use crate::auth::session;
use crate::auth::account::UserProfile;
use tauri::AppHandle;
use chrono::Utc;

#[derive(Debug, serde::Serialize)]
pub struct BootstrapResult {
    pub user: Option<UserProfile>,
    pub needs_refresh: bool,
}

/// Validates the active account and checks for token expiry.
/// Does NOT perform any refresh or network calls.
pub fn bootstrap_accounts(app_handle: &AppHandle) -> BootstrapResult {
    let active_account = session::get_active_account(app_handle);

    match active_account {
        Some(account) => {
            let current_time = Utc::now().timestamp();
            let has_token = !account.access_token.is_empty();
            let is_expired = account.expires_at <= current_time;

            BootstrapResult {
                user: Some(UserProfile::from(account)),
                needs_refresh: !has_token || is_expired,
            }
        }
        None => BootstrapResult {
            user: None,
            needs_refresh: false,
        },
    }
}
