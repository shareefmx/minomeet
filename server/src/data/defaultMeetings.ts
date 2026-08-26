import { Meeting, AppSettings } from '../types/index.js';

export const defaultSettings: AppSettings = {
  notifications: true,
  storagePath: '/Users/you/Minomeet/recordings',
  autoDeleteRecordingsDays: 30,
  saveAudio: true,
  audioFormat: 'MP4',
  transcriptionEngine: 'Nimbus Whisper · Local On-Device',
  liveCaptions: true,
  speakerLabels: true,
  autoSummary: true,
  defaultLanguage: 'English',
  defaultTemplate: 'Standard Meeting Notes',
  selectedModel: 'Nimbus 4B (High Quality)',
  theme: 'system',
  betaDiarization: true,
  betaAskMeetings: true,
  betaAutoFollowUp: true,
};

export const defaultMeetings: Meeting[] = [
  {
    id: 'meeting-1',
    title: 'Product Security Sync — Aug 24',
    createdAt: '2026-08-24T14:30:00.000Z',
    updatedAt: '2026-08-24T15:15:00.000Z',
    duration: '00:55',
    isPinned: true,
    tags: ['Security', 'Engineering', 'Rollout'],
    transcript: [
      {
        id: 't-1',
        time: '00:12',
        speaker: 'Dev',
        text: "Alright, let's start with the scanner updates — we swapped our legacy static scanner for the new Argus engine last week."
      },
      {
        id: 't-2',
        time: '00:24',
        speaker: 'Priya',
        text: 'Nice. And the dynamic scanner — Pulse — is that still in beta?'
      },
      {
        id: 't-3',
        time: '00:29',
        speaker: 'Dev',
        text: "Yeah, Pulse is in beta. It's built in-house specifically for single-page apps, which the old tool never handled well."
      },
      {
        id: 't-4',
        time: '00:41',
        speaker: 'Alex',
        text: 'Got it. Can we get a rollout date for Pulse going GA?'
      },
      {
        id: 't-5',
        time: '00:47',
        speaker: 'Priya',
        text: "I'll have a firm date by Friday — want to run one more regression pass first."
      },
      {
        id: 't-6',
        time: '00:55',
        speaker: 'Dev',
        text: "Sounds good. Let's also flag this for the Q3 roadmap doc so it doesn't get lost."
      }
    ],
    summary: {
      title: 'Product Security Sync — Aug 24',
      date: 'Aug 24, 2026',
      attendees: ['Dev (Security Lead)', 'Priya (QA / Release)', 'Alex (Product Manager)'],
      summary: 'The team reviewed recent security tooling changes, confirming the Argus static scanner is fully rolled out across all codebases and discussing the beta status of the in-house Pulse dynamic scanner ahead of its upcoming GA release.',
      keyDecisions: [
        'Replaced the legacy static scanner with Argus, company-wide without disruption.',
        'Pulse (in-house dynamic scanner) remains in beta pending one final regression pass.'
      ],
      actionItems: [
        {
          id: 'act-1',
          owner: 'Priya',
          task: 'Confirm Pulse GA rollout date after completing the final regression pass',
          due: 'Fri, Aug 28',
          notes: 'Pending regression pass on single-page app fixtures',
          completed: false
        },
        {
          id: 'act-2',
          owner: 'Dev',
          task: 'Add Argus & Pulse scanner status update to the official Q3 roadmap doc',
          due: 'Mon, Aug 31',
          notes: 'Coordinate with documentation team',
          completed: false
        }
      ],
      discussionHighlights: [
        'Argus scanner rollout completed with zero reported build pipeline regressions.',
        'Pulse specifically targets modern client-side single-page app vulnerability surfaces that legacy tools consistently missed.',
        'Final release candidate date for Pulse GA will be finalized by Friday afternoon.'
      ],
      nextSteps: [
        'Review regression pass results on Friday morning.',
        'Publish Q3 Security Milestone update to engineering leadership.'
      ],
      template: 'Standard Meeting Notes',
      language: 'English',
      modelUsed: 'Nimbus 4B (High Quality)',
      generatedAt: '2026-08-24T15:16:00.000Z'
    }
  },
  {
    id: 'meeting-2',
    title: 'Weekly Standup — Notes & Agenda',
    createdAt: '2026-08-23T09:00:00.000Z',
    updatedAt: '2026-08-23T09:30:00.000Z',
    duration: '00:30',
    tags: ['Standup', 'Sprint 32', 'Core Team'],
    transcript: [
      {
        id: 't-201',
        time: '00:05',
        speaker: 'Sarah',
        text: 'Morning everyone. Let’s do a quick round: updates on the auth migration and UI redesign.'
      },
      {
        id: 't-202',
        time: '00:15',
        speaker: 'Ken',
        text: 'OAuth2 refresh token rotation is done and merged. Working on the session revocation endpoints today.'
      },
      {
        id: 't-203',
        time: '00:22',
        speaker: 'Maya',
        text: 'Design system Tailwind v4 tokens are ready. I need one engineer to help test dark mode contrast tokens.'
      },
      {
        id: 't-204',
        time: '00:28',
        speaker: 'Ken',
        text: 'I can pair with Maya this afternoon after standup.'
      }
    ],
    summary: {
      title: 'Weekly Standup — Notes & Agenda',
      date: 'Aug 23, 2026',
      attendees: ['Sarah (Scrum Master)', 'Ken (Backend)', 'Maya (Design Lead)'],
      summary: 'Brief standup covering OAuth2 token rotation completion, session revocation endpoint work, and pairing schedule for Tailwind v4 dark mode contrast verification.',
      keyDecisions: [
        'OAuth2 token rotation PR approved and deployed to staging.',
        'Ken and Maya to pair today on UI contrast tokens.'
      ],
      actionItems: [
        {
          id: 'act-201',
          owner: 'Ken',
          task: 'Complete session revocation endpoints and write integration tests',
          due: 'Tue, Aug 25',
          notes: 'Ensure Redis session invalidation TTL is correct',
          completed: true
        },
        {
          id: 'act-202',
          owner: 'Ken & Maya',
          task: 'Pair on dark mode accessibility contrast verification',
          due: 'Today, 3:00 PM',
          notes: 'Target WCAG AAA compliance for text elements',
          completed: false
        }
      ],
      discussionHighlights: [
        'Auth migration is ahead of schedule.',
        'New Tailwind tokens will eliminate 400 lines of legacy CSS.'
      ],
      nextSteps: [
        'Merge dark mode token branch by tomorrow morning.',
        'QA deployment scheduled for Wednesday.'
      ],
      template: 'Daily Standup',
      language: 'English',
      modelUsed: 'Nimbus 2B (Balanced)',
      generatedAt: '2026-08-23T09:32:00.000Z'
    }
  },
  {
    id: 'meeting-3',
    title: 'Meeting 2026-08-22_09-46',
    createdAt: '2026-08-22T09:46:00.000Z',
    updatedAt: '2026-08-22T10:10:00.000Z',
    duration: '00:24',
    tags: ['Architecture', 'Database'],
    transcript: [
      {
        id: 't-301',
        time: '00:04',
        speaker: 'Vikram',
        text: 'We are seeing read spikes on the user activity table during peak hours in US East.'
      },
      {
        id: 't-302',
        time: '00:12',
        speaker: 'Elena',
        text: 'Adding read replicas or caching frequently accessed profile summaries in Redis would drop DB load by 70%.'
      },
      {
        id: 't-303',
        time: '00:20',
        speaker: 'Vikram',
        text: 'Let’s benchmark Redis caching first since we already have the cluster provisioned.'
      }
    ],
    summary: {
      title: 'Meeting 2026-08-22_09-46',
      date: 'Aug 22, 2026',
      attendees: ['Vikram (Principal Architect)', 'Elena (DBA / SRE)'],
      summary: 'Discussed database read load during peak traffic spikes and agreed on implementing Redis caching for user profile summaries before considering additional read replicas.',
      keyDecisions: [
        'Prioritize Redis caching over spinning up new database read replicas.',
        'Benchmark cache hit ratio before full rollout.'
      ],
      actionItems: [
        {
          id: 'act-301',
          owner: 'Elena',
          task: 'Implement 5-minute TTL Redis caching layer on user activity queries',
          due: 'Thu, Aug 27',
          notes: 'Monitor memory utilization on primary Redis cluster',
          completed: false
        }
      ],
      discussionHighlights: [
        'Peak read queries are 92% repetitive reads of unchanged profile data.',
        'Redis caching estimated to reduce database CPU by 70%.'
      ],
      nextSteps: [
        'Deploy canary caching on 10% of read traffic.'
      ],
      template: 'Project Sync / Status Update',
      language: 'English',
      modelUsed: 'Nimbus 4B (High Quality)',
      generatedAt: '2026-08-22T10:11:00.000Z'
    }
  },
  {
    id: 'meeting-4',
    title: 'Meeting 2026-08-22_09-38',
    createdAt: '2026-08-22T09:38:00.000Z',
    updatedAt: '2026-08-22T09:45:00.000Z',
    duration: '00:07',
    tags: ['Quick Sync'],
    transcript: [
      {
        id: 't-401',
        time: '00:02',
        speaker: 'Sam',
        text: 'Quick check: did everyone receive the calendar invite for next week’s offsite?'
      },
      {
        id: 't-402',
        time: '00:05',
        speaker: 'Rachel',
        text: 'Yes, confirmed. I’ll send the dietary requirements form by noon.'
      }
    ]
    // Note: No summary intentionally for meeting-4 so user can test "Generate Summary" on a fresh meeting!
  },
  {
    id: 'meeting-5',
    title: 'Meeting 2026-08-22_08-44',
    createdAt: '2026-08-22T08:44:00.000Z',
    updatedAt: '2026-08-22T08:55:00.000Z',
    duration: '00:11',
    tags: ['Client Sync', 'Onboarding'],
    transcript: [
      {
        id: 't-501',
        time: '00:03',
        speaker: 'Jordan',
        text: 'Acme Corp requested onboarding documentation and API sandbox keys for their dev team.'
      },
      {
        id: 't-502',
        time: '00:08',
        speaker: 'Tara',
        text: 'I generated the sandbox client ID and secret. Will email their tech lead by EOD.'
      }
    ],
    summary: {
      title: 'Meeting 2026-08-22_08-44',
      date: 'Aug 22, 2026',
      attendees: ['Jordan (Account Exec)', 'Tara (Solutions Engineer)'],
      summary: 'Aligned on delivering sandbox access credentials and onboarding guide to Acme Corp.',
      keyDecisions: [
        'Sandbox environment provisioned with 30-day trial quota.'
      ],
      actionItems: [
        {
          id: 'act-501',
          owner: 'Tara',
          task: 'Email sandbox keys and Postman collection to Acme Corp tech lead',
          due: 'Today, 5:00 PM',
          notes: 'Include webhook guide in attachment',
          completed: true
        }
      ],
      discussionHighlights: [
        'Client is eager to start prototyping in sprint 33.'
      ],
      template: 'Client / Sales Meeting',
      language: 'English',
      modelUsed: 'Nimbus 1B (Fast)',
      generatedAt: '2026-08-22T08:56:00.000Z'
    }
  }
];

