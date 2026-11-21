import { MOMTemplate } from '../types/meeting.js';

export const DEFAULT_MOM_TEMPLATES: MOMTemplate[] = [
  {
    id: 'template-standard',
    name: 'Standard Meeting Notes & MOM',
    category: 'General & Operations',
    description: 'Comprehensive business meeting record capturing executive summary, agreed decisions, assigned tasks with deadlines, key discussion points, and next steps.',
    sections: [
      'Executive Summary',
      'Key Decisions Made',
      'Action Items Matrix (Owner, Task, Due Date)',
      'Discussion Highlights',
      'Next Steps & Follow-ups'
    ],
    tableColumns: ['Owner', 'Task / Deliverable', 'Due Date', 'Status'],
    promptInstructions: 'Generate clean, structured Minutes of Meeting (MOM). Identify the central objective, list firm decisions made, extract concrete action items with assignees and due dates, summarize top discussion points, and specify next steps.',
    sampleDocument: `# Standard Meeting Notes & MOM
**Meeting Title:** Weekly Cross-Functional Team Sync  
**Date:** November 21, 2026 | **Duration:** 42 mins | **AI Model:** Built-in Neural AI (Local)  
**Attendees:** Sarah Chen (Product), Alex Rivera (Engineering), David Kim (Operations)

---

### Executive Summary
The team reviewed Q4 milestone progress, finalized the infrastructure migration schedule, and aligned on customer onboardings for the upcoming release window. System reliability metrics remain at 99.98% uptime.

### Key Decisions Made
1. **Infrastructure Cutover Date:** Agreed to schedule the database cutover for Sunday at 02:00 UTC during low-traffic maintenance window.
2. **Feature Freeze:** Enforced code freeze starting Wednesday for release stabilization.
3. **Telemetry Standards:** Standardized on OpenTelemetry structured tracing across all microservices.

### Action Items Matrix
| Owner | Task / Deliverable | Due Date | Status |
| :--- | :--- | :--- | :--- |
| **Alex Rivera** | Complete database replication dry-run in staging | Nov 24, 2026 | In Progress |
| **Sarah Chen** | Publish user-facing changelog and release notes | Nov 25, 2026 | Pending |
| **David Kim** | Notify enterprise customers of the Sunday maintenance window | Nov 22, 2026 | Completed |

### Discussion Highlights
- Reviewed CPU and memory consumption during peak synthetic load testing.
- Addressed latency regression in the search query pipeline; caching tier resolution deployed.
- Discussed feedback from beta users on real-time transcript latency.

### Next Steps & Follow-ups
- Engineering pairing session on Friday at 14:00 UTC to review cutover scripts.
- Reconvene on Monday morning for the post-migration health assessment.`,
    isDefault: true,
    isSystem: true,
    createdAt: '2026-08-20T00:00:00.000Z',
    updatedAt: '2026-08-20T00:00:00.000Z'
  },
  {
    id: 'template-executive',
    name: 'Executive & Board Summary',
    category: 'Leadership & Strategy',
    description: 'High-level strategic briefing designed for executives, board directors, and C-suite leadership focusing on organizational milestones, directives, and governance.',
    sections: [
      'Strategic Executive Briefing',
      'Board Decisions & Approvals',
      'Strategic Directives & Ownership',
      'Critical Risks & Mitigations',
      'Governance Roadmap'
    ],
    tableColumns: ['Executive Owner', 'Strategic Directive', 'Target Quarter', 'Governance Status'],
    promptInstructions: 'Synthesize the conversation into an executive briefing document. Highlight top-level strategic implications, formal decisions/approvals, organizational risks, and key roadmap deadlines. Avoid trivial conversational remarks.',
    sampleDocument: `# Executive & Board Summary
**Meeting Title:** Board of Directors Q4 Strategy Briefing  
**Date:** November 21, 2026 | **Governance Scope:** Fiscal 2027 Strategic Allocation  
**Attendees:** Elena Rostova (CEO), Marcus Vance (CFO), Priya Patel (CTO), Board Members

---

### Strategic Executive Briefing
Executive leadership presented the FY27 capital expansion plan, operational expenditure models, and market penetration targets. ARR grew 38% YoY, outperforming quarterly guidance.

### Board Decisions & Approvals
1. **Unanimous Approval:** Authorized $14.5M capital allocation for AI on-device inference hardware acceleration.
2. **Expansion Motion:** Approved European regional entity formation to satisfy local compliance requirements.
3. **Executive Compensation:** Ratified annual compensation committee resolutions for executive performance equity.

### Strategic Directives & Ownership
| Executive Owner | Strategic Directive | Target Quarter | Governance Status |
| :--- | :--- | :--- | :--- |
| **Marcus Vance (CFO)** | Finalize credit facility terms with Tier-1 banking syndicate | Q1 2027 | Approved |
| **Priya Patel (CTO)** | Deploy European isolated data boundary cluster | Q2 2027 | In Review |
| **Elena Rostova (CEO)** | Complete strategic partnership agreements with enterprise OEMs | Q1 2027 | Active |

### Critical Risks & Mitigations
- **Market Volatility:** Currency exposure mitigated through multi-currency forward contracts.
- **Supply Chain Lead Times:** Pre-committed purchase orders for GPU silicon with guaranteed allocation.

### Governance Roadmap
- Audit committee review scheduled for January 14, 2027.
- Full annual board assembly confirmed for March 22, 2027.`,
    isDefault: false,
    isSystem: true,
    createdAt: '2026-08-20T00:00:00.000Z',
    updatedAt: '2026-08-20T00:00:00.000Z'
  },
  {
    id: 'template-standup',
    name: 'Engineering & Daily Standup',
    category: 'Agile & Development',
    description: 'Fast-paced engineering alignment capturing completed work, today\'s sprint commitments, architectural decisions, technical blockers, and peer pairing.',
    sections: [
      'Sprint Progress & Yesterday Deliverables',
      'Today Commitments & PR Releases',
      'Technical Decisions & Architecture',
      'Blockers & Technical Impediments',
      'Peer Pairing Assignments'
    ],
    tableColumns: ['Engineer', 'Ticket / PR', 'Component', 'Blocker / Status'],
    promptInstructions: 'Extract engineering and agile standup details. Focus on code deliverables, pull request statuses, architectural/database decisions, active technical impediments/blockers, and assigned pairing tasks.',
    sampleDocument: `# Engineering & Daily Standup
**Sprint:** Sprint 44 — Core Reliability & Latency  
**Date:** November 21, 2026 | **Team:** Platform Core Engineering  
**Attendees:** Jason (Audio Engine), Maria (Tauri Rust), Kenji (Next.js UI)

---

### Sprint Progress & Yesterday Deliverables
- **Jason:** Merged PR #412 optimizing CircularBuffer ring-buffer memory allocations.
- **Maria:** Implemented CoreAudio fallback for virtual audio capture on macOS Sequoia.
- **Kenji:** Redesigned Settings Recording tab with responsive 16-band EQ visualizer.

### Today Commitments & PR Releases
- **Jason:** Benchmarking Whisper.cpp Metal inference throughput with batch size 1.
- **Maria:** Investigating IPC latency between Tauri background worker and Next.js frontend.
- **Kenji:** Wiring live status badges and connection testing state machines in UI.

### Technical Decisions & Architecture
- **Decision:** Keep audio processing in 16kHz mono internally before passing to speech models.
- **Decision:** Use IPC batching for transcript events to eliminate UI thread micro-stutters.

### Blockers & Technical Impediments
| Engineer | Ticket / PR | Component | Blocker / Status |
| :--- | :--- | :--- | :--- |
| **Jason** | PR #419 | Speech Metal Kernel | Awaiting macOS 15.2 SDK beta test device |
| **Maria** | CORE-882 | SQLite WAL Mode | Resolved: File locking issue on Windows fixed |

### Peer Pairing Assignments
- Jason & Maria pairing at 15:30 to profile CoreAudio ring buffer memory consumption.`,
    isDefault: false,
    isSystem: true,
    createdAt: '2026-08-20T00:00:00.000Z',
    updatedAt: '2026-08-20T00:00:00.000Z'
  },
  {
    id: 'template-sales',
    name: 'Client & Sales Engagement',
    category: 'Commercial & Sales',
    description: 'Structured customer and commercial meeting report capturing client requirements, pain points, agreed scope, pricing terms, and customer follow-up actions.',
    sections: [
      'Client Discovery & Opportunity Context',
      'Agreed Deliverables & Scope',
      'Commercial Terms & Pricing',
      'Client & Account Action Items',
      'Follow-up Timeline & Go-Live'
    ],
    tableColumns: ['Stakeholder', 'Commitment / Deliverable', 'Target Date', 'Account Stage'],
    promptInstructions: 'Structure the summary for a sales or client engagement. Emphasize client needs and expectations, commercial or contractual agreements, agreed timeline milestones, and designated owners for deliverables.',
    sampleDocument: `# Client & Sales Engagement
**Client:** Acme Health Technologies  
**Date:** November 21, 2026 | **Deal Size:** Enterprise ($120k ARR)  
**Attendees:** Robert Sterling (Account Director), Lisa Zhang (Solutions Architect), Dr. Aris Thorne (Client VP)

---

### Client Discovery & Opportunity Context
Acme Health requires a strictly on-device, HIPAA-compliant speech-to-text meeting summarizer for medical executive discussions. Zero audio transmission off premises is mandatory.

### Agreed Deliverables & Scope
1. **On-Premise Deployment:** Delivery of Minomeet Desktop with local Neural AI models.
2. **Security Verification:** Comprehensive SOC2 Type II and on-device data isolation audit.
3. **Custom MOM Schema:** Specialization for clinical governance review meetings.

### Commercial Terms & Pricing
- **Licensing Model:** 250 Enterprise seats with annual prepaid billing.
- **SLA Tier:** Mission-critical dedicated engineer support with 4-hour response SLA.

### Client & Account Action Items
| Stakeholder | Commitment / Deliverable | Target Date | Account Stage |
| :--- | :--- | :--- | :--- |
| **Lisa Zhang** | Deliver Architecture & Air-Gapped Security Whitepaper | Nov 24, 2026 | Technical Discovery |
| **Dr. Thorne** | Finalize legal master services agreement (MSA) review | Dec 01, 2026 | Contract Review |
| **Robert Sterling** | Send executable enterprise pilot agreement | Nov 23, 2026 | Proposal Delivery |

### Follow-up Timeline & Go-Live
- Technical security review call scheduled for Tuesday, November 25.
- Target pilot commencement: December 08, 2026.`,
    isDefault: false,
    isSystem: true,
    createdAt: '2026-08-20T00:00:00.000Z',
    updatedAt: '2026-08-20T00:00:00.000Z'
  },
  {
    id: 'template-product-design',
    name: 'Product & Design Review',
    category: 'Product & Design',
    description: 'User experience critique, product spec decisions, UI flow reviews, design system enhancements, and prototype iteration timelines.',
    sections: [
      'Product Vision & User Problem',
      'Design Critiques & UX Feedback',
      'Scope Trade-offs & Spec Decisions',
      'Design System & Component Actions',
      'Sprint Release Timeline'
    ],
    tableColumns: ['Designer / PM', 'UX Flow / Component', 'Revision Needed', 'Release Target'],
    promptInstructions: 'Synthesize product and design review discussions. Capture user problems, specific UX feedback and critique notes, wireframe/spec decisions, design token/component updates, and target delivery sprints.',
    sampleDocument: `# Product & Design Review
**Feature Area:** Settings Redesign & Audio Device Calibration  
**Date:** November 21, 2026 | **Design Stage:** High-Fidelity Prototype Review  
**Attendees:** Chloe Martin (Lead Product Designer), Tyler Ross (Principal PM), Frank Wu (Frontend Lead)

---

### Product Vision & User Problem
Users require instant visual feedback on microphone calibration and speech engine readiness to eliminate recorded meeting failures caused by muted inputs or missing models.

### Design Critiques & UX Feedback
- **Input dB Meter:** The meter animation is smooth, but needs high-gain peak warning threshold (above -3dB) styled in amber/red.
- **Equalizer Spectrum:** 16-band spectrum visualizer received universal praise; add subtle smoothing interpolation.
- **Card Padding:** Standardized on 20px padding (rounded-2xl) across all settings tabs to ensure visual harmony.

### Scope Trade-offs & Spec Decisions
1. **Decision:** Move audio spectrum to pure HTML5 Web Audio API; avoid heavy third-party canvas libraries.
2. **Decision:** Collapse advanced acoustic pre-processing filters into simple 3-card toggles.

### Design System & Component Actions
| Designer / PM | UX Flow / Component | Revision Needed | Release Target |
| :--- | :--- | :--- | :--- |
| **Chloe Martin** | Mic Calibration Card | Add dB scale tick marks (-30dB, -12dB, 0dB) | Sprint 45 |
| **Frank Wu** | Audio Spectrum Bars | Implement CSS gradient color stops for peak bars | Sprint 45 |
| **Tyler Ross** | Onboarding Wizard | Audit 4-step wizard against new card design tokens | Sprint 46 |

### Sprint Release Timeline
- Design tokens finalized: Wednesday.
- Interactive prototypes handed off to frontend team: Friday at 17:00.`,
    isDefault: false,
    isSystem: true,
    createdAt: '2026-08-20T00:00:00.000Z',
    updatedAt: '2026-08-20T00:00:00.000Z'
  },
  {
    id: 'template-retrospective',
    name: 'Project Milestone & Retrospective',
    category: 'Project Management',
    description: 'Post-launch or sprint retrospective report capturing milestone health, successes/wins, process friction points, root-cause insights, and corrective actions.',
    sections: [
      'Milestone Health & Velocity',
      'Successes & What Went Well',
      'Friction Points & Root-Cause Challenges',
      'Process Improvements & Corrective Actions',
      'Next Sprint Deadlines'
    ],
    tableColumns: ['Process Area', 'Retrospective Finding', 'Action / Owner', 'Review Date'],
    promptInstructions: 'Analyze the retrospective meeting. Categorize outcomes into project milestone status, positive achievements (wins), root-cause friction points, and specific process improvements or action items for the upcoming phase.',
    sampleDocument: `# Project Milestone & Retrospective
**Milestone:** v1.2 Release & Core Architecture Upgrade  
**Date:** November 21, 2026 | **Facilitator:** Maya Lin (Scrum Master)  
**Attendees:** Entire Platform & Product Engineering Team (12 participants)

---

### Milestone Health & Velocity
Sprint goal completed at 94% velocity. 38 user stories delivered, 2 non-critical technical debt items deferred to Sprint 45. Overall team morale rated 4.6 / 5.

### Successes & What Went Well
- **Zero Downtime Deployments:** Live transcript migration had zero downtime or data loss across all beta accounts.
- **Inference Optimization:** On-device neural latency dropped by 42% on Apple Silicon hardware.
- **Cross-Team Collaboration:** Daily 10-minute standups kept frontend and Rust core engineers closely synchronized.

### Friction Points & Root-Cause Challenges
- **CI Build Bottlenecks:** Rust cargo compilation times exceeded 12 minutes on GitHub Actions runners.
- **Mock Service Complexity:** Discrepancies between browser mock audio contexts and native CoreAudio hardware.

### Process Improvements & Corrective Actions
| Process Area | Retrospective Finding | Action / Owner | Review Date |
| :--- | :--- | :--- | :--- |
| **CI / CD Pipeline** | Cargo cache misses caused long test runs | Enable sccache on CI runners (Alex) | Dec 01, 2026 |
| **Testing Harness** | Mock audio device collides with system default | Refactor device identity unit tests (Frank) | Nov 28, 2026 |
| **Design Review** | Design spec changes mid-sprint caused rework | Enforce strict Friday spec lock (Chloe) | Dec 05, 2026 |

### Next Sprint Deadlines
- Sprint 45 planning starts Monday at 09:30.
- Production release freeze scheduled for December 12, 2026.`,
    isDefault: false,
    isSystem: true,
    createdAt: '2026-08-20T00:00:00.000Z',
    updatedAt: '2026-08-20T00:00:00.000Z'
  }
];
