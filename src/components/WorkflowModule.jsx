import React, { useEffect, useState } from 'react';
import { api } from '../api';

const workflows = {
  template: {
    title: 'Templates',
    intro: 'Create and review approved layout versions for your editions.',
    createTitle: 'Create template version',
    fields: [
      { name: 'edition', label: 'Edition', required: true },
      { name: 'version', label: 'Version', required: true },
      { name: 'assetUrl', label: 'Design file URL', type: 'url' },
      { name: 'notes', label: 'Design notes', type: 'textarea' },
    ],
    statuses: ['draft', 'review', 'approved', 'archived'],
    initialStatus: 'draft',
  },
  issue: {
    title: 'Publication issues',
    intro: 'Coordinate issue dates, proofs, approvals and publication handoff.',
    createTitle: 'Plan an issue',
    fields: [
      { name: 'edition', label: 'Edition', required: true },
      { name: 'issueDate', label: 'Issue date', type: 'date', required: true },
      { name: 'proofNotes', label: 'Proof notes', type: 'textarea' },
    ],
    statuses: ['planning', 'proof', 'approved', 'published'],
    initialStatus: 'planning',
  },
  campaign: {
    title: 'Campaigns',
    intro: 'Manage campaign schedules, approved terms and advertising details.',
    createTitle: 'Create campaign',
    fields: [
      { name: 'campaignCode', label: 'Campaign code', required: true },
      { name: 'startDate', label: 'Start date', type: 'date', required: true },
      { name: 'endDate', label: 'End date', type: 'date', required: true },
      { name: 'budget', label: 'Budget', type: 'number', min: 0 },
      { name: 'terms', label: 'Approved terms', type: 'textarea', required: true },
    ],
    statuses: ['draft', 'approved', 'active', 'paused', 'completed'],
    initialStatus: 'draft',
  },
  center: {
    title: 'Collection centers',
    intro: 'Maintain assigned intake locations and their operating status.',
    createTitle: 'Add collection center',
    fields: [
      { name: 'location', label: 'Address / location', required: true },
      { name: 'assignedOperator', label: 'Assigned operator email', type: 'email' },
      { name: 'contact', label: 'Center contact' },
    ],
    statuses: ['active', 'inactive'],
    initialStatus: 'active',
  },
  intake: {
    title: 'Physical intake',
    intro: 'Record physical sheets and scan intake receipt IDs for your center.',
    createTitle: 'Record sheet intake',
    fields: [
      { name: 'center', label: 'Collection center', required: true },
      { name: 'receiptId', label: 'Receipt ID', required: true },
      { name: 'sheetsCount', label: 'Number of sheets', type: 'number', min: 1, required: true },
      { name: 'receivedAt', label: 'Received on', type: 'date', required: true },
      { name: 'notes', label: 'Intake notes', type: 'textarea' },
    ],
    statuses: ['received', 'frozen', 'verified', 'rejected'],
    initialStatus: 'received',
  },
  verification: {
    title: 'Verification queue',
    intro: 'Inspect coupon series and original-sheet evidence, then record a decision.',
    createTitle: 'Add verification case',
    fields: [
      { name: 'receiptId', label: 'Receipt ID', required: true },
      { name: 'couponSeries', label: 'Coupon series', required: true },
      { name: 'evidenceNotes', label: 'Evidence inspection notes', type: 'textarea', required: true },
    ],
    statuses: ['pending', 'verified', 'rejected'],
    initialStatus: 'pending',
  },
  draw: {
    title: 'Draw operations',
    intro: 'Track authorized draws, frozen entries and audit approvals.',
    createTitle: 'Schedule authorized draw',
    fields: [
      { name: 'campaign', label: 'Campaign code', required: true },
      { name: 'drawDate', label: 'Draw date', type: 'date', required: true },
      { name: 'seedReference', label: 'Seed / audit reference', required: true },
      { name: 'winnerReference', label: 'Winner approval reference' },
    ],
    statuses: ['scheduled', 'entries_frozen', 'completed', 'audited'],
    initialStatus: 'scheduled',
  },
  claim: {
    title: 'My claims',
    intro: 'Submit a claim and check its status. Claims are visible only to you and authorized staff.',
    createTitle: 'Submit participant claim',
    fields: [
      { name: 'campaign', label: 'Campaign code', required: true },
      { name: 'participantName', label: 'Your name', required: true },
      { name: 'email', label: 'Contact email', type: 'email', required: true },
      { name: 'phone', label: 'Contact phone', type: 'tel', required: true },
      { name: 'claimDetails', label: 'Claim details', type: 'textarea', required: true },
      { name: 'consent', label: 'I agree to the campaign terms', type: 'checkbox', required: true },
    ],
    statuses: ['submitted', 'under_review', 'approved', 'rejected', 'paid'],
    initialStatus: 'submitted',
  },
};

const statusTransitions = {
  template: { draft: ['review'], review: ['draft', 'approved'], approved: ['archived'], archived: [] },
  issue: { planning: ['proof'], proof: ['planning', 'approved'], approved: ['proof', 'published'], published: [] },
  campaign: { draft: ['approved'], approved: ['active'], active: ['paused', 'completed'], paused: ['active', 'completed'], completed: [] },
  center: { active: ['inactive'], inactive: ['active'] },
  intake: { received: ['frozen', 'rejected'], frozen: ['verified', 'rejected'], verified: [], rejected: [] },
  verification: { pending: ['verified', 'rejected'], verified: [], rejected: [] },
  draw: { scheduled: ['entries_frozen'], entries_frozen: ['completed'], completed: ['audited'], audited: [] },
  claim: { submitted: ['under_review', 'rejected'], under_review: ['approved', 'rejected'], approved: ['paid'], rejected: [], paid: [] },
};

const statusTones = {
  draft: 'bg-[#e5f4f2] text-[#24747a]',
  planning: 'bg-[#e5f4f2] text-[#24747a]',
  pending: 'bg-[#e5f4f2] text-[#24747a]',
  scheduled: 'bg-[#e5f4f2] text-[#24747a]',
  submitted: 'bg-[#e5f4f2] text-[#24747a]',
  approved: 'bg-[#e6f5ee] text-[#23734c]',
  active: 'bg-[#e6f5ee] text-[#23734c]',
  verified: 'bg-[#e6f5ee] text-[#23734c]',
  published: 'bg-[#e6f5ee] text-[#23734c]',
  completed: 'bg-[#e6f5ee] text-[#23734c]',
  paid: 'bg-[#e6f5ee] text-[#23734c]',
  audited: 'bg-[#e6f5ee] text-[#23734c]',
  review: 'bg-[#fff3e1] text-[#97651c]',
  proof: 'bg-[#fff3e1] text-[#97651c]',
  under_review: 'bg-[#fff3e1] text-[#97651c]',
  received: 'bg-[#fff3e1] text-[#97651c]',
  entries_frozen: 'bg-[#fff3e1] text-[#97651c]',
  rejected: 'bg-[#fff2f1] text-[#b34447]',
  paused: 'bg-[#fff2f1] text-[#b34447]',
  inactive: 'bg-[#fff2f1] text-[#b34447]',
  archived: 'bg-[#fff2f1] text-[#b34447]',
};

function emptyFields(fields) {
  return fields.reduce((result, field) => ({ ...result, [field.name]: '' }), {});
}

function can(user, action, kind) {
  return user?.roleName === 'superadmin' || user?.permissions?.includes(`workflow:${kind}:${action}`);
}

function WorkflowModule({ kind, user, description, readOnly = false, allowedStatuses }) {
  const config = workflows[kind];
  const [items, setItems] = useState([]);
  const [centerOptions, setCenterOptions] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', ...emptyFields(config.fields) });
  const [statusDrafts, setStatusDrafts] = useState({});
  const [claimEdits, setClaimEdits] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');
  const canRead = can(user, 'read', kind);
  const canCreate = !readOnly && can(user, 'create', kind);
  const canUpdate = !readOnly && can(user, 'update', kind);
  const canReadCenters = can(user, 'read', 'center');
  const isParticipantClaim = kind === 'claim' && ['reader', 'participant'].includes((user?.roleName || '').toLowerCase());
  const statuses = allowedStatuses || config.statuses;

  async function loadItems() {
    const [itemResponse, centerResponse] = await Promise.all([
      api.get('/api/v1/workflows', { params: { kind } }),
      kind === 'intake' && canReadCenters
        ? api.get('/api/v1/workflows', { params: { kind: 'center' } })
        : Promise.resolve(null),
    ]);
    setItems(itemResponse.data.data);
    if (centerResponse) setCenterOptions(centerResponse.data.data);
  }

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [itemResponse, centerResponse] = await Promise.all([
          api.get('/api/v1/workflows', { params: { kind } }),
          kind === 'intake' && canReadCenters
            ? api.get('/api/v1/workflows', { params: { kind: 'center' } })
            : Promise.resolve(null),
        ]);
        if (active) {
          setItems(itemResponse.data.data);
          if (centerResponse) setCenterOptions(centerResponse.data.data);
        }
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || `Unable to load ${config.title.toLowerCase()}.`);
      } finally {
        if (active) setLoading(false);
      }
    }
    if (canRead) load();
    else setLoading(false);
    return () => { active = false; };
  }, [canRead, canReadCenters, config.title, kind]);

  function updateField(event) {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  async function createItem(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const { title, description: itemDescription, ...data } = form;
    try {
      await api.post('/api/v1/workflows', {
        kind,
        title,
        description: itemDescription,
        status: config.initialStatus,
        data,
      });
      setForm({ title: '', description: '', ...emptyFields(config.fields) });
      await loadItems();
    } catch (requestError) {
      setError(requestError.response?.data?.message || `Unable to save ${config.title.toLowerCase()}.`);
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(item) {
    const status = statusDrafts[item._id];
    if (!status || status === item.status) return;
    setSavingId(item._id);
    setError('');
    try {
      await api.patch(`/api/v1/workflows/${item._id}`, { status });
      await loadItems();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update this record.');
    } finally {
      setSavingId('');
    }
  }

  async function updateClaim(item, event) {
    event.preventDefault();
    setSavingId(item._id);
    setError('');
    try {
      await api.patch(`/api/v1/workflows/${item._id}`, {
        data: { ...item.data, ...(claimEdits[item._id] || {}) },
      });
      setClaimEdits((current) => {
        const next = { ...current };
        delete next[item._id];
        return next;
      });
      await loadItems();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update your claim contact details.');
    } finally {
      setSavingId('');
    }
  }

  return (
    <>
      <div className="mb-[25px] flex items-end justify-between max-[700px]:flex-col max-[700px]:items-start max-[700px]:gap-[13px]">
        <div><p className="mb-[7px] text-[11px] font-bold tracking-[1.1px] text-[#6b7f96]">{user?.roleName?.toUpperCase()} WORKSPACE</p><h1 className="m-0 font-sans text-[30px] font-bold tracking-[-.55px] text-[#172b46]">{config.title}</h1><p className="mt-[7px] text-[13px] leading-[1.6] text-[#6b7f96]">{description || config.intro}</p></div>
        <span className="inline-flex whitespace-nowrap rounded-full bg-[#e5f4f2] px-[9px] py-[6px] text-[11px] font-semibold text-[#24747a]">{items.length} records</span>
      </div>
      {!canRead && <p className="mb-[17px] rounded-[7px] border border-[#f6d5d3] bg-[#fff2f1] px-3 py-[10px] text-[11px] text-[#b34447]" role="alert">Your role does not have permission to view this workflow.</p>}
      {error && <p className="mb-[17px] rounded-[7px] border border-[#f6d5d3] bg-[#fff2f1] px-3 py-[10px] text-[11px] text-[#b34447]" role="alert">{error}</p>}
      {canCreate && (
        <section className="mb-[17px] rounded-[10px] border border-[#dbe5ef] bg-white p-[21px] px-[22px] max-[700px]:p-4 shadow-[0_2px_6px_rgba(23,43,70,.05)]">
          <div className="flex items-center justify-between"><div><h2 className="m-0 font-sans text-lg font-bold tracking-[-.55px] text-[#172b46]">{config.createTitle}</h2><p className="mt-[7px] text-[13px] leading-[1.6] text-[#6b7f96]">{config.intro}</p></div></div>
          <form className="mt-[19px] grid grid-cols-3 items-end gap-[13px] max-[1050px]:grid-cols-2 max-[700px]:grid-cols-1 [&_label]:grid [&_label]:gap-[6px] [&_label]:text-xs [&_label]:font-semibold [&_label]:text-[#405770] [&_input]:h-[38px] [&_input]:min-w-0 [&_input]:rounded-md [&_input]:border [&_input]:border-[#dbe5ef] [&_input]:bg-white [&_input]:px-[10px] [&_input]:text-[13px] [&_input]:text-[#334861] [&_input]:outline-none [&_input]:focus:border-brand-coral [&_input]:focus:ring-[3px] [&_input]:focus:ring-brand-coral/10 [&_select]:h-[38px] [&_select]:min-w-0 [&_select]:rounded-md [&_select]:border [&_select]:border-[#dbe5ef] [&_select]:bg-white [&_select]:px-[10px] [&_select]:text-[13px] [&_select]:text-[#334861] [&_select]:outline-none [&_select]:focus:border-brand-coral [&_select]:focus:ring-[3px] [&_textarea]:min-w-0 [&_textarea]:resize-y [&_textarea]:rounded-md [&_textarea]:border [&_textarea]:border-[#dbe5ef] [&_textarea]:bg-white [&_textarea]:px-[10px] [&_textarea]:py-[9px] [&_textarea]:text-[13px] [&_textarea]:leading-[1.5] [&_textarea]:text-[#334861] [&_textarea]:outline-none [&_textarea]:focus:border-brand-coral [&_textarea]:focus:ring-[3px] [&_textarea]:focus:ring-brand-coral/10 [&_button]:col-span-full [&_button]:min-h-[38px] [&_button]:justify-self-start" onSubmit={createItem}>
            <label>{kind === 'claim' ? 'Claim / campaign title' : 'Name'}<input name="title" value={form.title} onChange={updateField} required maxLength={160} /></label>
            <label className="col-span-full max-[700px]:col-span-1">Description<input name="description" value={form.description} onChange={updateField} maxLength={1000} /></label>
            {config.fields.map((field) => (
              <label className={field.type === 'textarea' ? 'col-span-full max-[700px]:col-span-1' : ''} key={field.name}>
                {field.label}
                {kind === 'intake' && field.name === 'center'
                  ? <select name={field.name} value={form[field.name]} onChange={updateField} required><option value="">Select assigned center</option>{centerOptions.map((center) => <option value={center._id} key={center._id}>{center.title}</option>)}</select>
                  : field.type === 'textarea'
                  ? <textarea name={field.name} value={form[field.name]} onChange={updateField} required={field.required} maxLength={5000} rows={3} />
                  : field.type === 'checkbox'
                    ? <input className="h-auto accent-[#0f7d83]" name={field.name} type="checkbox" checked={Boolean(form[field.name])} onChange={updateField} required={field.required} />
                    : <input name={field.name} type={field.type || 'text'} value={form[field.name]} onChange={updateField} required={field.required} min={field.min} maxLength={field.type === 'number' ? undefined : 500} />}
              </label>
            ))}
            {kind === 'intake' && centerOptions.length === 0 && <p className="col-span-full my-[5px] text-[10px] text-[#b34447] max-[700px]:col-span-1">No center is assigned to this account yet. Ask the publisher administrator to assign your account to a center.</p>}
            <button className="min-h-11 rounded-lg border-0 bg-brand-navy px-[15px] text-xs font-bold text-white shadow-[0_8px_18px_rgba(23,50,77,.18)] transition-all duration-150 hover:-translate-y-px hover:bg-brand-navy-soft hover:shadow-[0_10px_22px_rgba(23,50,77,.24)] disabled:cursor-wait disabled:opacity-65" type="submit" disabled={saving || (kind === 'intake' && centerOptions.length === 0)}>{saving ? 'Saving…' : 'Save record'}</button>
          </form>
        </section>
      )}
      <section className="grid gap-3" aria-label={`${config.title} records`}>
        {loading ? <div className="mb-0 rounded-[10px] border border-[#dbe5ef] bg-white p-[21px] px-[22px] max-[700px]:p-4 text-center text-[13px] text-[#6b7f96] shadow-[0_2px_6px_rgba(23,43,70,.05)]">Loading records…</div> : items.length === 0 ? (
          <div className="mb-0 rounded-[10px] border border-[#dbe5ef] bg-white p-[21px] px-[22px] max-[700px]:p-4 text-center text-[13px] text-[#6b7f96] shadow-[0_2px_6px_rgba(23,43,70,.05)]">No records yet.</div>
        ) : items.map((item) => (
          <article className="mb-0 rounded-[10px] border border-[#dbe5ef] bg-white p-[21px] px-[22px] max-[700px]:p-4 shadow-[0_2px_6px_rgba(23,43,70,.05)]" key={item._id}>
            <div className="flex items-center justify-between gap-3 max-[850px]:items-start max-[850px]:flex-col">
              <div className="min-w-0"><p className="mb-[7px] text-[11px] font-bold tracking-[1.1px] text-[#6b7f96]">{kind.toUpperCase()}</p><h2 className="m-0 break-words font-sans text-lg font-bold tracking-[-.55px] text-[#172b46]">{item.title}</h2>{item.description && <p className="mt-[7px] text-[13px] leading-[1.6] text-[#6b7f96]">{item.description}</p>}</div>
              <span className={`inline-flex whitespace-nowrap rounded-full px-[9px] py-[6px] text-[11px] font-semibold ${statusTones[item.status] || 'bg-[#e5f4f2] text-[#24747a]'}`}>{item.status.replace(/_/g, ' ')}</span>
            </div>
            {item.data && Object.keys(item.data).length > 0 && (
              <dl className="mt-[18px] grid grid-cols-2 gap-x-6 gap-y-[10px] border-t border-[#e6ebf2] pt-[15px] max-[700px]:grid-cols-1">
                {Object.entries(item.data).map(([key, value]) => (
                  <div className="min-w-0" key={key}><dt className="text-[11px] font-bold capitalize text-[#6b7f96]">{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</dt><dd className="mt-1 break-words text-[13px] text-[#405770]">{key === 'center' ? centerOptions.find((center) => center._id === value)?.title || value : String(value || '—')}</dd></div>
                ))}
              </dl>
            )}
            {canUpdate && isParticipantClaim && (
              <form className="mt-4 grid grid-cols-2 gap-x-3 gap-y-[10px] border-t border-[#e6ebf2] pt-[14px] max-[700px]:grid-cols-1 [&_label]:grid [&_label]:gap-[6px] [&_label]:text-xs [&_label]:font-semibold [&_label]:text-[#405770] [&_input]:h-[34px] [&_input]:min-w-0 [&_input]:rounded-md [&_input]:border [&_input]:border-[#dbe5ef] [&_input]:bg-white [&_input]:p-2 [&_input]:text-[13px] [&_input]:text-[#334861] [&_textarea]:min-w-0 [&_textarea]:resize-y [&_textarea]:rounded-md [&_textarea]:border [&_textarea]:border-[#dbe5ef] [&_textarea]:bg-white [&_textarea]:p-2 [&_textarea]:text-[13px] [&_textarea]:text-[#334861]" onSubmit={(event) => updateClaim(item, event)}>
                <h3 className="col-span-full m-0 text-[13px] text-[#52677e]">Update your claim contact details</h3>
                {config.fields.filter((field) => !['campaign', 'consent'].includes(field.name)).map((field) => (
                  <label key={field.name}>{field.label}
                    {field.type === 'textarea'
                      ? <textarea value={claimEdits[item._id]?.[field.name] ?? item.data?.[field.name] ?? ''} required={field.required} maxLength={5000} rows={3} onChange={(event) => setClaimEdits((current) => ({ ...current, [item._id]: { ...current[item._id], [field.name]: event.target.value } }))} />
                      : <input type={field.type || 'text'} value={claimEdits[item._id]?.[field.name] ?? item.data?.[field.name] ?? ''} required={field.required} onChange={(event) => setClaimEdits((current) => ({ ...current, [item._id]: { ...current[item._id], [field.name]: event.target.value } }))} />}
                  </label>
                ))}
                <button className="min-h-8 justify-self-start rounded-md border border-[#dbe5ef] bg-white px-[11px] text-xs text-[#405e63] hover:border-[#39a7a4] hover:text-[#176b78] disabled:cursor-not-allowed disabled:opacity-55" type="submit" disabled={savingId === item._id}>{savingId === item._id ? 'Saving…' : 'Save contact details'}</button>
              </form>
            )}
            {canUpdate && !isParticipantClaim && (
              <div className="mt-4 flex items-center gap-2 border-t border-[#e6ebf2] pt-[13px] max-[700px]:items-start max-[700px]:flex-col">
                <label className="text-xs font-semibold text-[#405770]" htmlFor={`status-${item._id}`}>Update status</label>
                <select className="min-h-8 rounded-md border border-[#dbe5ef] bg-white px-2 text-xs text-[#334861]" id={`status-${item._id}`} value={statusDrafts[item._id] || item.status} onChange={(event) => setStatusDrafts((current) => ({ ...current, [item._id]: event.target.value }))}>
                  {[...new Set([item.status, ...(statusTransitions[kind][item.status] || []).filter((status) => statuses.includes(status))])].map((status) => <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>)}
                </select>
                <button className="min-h-8 rounded-md border border-[#dbe5ef] bg-white px-[11px] text-xs text-[#405e63] hover:border-[#39a7a4] hover:text-[#176b78] disabled:cursor-not-allowed disabled:opacity-55" type="button" disabled={savingId === item._id || (statusDrafts[item._id] || item.status) === item.status} onClick={() => updateStatus(item)}>
                  {savingId === item._id ? 'Updating…' : 'Update'}
                </button>
              </div>
            )}
          </article>
        ))}
      </section>
    </>
  );
}

export function RoleWorkflowPage({ area, user, profile, description }) {
  if (area === 'templates') {
    const allowedStatuses = profile.key === 'designer'
      ? ['draft', 'review']
      : profile.key === 'editionmanager'
        ? ['draft', 'review', 'approved']
        : undefined;
    return <WorkflowModule kind="template" user={user} description={description} allowedStatuses={allowedStatuses} />;
  }
  if (area === 'issues') {
    const allowedStatuses = profile.key === 'designer'
      ? ['planning', 'proof']
      : profile.key === 'editor'
        ? ['proof', 'approved', 'published']
        : profile.key === 'editionmanager'
          ? ['planning', 'proof', 'approved']
          : undefined;
    return <WorkflowModule kind="issue" user={user} description={description} allowedStatuses={allowedStatuses} />;
  }
  if (area === 'centers') return <WorkflowModule kind="center" user={user} description={description} />;
  if (area === 'reports') return <ReportModule user={user} description={description} />;
  if (area === 'campaigns') {
    if (profile.key === 'reader') {
      return <><WorkflowModule kind="campaign" user={user} description="Available campaign information and terms." readOnly /><WorkflowModule kind="claim" user={user} /></>;
    }
    if (profile.key === 'drawofficer') {
      return <><WorkflowModule kind="campaign" user={user} description="Campaigns approved for draw operations." readOnly /><WorkflowModule kind="draw" user={user} /></>;
    }
    return <WorkflowModule kind="campaign" user={user} description={description} />;
  }
  if (area === 'submissions') {
    if (profile.key === 'verificationofficer') {
      return (
        <>
          <WorkflowModule kind="intake" user={user} description="Review receipt IDs and intake records awaiting verification." readOnly />
          <WorkflowModule kind="verification" user={user} description={description} />
        </>
      );
    }
    if (profile.key === 'drawofficer') return <WorkflowModule kind="intake" user={user} description="Freeze verified campaign entries before an authorized draw." allowedStatuses={['received', 'frozen']} />;
    return <WorkflowModule kind="intake" user={user} description={description} />;
  }
  return null;
}

function ReportModule({ user, description }) {
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const canRead = user?.roleName === 'superadmin' || user?.permissions?.includes('workflow:report:read');

  useEffect(() => {
    let active = true;
    if (canRead) {
      api.get('/api/v1/reports/summary')
        .then(({ data }) => { if (active) setReport(data.data); })
        .catch((requestError) => { if (active) setError(requestError.response?.data?.message || 'Unable to load reports.'); });
    }
    return () => { active = false; };
  }, [canRead]);

  return (
    <>
      <div className="mb-[25px] flex items-end justify-between max-[700px]:flex-col max-[700px]:items-start max-[700px]:gap-[13px]"><div><p className="mb-[7px] text-[11px] font-bold tracking-[1.1px] text-[#6b7f96]">ROLE WORKSPACE</p><h1 className="m-0 font-sans text-[30px] font-bold tracking-[-.55px] text-[#172b46]">Reports & audit</h1><p className="mt-[7px] text-[13px] leading-[1.6] text-[#6b7f96]">{description}</p></div></div>
      {!canRead && <p className="mb-[17px] rounded-[7px] border border-[#f6d5d3] bg-[#fff2f1] px-3 py-[10px] text-[11px] text-[#b34447]" role="alert">Your role does not have permission to view reports.</p>}
      {error && <p className="mb-[17px] rounded-[7px] border border-[#f6d5d3] bg-[#fff2f1] px-3 py-[10px] text-[11px] text-[#b34447]" role="alert">{error}</p>}
      {canRead && report && (
        <>
          <section className="mb-[19px] grid grid-cols-4 gap-[14px] max-[1050px]:grid-cols-2 max-[700px]:gap-[9px]" aria-label="Workflow totals">
            <article className="min-h-[126px] rounded-[10px] border border-[#dbe5ef] border-t-2 border-t-[#39a7a4] bg-white p-[17px] px-[18px] shadow-[0_2px_6px_rgba(23,43,70,.05)] max-[700px]:min-h-[110px] max-[700px]:p-[13px]"><span className="block text-[13px] font-semibold text-[#405770]">Total workflow records</span><strong className="mt-[15px] block font-sans text-[30px] font-bold text-[#233b5c] max-[700px]:mt-[11px]">{report.total}</strong><small className="mt-1 block text-xs text-[#6b7f96]">Within your publisher workspace</small></article>
            {report.byStatus.map((row) => <article className="min-h-[126px] rounded-[10px] border border-[#dbe5ef] border-t-2 border-t-[#39a7a4] bg-white p-[17px] px-[18px] shadow-[0_2px_6px_rgba(23,43,70,.05)] max-[700px]:min-h-[110px] max-[700px]:p-[13px]" key={row.status}><span className="block text-[13px] font-semibold text-[#405770]">{row.status.replace(/_/g, ' ')}</span><strong className="mt-[15px] block font-sans text-[30px] font-bold text-[#233b5c] max-[700px]:mt-[11px]">{row.count}</strong><small className="mt-1 block text-xs text-[#6b7f96]">Records in this status</small></article>)}
          </section>
          <section className="mb-[17px] rounded-[10px] border border-[#dbe5ef] bg-white p-[21px] px-[22px] max-[700px]:p-4 pb-2 shadow-[0_2px_6px_rgba(23,43,70,.05)]">
            <div className="flex items-center justify-between"><div><h2 className="m-0 font-sans text-lg font-bold tracking-[-.55px] text-[#172b46]">Workflow activity</h2><p className="mt-[7px] text-[13px] leading-[1.6] text-[#6b7f96]">Tenant-scoped records by workflow type</p></div></div>
            <div className="mt-[17px] overflow-x-auto"><table className="w-full min-w-[650px] border-collapse [&_th]:border-b [&_th]:border-[#e2e8ef] [&_th]:bg-[#edf3f7] [&_th]:px-3 [&_th]:py-[11px] [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-[.3px] [&_th]:text-[#405770] [&_td]:border-b [&_td]:border-[#e2e8ef] [&_td]:px-3 [&_td]:py-[11px] [&_td]:text-[13px] [&_td]:text-[#405770] [&_td:first-child]:font-semibold [&_td:first-child]:text-[#334861]"><thead><tr><th>Workflow</th><th>Records</th></tr></thead><tbody>
              {report.byKind.map((row) => <tr key={row.kind}><td>{row.kind}</td><td>{row.count}</td></tr>)}
            </tbody></table></div>
          </section>
        </>
      )}
    </>
  );
}

export default RoleWorkflowPage;
