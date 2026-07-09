use serde::{Deserialize, Serialize};
use regex::Regex;

pub mod schema_org;
pub mod calendar;
pub mod links;
pub mod otp;
pub mod tracking;
pub mod invoice;
pub mod account;
pub mod provider_registry;
pub mod commerce;

pub const CURRENT_EXTRACTOR_VERSION: u32 = 11;

/// Strip HTML tags and decode common entities to get clean visible text.
/// Shared utility for all extractors so they don't match against CSS/HTML artifacts.
pub fn strip_html(input: &str) -> String {
    // Remove <style> and <script> blocks entirely
    let re_style = Regex::new(r"(?is)<style[^>]*>.*?</style>").unwrap();
    let re_script = Regex::new(r"(?is)<script[^>]*>.*?</script>").unwrap();
    let cleaned = re_style.replace_all(input, " ");
    let cleaned = re_script.replace_all(&cleaned, " ");

    // Replace block-level tags with spaces to preserve word boundaries
    let re_block = Regex::new(r"(?i)<(?:br|p|div|tr|td|li|h[1-6])[^>]*/?>|</(?:p|div|tr|td|li|h[1-6])>").unwrap();
    let cleaned = re_block.replace_all(&cleaned, " ");

    // Remove all remaining HTML tags
    let re_tags = Regex::new(r"<[^>]+>").unwrap();
    let cleaned = re_tags.replace_all(&cleaned, "");

    // Decode common HTML entities
    let cleaned = cleaned
        .replace("&amp;", "&")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&quot;", "\"")
        .replace("&#39;", "'")
        .replace("&apos;", "'")
        .replace("&nbsp;", " ")
        .replace("&#160;", " ");

    // Collapse whitespace (including zero-width chars) into single spaces
    let re_ws = Regex::new(r"[\s\u{200b}\u{200c}\u{200d}\u{feff}]+").unwrap();
    re_ws.replace_all(&cleaned, " ").trim().to_string()
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum ExtractionSource {
    SchemaOrg,
    Calendar,
    Html,
    PlainText,
    Regex,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum EntityType {
    Code,
    Link,
    CalendarEvent,
    TrackingNumber,
    InvoiceReference,
    ReceiptReference,
    OrderReference,
    TransactionReference,
    SubscriptionReference,
    SchemaOrgObject,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Provenance {
    pub source: ExtractionSource,
    pub extractor: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ExtractedEntity {
    pub id: String,
    #[serde(rename = "entityType")]
    pub entity_type: EntityType,
    pub provider: Option<String>,
    pub value: String,
    pub confidence: f32,
    pub provenance: Provenance,
    pub evidence: Option<String>,
    pub metadata: serde_json::Value,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ExtractedData {
    pub version: u32,
    #[serde(rename = "extractedAt")]
    pub extracted_at: i64,
    pub entities: Vec<ExtractedEntity>,
}

pub fn run_extraction_pipeline(html: &str, text: &str) -> ExtractedData {
    let mut entities = Vec::new();

    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis() as i64;

    // Pre-compute clean visible text for extractors that need it.
    // This strips HTML/CSS so extractors don't match against invisible markup.
    let clean_text = strip_html(html);
    let clean_raw = strip_html(text);
    // Use whichever has more visible content
    let best_clean = if clean_text.len() >= clean_raw.len() { &clean_text } else { &clean_raw };

    entities.extend(schema_org::extract(html, text));
    entities.extend(calendar::extract(html, text));
    entities.extend(links::extract(html, best_clean));
    entities.extend(otp::extract(html, text));
    entities.extend(tracking::extract(html, best_clean));
    entities.extend(commerce::extract(html, text));
    entities.extend(invoice::extract(html, best_clean));
    entities.extend(account::extract(html, best_clean));

    ExtractedData {
        version: CURRENT_EXTRACTOR_VERSION,
        extracted_at: now,
        entities,
    }
}
