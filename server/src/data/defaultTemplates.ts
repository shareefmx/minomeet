import { MOMTemplate } from '../types/index.js';

export const defaultTemplates: MOMTemplate[] = [
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
    promptInstructions: 'Generate a clean, structured Minutes of Meeting (MOM). Identify the central objective, list firm decisions made, extract concrete action items with assignees and due dates, summarize top discussion points, and specify next steps.',
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
      'Strategic Executive Summary',
      'Board & Leadership Approvals',
      'Strategic Directives & Deliverables',
      'Critical Risks & Impediments',
      'Governance & Milestone Schedule'
    ],
    promptInstructions: 'Synthesize the conversation into an executive briefing document. Highlight top-level strategic implications, formal decisions/approvals, organizational risks, and key roadmap deadlines. Avoid trivial conversational remarks.',
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
      'Today\'s Commitments & PR Releases',
      'Technical Decisions & System Architecture',
      'Blockers, Dependencies & Impediments',
      'Peer Pairing & Code Review Assignments'
    ],
    promptInstructions: 'Extract engineering and agile standup details. Focus on code deliverables, pull request statuses, architectural/database decisions, active technical impediments/blockers, and assigned pairing tasks.',
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
      'Client Context & Key Pain Points',
      'Agreed Deliverables & Project Scope',
      'Commercial & Contractual Terms',
      'Client & Vendor Action Items',
      'Follow-up Schedule & Target Go-Live'
    ],
    promptInstructions: 'Structure the summary for a sales or client engagement. Emphasize client needs and expectations, commercial or contractual agreements, agreed timeline milestones, and designated owners for deliverables.',
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
      'Milestone Status & Project Health',
      'Successes & What Went Well',
      'Friction Points & Root-Cause Challenges',
      'Process Adjustments & Action Items',
      'Key Deadlines for Next Sprint'
    ],
    promptInstructions: 'Analyze the retrospective meeting. Categorize outcomes into project milestone status, positive achievements (wins), root-cause friction points, and specific process improvements or action items for the upcoming phase.',
    isDefault: false,
    isSystem: true,
    createdAt: '2026-08-20T00:00:00.000Z',
    updatedAt: '2026-08-20T00:00:00.000Z'
  }
];
