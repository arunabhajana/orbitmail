fn main() {
  // Emit OAuth credentials from .env as compile-time env vars.
  // This ensures they are baked into the binary so token refresh works
  // in production installs where no .env file exists at runtime.
  let env_path = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join(".env");
  if env_path.exists() {
    let content = std::fs::read_to_string(&env_path).expect("Failed to read .env");
    for line in content.lines() {
      let line = line.trim();
      if line.is_empty() || line.starts_with('#') {
        continue;
      }
      if let Some((key, value)) = line.split_once('=') {
        let key = key.trim();
        let value = value.trim();
        // Only emit known safe credential keys
        if matches!(key, "GOOGLE_CLIENT_ID" | "GOOGLE_CLIENT_SECRET") {
          println!("cargo:rustc-env={}={}", key, value);
        }
      }
    }
  }

  // Re-run this build script if .env changes
  println!("cargo:rerun-if-changed=.env");

  tauri_build::build()
}

