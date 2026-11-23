// frontend/src/components/Login.jsx
import React, { useState } from 'react';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, LockKeyhole, Mail, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { api } from '../api';
import { demoPassword, roleProfiles } from '../roles';
import BrandLogo from './BrandLogo';

const schema = yup.object().shape({
  email: yup.string().email('Enter a valid email address').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
});

function Login({ onSuccess, startupError }) {
  const [selectedRole, setSelectedRole] = useState(roleProfiles[0].key);
  const [form, setForm] = useState({ email: roleProfiles[0].email, password: demoPassword });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (e) => {
    const profile = roleProfiles.find((role) => role.key === e.target.value);
    if (!profile) return;
    setSelectedRole(profile.key);
    setForm({ email: profile.email, password: demoPassword });
    setErrors({});
  };

  const selectedProfile = roleProfiles.find((role) => role.key === selectedRole) || roleProfiles[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await schema.validate(form, { abortEarly: false });
      setErrors({});
    } catch (validationErr) {
      const errObj = {};
      validationErr.inner.forEach((v) => {
        errObj[v.path] = v.message;
      });
      setErrors(errObj);
      return;
    }

    setSubmitting(true);
    try {
      const resp = await api.post('/api/v1/auth/login', form);
      if (resp.data.success) {
        await onSuccess(resp.data.accessToken);
        navigate('/', { replace: true });
      } else {
        setErrors({ form: resp.data.message || 'Login failed' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setErrors({ form: msg || 'Unable to sign in' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FAF8F5] p-8 max-[850px]:items-start max-[850px]:overflow-y-auto max-[850px]:p-3">
      {/* Soft warm editorial ambient glow orbs */}
      <div className="pointer-events-none absolute -left-[160px] -top-[160px] h-[550px] w-[550px] rounded-full bg-orange-200/30 blur-[130px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-[160px] -right-[160px] h-[550px] w-[550px] rounded-full bg-amber-200/30 blur-[130px]" aria-hidden="true" />
      <div className="pointer-events-none absolute right-[25%] top-[10%] h-[320px] w-[320px] rounded-full bg-rose-200/20 blur-[100px]" aria-hidden="true" />

      <section className="relative z-10 grid min-h-[660px] w-full max-w-[1080px] grid-cols-[45%_55%] overflow-hidden rounded-3xl border border-[#E8E2D5] bg-white shadow-[0_20px_60px_-15px_rgba(44,38,34,0.08)] backdrop-blur-md max-[850px]:min-h-0 max-[850px]:grid-cols-1 max-[850px]:rounded-2xl">
        {/* Left Editorial Branding Showcase */}
        <aside className="relative flex flex-col justify-between overflow-hidden bg-[#F5F2EB] p-10 px-[44px] pb-10 border-r border-[#E8E2D5] text-[#14171A] max-[850px]:min-h-[240px] max-[850px]:px-6 max-[850px]:py-7">
          {/* Subtle newspaper grid pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(44,38,34,0.04)_1px,transparent_1px)] [background-size:24px_24px] opacity-80" aria-hidden="true" />

          <div className="relative z-10 flex items-center">
            <div className="h-[68px] w-[280px] max-w-full overflow-hidden rounded-xl border border-[#E8E2D5] bg-white shadow-sm">
              <BrandLogo className="h-full w-full object-cover object-center" />
            </div>
          </div>

          <div className="relative z-10 my-auto py-10 max-[850px]:py-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-50/80 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-900 shadow-2xs">
              <Sparkles size={12} className="text-[#C2410C] fill-[#C2410C]" /> Next-Gen Editorial Intelligence
            </span>
            <h2 className="my-5 font-serif text-[42px] font-extrabold leading-[1.08] tracking-tight text-[#14171A] max-[850px]:my-3 max-[850px]:text-[30px]">
              Every edition,<br />
              <span className="bg-gradient-to-r from-[#9A3412] via-[#C2410C] to-[#D97706] bg-clip-text text-transparent italic">
                flawlessly orchestrated.
              </span>
            </h2>
            <p className="max-w-[340px] text-xs leading-[1.8] text-[#57534E] max-[850px]:max-w-[420px]">
              Live wire ingestion, deep journalistic neural analysis, automated 8-page broadsheet assembly, and full editorial rights governance.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 rounded-2xl border border-[#E8E2D5] bg-white/90 p-3.5 shadow-2xs backdrop-blur-md max-[850px]:hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#C2410C]">
              <ShieldCheck size={20} />
            </div>
            <div className="min-w-0">
              <strong className="block font-serif text-xs font-bold text-[#14171A]">Enterprise Publisher Governance</strong>
              <span className="mt-0.5 block text-[11px] text-[#78716C]">Multi-tenant role permissions & automated broadsheet audit</span>
            </div>
          </div>
        </aside>

        {/* Right Form Container */}
        <div className="flex flex-col justify-center bg-white px-14 py-12 max-[850px]:px-6 max-[850px]:py-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-[11px] font-black tracking-wider text-[#C2410C] border border-orange-200/80">
              <Zap size={13} className="text-[#C2410C] fill-[#C2410C]" /> SECURE DESK ACCESS
            </div>
            <h1 className="mt-3 font-serif text-3xl font-extrabold tracking-tight text-[#14171A] max-[850px]:text-2xl">
              Editorial Sign In
            </h1>
            <p className="mt-1 mb-6 text-xs text-[#78716C]">
              Select your role credential to access your tailored publication desk.
            </p>
          </div>

          {startupError && (
            <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700" role="alert">
              Could not restore your session: {startupError}
            </p>
          )}
          {errors.form && (
            <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700" role="alert">
              {errors.form}
            </p>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#14171A]" htmlFor="role">
                Assigned Newsroom Role
              </label>
              <div className="relative">
                <select
                  id="role"
                  className="h-11 w-full appearance-none rounded-xl border border-[#E8E2D5] bg-[#FAF8F5] px-3.5 pr-10 text-xs font-semibold text-[#14171A] outline-none transition-all duration-150 focus:border-[#C2410C] focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  value={selectedRole}
                  onChange={handleRoleChange}
                  disabled={submitting}
                >
                  {roleProfiles.map((role) => (
                    <option key={role.key} value={role.key}>
                      {role.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#78716C]" size={16} />
              </div>
              <p className="mt-2 rounded-xl border-l-[3px] border-[#C2410C] bg-gradient-to-r from-orange-50/80 to-amber-50/40 p-2.5 px-3 text-[11px] leading-relaxed text-[#7C2D12] font-medium">
                {selectedProfile.responsibility}
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#14171A]" htmlFor="email">
                Email Address
              </label>
              <div className="relative flex items-center rounded-xl border border-[#E8E2D5] bg-[#FAF8F5] transition-all duration-150 focus-within:border-[#C2410C] focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-500/10">
                <Mail className="absolute left-3.5 text-[#78716C]" size={16} />
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="name@newspaper.com"
                  autoComplete="email"
                  className={`h-11 w-full border-0 bg-transparent px-3 pl-10 text-xs font-medium text-[#14171A] outline-none ${errors.email ? 'border-rose-500' : ''}`}
                  value={form.email}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>
              {errors.email && <p className="mt-1 text-[11px] font-medium text-rose-600">{errors.email}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#14171A]" htmlFor="password">
                Password
              </label>
              <div className="relative flex items-center rounded-xl border border-[#E8E2D5] bg-[#FAF8F5] transition-all duration-150 focus-within:border-[#C2410C] focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-500/10">
                <LockKeyhole className="absolute left-3.5 text-[#78716C]" size={16} />
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`h-11 w-full border-0 bg-transparent px-3 pl-10 text-xs font-medium text-[#14171A] outline-none ${errors.password ? 'border-rose-500' : ''}`}
                  value={form.password}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>
              {errors.password && <p className="mt-1 text-[11px] font-medium text-rose-600">{errors.password}</p>}
            </div>

            <button
              type="submit"
              className="group mt-2 flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C2410C] via-[#EA580C] to-[#D97706] px-5 text-xs font-bold text-white shadow-md shadow-orange-950/15 transition-all duration-150 hover:-translate-y-0.5 hover:from-[#9A3412] hover:to-[#B45309] hover:shadow-lg disabled:cursor-wait disabled:opacity-60"
              disabled={submitting}
            >
              <span>{submitting ? 'Authenticating…' : 'Enter Desk Workspace'}</span>
              {!submitting && <ArrowRight className="transition-transform duration-150 group-hover:translate-x-1" size={16} />}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between border-t border-[#E8E2D5] pt-4 text-xs text-[#78716C]">
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#78716C]">Local Demo Password</span>
            <span className="rounded-md bg-amber-50 px-2.5 py-0.5 font-mono text-[11px] font-bold text-amber-900 border border-amber-200/80">
              {demoPassword}
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;
