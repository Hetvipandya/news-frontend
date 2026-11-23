import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { roleProfiles } from '../roles';

const assignableRoles = roleProfiles.filter((role) => !['superadmin', 'publisheradmin'].includes(role.key));

function TeamUsersModule({ title, description }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ email: '', password: '', roleName: 'reporter' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadUsers() {
    const { data } = await api.get('/api/v1/team/users');
    setUsers(data.data);
  }

  useEffect(() => {
    let active = true;
    api.get('/api/v1/team/users')
      .then(({ data }) => { if (active) setUsers(data.data); })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.message || 'Unable to load team accounts.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function createUser(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await api.post('/api/v1/team/users', form);
      setForm({ email: '', password: '', roleName: 'reporter' });
      setMessage('Team account created. Share its login details securely with the staff member.');
      await loadUsers();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to create the account.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="mb-[25px] flex items-end justify-between max-[700px]:flex-col max-[700px]:items-start max-[700px]:gap-[13px]">
        <div><p className="mb-[7px] text-[11px] font-bold tracking-[1.1px] text-[#6b7f96]">PUBLISHER ADMINISTRATION</p><h1 className="m-0 font-sans text-[30px] font-bold tracking-[-.55px] text-[#172b46]">{title}</h1><p className="mt-[7px] text-[13px] leading-[1.6] text-[#6b7f96]">{description}</p></div>
        <span className="inline-flex whitespace-nowrap rounded-full bg-[#e5f4f2] px-[9px] py-[6px] text-[11px] font-semibold text-[#24747a]">{users.length} accounts</span>
      </div>
      <section className="mb-[17px] rounded-[10px] border border-[#dbe5ef] bg-white p-[21px] px-[22px] max-[700px]:p-4 shadow-[0_2px_6px_rgba(23,43,70,.05)]">
        <div className="flex items-center justify-between"><div><h2 className="m-0 font-sans text-lg font-bold tracking-[-.55px] text-[#172b46]">Create a team account</h2><p className="mt-[7px] text-[13px] leading-[1.6] text-[#6b7f96]">Passwords are stored as hashes; give the temporary password to the user securely.</p></div></div>
        {error && <p className="mb-[17px] rounded-[7px] border border-[#f6d5d3] bg-[#fff2f1] px-3 py-[10px] text-[11px] text-[#b34447]" role="alert">{error}</p>}
        {message && <p className="mb-[17px] rounded-[7px] border border-[#c8e8d8] bg-[#e6f5ee] px-3 py-[10px] text-[11px] text-[#23734c]" role="status">{message}</p>}
        <form className="mt-[19px] grid grid-cols-3 items-end gap-[13px] max-[1050px]:grid-cols-2 max-[700px]:grid-cols-1 [&_label]:grid [&_label]:gap-[6px] [&_label]:text-xs [&_label]:font-semibold [&_label]:text-[#405770] [&_input]:h-[38px] [&_input]:min-w-0 [&_input]:rounded-md [&_input]:border [&_input]:border-[#dbe5ef] [&_input]:bg-white [&_input]:px-[10px] [&_input]:text-[13px] [&_input]:text-[#334861] [&_input]:outline-none [&_input]:focus:border-brand-coral [&_input]:focus:ring-[3px] [&_input]:focus:ring-brand-coral/10 [&_select]:h-[38px] [&_select]:min-w-0 [&_select]:rounded-md [&_select]:border [&_select]:border-[#dbe5ef] [&_select]:bg-white [&_select]:px-[10px] [&_select]:text-[13px] [&_select]:text-[#334861] [&_select]:outline-none [&_select]:focus:border-brand-coral [&_select]:focus:ring-[3px] [&_button]:col-span-full [&_button]:min-h-[38px] [&_button]:justify-self-start" onSubmit={createUser}>
          <label>Email address<input name="email" type="email" autoComplete="off" value={form.email} onChange={updateField} required maxLength={254} /></label>
          <label>Role<select name="roleName" value={form.roleName} onChange={updateField} required>{assignableRoles.map((role) => <option key={role.key} value={role.key}>{role.name}</option>)}</select></label>
          <label>Temporary password<input name="password" type="password" autoComplete="new-password" value={form.password} onChange={updateField} required minLength={12} /></label>
          <button className="min-h-11 rounded-lg border-0 bg-brand-navy px-[15px] text-xs font-bold text-white shadow-[0_8px_18px_rgba(23,50,77,.18)] transition-all duration-150 hover:-translate-y-px hover:bg-brand-navy-soft hover:shadow-[0_10px_22px_rgba(23,50,77,.24)] disabled:cursor-wait disabled:opacity-65" type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create account'}</button>
        </form>
      </section>
      <section className="mb-[17px] rounded-[10px] border border-[#dbe5ef] bg-white p-[21px] px-[22px] max-[700px]:p-4 pb-2 shadow-[0_2px_6px_rgba(23,43,70,.05)]">
        <div className="flex items-center justify-between"><div><h2 className="m-0 font-sans text-lg font-bold tracking-[-.55px] text-[#172b46]">Publisher team</h2><p className="mt-[7px] text-[13px] leading-[1.6] text-[#6b7f96]">Accounts belonging to this publisher workspace</p></div></div>
        {loading ? <div className="mt-[18px] border-t border-[#e6ebf2] px-0 pb-[3px] pt-[22px] text-center text-[13px] text-[#6b7f96]">Loading team accounts…</div> : users.length === 0 ? <div className="mt-[18px] border-t border-[#e6ebf2] px-0 pb-[3px] pt-[22px] text-center text-[13px] text-[#6b7f96]">No team accounts yet.</div> : (
          <div className="mt-[17px] overflow-x-auto"><table className="w-full min-w-[650px] border-collapse [&_th]:border-b [&_th]:border-[#e2e8ef] [&_th]:bg-[#edf3f7] [&_th]:px-3 [&_th]:py-[11px] [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-[.3px] [&_th]:text-[#405770] [&_td]:border-b [&_td]:border-[#e2e8ef] [&_td]:px-3 [&_td]:py-[11px] [&_td]:text-[13px] [&_td]:text-[#405770] [&_td:first-child]:font-semibold [&_td:first-child]:text-[#334861]"><thead><tr><th>Email</th><th>Role</th><th>Status</th></tr></thead><tbody>
            {users.map((user) => {
              const profile = roleProfiles.find((role) => role.key === user.roleName);
              return <tr key={user.id}><td>{user.email}</td><td>{profile?.name || user.roleName}</td><td>{user.isActive ? 'Active' : 'Inactive'}</td></tr>;
            })}
          </tbody></table></div>
        )}
      </section>
    </>
  );
}

export default TeamUsersModule;
