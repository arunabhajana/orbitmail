// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]


#[cfg(target_os = "windows")]
use window_vibrancy::apply_mica;

use tauri::Manager;

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      let window = app.get_webview_window("main").unwrap();

      #[cfg(target_os = "windows")]
      apply_mica(&window, None).ok();

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
