import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Navigate, NavLink, Route, Routes, useParams } from 'react-router-dom';
import {
  Archive, BookOpen, Building2, CalendarDays, ChevronDown, MoreHorizontal, X,
  FileStack, LayoutDashboard, LogOut, Map, Megaphone, Newspaper, RotateCw, Settings2,
  ShieldCheck, Sparkles, Users,
} from 'lucide-react';
import Login from './components/Login';
import BrandLogo from './components/BrandLogo';
import PlatformPublishersModule from './components/PlatformPublishersModule';
import TeamUsersModule from './components/TeamUsersModule';
import RoleResponsibilitiesModule from './components/RoleResponsibilitiesModule';
import AiNewsroomModule from './components/AiNewsroomModule';
import { RoleWorkflowPage } from './components/WorkflowModule';
import { api, restoreSession, setAccessToken } from './api';
import { getRoleProfile } from './roles';

const navigation = [
  { label: 'Overview', path: '/', icon: LayoutDashboard },
  { label: 'AI Newsroom', path: '/ai-newsroom', icon: Sparkles },
  { label: 'Newspaper titles', path: '/publishers', icon: Building2 },
  { label: 'Editions & regions', path: '/editions', icon: Map },
  { label: 'Team users', path: '/users', icon: Users },
  { label: 'Role responsibilities', path: '/roles', icon: ShieldCheck },
  { label: 'Editorial desk', path: '/editorial', icon: BookOpen },
  { label: 'Templates', path: '/templates', icon: FileStack },
  { label: 'Publication issues', path: '/issues', icon: CalendarDays },
  { label: 'Campaigns', path: '/campaigns', icon: Megaphone },
  { label: 'Collection centers', path: '/centers', icon: Archive },
  { label: 'Submissions', path: '/submissions', icon: Users },
  { label: 'Reports & audit', path: '/reports', icon: ShieldCheck },
];

const pageCopy = {
  'ai-newsroom': ['AI Newsroom & Page Layout', 'Collect live news, analyze with AI, and generate page-wise newspaper editions.'],
  publishers: ['Newspaper titles', 'Manage newspaper titles in the publisher workspace you signed in to.'],
  editions: ['Editions & regions', 'Organize publication editions by state, district, city and language.'],
  users: ['Team users', 'Create accounts and assign newspaper-workspace roles to your team.'],
  roles: ['Role responsibilities', 'Review the actors and operational responsibilities available in this workspace.'],
  editorial: ['Editorial desk', 'Review sourced stories, rights and editorial approvals.'],
  templates: ['Template library', 'Version page, coupon and collection-sheet designs for each edition.'],
  issues: ['Publication issues', 'Prepare edition issues, proofs, approvals and press handoff.'],
  campaigns: ['Campaigns', 'Configure coupon schedules, eligibility rules and approved terms.'],
  centers: ['Collection centers', 'Manage authorized submission locations and campaign assignments.'],
  submissions: ['Submissions', 'Receive physical entry records and manage verification decisions.'],
  reports: ['Reports & audit', 'Review campaign, editorial and publishing activity.'],
};

const roleDashboardMetrics = {
  superadmin: [
    { label: 'Publisher newspapers', summaryKey: 'activeNewspapers', detail: 'Across active publisher workspaces' },
    { label: 'Active editions', summaryKey: 'activeEditions', detail: 'Across active publisher workspaces' },
  ],
  publisheradmin: [
    { label: 'Newspaper titles', summaryKey: 'activeNewspapers', detail: 'Active in your workspace' },
    { label: 'Active editions', summaryKey: 'activeEditions', detail: 'Configured publication markets' },
    { label: 'Campaigns to set up', kind: 'campaign', statuses: ['draft'], area: 'campaigns' },
    { label: 'Issues in proof', kind: 'issue', statuses: ['proof'], area: 'issues' },
  ],
  editionmanager: [
    { label: 'Active editions', summaryKey: 'activeEditions', detail: 'Configured publication markets' },
    { label: 'Issues to coordinate', kind: 'issue', statuses: ['planning', 'proof'], area: 'issues' },
    { label: 'Templates to review', kind: 'template', statuses: ['draft', 'review'], area: 'templates' },
  ],
  editor: [
    { label: 'Stories to review', summaryKey: 'storiesToReview', detail: 'Submitted or under editorial review' },
    { label: 'Approved stories', summaryKey: 'approvedStories', detail: 'Ready for issue planning' },
    { label: 'Issue proofs', kind: 'issue', statuses: ['proof'], area: 'issues' },
  ],
  reporter: [
    { label: 'Drafts and corrections', kind: 'article', statuses: ['draft', 'needs_changes'], area: 'editorial' },
    { label: 'Submitted stories', kind: 'article', statuses: ['submitted', 'under_review'], area: 'editorial' },
  ],
  designer: [
    { label: 'Templates in progress', kind: 'template', statuses: ['draft', 'review'], area: 'templates' },
    { label: 'Pages in proof', kind: 'issue', statuses: ['planning', 'proof'], area: 'issues' },
  ],
  campaignmanager: [
    { label: 'Campaigns to prepare', kind: 'campaign', statuses: ['draft'], area: 'campaigns' },
    { label: 'Campaigns awaiting launch', kind: 'campaign', statuses: ['approved'], area: 'campaigns' },
    { label: 'Live campaigns', kind: 'campaign', statuses: ['active'], area: 'campaigns' },
  ],
  collectionoperator: [
    { label: 'Assigned active centers', kind: 'center', statuses: ['active'], area: 'centers' },
    { label: 'Sheets received', kind: 'intake', statuses: ['received'], area: 'submissions' },
  ],
  verificationofficer: [
    { label: 'Cases awaiting verification', kind: 'verification', statuses: ['pending'], area: 'submissions' },
    { label: 'Intakes to inspect', kind: 'intake', statuses: ['received', 'frozen'], area: 'submissions' },
  ],
  drawofficer: [
    { label: 'Draws scheduled', kind: 'draw', statuses: ['scheduled'], area: 'campaigns' },
    { label: 'Draws with frozen entries', kind: 'draw', statuses: ['entries_frozen'], area: 'campaigns' },
    { label: 'Intakes to reconcile', kind: 'intake', statuses: ['received', 'frozen'], area: 'submissions' },
  ],
  reader: [
    { label: 'Available campaigns', kind: 'campaign', statuses: ['active'], area: 'campaigns' },
    { label: 'Claims in progress', kind: 'claim', statuses: ['submitted', 'under_review'], area: 'campaigns' },
  ],
};

function Overview({ user, profile }) {
  const [summary, setSummary] = useState(null);
  const [summaryLoaded, setSummaryLoaded] = useState(false);
  const [workflowRecords, setWorkflowRecords] = useState({});
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [workflowLoaded, setWorkflowLoaded] = useState(false);
  const [workflowError, setWorkflowError] = useState('');
  const [workflowRefresh, setWorkflowRefresh] = useState(0);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const summaryRequest = useRef(null);
  const canViewSummary = user?.roleName === 'superadmin' || user?.permissions?.includes('dashboard:read');
  const metrics = roleDashboardMetrics[profile.key] || [];
  const workflowKinds = [...new Set(metrics.map((metric) => metric.kind).filter((kind) => kind && kind !== 'article'))];
  const needsArticles = metrics.some((metric) => metric.kind === 'article');
  const canLoadWorkflowMetrics = workflowKinds.length > 0 || needsArticles;

  const loadSummary = useCallback(async () => {
    if (summaryRequest.current) return;
    const controller = new AbortController();
    summaryRequest.current = controller;
    setRefreshing(true);
    try {
      const { data } = await api.get('/api/v1/dashboard/summary', { signal: controller.signal });
      setSummary(data.data);
      setSummaryLoaded(true);
      setError('');
    } catch (requestError) {
      if (requestError.code !== 'ERR_CANCELED') {
        setError(requestError.response?.data?.message || 'Unable to load workspace metrics.');
        setSummaryLoaded(true);
      }
    } finally {
      if (summaryRequest.current === controller) {
        summaryRequest.current = null;
        setRefreshing(false);
      }
      if (!controller.signal.aborted) setSummaryLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!canViewSummary) {
      setSummary(null);
      setSummaryLoaded(true);
      return undefined;
    }
    setSummary(null);
    setSummaryLoaded(false);
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') loadSummary();
    };
    refreshWhenVisible();
    const interval = window.setInterval(refreshWhenVisible, 30000);
    window.addEventListener('focus', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshWhenVisible);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      const request = summaryRequest.current;
      summaryRequest.current = null;
      request?.abort();
    };
  }, [canViewSummary, loadSummary, user?.tenantId]);

  useEffect(() => {
    if (!canLoadWorkflowMetrics) {
      setWorkflowRecords({});
      setWorkflowLoading(false);
      setWorkflowLoaded(true);
      setWorkflowError('');
      return undefined;
    }

    const controller = new AbortController();
    const resources = [
      ...workflowKinds.map((kind) => ({
        key: kind,
        path: '/api/v1/workflows',
        params: { kind },
      })),
      ...(needsArticles ? [{ key: 'article', path: '/api/v1/articles' }] : []),
    ];

    setWorkflowLoading(true);
    setWorkflowLoaded(false);
    setWorkflowError('');
    Promise.all(resources.map(async ({ key, path, params }) => {
      const { data } = await api.get(path, { params, signal: controller.signal });
      if (!Array.isArray(data?.data)) {
        throw new Error(`The server returned invalid ${key} dashboard data.`);
      }
      return [key, data.data];
    }))
      .then((entries) => {
        setWorkflowRecords(Object.fromEntries(entries));
        setWorkflowLoaded(true);
      })
      .catch((requestError) => {
        if (requestError.code !== 'ERR_CANCELED') {
          setWorkflowError(requestError.response?.data?.message || requestError.message || 'Unable to load role workflow data.');
          setWorkflowLoaded(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setWorkflowLoading(false);
      });

    return () => controller.abort();
  }, [canLoadWorkflowMetrics, needsArticles, profile.key, user?.id, user?.tenantId, workflowKinds.join(','), workflowRefresh]);

  function getMetricValue(metric) {
    if (metric.summaryKey) return summary ? summary[metric.summaryKey] : '—';
    const records = workflowRecords[metric.kind] || [];
    return records.filter((record) => metric.statuses.includes(String(record.status || '').toLowerCase())).length;
  }

  function refreshDashboard() {
    if (canViewSummary) loadSummary();
    if (canLoadWorkflowMetrics) setWorkflowRefresh((current) => current + 1);
  }

  return (
    <>
      <div className="mb-7 flex items-end justify-between border-b border-[#E8E2D5] pb-6 max-[700px]:flex-col max-[700px]:items-start max-[700px]:gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-800">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" />
            Role Dashboard · Active
          </span>
          <h1 className="mt-2 font-serif text-3xl font-extrabold tracking-tight text-[#14171A]">{profile.name}</h1>
          <p className="mt-1 text-xs text-[#78716C] max-w-[650px] leading-relaxed">{profile.responsibility}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E8E2D5] bg-white text-[#78716C] shadow-xs transition-all hover:bg-[#FAF8F5] hover:text-[#C2410C] hover:border-[#D5CDBF] disabled:cursor-wait disabled:opacity-50"
            type="button"
            aria-label="Refresh dashboard data"
            title="Refresh dashboard data"
            onClick={refreshDashboard}
            disabled={(!canViewSummary && !canLoadWorkflowMetrics) || refreshing || workflowLoading}
          >
            <RotateCw className={refreshing || workflowLoading ? 'animate-spin' : ''} size={15} />
          </button>
          <span className="rounded-xl border border-[#E8E2D5] bg-white px-3.5 py-2 text-xs font-semibold text-[#14171A] shadow-xs">
            {new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date())}
          </span>
        </div>
      </div>

      {metrics.length > 0 && (
        <section className="mb-7 grid grid-cols-4 gap-4 max-[1050px]:grid-cols-2 max-[700px]:gap-3" aria-label={`${profile.name} dashboard metrics`}>
          {metrics.map((metric, index) => {
            const colors = [
              'from-[#C2410C] to-[#EA580C]',
              'from-[#D97706] to-[#F59E0B]',
              'from-[#1E3A8A] to-[#3B82F6]',
              'from-[#047857] to-[#10B981]',
            ];
            const value = getMetricValue(metric);
            const isWorkflowMetric = Boolean(metric.kind);
            const isLoading = (isWorkflowMetric && !workflowLoaded)
              || (Boolean(metric.summaryKey) && !summaryLoaded);
            const displayedValue = isWorkflowMetric && workflowError ? '—' : value;
            const card = (
              <article
                key={`${metric.label}-${metric.kind || metric.summaryKey}`}
                className="relative min-h-[126px] overflow-hidden rounded-2xl border border-[#E8E2D5] bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${colors[index % colors.length]}`} />
                <span className="block text-[11px] font-extrabold uppercase tracking-wider text-[#78716C]">{metric.label}</span>
                <strong className="mt-3 block font-serif text-3xl font-extrabold tracking-tight text-[#14171A]">
                  {isLoading ? '…' : displayedValue}
                </strong>
                <small className="mt-1 block text-xs font-medium text-[#78716C]">
                  {metric.detail || 'From your authorized workflow queue'}
                </small>
              </article>
            );
            return metric.area ? (
              <NavLink key={`${metric.label}-${metric.kind}`} className="no-underline" to={`/${metric.area}`}>
                {card}
              </NavLink>
            ) : card;
          })}
        </section>
      )}

      {error && <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-700" role="alert">{error}</p>}
      {workflowError && <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-700" role="alert">{workflowError}</p>}

      <section className="grid grid-cols-2 gap-4 max-[1050px]:grid-cols-1" aria-label={`${profile.name} role-based actions`}>
        {profile.work.map(([title, description, area], index) => {
          const Icon = [Newspaper, BookOpen, ShieldCheck][index % 3];
          const colorStyles = [
            'bg-amber-50 text-[#C2410C] group-hover:bg-[#C2410C] group-hover:text-white',
            'bg-orange-50 text-[#D97706] group-hover:bg-[#D97706] group-hover:text-white',
            'bg-emerald-50 text-[#047857] group-hover:bg-[#047857] group-hover:text-white',
          ][index % 3];
          return (
            <NavLink
              className="group flex min-h-[135px] items-start gap-4 rounded-2xl border border-[#E8E2D5] bg-white p-6 no-underline shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C2410C]/40 hover:shadow-card-hover"
              key={title}
              to={`/${area}`}
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 ${colorStyles}`}>
                <Icon size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-[10px] font-extrabold tracking-wider uppercase text-[#78716C]">Desk Workflow</p>
                <h2 className="m-0 font-serif text-lg font-bold text-[#14171A] transition-colors group-hover:text-[#C2410C]">{title}</h2>
                <p className="mt-1 text-xs leading-relaxed text-[#78716C]">{description}</p>
              </div>
              <span className="inline-flex shrink-0 items-center rounded-full border border-[#E8E2D5] bg-[#FAF8F5] px-3 py-1 text-[11px] font-bold text-[#14171A] transition-colors group-hover:border-[#C2410C]/30 group-hover:bg-amber-50 group-hover:text-[#C2410C]">
                Launch
              </span>
            </NavLink>
          );
        })}
      </section>

      {canViewSummary && (
        <section className="mt-6 rounded-2xl border border-[#E8E2D5] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#14171A]">Workspace Operations</h2>
              <p className="mt-0.5 text-xs text-[#78716C]">All publishing workflows and operational rights are scoped to your authenticated publisher tenant.</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              Live & Secure
            </span>
          </div>
        </section>
      )}
    </>
  );
}

function WorkspacePage({ area, user, profile }) {
  const [title, description] = pageCopy[area] || ['Workspace', 'Manage publishing operations.'];
  if (area === 'roles') {
    return <RoleResponsibilitiesModule />;
  }
  if (area === 'publishers' && profile.key === 'superadmin') {
    return <PlatformPublishersModule />;
  }
  if (area === 'publishers' || area === 'editions') {
    return <SetupModule
      key={area}
      area={area}
      title={title}
      description={description}
      isPlatformAdmin={area === 'editions' && profile.key === 'superadmin'}
    />;
  }
  if (area === 'users') return <TeamUsersModule title={title} description={description} />;
  if (area === 'editorial') return <EditorialModule title={title} description={description} user={user} />;
  if (area === 'ai-newsroom') return <AiNewsroomModule user={user} profile={profile} />;
  return <RoleWorkflowPage area={area} user={user} profile={profile} description={description} />;
}

function EditorialModule({ title, description, user }) {
  const [articles, setArticles] = useState([]);
  const [newspapers, setNewspapers] = useState([]);
  const [editions, setEditions] = useState([]);
  const [form, setForm] = useState({
    newspaperId: '', editionScopes: [], headline: '', body: '', author: '',
    category: '', language: 'en', originalSource: '', attribution: '', expiresAt: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadArticles() {
    const [articleResponse, newspaperResponse, editionResponse] = await Promise.all([
      api.get('/api/v1/articles'),
      api.get('/api/v1/newspapers'),
      api.get('/api/v1/editions'),
    ]);
    setArticles(articleResponse.data.data);
    setNewspapers(newspaperResponse.data.data.filter((item) => item.status === 'active'));
    setEditions(editionResponse.data.data.filter((item) => item.status === 'active'));
  }

  useEffect(() => {
    let active = true;
    loadArticles()
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Unable to load editorial records.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  function updateField(event) {
    const { name, value, selectedOptions } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === 'editionScopes'
        ? Array.from(selectedOptions, (option) => option.value)
        : value,
      ...(name === 'newspaperId' ? { editionScopes: [] } : {}),
    }));
  }

  async function createArticle(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { attribution, expiresAt, ...fields } = form;
      await api.post('/api/v1/articles', {
        ...fields,
        rights: {
          ...(attribution ? { attribution } : {}),
          ...(expiresAt ? { expiresAt: new Date(expiresAt).toISOString() } : {}),
        },
      });
      setForm({
        newspaperId: '', editionScopes: [], headline: '', body: '', author: '',
        category: '', language: 'en', originalSource: '', attribution: '', expiresAt: '',
      });
      await loadArticles();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save the story.');
    } finally {
      setSaving(false);
    }
  }

  async function runAction(article, action, endpoint) {
    setError('');
    try {
      const payload = action ? { action } : {};
      await api.post(`/api/v1/articles/${article._id}/${endpoint}`, payload);
      await loadArticles();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Action failed. Check your permissions and article status.');
    }
  }

  const availableEditions = editions.filter((item) => (item.newspaperId?._id || item.newspaperId) === form.newspaperId);
  const permissions = user?.permissions || [];
  const canCreate = user?.roleName === 'superadmin' || permissions.includes('article:create');
  const canApproveRights = user?.roleName === 'superadmin' || permissions.includes('article:rights:approve');
  const canSubmit = user?.roleName === 'superadmin' || permissions.includes('article:submit');
  const canReview = user?.roleName === 'superadmin' || permissions.includes('article:review');
  return (
    <>
      <div className="mb-[25px] flex items-end justify-between max-[700px]:flex-col max-[700px]:items-start max-[700px]:gap-[13px]">
        <div><p className="mb-[7px] text-[11px] font-bold tracking-[1.1px] text-[#6b7f96]">EDITORIAL WORKFLOW</p><h1 className="m-0 font-sans text-[30px] font-bold tracking-[-.55px] text-[#172b46]">{title}</h1><p className="mt-[7px] text-[13px] leading-[1.6] text-[#6b7f96]">{description}</p></div>
        <span className="inline-flex whitespace-nowrap rounded-full bg-[#e5f4f2] px-[9px] py-[6px] text-[11px] font-semibold text-[#24747a]">{articles.length} stories</span>
      </div>
      {canCreate && <section className="mb-[17px] rounded-[10px] border border-[#dbe5ef] bg-white p-[21px] px-[22px] max-[700px]:p-4 shadow-[0_2px_6px_rgba(23,43,70,.05)]">
        <div className="flex items-center justify-between"><div><h2 className="m-0 font-sans text-lg font-bold tracking-[-.55px] text-[#172b46]">Submit a story draft</h2><p className="mt-[7px] text-[13px] leading-[1.6] text-[#6b7f96]">Source rights require separate approval before an editor can approve publication.</p></div></div>
        {error && <p className="mb-[17px] rounded-[7px] border border-[#f6d5d3] bg-[#fff2f1] px-3 py-[10px] text-[11px] text-[#b34447]" role="alert">{error}</p>}
        <form className="mt-[19px] grid grid-cols-3 items-end gap-[13px] max-[1050px]:grid-cols-2 max-[700px]:grid-cols-1 [&_label]:grid [&_label]:gap-[6px] [&_label]:text-xs [&_label]:font-semibold [&_label]:text-[#405770] [&_input]:h-[38px] [&_input]:min-w-0 [&_input]:rounded-md [&_input]:border [&_input]:border-[#dbe5ef] [&_input]:bg-white [&_input]:px-[10px] [&_input]:text-[13px] [&_input]:text-[#334861] [&_input]:outline-none [&_input]:focus:border-brand-coral [&_input]:focus:ring-[3px] [&_input]:focus:ring-brand-coral/10 [&_select]:h-[38px] [&_select]:min-w-0 [&_select]:rounded-md [&_select]:border [&_select]:border-[#dbe5ef] [&_select]:bg-white [&_select]:px-[10px] [&_select]:text-[13px] [&_select]:text-[#334861] [&_select]:outline-none [&_select]:focus:border-brand-coral [&_select]:focus:ring-[3px] [&_textarea]:min-w-0 [&_textarea]:resize-y [&_textarea]:rounded-md [&_textarea]:border [&_textarea]:border-[#dbe5ef] [&_textarea]:bg-white [&_textarea]:px-[10px] [&_textarea]:py-[9px] [&_textarea]:text-[13px] [&_textarea]:leading-[1.5] [&_textarea]:text-[#334861] [&_textarea]:outline-none [&_textarea]:focus:border-brand-coral [&_textarea]:focus:ring-[3px] [&_textarea]:focus:ring-brand-coral/10" onSubmit={createArticle}>
          <label>
            Newspaper
            <select name="newspaperId" value={form.newspaperId} onChange={updateField} required>
              <option value="">
                {loading ? 'Loading newspapers…' : newspapers.length ? 'Select a newspaper' : 'No active newspapers found'}
              </option>
              {newspapers.map((item) => (
                <option key={item._id} value={item._id}>{item.title}</option>
              ))}
            </select>
            {!loading && newspapers.length === 0 && (
              <small className="mt-[7px] text-[13px] leading-[1.6] text-[#6b7f96]">No active newspapers found in this workspace. Add or activate one under Newspaper titles first.</small>
            )}
          </label>
          <label>Edition scopes<select name="editionScopes" multiple value={form.editionScopes} onChange={updateField} required>{availableEditions.map((item) => <option key={item._id} value={item._id}>{item.city} ({item.editionCode})</option>)}</select></label>
          <label>Headline<input name="headline" value={form.headline} onChange={updateField} required maxLength={240} /></label>
          <label>Category<input name="category" value={form.category} onChange={updateField} required maxLength={80} /></label>
          <label>Language<input name="language" value={form.language} onChange={updateField} required maxLength={16} /></label>
          <label>Author<input name="author" value={form.author} onChange={updateField} maxLength={160} /></label>
          <label>Original source URL<input name="originalSource" type="url" value={form.originalSource} onChange={updateField} required maxLength={2048} /></label>
          <label>Source attribution<input name="attribution" value={form.attribution} onChange={updateField} maxLength={500} /></label>
          <label>Rights expiry (optional)<input name="expiresAt" type="date" value={form.expiresAt} onChange={updateField} /></label>
          <label className="col-span-full grid gap-[6px] text-xs font-semibold text-[#405770] max-[700px]:col-span-1">Story body<textarea name="body" value={form.body} onChange={updateField} required maxLength={100000} rows={5} /></label>
          <button className="col-span-full min-h-[38px] justify-self-start rounded-lg border-0 bg-brand-navy px-[15px] text-xs font-bold text-white shadow-[0_8px_18px_rgba(23,50,77,.18)] transition-all duration-150 hover:-translate-y-px hover:bg-brand-navy-soft hover:shadow-[0_10px_22px_rgba(23,50,77,.24)] disabled:cursor-wait disabled:opacity-65 max-[700px]:col-span-1" type="submit" disabled={saving || newspapers.length === 0}>{saving ? 'Saving…' : 'Save draft'}</button>
        </form>
      </section>}
      <section className="mb-[17px] rounded-[10px] border border-[#dbe5ef] bg-white p-[21px] px-[22px] max-[700px]:p-4 pb-2 shadow-[0_2px_6px_rgba(23,43,70,.05)]">
        <div className="flex items-center justify-between"><div><h2 className="m-0 font-sans text-lg font-bold tracking-[-.55px] text-[#172b46]">Editorial queue</h2><p className="mt-[7px] text-[13px] leading-[1.6] text-[#6b7f96]">Rights, submission and human review status</p></div></div>
        {error && <p className="mb-[17px] rounded-[7px] border border-[#f6d5d3] bg-[#fff2f1] px-3 py-[10px] text-[11px] text-[#b34447]" role="alert">{error}</p>}
        {loading ? <div className="mt-[18px] border-t border-[#eff1f4] px-0 pb-[3px] pt-[22px] text-center text-[13px] text-[#6b7f96]">Loading stories…</div> : articles.length === 0 ? <div className="mt-[18px] border-t border-[#eff1f4] px-0 pb-[3px] pt-[22px] text-center text-[13px] text-[#6b7f96]">No stories yet. Save a sourced draft to begin.</div> : (
          <div className="mt-[17px] overflow-x-auto"><table className="w-full min-w-[650px] border-collapse [&_th]:border-b [&_th]:border-[#e2e8ef] [&_th]:bg-[#edf3f7] [&_th]:px-3 [&_th]:py-[11px] [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-[.3px] [&_th]:text-[#405770] [&_td]:border-b [&_td]:border-[#e2e8ef] [&_td]:px-3 [&_td]:py-[11px] [&_td]:text-[13px] [&_td]:text-[#405770] [&_td:first-child]:font-semibold [&_td:first-child]:text-[#334861]"><thead><tr><th>Headline</th><th>Status</th><th>Rights</th><th>Actions</th></tr></thead><tbody>
            {articles.map((article) => <tr key={article._id}>
              <td>{article.headline}</td><td>{article.status}</td><td>{article.rights.status}</td>
              <td className="flex flex-wrap gap-[5px]">
                {canApproveRights && article.rights.status === 'pending' && <button type="button" onClick={() => runAction(article, 'approve', 'rights')}>Approve rights</button>}
                {canSubmit && ['DRAFT', 'NEEDS_CHANGES'].includes(article.status) && article.rights.status === 'approved' && article.rights.approvedAt && <button type="button" onClick={() => runAction(article, null, 'submit')}>Submit</button>}
                {canReview && article.status === 'SUBMITTED' && <button type="button" onClick={() => runAction(article, 'start', 'review')}>Start review</button>}
                {canReview && article.status === 'UNDER_REVIEW' && article.rights.status === 'approved' && article.rights.approvedAt && <button type="button" onClick={() => runAction(article, 'approve', 'review')}>Approve story</button>}
              </td>
            </tr>)}
          </tbody></table></div>
        )}
      </section>
    </>
  );
}

function SetupModule({ area, title, description, isPlatformAdmin }) {
  const isPublisher = area === 'publishers';
  const [records, setRecords] = useState([]);
  const [newspapers, setNewspapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(isPublisher
    ? { title: '', legalOwner: '', languages: 'en' }
    : { newspaperId: '', editionCode: '', stateCode: '', district: '', city: '', language: 'en', printCenterId: '' });
  const newspapersEndpoint = isPlatformAdmin ? '/api/v1/platform/newspapers' : '/api/v1/newspapers';
  const editionsEndpoint = isPlatformAdmin ? '/api/v1/platform/editions' : '/api/v1/editions';

  async function loadRecords() {
    const { data } = await api.get(isPublisher ? '/api/v1/newspapers' : editionsEndpoint);
    setRecords(data.data);
  }

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [recordResponse, newspaperResponse] = await Promise.all([
          api.get(isPublisher ? '/api/v1/newspapers' : editionsEndpoint),
          isPublisher ? Promise.resolve(null) : api.get(newspapersEndpoint),
        ]);
        if (active) {
          setRecords(recordResponse.data.data);
          if (newspaperResponse) setNewspapers(newspaperResponse.data.data.filter((item) => item.status === 'active'));
        }
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || 'Unable to load records.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [isPublisher]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = isPublisher
        ? { ...form, languages: form.languages.split(',').map((language) => language.trim()).filter(Boolean) }
        : form;
      await api.post(
        isPublisher ? '/api/v1/newspapers' : editionsEndpoint,
        payload
      );
      setForm(isPublisher
        ? { title: '', legalOwner: '', languages: 'en' }
        : { newspaperId: '', editionCode: '', stateCode: '', district: '', city: '', language: 'en', printCenterId: '' });
      await loadRecords();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save. Check the form and permissions.');
    } finally {
      setSaving(false);
    }
  }

  const columns = isPublisher
    ? [
      ['title', 'Newspaper title'],
      ['legalOwner', 'Legal owner'],
      ['languages', 'Languages'],
      ['status', 'Status'],
    ]
    : [
      ['editionCode', 'Edition code'],
      ['newspaperId', 'Newspaper'],
      ['stateCode', 'State'],
      ['city', 'City'],
      ['language', 'Language'],
      ['status', 'Status'],
    ];

  return (
    <>
      <div className="mb-[25px] flex items-end justify-between max-[700px]:flex-col max-[700px]:items-start max-[700px]:gap-[13px]">
        <div><p className="mb-[7px] text-[11px] font-bold tracking-[1.1px] text-[#6b7f96]">PUBLISHING SETUP</p><h1 className="m-0 font-sans text-[30px] font-bold tracking-[-.55px] text-[#172b46]">{title}</h1><p className="mt-[7px] text-[13px] leading-[1.6] text-[#6b7f96]">{description}</p></div>
        <span className="inline-flex whitespace-nowrap rounded-full bg-[#e5f4f2] px-[9px] py-[6px] text-[11px] font-semibold text-[#24747a]">{records.length} records</span>
      </div>
      <section className="mb-[17px] rounded-[10px] border border-[#dbe5ef] bg-white p-[21px] px-[22px] max-[700px]:p-4 shadow-[0_2px_6px_rgba(23,43,70,.05)]">
        <div className="flex items-center justify-between"><div><h2 className="m-0 font-sans text-lg font-bold tracking-[-.55px] text-[#172b46]">{isPublisher ? 'Add a newspaper title' : 'Add an edition'}</h2><p className="mt-[7px] text-[13px] leading-[1.6] text-[#6b7f96]">{isPlatformAdmin ? 'Each edition is saved to the publisher workspace that owns its newspaper.' : 'Every record is scoped to your signed-in tenant.'}</p></div></div>
        {error && <p className="mb-[17px] rounded-[7px] border border-[#f6d5d3] bg-[#fff2f1] px-3 py-[10px] text-[11px] text-[#b34447]" role="alert">{error}</p>}
        <form className="mt-[19px] grid grid-cols-3 items-end gap-[13px] max-[1050px]:grid-cols-2 max-[700px]:grid-cols-1 [&_label]:grid [&_label]:gap-[6px] [&_label]:text-xs [&_label]:font-semibold [&_label]:text-[#405770] [&_input]:h-[38px] [&_input]:min-w-0 [&_input]:rounded-md [&_input]:border [&_input]:border-[#dbe5ef] [&_input]:bg-white [&_input]:px-[10px] [&_input]:text-[13px] [&_input]:text-[#334861] [&_input]:outline-none [&_input]:focus:border-brand-coral [&_input]:focus:ring-[3px] [&_input]:focus:ring-brand-coral/10 [&_select]:h-[38px] [&_select]:min-w-0 [&_select]:rounded-md [&_select]:border [&_select]:border-[#dbe5ef] [&_select]:bg-white [&_select]:px-[10px] [&_select]:text-[13px] [&_select]:text-[#334861] [&_select]:outline-none [&_select]:focus:border-brand-coral [&_select]:focus:ring-[3px] [&_textarea]:min-w-0 [&_textarea]:resize-y [&_textarea]:rounded-md [&_textarea]:border [&_textarea]:border-[#dbe5ef] [&_textarea]:bg-white [&_textarea]:px-[10px] [&_textarea]:py-[9px] [&_textarea]:text-[13px] [&_textarea]:leading-[1.5] [&_textarea]:text-[#334861] [&_textarea]:outline-none [&_textarea]:focus:border-brand-coral [&_textarea]:focus:ring-[3px] [&_textarea]:focus:ring-brand-coral/10 [&_button]:col-span-full [&_button]:min-h-[38px] [&_button]:justify-self-start" onSubmit={submit}>
          {isPublisher ? (
            <>
              <label>Newspaper title<input name="title" value={form.title} onChange={updateField} required maxLength={120} /></label>
              <label>Legal owner<input name="legalOwner" value={form.legalOwner} onChange={updateField} maxLength={160} /></label>
              <label>Languages (comma-separated)<input name="languages" value={form.languages} onChange={updateField} required placeholder="en, gu" /></label>
            </>
          ) : (
            <>
              <label>
                Newspaper
                <select name="newspaperId" value={form.newspaperId} onChange={updateField} required>
                  <option value="">
                    {loading ? 'Loading newspapers…' : newspapers.length ? 'Select a newspaper' : 'No active newspapers found'}
                  </option>
                  {newspapers.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.title}{isPlatformAdmin && item.tenantId?.name ? ` — ${item.tenantId.name}` : ''}
                    </option>
                  ))}
                </select>
                {!loading && newspapers.length === 0 && (
                  <small className="mt-[7px] text-[13px] leading-[1.6] text-[#6b7f96]">
                    {isPlatformAdmin
                      ? 'No active newspapers found in active publisher workspaces. Add a newspaper from a publisher account first.'
                      : 'Add or activate a newspaper under Newspaper titles, then return here.'}
                  </small>
                )}
              </label>
              <label>Edition code<input name="editionCode" value={form.editionCode} onChange={updateField} required maxLength={32} placeholder="AMD-CITY" /></label>
              <label>State code<input name="stateCode" value={form.stateCode} onChange={updateField} required maxLength={8} placeholder="GJ" /></label>
              <label>District<input name="district" value={form.district} onChange={updateField} maxLength={100} /></label>
              <label>City<input name="city" value={form.city} onChange={updateField} required maxLength={100} /></label>
              <label>Language<input name="language" value={form.language} onChange={updateField} required maxLength={16} placeholder="gu" /></label>
              <label>Print center<input name="printCenterId" value={form.printCenterId} onChange={updateField} maxLength={100} /></label>
            </>
          )}
          <button className="min-h-11 rounded-lg border-0 bg-brand-navy px-[15px] text-xs font-bold text-white shadow-[0_8px_18px_rgba(23,50,77,.18)] transition-all duration-150 hover:-translate-y-px hover:bg-brand-navy-soft hover:shadow-[0_10px_22px_rgba(23,50,77,.24)] disabled:cursor-wait disabled:opacity-65" type="submit" disabled={saving || (!isPublisher && newspapers.length === 0)}>{saving ? 'Saving…' : `Add ${isPublisher ? 'newspaper' : 'edition'}`}</button>
        </form>
      </section>
      <section className="mb-[17px] rounded-[10px] border border-[#dbe5ef] bg-white p-[21px] px-[22px] max-[700px]:p-4 pb-2 shadow-[0_2px_6px_rgba(23,43,70,.05)]">
        <div className="flex items-center justify-between"><div><h2 className="m-0 font-sans text-lg font-bold tracking-[-.55px] text-[#172b46]">{isPublisher ? 'Newspaper titles' : 'Configured editions'}</h2><p className="mt-[7px] text-[13px] leading-[1.6] text-[#6b7f96]">Records belonging to the current tenant</p></div></div>
        {loading ? <div className="mt-[18px] border-t border-[#eff1f4] px-0 pb-[3px] pt-[22px] text-center text-[13px] text-[#6b7f96]">Loading records…</div> : records.length === 0 ? <div className="mt-[18px] border-t border-[#eff1f4] px-0 pb-[3px] pt-[22px] text-center text-[13px] text-[#6b7f96]">No records yet. Use the form above to add one.</div> : (
          <div className="mt-[17px] overflow-x-auto"><table className="w-full min-w-[650px] border-collapse [&_th]:border-b [&_th]:border-[#e2e8ef] [&_th]:bg-[#edf3f7] [&_th]:px-3 [&_th]:py-[11px] [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-[.3px] [&_th]:text-[#405770] [&_td]:border-b [&_td]:border-[#e2e8ef] [&_td]:px-3 [&_td]:py-[11px] [&_td]:text-[13px] [&_td]:text-[#405770] [&_td:first-child]:font-semibold [&_td:first-child]:text-[#334861]"><thead><tr>{columns.map(([, label]) => <th key={label}>{label}</th>)}</tr></thead><tbody>
            {records.map((record) => <tr key={record._id}>{columns.map(([key]) => {
              const value = record[key];
              const display = key === 'newspaperId'
                ? (typeof value === 'object' ? value?.title : newspapers.find((item) => item._id === value)?.title) || '—'
                : Array.isArray(value) ? value.join(', ') : value || '—';
              return <td key={key}>{display}</td>;
            })}</tr>)}
          </tbody></table></div>
        )}
      </section>
    </>
  );
}

function Dashboard({ user, onLogout }) {
  const firstName = user?.email?.split('@')[0] || 'Publisher';
  const profile = getRoleProfile(user?.roleName);
  const allowedNavigation = navigation.filter(({ path }) => path === '/' || profile.areas.includes(path.slice(1)));
  const [logoutError, setLogoutError] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  async function signOut() {
    setLogoutError('');
    try {
      await onLogout();
    } catch (error) {
      setLogoutError(error.message || 'Unable to sign out. Please try again.');
    }
  }
  return (
    <div className="flex min-h-screen w-full min-w-0 bg-[#FAF8F5] text-sm text-[#14171A] max-[850px]:flex-col [&_h1]:m-0 [&_h1]:font-serif [&_h1]:text-[32px] [&_h1]:font-extrabold [&_h1]:tracking-tight [&_h1]:text-[#14171A] [&_h2]:m-0 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-[#14171A]">
      {mobileNavOpen && <button className="fixed inset-0 z-40 hidden bg-[#14171A]/30 backdrop-blur-xs max-[850px]:block" type="button" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
      <aside id="workspace-navigation" className={`sticky top-0 flex h-screen shrink-0 basis-[270px] flex-col overflow-y-auto border-r border-[#E8E2D5] bg-[#F5F2EB] px-4 pb-4 pt-5 text-[#14171A] shadow-[2px_0_12px_rgba(44,38,34,0.03)] max-[1050px]:basis-[240px] max-[850px]:fixed max-[850px]:inset-y-0 max-[850px]:left-0 max-[850px]:z-50 max-[850px]:w-[280px] max-[850px]:max-w-[85vw] max-[850px]:transition-transform max-[850px]:duration-200 ${mobileNavOpen ? 'max-[850px]:translate-x-0' : 'max-[850px]:-translate-x-full'}`}>
        {/* Brand Masthead / Pressora Seal */}
        <div className="flex items-center gap-3 px-1 pb-5 border-b border-[#E8E2D5]/70 mb-4">
          <div className="h-[52px] w-[180px] shrink-0 overflow-hidden rounded-xl border border-[#E8E2D5] bg-white shadow-sm">
            <BrandLogo className="h-full w-full object-cover object-center" />
          </div>
          <button className="ml-auto hidden h-8 w-8 items-center justify-center rounded-lg border border-[#E8E2D5] bg-white text-[#78716C] hover:text-[#14171A] max-[850px]:inline-flex shadow-xs" type="button" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)}><X size={18} /></button>
        </div>

        {/* Press Pass / User Credential Badge */}
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-[#E8E2D5] bg-white px-3.5 py-2.5 shadow-2xs">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 font-serif text-xs font-black text-[#9A3412]">
            {profile.name[0]}
          </div>
          <div className="min-w-0 flex-1">
            <strong className="block truncate text-xs font-bold text-[#14171A]">{profile.name}</strong>
            <small className="block text-[10px] text-[#78716C] font-medium">Press Workspace Pass</small>
          </div>
          <ChevronDown className="text-[#78716C]" size={14} />
        </div>

        <p className="mx-2 mb-2 text-[10px] font-extrabold tracking-[1.6px] text-[#78716C] uppercase">Newsroom Desks</p>
        <nav className="space-y-1" aria-label="Main navigation">
          {allowedNavigation.map(({ label, path, icon: Icon }) => {
            const isAi = path === '/ai-newsroom';
            return (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                onClick={() => setMobileNavOpen(false)}
                className={({ isActive }) => `group relative flex min-h-[40px] w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs transition-all duration-150 no-underline ${
                  isActive
                    ? 'bg-white text-[#C2410C] font-bold border border-[#E8E2D5] shadow-xs'
                    : 'text-[#57534E] font-semibold hover:bg-[#EAE6DC] hover:text-[#14171A]'
                }`}
              >
                <Icon size={17} className={isAi ? 'text-[#C2410C]' : 'text-[#78716C] group-hover:text-[#C2410C] transition-colors'} />
                <span className="truncate">{profile.key === 'superadmin' && path === '/publishers' ? 'Publisher workspaces' : label}</span>
                {isAi && (
                  <span className="ml-auto rounded-full bg-gradient-to-r from-[#C2410C] to-[#D97706] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-xs">
                    AI Auto
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-[#E8E2D5] pt-3">
          {logoutError && <p className="my-1 text-[10px] text-rose-600" role="alert">{logoutError}</p>}
          <button
            className="flex min-h-[40px] w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-[#78716C] transition-colors hover:bg-rose-50 hover:text-rose-700"
            type="button"
            onClick={signOut}
          >
            <LogOut size={17} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-[#E8E2D5] bg-[#FAF8F5]/90 backdrop-blur-md px-10 max-[1050px]:px-6 max-[700px]:h-14 max-[700px]:px-4 sticky top-0 z-30">
          <div className="hidden min-w-0 items-center gap-2 max-[850px]:flex">
            <button className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E8E2D5] bg-white text-[#78716C] shadow-xs hover:bg-[#FAF8F5]" type="button" aria-label="Open navigation" aria-controls="workspace-navigation" aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen(true)}><MoreHorizontal size={20} /></button>
            <div className="h-8 w-[112px] shrink-0 overflow-hidden rounded-md border border-[#E8E2D5] bg-white">
              <BrandLogo className="h-full w-full object-cover object-center" />
            </div>
          </div>
          <div className="flex min-w-0 items-center gap-3 text-xs text-[#78716C] max-[850px]:hidden">
            <span className="font-serif italic font-semibold text-[#14171A]">Broadsheet Edition</span>
            <span className="text-[#D5CDBF]">/</span>
            <strong className="max-w-[35vw] truncate font-bold text-[#14171A]">{profile.name}</strong>
            <span className="rounded-full border border-amber-300/60 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">
              Live Neural Wire
            </span>
          </div>
          <div className="flex min-w-0 items-center gap-3 text-xs text-[#78716C]">
            <div className="flex items-center gap-2 rounded-full border border-[#E8E2D5] bg-white p-1 pr-3.5 shadow-xs">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#C2410C] to-[#D97706] text-xs font-bold text-white shadow-xs">
                {firstName[0].toUpperCase()}
              </div>
              <span className="max-w-[20vw] truncate font-bold text-[#14171A]">{firstName}</span>
            </div>
            <span className="rounded-full border border-[#E8E2D5] bg-white px-2.5 py-1 text-[10px] font-bold text-[#78716C] max-[850px]:hidden">
              {profile.name}
            </span>
          </div>
        </header>

        <main className="mx-auto w-full min-w-0 max-w-[1400px] flex-1 px-10 pb-14 pt-8 max-[1050px]:px-6 max-[700px]:px-4 max-[700px]:pb-10 max-[700px]:pt-6">
          <Routes>
            <Route path="/" element={<Overview user={user} profile={profile} />} />
            <Route path="/:area" element={<WorkspaceRoute profile={profile} user={user} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="flex justify-between border-t border-[#E8E2D5] bg-[#F5F2EB]/90 px-10 py-4 text-xs text-[#78716C] max-[700px]:px-4 max-[400px]:flex-col max-[400px]:gap-1">
          <span className="font-serif">PRESSORA · Intelligent Newsroom & Automated Broadsheet Engine</span>
          <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            Workspace Active
          </span>
        </footer>
      </div>
    </div>
  );
}

function WorkspaceRoute({ profile, user }) {
  const { area } = useParams();
  if (!profile.areas.includes(area)) return <Navigate to="/" replace />;
  return <WorkspacePage area={area} user={user} profile={profile} />;
}

function Application() {
  const [auth, setAuth] = useState({ token: null, user: null, loading: true, error: null });

  useEffect(() => {
    let active = true;
    restoreSession()
      .then(async (token) => {
        if (!active) return;
        if (!token) {
          setAuth({ token: null, user: null, loading: false, error: null });
          return;
        }
        const { data } = await api.get('/api/v1/auth/me');
        if (active) setAuth({ token, user: data.data, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setAuth({ token: null, user: null, loading: false, error: error.message });
      });

    const handleToken = (event) => setAuth((current) => ({ ...current, token: event.detail }));
    const handleExpired = () => setAuth({ token: null, user: null, loading: false, error: null });
    window.addEventListener('auth:token', handleToken);
    window.addEventListener('auth:expired', handleExpired);
    return () => {
      active = false;
      window.removeEventListener('auth:token', handleToken);
      window.removeEventListener('auth:expired', handleExpired);
    };
  }, []);

  const handleLogin = async (token) => {
    setAccessToken(token);
    const { data } = await api.get('/api/v1/auth/me');
    setAuth({ token, user: data.data, loading: false, error: null });
  };

  const handleLogout = async () => {
    await api.post('/api/v1/auth/logout');
    setAccessToken(null);
    setAuth({ token: null, user: null, loading: false, error: null });
  };

  if (auth.loading) {
    return (
      <main
        className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F5F2EB] px-5 py-12 text-[#14171A]"
        role="status"
        aria-live="polite"
      >
        <div className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-[#D97706]/[0.07] blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-[#C2410C]/[0.06] blur-3xl" aria-hidden="true" />
        <div className="absolute inset-x-0 top-0 h-1 overflow-hidden bg-[#E8E2D5]" aria-hidden="true">
          <div className="preloader-sweep h-full w-1/3 bg-gradient-to-r from-[#9A3412] via-[#C2410C] to-[#D97706]" />
        </div>

        <section className="relative w-full max-w-md rounded-3xl border border-[#E8E2D5] bg-white p-8 shadow-[0_24px_70px_rgba(44,38,34,0.10)] sm:p-10">
          <div className="flex items-center">
            <div className="h-14 w-[220px] overflow-hidden rounded-lg border border-[#E8E2D5] bg-white shadow-sm">
              <BrandLogo className="h-full w-full object-cover object-center" />
            </div>
          </div>

          <div className="mt-9 flex items-start gap-4">
            <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#F1E8DD] border-t-[#C2410C] motion-safe:animate-spin motion-reduce:animate-none" aria-hidden="true" />
            <div>
              <h1 className="m-0 font-serif text-2xl font-extrabold tracking-tight text-[#14171A]">Preparing your newsroom</h1>
              <p className="mb-0 mt-2 text-sm leading-6 text-[#78716C]">
                Securely restoring your session and opening your publishing workspace.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-3" aria-hidden="true">
            <div className="h-px bg-[#E8E2D5]" />
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C2410C] motion-safe:animate-pulse motion-reduce:animate-none" />
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#78716C]">Connecting to your workspace</span>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={auth.token ? <Navigate to="/" replace /> : <Login onSuccess={handleLogin} startupError={auth.error} />} />
        <Route path="/*" element={auth.token ? <Dashboard user={auth.user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return <Application />;
}
