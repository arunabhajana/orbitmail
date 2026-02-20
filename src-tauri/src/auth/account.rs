use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Account {
    pub id: String,
    pub email: String,
    pub provider: String, // "google"
    pub access_token: String,
    pub refresh_token: String,
    pub expires_at: i64,
    pub last_sync: Option<i64>,
    pub profile_name: String,
    pub profile_picture: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserProfile {
    pub email: String,
    pub name: String,
    pub picture: String,
    pub provider: String,
}

impl From<Account> for UserProfile {
    fn from(account: Account) -> Self {
        Self {
            email: account.email,
            name: account.profile_name,
            picture: account.profile_picture,
            provider: account.provider,
        }
    }
}
