use crate::auth::account::Account;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::AppHandle;
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct AuthStore {
    pub accounts: Vec<Account>,
    pub active_account_id: Option<String>,
}

/// Manages persistence for user accounts and active sessions.
/// Stores data in `accounts.json` within the OS-specific app data directory.

/// Loads the JSON store path from Tauri's path resolver.
fn get_store_path(app_handle: &AppHandle) -> PathBuf {
    let mut path = app_handle
        .path()
        .app_data_dir()
        .expect("Failed to resolve app data directory");
    
    if !path.exists() {
        fs::create_dir_all(&path).ok();
    }
    path.push("accounts.json");
    path
}

/// Commits an account to persistent storage and optionally sets it as active.
pub fn save_account(app_handle: &AppHandle, account: Account, set_active: bool) -> Result<(), String> {
    let path = get_store_path(app_handle);
    let mut store = load_store(app_handle);

    // Update existing record if present, otherwise append
    if let Some(pos) = store.accounts.iter().position(|a| a.id == account.id) {
        store.accounts[pos] = account.clone();
    } else {
        store.accounts.push(account.clone());
    }

    // Update active session pointer
    if set_active || store.active_account_id.is_none() {
        store.active_account_id = Some(account.id.clone());
    }

    let json = serde_json::to_string_pretty(&store).map_err(|e| e.to_string())?;
    fs::write(path, json).map_err(|e| e.to_string())?;

    Ok(())
}

/// Returns all stored accounts.
pub fn load_accounts(app_handle: &AppHandle) -> Vec<Account> {
    load_store(app_handle).accounts
}

/// Retrieves the profile currently marked as active.
pub fn get_active_account(app_handle: &AppHandle) -> Option<Account> {
    let store = load_store(app_handle);
    let active_id = store.active_account_id?;
    store.accounts.into_iter().find(|a| a.id == active_id)
}

/// Switches the active session to the specified account.
pub fn set_active_account(app_handle: &AppHandle, account_id: String) -> Result<(), String> {
    let path = get_store_path(app_handle);
    let mut store = load_store(app_handle);
    
    if store.accounts.iter().any(|a| a.id == account_id) {
        store.active_account_id = Some(account_id);
        let json = serde_json::to_string_pretty(&store).map_err(|e| e.to_string())?;
        fs::write(path, json).map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("Account not found".to_string())
    }
}

/// Removes an account and its tokens from the system.
pub fn remove_account(app_handle: &AppHandle, account_id: String) -> Result<(), String> {
    let path = get_store_path(app_handle);
    let mut store = load_store(app_handle);

    store.accounts.retain(|a| a.id != account_id);
    
    // Reset active ID if the deleted account was active
    if store.active_account_id.as_ref() == Some(&account_id) {
        store.active_account_id = store.accounts.first().map(|a| a.id.clone());
    }

    let json = serde_json::to_string_pretty(&store).map_err(|e| e.to_string())?;
    fs::write(path, json).map_err(|e| e.to_string())?;

    Ok(())
}

/// Internal helper to deserialize the state file.
fn load_store(app_handle: &AppHandle) -> AuthStore {
    let path = get_store_path(app_handle);
    if !path.exists() {
        return AuthStore::default();
    }

    let content = fs::read_to_string(path).unwrap_or_default();
    serde_json::from_str(&content).unwrap_or_default()
}
