export const newsletterSubsSeedArray = [
  { email: 'subscriber1@example.com', name: 'Timmy', uniqueStringUnsubscribe: 'abc123', isVerified: true },
  { email: 'subscriber2@example.com', name: 'Sam' },
  { email: 'subscriber3@example.com', name: 'Karol', uniqueStringUnsubscribe: 'def456', isVerified: true },
  { email: 'subscriber4@example.com', name: 'Alice', uniqueStringUnsubscribe: 'ghi789', isVerified: true },
  { email: 'subscriber5@example.com', name: 'Bob' },
  { email: 'subscriber6@example.com', name: 'Lena', uniqueStringUnsubscribe: 'jkl012', isVerified: true },
  { email: 'subscriber7@example.com', name: 'Mark' },
  { email: 'subscriber8@example.com', name: 'Nina', uniqueStringUnsubscribe: 'mno345', isVerified: true },
  { email: 'subscriber9@example.com', name: 'Jake' },
  { email: 'subscriber10@example.com', name: 'Daisy', uniqueStringUnsubscribe: 'pqr678', isVerified: true },
  { email: 'subscriber11@example.com', name: 'Tara' },
  { email: 'subscriber12@example.com', name: 'Leo', uniqueStringUnsubscribe: 'stu901', isVerified: true },
  { email: 'subscriber13@example.com', name: 'Mia' },
  { email: 'subscriber14@example.com', name: 'Noah', uniqueStringUnsubscribe: 'vwx234', isVerified: true },
  { email: 'subscriber15@example.com', name: 'Olivia' },
  { email: 'subscriber16@example.com', name: 'Lucas', uniqueStringUnsubscribe: 'yz1234', isVerified: true },
  { email: 'subscriber17@example.com', name: 'Ella' },
  { email: 'subscriber18@example.com', name: 'Max', uniqueStringUnsubscribe: 'abc567', isVerified: true },
  { email: 'subscriber19@example.com', name: 'Zoe' },
  { email: 'subscriber20@example.com', name: 'Finn', uniqueStringUnsubscribe: 'def890', isVerified: true },
];

export const newsletterPublicationsSeedArray = [
  // Drafts (Unpublished)
  {
    title: '📝 Draft: January Plans',
    content: `
      <p>Here's what we aim to achieve in January:</p>
      <ul>
        <li>Kickoff new marketing campaigns</li>
        <li>Roll out the updated UI</li>
        <li>Host a webinar for early users</li>
        <li>Improve onboarding flows</li>
        <li>Start performance audits</li>
      </ul>
    `,
  },
  {
    title: '📝 Draft: February Progress Report',
    content: `
      <p>Our February efforts include:</p>
      <ol>
        <li>Fixing user-reported bugs</li>
        <li>Completing mobile redesign</li>
        <li>Launching A/B tests for signups</li>
        <li>Hiring two new engineers</li>
        <li>Publishing first customer case study</li>
      </ol>
    `,
  },
  {
    title: '📝 Draft: Community Growth Strategy',
    content: `
      <p>Community building is our 2025 focus:</p>
      <ul>
        <li>Monthly AMAs</li>
        <li>Discord server improvements</li>
        <li>Contributor spotlights</li>
        <li>Partnerships with creators</li>
        <li>Weekly live demos</li>
      </ul>
    `,
  },
  {
    title: '📝 Draft: Internal Tooling Overhaul',
    content: `
      <p>Revamping internal systems:</p>
      <ul>
        <li>New CI/CD pipelines</li>
        <li>Centralized logging dashboard</li>
        <li>Improved test coverage</li>
        <li>Role-based access control</li>
        <li>Documentation update sprint</li>
      </ul>
    `,
  },
  {
    title: '📝 Draft: Summer Product Preview',
    content: `
      <p>We’re testing new ideas for summer:</p>
      <ul>
        <li>Live collaboration tools</li>
        <li>Team workspace UX</li>
        <li>Weekly feedback surveys</li>
        <li>Beta testing invites</li>
        <li>New onboarding flow</li>
      </ul>
    `,
  },
  {
    title: '📝 Draft: Feedback Roundup',
    content: `
      <p>We appreciate your input:</p>
      <ul>
        <li>Top requests are noted</li>
        <li>We're refining roadmap priorities</li>
        <li>Weekly reviews underway</li>
        <li>Expect UI refinements soon</li>
        <li>Thank you for being involved</li>
      </ul>
    `,
  },
  {
    title: '📝 Draft: Autumn Onboarding Refresh',
    content: `
      <p>Making onboarding smoother:</p>
      <ul>
        <li>Video walkthroughs</li>
        <li>Tooltips and guides</li>
        <li>New user dashboard</li>
        <li>In-app live chat</li>
        <li>Shorter setup forms</li>
      </ul>
    `,
  },
  {
    title: '📝 Draft: Year-End Reflections',
    content: `
      <p>Looking back on 2024:</p>
      <ul>
        <li>Record user growth</li>
        <li>10 new features released</li>
        <li>Infrastructure scaled up</li>
        <li>Global user base expanded</li>
        <li>Exciting roadmap for 2025</li>
      </ul>
    `,
  },
  {
    title: '📝 Draft: Bug Fix Report Q1',
    content: `
      <p>Here are the main fixes:</p>
      <ul>
        <li>Mobile crashing resolved</li>
        <li>Form validations updated</li>
        <li>Performance boosted by 20%</li>
        <li>Search indexing corrected</li>
        <li>Better caching for assets</li>
      </ul>
    `,
  },
  {
    title: '📝 Draft: FAQ Page Update',
    content: `
      <p>Improvements to FAQs:</p>
      <ul>
        <li>Grouped by category</li>
        <li>Searchable questions</li>
        <li>Updated policies</li>
        <li>Live support links</li>
        <li>Mobile-friendly layout</li>
      </ul>
    `,
  },

  // Published
  {
    title: '🎉 Welcome to Our Newsletter!',
    content: `
      <p>Thanks for joining our community!</p>
      <p>Each month, you’ll get updates about new features, team insights, and stories from our users.</p>
      <p>We’re glad to have you here.</p>
      <p>Let us know your thoughts any time.</p>
      <p>Enjoy the ride!</p>
    `,
    publishedAt: new Date('2025-01-15T09:00:00Z'),
    isPublished: true,
  },
  {
    title: '🚀 April Launch Update',
    content: `
      <p>April was a huge month for us:</p>
      <ul>
        <li>We launched new collaboration tools</li>
        <li>Improved our API performance</li>
        <li>Expanded team by 4 engineers</li>
        <li>Held our first product webinar</li>
        <li>Shipped 3 UI upgrades</li>
      </ul>
    `,
    publishedAt: new Date('2025-04-01T10:30:00Z'),
    isPublished: true,
  },
  {
    title: '📢 May Highlights & Announcements',
    content: `
      <p>Here’s what’s new:</p>
      <ul>
        <li>Dark mode is now available</li>
        <li>We’ve added keyboard shortcuts</li>
        <li>New changelog page</li>
        <li>New enterprise onboarding program</li>
        <li>Weekly bug-fix rollups</li>
      </ul>
    `,
    publishedAt: new Date('2025-05-05T08:15:00Z'),
    isPublished: true,
  },
  {
    title: '🌍 Going Global: Our Expansion Plans',
    content: `
      <p>We’re officially expanding into:</p>
      <ul>
        <li>Europe</li>
        <li>South America</li>
        <li>Australia</li>
        <li>South-East Asia</li>
        <li>Middle East</li>
      </ul>
    `,
    publishedAt: new Date('2025-03-12T11:45:00Z'),
    isPublished: true,
  },
  {
    title: '📈 Q1 Product Recap',
    content: `
      <p>Big wins this quarter:</p>
      <ol>
        <li>New dashboard analytics</li>
        <li>Improved file uploads</li>
        <li>24/7 support coverage</li>
        <li>New docs and videos</li>
        <li>Better admin roles</li>
      </ol>
    `,
    publishedAt: new Date('2025-03-30T15:00:00Z'),
    isPublished: true,
  },
  {
    title: '💬 Customer Spotlight: Sarah',
    content: `
      <p>Meet Sarah, a power user:</p>
      <ul>
        <li>Grew revenue 3x using our tools</li>
        <li>Shared her feedback in a webinar</li>
        <li>Suggested new roadmap items</li>
        <li>Improved collaboration in her team</li>
        <li>Helped us fix a bug!</li>
      </ul>
    `,
    publishedAt: new Date('2025-02-27T12:20:00Z'),
    isPublished: true,
  },
  {
    title: '🔐 Security & Privacy Updates',
    content: `
      <p>We’ve made major improvements:</p>
      <ul>
        <li>2FA now required for admins</li>
        <li>All data encrypted at rest</li>
        <li>New audit log features</li>
        <li>Daily backup reports</li>
        <li>New privacy policy published</li>
      </ul>
    `,
    publishedAt: new Date('2025-04-22T17:00:00Z'),
    isPublished: true,
  },
  {
    title: '📅 June Events & Community',
    content: `
      <p>Upcoming events this month:</p>
      <ul>
        <li>Live AMA June 14</li>
        <li>Feature preview stream</li>
        <li>Partner showcase</li>
        <li>Q&A session with product team</li>
        <li>New community badge rollout</li>
      </ul>
    `,
    publishedAt: new Date('2025-06-01T09:00:00Z'),
    isPublished: true,
  },
  {
    title: '🛠️ Maintenance Report',
    content: `
      <p>This month’s system maintenance:</p>
      <ul>
        <li>Server upgrades complete</li>
        <li>Database migration finished</li>
        <li>Improved API response times</li>
        <li>Uptime remains 99.98%</li>
        <li>No major outages reported</li>
      </ul>
    `,
    publishedAt: new Date('2025-05-20T11:00:00Z'),
    isPublished: true,
  },
  {
    title: '🎨 UI Improvements Rollout',
    content: `
      <p>We’ve refreshed the app visuals:</p>
      <ul>
        <li>New fonts and spacing</li>
        <li>Color palette adjustments</li>
        <li>Better mobile scaling</li>
        <li>Improved focus states</li>
        <li>Accessible contrast ratios</li>
      </ul>
    `,
    publishedAt: new Date('2025-05-29T10:45:00Z'),
    isPublished: true,
  },
];
