use super::{ExtractedEntity, EntityType, Provenance, ExtractionSource};
use regex::Regex;
use std::collections::HashSet;

pub fn extract(html: &str, _text: &str) -> Vec<ExtractedEntity> {
    let mut entities = Vec::new();
    let mut seen = HashSet::new();

    // Extract URLs from href attributes in HTML to avoid invisible tracking pixels,
    // CSS font URLs, base64 data, and other non-user-visible URLs.
    if let Ok(re) = Regex::new(r#"(?i)href\s*=\s*["']?(https?://[^"'\s>]+)"#) {
        for (i, cap) in re.captures_iter(html).enumerate() {
            if let Some(m) = cap.get(1) {
                let url = m.as_str().trim_end_matches(|c: char| {
                    c == '.' || c == ',' || c == ';' || c == ')' || c == '"' || c == '\'' || c == ']'
                }).to_string();

                // Skip common tracking/unsubscribe/pixel URLs
                let url_lower = url.to_lowercase();
                if url_lower.contains("unsubscribe")
                    || url_lower.contains("list-manage")
                    || url_lower.contains("tracking")
                    || url_lower.contains("/track/")
                    || url_lower.contains("open.php")
                    || url_lower.contains("/pixel")
                    || url_lower.contains("/beacon")
                {
                    continue;
                }

                if seen.insert(url.clone()) {
                    entities.push(ExtractedEntity {
                        id: format!("link:{}", i),
                        entity_type: EntityType::Link,
                        provider: None,
                        value: url.clone(),
                        confidence: 1.0,
                        provenance: Provenance {
                            source: ExtractionSource::Html,
                            extractor: "links.rs".to_string(),
                        },
                        evidence: Some(url.clone()),
                        metadata: serde_json::json!({ "url": url }),
                    });
                }
            }
        }
    }
    entities
}
