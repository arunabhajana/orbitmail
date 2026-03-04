use tauri::AppHandle;
use tauri_plugin_notification::NotificationExt;
use std::sync::Mutex;
use std::time::{Instant, Duration};
use once_cell::sync::Lazy;

// State to keep track of recent notifications to avoid spamming
struct NotificationState {
    last_notification_time: Instant,
    pending_count: u32,
}

static STATE: Lazy<Mutex<NotificationState>> = Lazy::new(|| Mutex::new(NotificationState {
    last_notification_time: Instant::now() - Duration::from_secs(60),
    pending_count: 0,
}));

pub fn show_new_email_notification(app: &AppHandle, from: &str, subject: &str, uid: u32) {
    let mut state = STATE.lock().unwrap();
    let now = Instant::now();
    
    // If we've shown a notification recently (last 5 seconds), start batching
    if now.duration_since(state.last_notification_time) < Duration::from_secs(5) {
        state.pending_count += 1;
        
        // After 3 batched messages, or if more time has passed, show a summary
        if state.pending_count >= 3 {
            let count = state.pending_count;
            state.pending_count = 0;
            state.last_notification_time = now;
            
            app.notification()
                .builder()
                .title("New Messages")
                .body(format!("You have {} new incoming transmissions.", count))
                .icon("icons/128x128.png")
                .show()
                .ok();
        }
        return;
    }

    // Reset pending count if enough time has passed
    state.pending_count = 0;
    state.last_notification_time = now;

    // Show individual notification
    let clean_from = from.split('<').next().unwrap_or(from).trim();
    let display_from = if clean_from.is_empty() { from } else { clean_from };

    app.notification()
        .builder()
        .title(display_from)
        .body(subject)
        .icon("icons/128x128.png")
        .extra("uid", uid.to_string())
        .show()
        .ok();
}

