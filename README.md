<div align="center">
  <h1>🛡️ MailGuard</h1>
  <h3>Autonomous Email Threat Triage Platform</h3>
  <p>Enterprise-Grade Security Orchestration with Model Context Protocol (MCP)</p>
  <br />
  <br />
  <a href="https://mailguard-74o0.onrender.com/"><strong>🚀 Live Deployed Demo</strong></a>
  <br />
  <br />
  <p>
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" />
    <img src="https://img.shields.io/badge/python-3.11+-blue.svg" alt="Python" />
    <img src="https://img.shields.io/badge/framework-Archestra-purple.svg" alt="Archestra" />
    <img src="https://img.shields.io/badge/frontend-React_Vite-cyan.svg" alt="React" />
    <img src="https://img.shields.io/badge/status-Production_Ready-green.svg" alt="Status" />
  </p>
</div>

---

## 🚀 Overview

**Archestra.ai MailGuard** is a next-generation **Autonomous Email Threat Triage System**. It moves beyond simple rule-based filters by leveraging **AI Agents** orchestrated via the **Model Context Protocol (MCP)** to analyze, score, and respond to email threats in real-time.

This is not a chatbot. It is a **governed, observable, and deterministic** security infrastructure designed to replicate the workflow of a Level 1 SOC Analyst—automatically.

---

## 🎯 The Problem vs. The Solution

Organizations face thousands of potential phishing attempts daily. Manual triage is slow, error-prone, and leads to analyst burnout.

| Feature | 🚫 Traditional Manual Triage | ✅ Archestra Automated Triage |
| :--- | :--- | :--- |
| **Speed** | 10-30 minutes per email | < 10 seconds per email |
| **Consistency** | High variance between analysts | 100% Deterministic Risk Scoring |
| **Coverage** | Sampling only high-priority alerts | Inspects 100% of reported emails |
| **Context** | Siloed tools (separately checking URLs, domains) | Unified Context (Cross-tool correlation) |
| **Response** | Delayed manual blocking | Immediate automated quarantine/block |

---

## 💡 Key Use Cases

This platform is engineered to handle specific enterprise security scenarios:

| Use Case | Description | Primary Detection Engine |
| :--- | :--- | :--- |
| **🎣 Credential Phishing** | Detects fake login pages designed to steal user credentials. | `URL Analyzer` + `Visual Inspection` |
| **💼 Business Email Compromise (BEC)** | Identifies social engineering attacks (e.g., CEO fraud, urgent wire transfers) without malicious links. | `Social Engineering MCP` + `Context Analysis` |
| **🦠 Malware Delivery** | Flags emails containing malicious attachments, macro-enabled documents, or suspicious script files. | `Attachment Risk Analyzer` |
| **🕵️ Brand Impersonation** | Spots look-alike domains and subtle spoofing attempts targeting the organization's brand. | `Domain Reputation Analyzer` |

---

## 🏗️ System Architecture

The architecture follows an **Archestra-first, MCP-native** design pattern. The Agent does not "guess"; it orchestrates specialized tools to gather hard evidence.

```mermaid
graph TD
    User[User / Email Gateway] -->|Submits Email| API[FastAPI Gateway]
    API --> Agent[Archestra Security Agent]
    
    subgraph "MCP Tool Layer"
        Agent -->|Checks Link| URL[URL Analyzer MCP]
        Agent -->|Verifies Sender| Domain[Domain Reputation MCP]
        Agent -->|Scans File| File[Attachment Risk MCP]
        Agent -->|Reads Intent| NLP[Social Engineering MCP]
    end
    
    URL -->|Risk Score| Aggregator
    Domain -->|Risk Score| Aggregator
    File -->|Risk Score| Aggregator
    NLP -->|Risk Score| Aggregator
    
    Aggregator -->|Final Verdict| Agent
    Agent -->|Action (Block/Allow)| Response[Response Handler]
    Agent -->|Log Trace| DB[(Audit Log)]
```

---

## 🧩 The MCP Tool Suite

Each security capability is encapsulated as an independent **Model Context Protocol (MCP)** server, ensuring modularity and scalability.

| MCP Server Name | Function | Output |
| :--- | :--- | :--- |
| **🔗 URL Analyzer** | Extracts URLs, unshortens links, checks for IP-based URLs, and validates against threat feeds. | `risk_score`, `suspicious_tlds`, `redirect_chain` |
| **🌐 Domain Reputation** | Checks domain age, WHOIS data, and DMARC/SPF/DKIM alignment to detect spoofing. | `domain_age`, `impersonation_score`, `mx_records` |
| **📎 Attachment Inspector** | Analyzes file headers, detects macros in Office docs, and identifies executable content. | `file_type`, `macro_detected`, `malware_signature` |
| **🧠 Social Engineer** | Uses LLMs to detect urgency, authority bias, financial requests, and coercion patterns. | `urgency_level`, `intent_classification`, `financial_ask` |

---

## 📊 Risk Scoring Model

The system triggers a response based on a weighted risk score (0-100). The scoring logic is transparent and configurable.

| Threat Indicator | Weight | Reasoning |
| :--- | :---: | :--- |
| **Malicious Attachment** | **35** | High probability of immediate compromise (Ransomware/Trojan). |
| **Blacklisted Domain** | **30** | Known bad actor; almost certainly malicious. |
| **Newly Registered Domain** | **20** | Common in burner campaigns (< 30 days old). |
| **Suspicious URL Pattern** | **20** | IP address as host, @ symbol in URL, or multiple redirects. |
| **Social Engineering Language** | **15** | Urgent requests for money or passwords. |

> **Final Score Calculation**: Sum of weighted triggers normalized to a 0-100 scale.
> - **0-30**: Safe ✅
> - **31-70**: Suspicious (Human Review) ⚠️
> - **71-100**: Malicious (Auto-Block) 🛑

---

## ⚙️ Technology Stack

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React, Vite, TailwindCSS | SOC Analyst Dashboard for visualization. |
| **Backend** | Python, FastAPI | High-performance API Gateway. |
| **AI Orchestration** | **Archestra**, Pydantic AI | Agentic workflow control and governance. |
| **Tool Protocol** | **Model Context Protocol (MCP)** | Standardized interface for security tools. |
| **Observability** | OpenTelemetry | Tracing agent decisions and tool latency. |
| **Deployment** | Docker, Render/Railway | Containerized microservices architecture. |

---

## 🚀 Getting Started

### Prerequisites
- Node.js & npm
- Python 3.11+
- Virtual Environment tool

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
python main.py
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The Dashboard will launch at `http://localhost:5173`, connecting to the backend at `http://localhost:8000`.

---

## 🛡️ Governance & Security

This project adheres to **"Security by Design"** principles:
- **Immutable Audit Logs**: Every decision made by the agent is recorded with a full reasoning chain.
- **Strict Schemas**: JSON schemas enforce valid inputs/outputs between agents and tools.
- **Human-in-the-Loop**: "Suspicious" emails can be routed to human analysts for final verification.
- **Rate Limiting**: Protects the analysis pipeline from DoS attacks.

---

## 🔮 Future Roadmap

- [ ] **Live Mailbox Integration**: Direct hooks into Gmail/Outlook APIs.
- [ ] **Crowd-Sourced Intelligence**: Share threat signatures across organizations.
- [ ] **Automated Remediation**: Auto-delete malicious emails from user inboxes.
- [ ] **SIEM Connector**: Push alerts to Splunk/Datadog.

---

*Built with ❤️ by Shrikant Kole - Redefining AI Security.*
