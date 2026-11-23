import React, { useEffect, useState } from 'react';
import { api } from '../api';

function PlatformPublishersModule() {
  const [publishers, setPublishers] = useState([]);
  const [form, setForm] = useState({ name: '', domain: '', ownerEmail: '', ownerPassword: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadPublishers() {
    const { data } = await api.get('/api/v1/platform/publishers');
    setPublishers(data.data);
  }

  useEffect(() => {
    let active = true;
    api.get('/api/v1/platform/publishers')
      .then(({ data }) => { if (active) setPublishers(data.data); })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.message || 'Unable to load publisher workspaces.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function createPublisher(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const { data } = await api.post('/api/v1/platform/publishers', form);
      setMessage(`Publisher workspace created for ${data.data.owner.email}. Share the initial password securely.`);
      setForm({ name: '', domain: '', ownerEmail: '', ownerPassword: '' });
      await loadPublishers();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to create the publisher workspace.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="mb-[25px] flex items-end justify-between max-[700px]:flex-col max-[700px]:items-start max-[700px]:gap-[13px]">
        <div><p className="mb-[7px] text-[11px] font-bold tracking-[1.1px] text-[#6b7f96]">PLATFORM ADMINISTRATION</p><h1 className="m-0 font-sans text-[30px] font-bold tracking-[-.55px] text-[#172b46]">Publisher onboarding</h1><p className="mt-[7px] text-[13px] leading-[1.6] text-[#6b7f96]">Create an isolated publisher workspace and its first owner login.</p></div>
        <span className="inline-flex whitespace-nowrap rounded-full bg-[#e5f4f2] px-[9px] py-[6px] text-[11px] font-semibold text-[#24747a]">{publishers.length} publishers</span>
      </div>
      <section className="mb-[17px] rounded-[10px] border border-[#dbe5ef] bg-white p-[21px] px-[22px] max-[700px]:p-4 shadow-[0_2px_6px_rgba(23,43,70,.05)]">
        <div className="flex items-center justify-between"><div><h2 className="m-0 font-sans text-lg font-bold tracking-[-.55px] text-[#172b46]">Onboard a publisher</h2><p className="mt-[7px] text-[13px] leading-[1.6] text-[#6b7f96]">The owner receives publisher-level access only inside the new tenant.</p></div></div>
        {error && <p className="mb-[17px] rounded-[7px] border border-[#f6d5d3] bg-[#fff2f1] px-3 py-[10px] text-[11px] text-[#b34447]" role="alert">{error}</p>}
        {message && <p className="mb-[17px] rounded-[7px] border border-[#c8e8d8] bg-[#e6f5ee] px-3 py-[10px] text-[11px] text-[#23734c]" role="status">{message}</p>}
        <form className="mt-[19px] grid grid-cols-3 items-end gap-[13px] max-[1050px]:grid-cols-2 max-[700px]:grid-cols-1 [&_label]:grid [&_label]:gap-[6px] [&_label]:text-xs [&_label]:font-semibold [&_label]:text-[#405770] [&_input]:h-[38px] [&_input]:min-w-0 [&_input]:rounded-md [&_input]:border [&_input]:border-[#dbe5ef] [&_input]:bg-white [&_input]:px-[10px] [&_input]:text-[13px] [&_input]:text-[#334861] [&_input]:outline-none [&_input]:focus:border-brand-coral [&_input]:focus:ring-[3px] [&_input]:focus:ring-brand-coral/10 [&_button]:col-span-full [&_button]:min-h-[38px] [&_button]:justify-self-start" onSubmit={createPublisher}>
          <label>Publisher name<input name="name" value={form.name} onChange={updateField} required minLength={2} maxLength={120} /></label>
          <label>Domain (optional)<input name="domain" value={form.domain} onChange={updateField} maxLength={253} /></label>
          <label>Owner email<input name="ownerEmail" type="email" autoComplete="off" value={form.ownerEmail} onChange={updateField} required maxLength={254} /></label>
          <label>Initial owner password<input name="ownerPassword" type="password" autoComplete="new-password" value={form.ownerPassword} onChange={updateField} required minLength={12} /></label>
          <button className="min-h-11 rounded-lg border-0 bg-brand-navy px-[15px] text-xs font-bold text-white shadow-[0_8px_18px_rgba(23,50,77,.18)] transition-all duration-150 hover:-translate-y-px hover:bg-brand-navy-soft hover:shadow-[0_10px_22px_rgba(23,50,77,.24)] disabled:cursor-wait disabled:opacity-65" type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create publisher workspace'}</button>
        </form>
      </section>
      <section className="mb-[17px] rounded-[10px] border border-[#dbe5ef] bg-white p-[21px] px-[22px] max-[700px]:p-4 pb-2 shadow-[0_2px_6px_rgba(23,43,70,.05)]">
        <div className="flex items-center justify-between"><div><h2 className="m-0 font-sans text-lg font-bold tracking-[-.55px] text-[#172b46]">Publisher workspaces</h2><p className="mt-[7px] text-[13px] leading-[1.6] text-[#6b7f96]">Tenant details only; editorial records remain in each publisher workspace.</p></div></div>
        {loading ? <div className="mt-[18px] border-t border-[#e6ebf2] px-0 pb-[3px] pt-[22px] text-center text-[13px] text-[#6b7f96]">Loading publisher workspaces…</div> : publishers.length === 0 ? <div className="mt-[18px] border-t border-[#e6ebf2] px-0 pb-[3px] pt-[22px] text-center text-[13px] text-[#6b7f96]">No publisher workspaces yet.</div> : (
          <div className="mt-[17px] overflow-x-auto"><table className="w-full min-w-[650px] border-collapse [&_th]:border-b [&_th]:border-[#e2e8ef] [&_th]:bg-[#edf3f7] [&_th]:px-3 [&_th]:py-[11px] [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-[.3px] [&_th]:text-[#405770] [&_td]:border-b [&_td]:border-[#e2e8ef] [&_td]:px-3 [&_td]:py-[11px] [&_td]:text-[13px] [&_td]:text-[#405770] [&_td:first-child]:font-semibold [&_td:first-child]:text-[#334861]"><thead><tr><th>Publisher</th><th>Domain</th><th>Status</th></tr></thead><tbody>
            {publishers.map((publisher) => <tr key={publisher._id}><td>{publisher.name}</td><td>{publisher.domain || '—'}</td><td>{publisher.status}</td></tr>)}
          </tbody></table></div>
        )}
      </section>
    </>
  );
}

export default PlatformPublishersModule;
