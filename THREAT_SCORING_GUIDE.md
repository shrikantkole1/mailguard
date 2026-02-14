# Email Threat Analysis - Trust Score System (Inverted Risk)

## 🔄 **How Trust Scores Work**

The system displays **Trust/Safety Scores** (inverse of risk):
- **High score (90-95%)** = Safe, trustworthy email ✅
- **Medium score (20-35%)** = Suspicious, likely phishing ⚠️
- **Low score (5-15%)** = Dangerous, contains malware 🚨

---

## ✅ SAFE Emails (Trust Score: 70-95%)

**Characteristics:**
- Sender from known safe domains (company.com, gmail.com, microsoft.com)
- No suspicious URLs or shortened links
- Safe attachments (PDFs, standard documents)
- No urgency or manipulation tactics
- Domain age > 3 years

**Expected Verdict:**
- Classification: **SAFE**
- Trust Score: **75-95%**
- Message: "✅ Email appears legitimate with no significant security concerns. All checks passed successfully."
- Action: **DELIVER** - Safe passage to inbox

---

## ⚠️ PHISHING Emails (Trust Score: 15-35%)

**Characteristics:**
- **Typosquatting domains**: paypa1-verify.com, amaz0n-help.net
- **Urgency tactics**: "URGENT", "suspended", "verify immediately", "within 24 hours"
- **Credential harvesting**: "verify your account", "confirm your identity", "click here to login"
- **Suspicious URLs**: Shortened URLs (bit.ly), suspicious keywords (verify, login, secure)
- **Fear tactics**: "account will be closed", "unusual activity"
- Recently registered domains (< 90 days)

**Expected Verdict:**
- Classification: **SUSPICIOUS** or **MALICIOUS** (based on severity)
- Trust Score: **15-50%**
- Message: "🚨 CRITICAL PHISHING ATTACK: Domain impersonating trusted brand. Attackers are trying to steal your credentials or financial information. DO NOT CLICK any links or provide any information."
- Action: **WARN_USER** or **BLOCK_SENDER**

**Key Indicators:**
- Domain Risk: 80-90 (typosquatting detected)
- URL Risk: 35-60 (suspicious URLs)
- Social Engineering Risk: 70-80 (urgency + credential harvesting)
- Attachment Risk: 0-20 (usually no attachments or safe PDFs)

---

## 🚨 MALWARE Emails (Trust Score: 0-19%)

**Characteristics:**
- **Dangerous attachments**:
  - Macro-enabled documents (.xlsm, .docm, .pptm)
  - Executables (.exe, .scr, .bat, .vbs)
  - Script files (.ps1, .js)
  - Double extensions (invoice.pdf.exe)
- **Malware domains**: company-payro11.com, domains with .tk, .ml, .ru TLDs
- **Malware delivery patterns**: "enable macros", "open attachment", "confidential document"
- **Multiple red flags**: Suspicious domain + dangerous attachment + urgency

**Expected Verdict:**
- Classification: **MALICIOUS**
- Trust Score: **5-15%**
- Message: "🚨 CRITICAL MALWARE THREAT: MALWARE DETECTED in attachments. This email contains dangerous malware attempting to compromise your system. QUARANTINE IMMEDIATELY and notify security team."
- Action: **BLOCK_SENDER** - Quarantine and notify SOC

**Key Indicators:**
- Attachment Risk: 85-100 (macro-enabled or executable files)
- Domain Risk: 80-95 (malware-associated domain)
- Social Engineering Risk: 35-70 (malware delivery tactics)
- URL Risk: 25-50 (may contain malicious download links)

---

## Risk Score Calculation (Weighted)

The final risk score is calculated as:
- **Attachment Risk**: 35% weight
- **Domain Risk**: 30% weight  
- **URL Risk**: 20% weight
- **Social Engineering Risk**: 15% weight

**Trust Score Display (Inverted):**
- **70-100%**: SAFE (green)
- **40-69%**: SUSPICIOUS (yellow)
- **0-39%**: MALICIOUS (red)

---

## Testing the Three Scenarios

### 1. Click "Safe" Button
- Email: colleague@company.com
- Subject: "Q4 Budget Review Meeting"
- Attachment: budget_q4.pdf
- **Expected Result**: Trust Score ~85-90%, Classification: SAFE ✅

### 2. Click "Phishing" Button
- Email: support@paypa1-verify.com
- Subject: "URGENT: Verify your account immediately"
- Contains shortened URL (bit.ly)
- **Expected Result**: Trust Score ~25-35%, Classification: SUSPICIOUS/MALICIOUS ⚠️

### 3. Click "Malware" Button
- Email: hr@company-payro11.com
- Subject: "Important: Updated Salary Information"
- Attachment: Salary_Update_2024.xlsm (macro-enabled)
- **Expected Result**: Trust Score ~5-15%, Classification: MALICIOUS 🚨

---

## What Changed

### Enhanced Detection:
1. **Domain Analysis**: Better typosquatting detection, specific patterns for phishing domains
2. **Social Engineering**: Stronger pattern matching for urgency, credential harvesting, fear tactics
3. **URL Scanning**: Added checks for typosquatting in URLs, suspicious keywords
4. **Attachment Forensics**: Emoji warnings, clearer threat categorization, expanded file type coverage
5. **Threat Reasoning**: Context-aware messages that clearly explain the specific threat type

### Result:
- **Safe emails** get reassuring messages
- **Phishing emails** get clear warnings about credential theft
- **Malware emails** get critical alerts about system compromise

Try the three test scenarios now to see the enhanced threat detection in action! 🚀
