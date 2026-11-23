export const demoPassword = 'Demo@12345';

export const roleProfiles = [
  {
    key: 'superadmin',
    name: 'Platform Super Admin',
    email: 'platform.admin@demo.com',
    responsibility: 'Onboard publishers, configure platform services and provide support without routine access to private editorial data.',
    areas: ['publishers', 'editions', 'users', 'roles', 'ai-newsroom', 'templates', 'issues', 'campaigns', 'centers', 'reports'],
    work: [
      ['AI Newsroom & Layout', 'Collect live news, analyze with AI, and generate page-wise newspaper editions.', 'ai-newsroom'],
      ['Publisher onboarding', 'Set up publisher workspaces and platform access.', 'publishers'],
      ['Service configuration', 'Coordinate platform-wide setup and support.', 'reports'],
      ['Operational oversight', 'Review publishing, campaign and audit workflows.', 'reports'],
    ],
  },
  {
    key: 'publisheradmin',
    name: 'Publisher Owner/Admin',
    email: 'publisher.owner@demo.com',
    responsibility: 'Configure newspapers, brands, regions, users, campaign budgets and approvals.',
    areas: ['publishers', 'editions', 'users', 'roles', 'ai-newsroom', 'templates', 'issues', 'campaigns', 'reports'],
    work: [
      ['AI Newsroom & Layout', 'Collect live news, analyze with AI, and generate page-wise newspaper editions.', 'ai-newsroom'],
      ['Newspaper & brand setup', 'Manage the publisher’s newspaper titles and languages.', 'publishers'],
      ['Regions & editions', 'Configure local editions and publication markets.', 'editions'],
      ['Approvals & campaigns', 'Coordinate editorial setup, publication and campaigns.', 'campaigns'],
      ['Team accounts', 'Create and review role-based accounts for your publisher staff.', 'users'],
      ['Collection center assignments', 'Assign intake centers to their responsible operators.', 'centers'],
    ],
  },
  {
    key: 'editionmanager',
    name: 'State Manager / Edition Manager',
    email: 'edition.manager@demo.com',
    responsibility: 'Manage edition settings, schedules, local templates and final edition coordination.',
    areas: ['editions', 'ai-newsroom', 'templates', 'issues', 'reports'],
    work: [
      ['AI Newsroom & Layout', 'Collect live news, analyze with AI, and generate page-wise newspaper editions.', 'ai-newsroom'],
      ['Edition settings', 'Maintain state, district, city and language details.', 'editions'],
      ['Local templates', 'Coordinate approved layouts for the edition.', 'templates'],
      ['Schedules & final coordination', 'Prepare publication issues and press handoff.', 'issues'],
    ],
  },
  {
    key: 'editor',
    name: 'Editor / Chief Editor',
    email: 'editor@demo.com',
    responsibility: 'Review sources, approve stories, check page proofs and lock publication.',
    areas: ['editorial', 'ai-newsroom', 'issues', 'reports'],
    work: [
      ['AI Newsroom & Layout', 'Collect live news, analyze with AI, and generate page-wise newspaper editions.', 'ai-newsroom'],
      ['Source & rights review', 'Check source attribution and rights status.', 'editorial'],
      ['Story approvals', 'Review submitted stories and editorial decisions.', 'editorial'],
      ['Proof & publication lock', 'Coordinate final issue proofing and handoff.', 'issues'],
    ],
  },
  {
    key: 'reporter',
    name: 'Reporter / Agency Feed',
    email: 'reporter@demo.com',
    responsibility: 'Submit stories, media and corrections within assigned geographies.',
    areas: ['editorial', 'ai-newsroom'],
    work: [
      ['AI Newsroom & Layout', 'Collect live news, analyze with AI, and generate page-wise newspaper editions.', 'ai-newsroom'],
      ['Submit a sourced story', 'Create story drafts with attribution and rights details.', 'editorial'],
      ['Assigned editions', 'Choose the active newspaper editions for a submission.', 'editorial'],
      ['Corrections', 'Follow up on editorial feedback and resubmit drafts.', 'editorial'],
    ],
  },
  {
    key: 'designer',
    name: 'Designer / Prepress Operator',
    email: 'designer@demo.com',
    responsibility: 'Create approved template versions, adjust page layouts and run preflight.',
    areas: ['templates', 'issues'],
    work: [
      ['Template versions', 'Prepare approved page and campaign template versions.', 'templates'],
      ['Page layout', 'Coordinate layout adjustments for publication issues.', 'issues'],
      ['Preflight', 'Check press-ready files before publication handoff.', 'issues'],
    ],
  },
  {
    key: 'campaignmanager',
    name: 'Advertising / Campaign Manager',
    email: 'campaign.manager@demo.com',
    responsibility: 'Book advertisements, define coupon campaigns and placement constraints.',
    areas: ['campaigns', 'reports'],
    work: [
      ['Campaign setup', 'Coordinate approved coupon campaign details and terms.', 'campaigns'],
      ['Ad booking', 'Manage advertising placement and campaign schedules.', 'campaigns'],
      ['Campaign reporting', 'Review available campaign and placement reporting.', 'reports'],
    ],
  },
  {
    key: 'collectionoperator',
    name: 'Collection Center Manager / Operator',
    email: 'collection.operator@demo.com',
    responsibility: 'Receive physical sheets and record scan intake receipt IDs only for the assigned center.',
    areas: ['centers', 'submissions'],
    work: [
      ['Center assignments', 'Review collection-center locations and assignments.', 'centers'],
      ['Physical intake', 'Record incoming physical sheets and receipt IDs.', 'submissions'],
      ['Intake status', 'Track records received at the assigned center.', 'submissions'],
    ],
  },
  {
    key: 'verificationofficer',
    name: 'Verification Officer / Supervisor',
    email: 'verification.officer@demo.com',
    responsibility: 'Inspect coupon series and original sheet evidence, then decide verification status.',
    areas: ['submissions', 'reports'],
    work: [
      ['Evidence inspection', 'Check coupon series and original sheet evidence.', 'submissions'],
      ['Verification decision', 'Record the review status for assigned submissions.', 'submissions'],
      ['Review history', 'Review verification activity and reports.', 'reports'],
    ],
  },
  {
    key: 'drawofficer',
    name: 'Draw Officer / Auditor',
    email: 'draw.officer@demo.com',
    responsibility: 'Conduct authorized draws, freeze entries and audit seed and winner approvals.',
    areas: ['campaigns', 'submissions', 'reports'],
    work: [
      ['Authorized draw', 'Coordinate approved campaign draw operations.', 'campaigns'],
      ['Entry freeze', 'Verify entries are frozen before a draw.', 'submissions'],
      ['Audit approvals', 'Track seed, winner and draw approval records.', 'reports'],
    ],
  },
  {
    key: 'reader',
    name: 'Reader / Participant',
    email: 'reader@demo.com',
    responsibility: 'Use the optional campaign portal for consent, status, claims and contact management.',
    areas: ['campaigns'],
    work: [
      ['Campaign information', 'Review participant campaign details and terms.', 'campaigns'],
      ['Consent & status', 'Manage consent and check participation status.', 'campaigns'],
      ['Claims & contact', 'Follow up on claims and keep contact details current.', 'campaigns'],
    ],
  },
];

export function getRoleProfile(roleName) {
  const normalizedRole = (roleName || '').toLowerCase().replace(/[\s/_-]+/g, '');
  return roleProfiles.find((profile) => profile.key === normalizedRole) || roleProfiles[0];
}
