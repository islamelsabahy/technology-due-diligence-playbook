# Technology Due Diligence Playbook

A public-safe technology due diligence framework for acquisitions, investments, partnerships, carve-outs, integrations, and strategic reviews.

It covers infrastructure, applications, architecture, cybersecurity, cloud, data, ERP, AI, vendors, licenses, technical debt, team capability, normalized technology cost, integration readiness, red flags, and executive reporting.

All examples are fictional.

## Interactive scorer / أداة الفحص التفاعلية

**Live:** https://islamelsabahy.github.io/technology-due-diligence-playbook/

The playbook below now has a working tool for investors and acquirers:

- **32 checks across 10 domains**, from infrastructure, applications and cybersecurity through to ERP, AI, vendors and team. Each answer is *evidenced*, *claimed only*, *partial*, *missing* or *unknown*: claims without evidence lower confidence, and unknowns count as risk.
- **Risk grade A–E**, risk per domain and an **evidence-confidence** score.
- **Red-flag register:** critical checks that fail become Critical or High findings, flagged for validation when the evidence is weak.
- **Remediation cost:** one-time and annual uplift, scaled by company size. It also gives the **normalized IT run-rate**, IT-to-revenue, and a **suggested price adjustment** (one-time plus two years of uplift).
- **Contract protections:** condition precedent, price adjustment, escrow, key-person retention, licence indemnity.
- **Day 1 / Day 100 / longer-term plan.**
- **Shareable result link, Arabic/English, CSV, print to PDF.** Optional AI layer: paste your own Anthropic API key to draft the executive section of the DD report (the key is never stored).

Engine: `docs/app/dd.js` (checks, weights and costs as plain data). Tests: `node tests/test_dd.js`. Costs are indicative bands; edit them in the engine to match your market.

## Core Areas
- Diligence scope & request list
- Infrastructure
- Applications
- Enterprise architecture
- Cybersecurity
- Cloud & hosting
- Data & analytics
- ERP / business applications
- AI & automation
- Vendors / licenses / contracts
- Technical debt
- Technology organization
- Normalized technology cost
- Risk scoring
- Red flags
- Integration readiness
- Remediation priorities
- Executive diligence report

## Diligence Flow
Scope → Data Request → Management Interviews → Domain Assessment → Evidence Validation → Risk Scoring → Cost Normalization → Integration Readiness → Red Flags → Recommendations → Executive Report

## Principles
1. Evidence before conclusions.
2. Separate facts, assumptions, and hypotheses.
3. Materiality should drive depth.
4. Cost normalization should distinguish one-time and recurring costs.
5. Cybersecurity findings require evidence and business impact context.
6. Integration readiness should consider systems, data, identity, vendors, and people.
7. Technical debt must be linked to risk, cost, or delivery impact.
8. Missing evidence is itself a diligence finding when material.
9. Recommendations should distinguish Day 1, Day 100, and long-term actions.
10. Public examples use fictional data only.

## Author
Eng. Islam El-Sherbiny
