use super::{ExtractedEntity, EntityType, Provenance, ExtractionSource};
use regex::Regex;

/// Strip HTML tags and decode common HTML entities to get clean visible text.
fn strip_html(html: &str) -> String {
    // Remove <style> and <script> blocks entirely
    let re_style = Regex::new(r"(?is)<style[^>]*>.*?</style>").unwrap();
    let re_script = Regex::new(r"(?is)<script[^>]*>.*?</script>").unwrap();
    let cleaned = re_style.replace_all(html, " ");
    let cleaned = re_script.replace_all(&cleaned, " ");

    // Replace <br>, <p>, <div>, <tr>, <td> boundaries with spaces
    let re_block = Regex::new(r"(?i)<(?:br|p|div|tr|td|li|h[1-6])[^>]*/?>").unwrap();
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

    // Collapse whitespace (but keep newlines as single spaces)
    let re_ws = Regex::new(r"[\s\u{200b}\u{200c}\u{200d}\u{feff}]+").unwrap();
    re_ws.replace_all(&cleaned, " ").trim().to_string()
}

pub fn extract(html: &str, text: &str) -> Vec<ExtractedEntity> {
    let mut entities = Vec::new();
    let mut i = 0;

    // Build clean text by stripping HTML from both inputs
    let clean_from_html = strip_html(html);
    let clean_from_text = strip_html(text);

    // Use whichever has more content, but prefer html-stripped version
    let clean_text = if clean_from_html.len() >= clean_from_text.len() {
        clean_from_html
    } else {
        clean_from_text
    };

    // Pattern 1: Explicit G-Codes (Google style)
    if let Ok(re) = Regex::new(r"\b(G-\d{4,8})\b") {
        for cap in re.captures_iter(&clean_text) {
            if let Some(m) = cap.get(1) {
                entities.push(ExtractedEntity {
                    id: format!("code:{}", i),
                    entity_type: EntityType::Code,
                    provider: None,
                    value: m.as_str().to_uppercase(),
                    confidence: 0.95,
                    provenance: Provenance {
                        source: ExtractionSource::Regex,
                        extractor: "otp.rs".to_string(),
                    },
                    evidence: Some(m.as_str().to_string()),
                    metadata: serde_json::json!({}),
                });
                i += 1;
            }
        }
    }

    // Pattern 2: "Your code is: XXXXXX" or "code: XXXXXX" style
    // After finding a trigger word, collect ALL digits in the next ~40 visible characters.
    if let Ok(trigger_re) = Regex::new(r"(?i)\b(?:code|otp|pin|verification\s+code)\s*(?:is)?[\s:]+") {
        for cap in trigger_re.captures_iter(&clean_text) {
            let m = cap.get(0).unwrap();
            let start = m.end();
            let end = std::cmp::min(start + 40, clean_text.len());

            // Ensure valid char boundary
            let mut valid_end = end;
            while valid_end > start && !clean_text.is_char_boundary(valid_end) {
                valid_end -= 1;
            }
            let window = &clean_text[start..valid_end];

            // Collect all digits until we hit a letter or significant punctuation
            let mut digits = String::new();
            for ch in window.chars() {
                if ch.is_ascii_digit() {
                    digits.push(ch);
                } else if ch == ' ' || ch == '-' || ch == '.' || ch == '\u{00a0}' {
                    // Skip common separators within codes
                    continue;
                } else {
                    // Stop at any letter or other character (the code has ended)
                    if !digits.is_empty() {
                        break;
                    }
                    // Haven't started collecting digits yet, keep scanning
                }
            }

            if digits.len() >= 4 && digits.len() <= 8 {
                entities.push(ExtractedEntity {
                    id: format!("code:{}", i),
                    entity_type: EntityType::Code,
                    provider: None,
                    value: digits.clone(),
                    confidence: 0.9,
                    provenance: Provenance {
                        source: ExtractionSource::Regex,
                        extractor: "otp.rs".to_string(),
                    },
                    evidence: Some(window.trim().to_string()),
                    metadata: serde_json::json!({}),
                });
                i += 1;
            }
        }
    }

    // Pattern 3: Standalone alphanumeric codes near trigger words (e.g. "Enter code ABC123")
    if entities.is_empty() {
        if let Ok(trigger_re) = Regex::new(r"(?i)\b(?:code|otp|pin|verification)\b") {
            if let Ok(code_re) = Regex::new(r"\b[A-Z0-9]{4,8}\b") {
                for cap in trigger_re.captures_iter(&clean_text) {
                    let m = cap.get(0).unwrap();
                    let start = m.end();
                    let end = std::cmp::min(start + 60, clean_text.len());

                    let mut valid_end = end;
                    while valid_end > start && !clean_text.is_char_boundary(valid_end) {
                        valid_end -= 1;
                    }
                    let window = &clean_text[start..valid_end];

                    for code_cap in code_re.captures_iter(window) {
                        let code_str = code_cap.get(0).unwrap().as_str();
                        let code_upper = code_str.to_uppercase();

                        // Must contain at least one digit
                        if !code_upper.chars().any(|c| c.is_ascii_digit()) {
                            continue;
                        }

                        // Filter out likely CSS hex colors (e.g. E60023)
                        if (code_upper.len() == 6 || code_upper.len() == 8)
                            && code_upper.chars().all(|c| c.is_ascii_hexdigit())
                            && code_upper.chars().any(|c| c.is_ascii_alphabetic())
                        {
                            continue;
                        }

                        entities.push(ExtractedEntity {
                            id: format!("code:{}", i),
                            entity_type: EntityType::Code,
                            provider: None,
                            value: code_upper.clone(),
                            confidence: 0.75,
                            provenance: Provenance {
                                source: ExtractionSource::Regex,
                                extractor: "otp.rs".to_string(),
                            },
                            evidence: Some(window.trim().to_string()),
                            metadata: serde_json::json!({}),
                        });
                        i += 1;
                        break; // Take only the first code per trigger
                    }
                }
            }
        }
    }

    // Deduplicate entities by value
    let mut unique_entities = Vec::new();
    let mut seen_values = std::collections::HashSet::new();
    for e in entities {
        if !seen_values.contains(&e.value) {
            seen_values.insert(e.value.clone());
            unique_entities.push(e);
        }
    }

    unique_entities
}
