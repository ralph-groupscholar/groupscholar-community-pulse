const pulseData = {
  responses: [
    {
      id: 'resp-001',
      date: '2026-02-03',
      segment: 'Scholars',
      sentimentScore: 42,
      trustScore: 51,
      engagementScore: 64,
      themes: ['Funding gap', 'Advisor access'],
      channel: '1:1 check-in',
      note: 'Waiting on stipend confirmation is creating anxiety about spring housing.',
      urgency: 5,
      location: 'Atlanta, GA',
      program: 'Momentum Scholars',
      followUp: 'Confirm stipend release timeline + bridge fund policy.'
    },
    {
      id: 'resp-002',
      date: '2026-02-02',
      segment: 'Alumni',
      sentimentScore: 76,
      trustScore: 82,
      engagementScore: 70,
      themes: ['Career pathways', 'Networking'],
      channel: 'Survey',
      note: 'Alumni cohort felt energized after the hiring roundtable with recruiters.',
      urgency: 2,
      location: 'Remote',
      program: 'Launch Alumni',
      followUp: 'Schedule a follow-up roundtable focused on internships.'
    },
    {
      id: 'resp-003',
      date: '2026-01-29',
      segment: 'Mentors',
      sentimentScore: 61,
      trustScore: 68,
      engagementScore: 55,
      themes: ['Scheduling', 'Tools'],
      channel: 'Slack',
      note: 'Mentors want more structured prep prompts before office hours.',
      urgency: 3,
      location: 'Chicago, IL',
      program: 'Mentor Guild',
      followUp: 'Ship a templated mentor prep brief 24h before sessions.'
    },
    {
      id: 'resp-004',
      date: '2026-01-26',
      segment: 'Scholars',
      sentimentScore: 58,
      trustScore: 62,
      engagementScore: 72,
      themes: ['Program pacing', 'Community'],
      channel: 'Focus group',
      note: 'Scholars love peer pods but want clearer weekly expectations.',
      urgency: 3,
      location: 'Detroit, MI',
      program: 'Momentum Scholars',
      followUp: 'Publish a weekly cadence guide with time estimates.'
    },
    {
      id: 'resp-005',
      date: '2026-01-24',
      segment: 'Scholars',
      sentimentScore: 33,
      trustScore: 48,
      engagementScore: 59,
      themes: ['Financial stress', 'Wellbeing'],
      channel: 'Survey',
      note: 'Several scholars are struggling with food access between stipends.',
      urgency: 5,
      location: 'New Orleans, LA',
      program: 'Momentum Scholars',
      followUp: 'Trigger emergency micro-grant + partner resource list.'
    },
    {
      id: 'resp-006',
      date: '2026-01-20',
      segment: 'Alumni',
      sentimentScore: 69,
      trustScore: 74,
      engagementScore: 66,
      themes: ['Mentorship', 'Giving back'],
      channel: 'Survey',
      note: 'Alumni want a structured way to mentor current scholars in 30-minute blocks.',
      urgency: 2,
      location: 'Remote',
      program: 'Launch Alumni',
      followUp: 'Design micro-mentoring signup flow.'
    },
    {
      id: 'resp-007',
      date: '2026-01-17',
      segment: 'Mentors',
      sentimentScore: 44,
      trustScore: 57,
      engagementScore: 52,
      themes: ['Recognition', 'Feedback loops'],
      channel: 'Email',
      note: 'Mentors feel their insights are not surfacing in program strategy.',
      urgency: 4,
      location: 'Remote',
      program: 'Mentor Guild',
      followUp: 'Add mentor insight digest to monthly program review.'
    },
    {
      id: 'resp-008',
      date: '2026-01-12',
      segment: 'Scholars',
      sentimentScore: 81,
      trustScore: 86,
      engagementScore: 84,
      themes: ['Belonging', 'Coaching quality'],
      channel: 'Town hall',
      note: 'Scholars highlighted coaching as the biggest reason they stay engaged.',
      urgency: 1,
      location: 'Houston, TX',
      program: 'Momentum Scholars',
      followUp: 'Capture coaching testimonials for recruitment.'
    }
  ],
  events: [
    {
      id: 'evt-01',
      date: '2026-02-01',
      type: 'Program Update',
      label: 'Stipend processing delay communicated to scholars.',
      impact: 'Short-term trust dip, high urgency.',
      risk: 'Financial stress increase.'
    },
    {
      id: 'evt-02',
      date: '2026-01-25',
      type: 'Community',
      label: 'Scholar pod relaunch with new peer leads.',
      impact: 'Engagement lift in weekly attendance.',
      risk: 'Uneven expectation alignment.'
    },
    {
      id: 'evt-03',
      date: '2026-01-20',
      type: 'Alumni Activation',
      label: 'Hiring roundtable with 6 employer partners.',
      impact: 'High optimism among alumni cohort.',
      risk: 'Need sustained follow-through.'
    }
  ],
  actions: [
    {
      id: 'act-001',
      title: 'Confirm stipend release timeline and communicate to scholars',
      owner: 'Program Ops',
      due: '2026-02-09',
      status: 'Open',
      tags: ['Funding gap', 'Urgent'],
      linkedSignal: 'resp-001'
    },
    {
      id: 'act-002',
      title: 'Build weekly cadence guide with time estimates',
      owner: 'Program Lead',
      due: '2026-02-14',
      status: 'In progress',
      tags: ['Program pacing'],
      linkedSignal: 'resp-004'
    }
  ]
};
