import React, { useEffect, useState } from 'react';
import {
  BadgeCheck,
  Building2,
  ClipboardCheck,
  FileText,
  Map,
  Megaphone,
  Newspaper,
  Palette,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { api } from '../api';

const roleStyles = [
  { Icon: ShieldCheck, tone: 'bg-[#e2f4f4] text-[#168b9a]', stripe: 'bg-[#168b9a]' },
  { Icon: Building2, tone: 'bg-[#fff0e8] text-[#b86548]', stripe: 'bg-[#e58b63]' },
  { Icon: Map, tone: 'bg-[#edf0ff] text-[#5b65b7]', stripe: 'bg-[#7b83d1]' },
  { Icon: Newspaper, tone: 'bg-[#e8f4eb] text-[#4c8b61]', stripe: 'bg-[#68a978]' },
  { Icon: FileText, tone: 'bg-[#fff4df] text-[#a97922]', stripe: 'bg-[#d5a548]' },
  { Icon: Palette, tone: 'bg-[#f3eaff] text-[#8054a8]', stripe: 'bg-[#9d70c5]' },
  { Icon: Megaphone, tone: 'bg-[#ffe9ed] text-[#bc536b]', stripe: 'bg-[#d87388]' },
  { Icon: ClipboardCheck, tone: 'bg-[#e4f2f5] text-[#3f8392]', stripe: 'bg-[#5ba3b1]' },
  { Icon: BadgeCheck, tone: 'bg-[#e8f4eb] text-[#4c8b61]', stripe: 'bg-[#68a978]' },
  { Icon: ClipboardCheck, tone: 'bg-[#fff0e8] text-[#b86548]', stripe: 'bg-[#e58b63]' },
  { Icon: UserRound, tone: 'bg-[#edf0ff] text-[#5b65b7]', stripe: 'bg-[#7b83d1]' },
];

function RoleResponsibilitiesModule() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/api/v1/team/roles')
      .then(({ data }) => {
        if (active) setRoles(data.data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Unable to load role responsibilities.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <>
      <div className="mb-6 flex items-end justify-between gap-4 max-[700px]:flex-col max-[700px]:items-start">
        <div className="min-w-0">
          <p className="mb-2 text-[11px] font-bold tracking-[1.2px] text-[#168b9a]">ACCESS &amp; ACCOUNTABILITY</p>
          <h1 className="m-0 font-sans text-[30px] font-bold tracking-[-.55px] text-[#172b46] max-[500px]:text-[26px]">Roles that keep work moving</h1>
          <p className="mt-2 text-sm leading-6 text-[#6b7f96]">A clear view of who does what across your publication.</p>
        </div>
        <div className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#dbe5ef] bg-white px-3 py-2 shadow-[0_2px_8px_rgba(23,43,70,.04)]">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e2f4f4] text-xs font-extrabold text-[#168b9a]">{String(roles.length).padStart(2, '0')}</span>
          <span className="text-xs font-semibold text-[#526980]">defined roles</span>
        </div>
      </div>
      {error && <p className="mb-[17px] rounded-[7px] border border-[#f6d5d3] bg-[#fff2f1] px-3 py-[10px] text-[11px] text-[#b34447]" role="alert">{error}</p>}
      <section aria-label="Roles and responsibilities" className="mb-[17px]">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 min-[640px]:grid-cols-2 min-[1250px]:grid-cols-3" aria-live="polite">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="min-h-[188px] animate-pulse rounded-2xl border border-[#dbe5ef] bg-white p-5">
                <div className="mb-5 h-11 w-11 rounded-xl bg-[#e7eef4]" />
                <div className="mb-3 h-4 w-2/3 rounded bg-[#e7eef4]" />
                <div className="h-3 w-full rounded bg-[#f0f4f7]" />
                <div className="mt-2 h-3 w-4/5 rounded bg-[#f0f4f7]" />
              </div>
            ))}
          </div>
        ) : (
          roles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#cbd8e5] bg-white px-5 py-12 text-center">
              <ShieldCheck className="mx-auto mb-3 h-9 w-9 text-[#8ba0b4]" aria-hidden="true" />
              <p className="text-sm font-semibold text-[#172b46]">No roles to display</p>
              <p className="mt-1 text-xs text-[#6b7f96]">Role responsibilities will appear here when available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 min-[640px]:grid-cols-2 min-[1250px]:grid-cols-3">
              {roles.map((role, index) => {
                const { Icon, tone, stripe } = roleStyles[index % roleStyles.length];
                return (
                  <article
                    key={role.key}
                    className="group min-w-0 overflow-hidden rounded-2xl border border-[#dbe5ef] bg-white shadow-[0_3px_12px_rgba(23,43,70,.045)] transition duration-200 hover:-translate-y-1 hover:border-[#a9d8d8] hover:shadow-[0_10px_24px_rgba(23,43,70,.09)]"
                  >
                    <div className={`h-1 w-full ${stripe}`} />
                    <div className="p-5">
                      <div className="mb-5 flex items-center justify-between gap-3">
                        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>
                          <Icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
                        </span>
                        <span className="rounded-full bg-[#f3f6f9] px-2.5 py-1 text-[10px] font-bold tracking-[.8px] text-[#71849a]">
                          ROLE {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <h2 className="mb-2 text-[15px] font-bold leading-6 text-[#172b46]">{role.name}</h2>
                      <p className="text-[13px] leading-[1.7] text-[#61758b]">{role.responsibility}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          )
        )}
      </section>
    </>
  );
}

export default RoleResponsibilitiesModule;
