use crate::auth::account::Account;
use crate::mail::sync::is_sync_running;
use crate::auth::bootstrap::bootstrap_accounts;
use tauri::AppHandle;
use std::sync::Mutex;
use std::time::Duration;
use once_cell::sync::Lazy;
use tokio::task::JoinHandle;
use tokio::sync::mpsc;
use native_tls::TlsConnector;


static IDLE_TASK: Lazy<Mutex<Option<JoinHandle<()>>>> = Lazy::new(|| Mutex::new(None));
static COORDINATOR_TASK: Lazy<Mutex<Option<JoinHandle<()>>>> = Lazy::new(|| Mutex::new(None));

pub fn start_idle_listener(app_handle: AppHandle, account: Account) {
    let mut idle_lock = IDLE_TASK.lock().unwrap();
    if idle_lock.is_some() {
        log::info!("IMAP IDLE: Listener already running (idempotent skip).");
        return;
    }

    let (tx, mut rx) = mpsc::channel::<u32>(32);
    let app_handle_clone = app_handle.clone();
    let account_clone = account.clone();

    // 1. COORDINATOR TASK: Listens for signals and triggers sync
    let coordinator = tokio::spawn(async move {
        log::info!("IMAP IDLE: Coordinator started.");
        while let Some(_) = rx.recv().await {
            // BACKPRESSURE: Drain the channel to collapse rapid-fire EXISTS events
            while rx.try_recv().is_ok() {}

            if is_sync_running() {
                log::info!("IMAP IDLE: Sync already in progress, ignoring signal.");
                continue;
            }

            log::info!("IMAP IDLE: New mail signal received. Triggering sync...");
            let res = crate::mail::sync::sync_inbox(&app_handle_clone, account_clone.clone()).await;
            if let Err(e) = res {
                log::error!("IMAP IDLE: Auto-sync failed: {}", e);
            }
        }
        log::info!("IMAP IDLE: Coordinator exiting.");
    });
    *COORDINATOR_TASK.lock().unwrap() = Some(coordinator);

    // 2. IDLE LISTENER TASK: Blocking IMAP loop
    let app_handle_idle = app_handle.clone();
    let account_idle = account.clone();
    
    let idle_handle = tokio::spawn(async move {
        log::info!("IMAP IDLE: Listener task spawned.");
        let mut last_exists = 0;
        let mut backoff = 2;

        loop {
            let res = run_idle_loop(&app_handle_idle, &account_idle, tx.clone(), last_exists).await;
            
            match res {
                Ok(new_count) => {
                    last_exists = new_count;
                    backoff = 2;
                }
                Err(e) => {
                    log::error!("IMAP IDLE: Loop error: {}. Reconnecting in {}s...", e, backoff);
                    tokio::time::sleep(Duration::from_secs(backoff)).await;
                    backoff = (backoff * 2).min(60);
                }
            }
        }
    });

    *idle_lock = Some(idle_handle);
}

async fn run_idle_loop(
    app_handle: &AppHandle,
    account: &Account,
    tx: mpsc::Sender<u32>,
    mut last_exists: u32,
) -> Result<u32, String> {
    // 1. Ensure valid token before connect
    let mut current_account = account.clone();
    let bootstrap = bootstrap_accounts(app_handle).await;
    if let Some(_) = bootstrap.user {
        // We need the full Account object, but bootstrap returns UserProfile.
        // Let's reload from session to get tokens.
        if let Some(acc) = crate::auth::session::get_active_account(app_handle) {
            current_account = acc;
        }
    }

    let email = current_account.email.clone();
    let access_token = current_account.access_token.clone();

    tokio::task::spawn_blocking(move || {
        let domain = "imap.gmail.com";
        let port = 993;

        let tls = TlsConnector::builder()
            .danger_accept_invalid_certs(true)
            .build()
            .map_err(|e| format!("TLS Error: {}", e))?;

        let client = imap::connect((domain, port), domain, &tls)
            .map_err(|e| format!("Connect Error: {}", e))?;

        let auth_raw = format!("user={}\x01auth=Bearer {}\x01\x01", email, access_token);
        struct XoAuth2 { auth_string: String }
        impl imap::Authenticator for XoAuth2 {
            type Response = String;
            fn process(&self, _: &[u8]) -> Self::Response { self.auth_string.clone() }
        }
        let auth = XoAuth2 { auth_string: auth_raw };

        let mut session = client
            .authenticate("XOAUTH2", &auth)
            .map_err(|(e, _)| format!("Auth Failed: {}", e))?;

        // 2. Select INBOX (Required after connect)
        let mailbox = session.select("INBOX").map_err(|e| format!("Select Error: {}", e))?;
        last_exists = mailbox.exists;

        log::info!("IMAP IDLE: Initialized. Last exists count: {}", last_exists);

        // 3. Main IDLE loop with 15-min refresh
        loop {
            let wait_res = {
                let idle_handle = session.idle().map_err(|e| format!("IDLE Start Error: {}", e))?;
                
                // Wait for events or timeout (15 mins)
                // sleep/wake fix: we treat "no response" as a break-and-reconnect trigger after 20m if needed,
                // but the imap crate's wait_with_timeout handles the network block.
                idle_handle.wait_with_timeout(Duration::from_secs(15 * 60))
                // idle_handle is dropped here, sending DONE to the server
            };

            match wait_res {
                Ok(imap::extensions::idle::WaitOutcome::MailboxChanged) => {
                    // Collect responses from the session's unsolicited_responses channel
                    while let Ok(response) = session.unsolicited_responses.try_recv() {
                        if let imap::types::UnsolicitedResponse::Exists(count) = response {
                            if count > last_exists {
                                log::info!("IMAP IDLE: EXISTS received ({} > {}). Signaling sync.", count, last_exists);
                                let _ = tx.blocking_send(count);
                            }
                            last_exists = count;
                        }
                    }
                }
                Ok(imap::extensions::idle::WaitOutcome::TimedOut) => {
                    log::info!("IMAP IDLE: 15-min refresh interval reached. Recycling session...");
                    // Just continue the loop to re-issue IDLE
                }
                Err(e) => return Err(format!("IDLE Wait Error: {}", e)),
            }
        }
    }).await.map_err(|e| e.to_string())?
}

pub fn stop_idle_listener() {
    if let Some(handle) = IDLE_TASK.lock().unwrap().take() {
        log::info!("IMAP IDLE: Dropping listener task.");
        handle.abort();
    }
    if let Some(handle) = COORDINATOR_TASK.lock().unwrap().take() {
        log::info!("IMAP IDLE: Dropping coordinator task.");
        handle.abort();
    }
}
