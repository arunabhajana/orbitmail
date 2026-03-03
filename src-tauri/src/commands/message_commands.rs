use crate::auth::session::get_active_account;
use crate::mail::database;
use crate::mail::imap_session::{execute_with_session, SessionKind};
use tauri::AppHandle;

#[tauri::command]
pub async fn mark_as_read(app_handle: AppHandle, uid: u32) -> Result<(), String> {
    let account = get_active_account(&app_handle).ok_or("No active account")?;

    // Idempotency Check: Don't hit IMAP if already updated locally
    let is_already_seen = tokio::task::spawn_blocking({
        let app = app_handle.clone();
        move || {
            database::is_message_seen(&app, "INBOX", uid)
        }
    }).await.map_err(|e| e.to_string())??;

    if is_already_seen {
        return Ok(());
    }

    // Update IMAP (Silent Flag to avoid untagged responses)
    execute_with_session(&account, SessionKind::Primary, move |session| {
        session.uid_store(uid.to_string(), "+FLAGS.SILENT (\\Seen)")
            .map_err(|e| format!("IMAP Error marking read: {}", e))?;
        Ok::<(), String>(())
    }).await?;

    // Update SQLite
    let _ = tokio::task::spawn_blocking(move || {
        database::set_message_seen(&app_handle, "INBOX", uid, true)
    }).await;

    Ok(())
}

#[tauri::command]
pub async fn toggle_star(app_handle: AppHandle, uid: u32, should_star: bool) -> Result<(), String> {
    let account = get_active_account(&app_handle).ok_or("No active account")?;

    // Update IMAP
    let flag_cmd = if should_star {
        "+FLAGS.SILENT (\\Flagged)"
    } else {
        "-FLAGS.SILENT (\\Flagged)"
    };

    execute_with_session(&account, SessionKind::Primary, move |session| {
        session.uid_store(uid.to_string(), flag_cmd)
            .map_err(|e| format!("IMAP Error toggling star: {}", e))?;
        Ok::<(), String>(())
    }).await?;

    // Update SQLite
    let _ = tokio::task::spawn_blocking(move || {
        database::set_message_flagged(&app_handle, "INBOX", uid, should_star)
    }).await;

    Ok(())
}

#[tauri::command]
pub async fn delete_message(app_handle: AppHandle, uid: u32) -> Result<(), String> {
    let account = get_active_account(&app_handle).ok_or("No active account")?;

    // IMAP Action: Try MOVE, fallback to Label + Deleted Flag
    execute_with_session(&account, SessionKind::Primary, move |session| {
        // Attempt standard IMAP MOVE to Gmail trash
        let move_result = session.uid_mv(uid.to_string(), "[Gmail]/Trash");
        
        if let Err(e) = move_result {
            log::warn!("MOVE to Trash failed, attempting fallback: {}", e);
            // Fallback: Gmail Labels extension + \Deleted
            let _ = session.uid_store(uid.to_string(), "+X-GM-LABELS (\\Trash)");
            let _ = session.uid_store(uid.to_string(), "+FLAGS.SILENT (\\Deleted)");
        }
        
        Ok::<(), String>(())
    }).await?;

    // Delete locally
    let _ = tokio::task::spawn_blocking(move || {
        database::delete_message_local(&app_handle, "INBOX", uid)
    }).await;

    Ok(())
}

#[tauri::command]
pub async fn get_messages_page(
    app_handle: AppHandle,
    before_uid: Option<u32>,
    limit: u32,
) -> Result<Vec<crate::mail::message_list::MessageHeader>, String> {
    let safe_limit = limit.min(100);
    
    let app_handle_clone = app_handle.clone();
    let pages = tokio::task::spawn_blocking(move || {
        database::load_messages_page(&app_handle_clone, "INBOX", before_uid, safe_limit)
    })
    .await
    .map_err(|e| e.to_string())??;

    if let Some(account) = get_active_account(&app_handle) {
        let uids_to_prefetch = pages.iter().take(8).map(|m| m.uid).collect::<Vec<_>>();
        let app_handle_pf = app_handle.clone();
        
        // Fire-and-forget background prefetch enqueue
        tokio::spawn(async move {
            // Cancel stale prefetch requests before enqueuing new ones
            crate::mail::prefetch::clear_prefetch_queue().await;
            
            for uid in uids_to_prefetch {
                crate::mail::prefetch::enqueue_prefetch(app_handle_pf.clone(), account.clone(), uid).await;
            }
        });
    }

    Ok(pages)
}

#[tauri::command]
pub async fn download_attachment(
    app_handle: tauri::AppHandle,
    uid: u32,
    part_id: String,
    filename: String,
) -> Result<String, String> {
    let account = get_active_account(&app_handle).ok_or("No active account")?;
    
    let bytes = crate::mail::message_body::fetch_attachment_part(&account, uid, &part_id).await?;
    
    use tauri::Manager;
    let download_dir = app_handle.path().download_dir()
        .map_err(|e| format!("Failed to get download directory: {}", e))?;
    
    let file_path = download_dir.join(&filename);
    
    // Check if file exists and append number if it does
    let mut final_path = file_path.clone();
    let mut count = 1;
    while final_path.exists() {
        let name = std::path::Path::new(&filename)
            .file_stem()
            .map(|s| s.to_string_lossy().to_string())
            .unwrap_or_default();
        let ext = std::path::Path::new(&filename)
            .extension()
            .map(|e| format!(".{}", e.to_string_lossy()))
            .unwrap_or_default();
        final_path = download_dir.join(format!("{} ({}){}", name, count, ext));
        count += 1;
    }
    
    std::fs::write(&final_path, bytes)
        .map_err(|e| format!("Failed to write file: {}", e))?;
    
    Ok(final_path.to_string_lossy().to_string())
}
