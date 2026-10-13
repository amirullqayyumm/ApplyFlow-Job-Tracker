import { useEffect, useMemo, useState } from 'react';
import {
  Activity, ArrowRight, ArrowUpRight, Bell, BriefcaseBusiness,
  CalendarDays, ChartNoAxesCombined, Check, CheckCheck,
  ChevronRight, CircleCheckBig, Clock3, CloudDownload,
  FileSpreadsheet, FolderKanban, GripVertical, Heart, Inbox, LayoutDashboard,
  ListFilter, MapPin, Menu, Moon, MoreHorizontal, Plus, RotateCcw, Search, Settings2,
  ShieldCheck, Sparkles, Sun, Target, Trash2, TrendingUp, X,
} from 'lucide-react';
import { blankApplication, sampleApplications, STAGES, STAGE_IDS } from './data';
import { asLocalDate, daysUntil, dueLabel, initials, localISO, logoHue, makeId, prettyDate, safeUrl, saveCSV } from './utils';

const STORAGE_JOBS = 'applyflow-applications-v1';
const STORAGE_THEME = 'applyflow-theme-v1';
const STORAGE_DEMO = 'applyflow-demo-v1';

function readJobs() {
  try {
    const saved = localStorage.getItem(STORAGE_JOBS);
    if (saved !== null) {
      const data = JSON.parse(saved);
      if (Array.isArray(data)) return data;
    }
  } catch (error) { console.warn('Unable to read saved applications', error); }
  return sampleApplications();
}

const navigation = [
  { id: 'dashboard', title: 'Overview', Icon: LayoutDashboard },
  { id: 'pipeline', title: 'Pipeline board', Icon: FolderKanban },
  { id: 'applications', title: 'All applications', Icon: BriefcaseBusiness },
  { id: 'interviews', title: 'Interviews & tasks', Icon: CalendarDays },
  { id: 'insights', title: 'Insights', Icon: ChartNoAxesCombined },
];

const pageInfo = {
  dashboard: { eyebrow: 'YOUR WORKSPACE', title: 'Good things take follow-through.', subtitle: 'Every opportunity, one step closer.' },
  pipeline: { eyebrow: 'YOUR WORKFLOW', title: 'Application pipeline', subtitle: 'Drag cards across stages as your journey progresses.' },
  applications: { eyebrow: 'STAY ORGANIZED', title: 'All applications', subtitle: 'Everything you need to track your next opportunity.' },
  interviews: { eyebrow: 'WHAT’S NEXT', title: 'Interviews & follow-ups', subtitle: 'Stay ready and never miss the next conversation.' },
  insights: { eyebrow: 'THE BIG PICTURE', title: 'Your career insights', subtitle: 'A clearer view of the progress you’re making.' },
};

function BrandMark({ size = 40 }) {
  return <span className="brand-mark" style={{ width: size, height: size }}><Check strokeWidth={3.5} size={size * .54} /></span>;
}

function CompanyMark({ company, size = 42 }) {
  const bg = logoHue(company);
  return <span className="company-mark" style={{ background: `${bg}1b`, color: bg, width: size, height: size, fontSize: Math.max(12, size * .29) }} aria-hidden="true">{initials(company)}</span>;
}

function StagePill({ stage, small = false }) {
  const s = STAGES.find((x) => x.id === stage) || STAGES[0];
  return <span className={`stage-pill ${small ? 'stage-pill-small' : ''}`} style={{ '--stage-color': s.color, '--stage-soft': s.soft }}><span className="stage-dot" />{s.label}</span>;
}

function Sidebar({ view, setView, theme, setTheme, mobileOpen, setMobileOpen, total }) {
  return <>
    {mobileOpen && <button className="sidebar-scrim" aria-label="Close menu" onClick={() => setMobileOpen(false)} />}
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-top"><div className="sidebar-brand"><BrandMark /><span><strong>apply<span>flow</span></strong><small>YOUR CAREER COMPANION</small></span></div><button className="icon-button mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={19}/></button></div>
      <div className="sidebar-section-title">WORKSPACE</div>
      <nav className="sidebar-links" aria-label="Main navigation">
        {navigation.map(({ id, title, Icon }) => <button key={id} className={`sidebar-link ${view === id ? 'active' : ''}`} onClick={() => { setView(id); setMobileOpen(false); }}><Icon size={19} strokeWidth={1.9}/><span>{title}</span>{id === 'applications' && <span className="sidebar-count">{total}</span>}</button>)}
      </nav>
      <div className="sidebar-spacer" />
      
      <div className="sidebar-bottom"><button className="sidebar-theme" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}><span>{theme === 'light' ? <Moon size={18}/> : <Sun size={18}/>}</span>{theme === 'light' ? 'Dark appearance' : 'Light appearance'}<ArrowRight size={16}/></button><div className="sidebar-footer"><span className="footer-avatar">AF</span><span><strong>My workspace</strong><small>Saved on this device</small></span><span className="online-dot" /></div></div>
    </aside>
  </>;
}

function StatCard({ label, value, detail, Icon, variant = 'purple', onClick, decorative }) {
  return <button className={`stat-card stat-${variant}`} onClick={onClick} type="button"><div className="stat-top"><span className="stat-icon"><Icon size={20} strokeWidth={2}/></span>{decorative && <span className="stat-small-badge">{decorative}</span>}</div><div className="stat-value">{value}</div><div className="stat-name">{label}</div><div className="stat-detail">{detail} <ArrowUpRight size={15}/></div></button>;
}

function EmptyState({ title = 'Nothing here yet', detail = 'Your opportunities will appear here.', action, onAction, Icon = Inbox }) {
  return <div className="empty-state"><div className="empty-icon"><Icon size={25}/></div><h3>{title}</h3><p>{detail}</p>{action && <button className="btn btn-primary btn-sm" onClick={onAction}><Plus size={16}/>{action}</button>}</div>;
}

function ApplicationForm({ initial, onClose, onSave }) {
  const [form, setForm] = useState(() => initial ? { ...blankApplication(), ...initial } : blankApplication());
  const [error, setError] = useState('');
  const edit = Boolean(initial?.id);
  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  const submit = (event) => {
    event.preventDefault();
    if (!form.company.trim() || !form.role.trim()) { setError('Company and job title are required.'); return; }
    if (form.url.trim() && !safeUrl(form.url.trim())) { setError('Use a full link starting with https:// or http://.'); return; }
    onSave({ ...form, company: form.company.trim(), role: form.role.trim(), location: form.location.trim(), contact: form.contact.trim(), url: form.url.trim(), notes: form.notes.trim(), salary: form.salary.trim(), id: initial?.id || makeId(), createdAt: initial?.createdAt || localISO() });
  };
  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-header"><div><div className="eyebrow">APPLICATION DETAILS</div><h2 id="modal-title">{edit ? 'Edit opportunity' : 'Add an opportunity'}</h2><p>Every big move starts with one application.</p></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={21}/></button></div>
      <form onSubmit={submit}>
        <div className="modal-body">
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="form-grid"><label className="field">Company name <span className="required">*</span><input required autoFocus value={form.company} onChange={(e) => update('company', e.target.value)} placeholder="e.g. Figma" maxLength={90}/></label><label className="field">Job title <span className="required">*</span><input required value={form.role} onChange={(e) => update('role', e.target.value)} placeholder="e.g. Frontend Developer" maxLength={110}/></label></div>
          <div className="form-grid"><label className="field">Stage <select value={form.status} onChange={(e) => update('status', e.target.value)}>{STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></label><label className="field">Date applied <input type="date" value={form.appliedDate || ''} onChange={(e) => update('appliedDate', e.target.value)}/></label></div>
          <div className="form-grid"><label className="field">Location<input value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="e.g. Kuala Lumpur"/></label><label className="field">Work arrangement<select value={form.workMode} onChange={(e) => update('workMode', e.target.value)}><option>Hybrid</option><option>Remote</option><option>On-site</option></select></label></div>
          <div className="form-grid"><label className="field">Job type<select value={form.jobType} onChange={(e) => update('jobType', e.target.value)}><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option><option>Freelance</option></select></label><label className="field">Salary / compensation<input value={form.salary} onChange={(e) => update('salary', e.target.value)} placeholder="e.g. RM 5,000 – 7,000"/></label></div>
          <div className="form-separator"><span>REMINDERS & LINKS</span></div>
          <div className="form-grid"><label className="field">Interview date<input type="date" value={form.interviewDate || ''} onChange={(e) => update('interviewDate', e.target.value)}/></label><label className="field">Follow-up date<input type="date" value={form.followUpDate || ''} onChange={(e) => update('followUpDate', e.target.value)}/></label></div>
          <div className="form-grid"><label className="field">Job posting URL<input type="url" value={form.url} onChange={(e) => update('url', e.target.value)} placeholder="https://company.com/jobs/..."/></label><label className="field">Recruiter / contact<input value={form.contact} onChange={(e) => update('contact', e.target.value)} placeholder="Optional contact"/></label></div>
          <label className="field">Your notes<textarea rows="4" value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Key details, interview prep, questions to ask..."/></label>
        </div>
        <div className="modal-footer"><button className="btn btn-quiet" type="button" onClick={onClose}>Cancel</button><button className="btn btn-primary" type="submit"><Check size={17}/>{edit ? 'Save changes' : 'Add opportunity'}</button></div>
      </form>
    </div>
  </div>;
}

function ApplicationCard({ job, onEdit, onStageChange, onDelete, compact = false }) {
  const [menu, setMenu] = useState(false);
  return <div className={`application-card ${compact ? 'compact' : ''}`} draggable={!compact} onDragStart={(event) => { event.dataTransfer.setData('text/plain', job.id); event.dataTransfer.effectAllowed = 'move'; }}>
    <div className="application-card-head"><CompanyMark company={job.company} size={42}/><div className="application-card-company"><strong>{job.company}</strong><span>{job.workMode || 'Hybrid'}</span></div>{!compact && <GripVertical className="drag-grip" size={17}/>}</div>
    <button className="application-card-title" type="button" onClick={() => onEdit(job)}>{job.role}</button>
    <div className="application-card-location"><MapPin size={14}/>{job.location || 'Location not specified'}</div>
    {job.interviewDate && job.status === 'Interview' && <div className="card-reminder"><CalendarDays size={14}/> Interview · {prettyDate(job.interviewDate)}</div>}
    {job.followUpDate && job.status !== 'Rejected' && <div className={`card-reminder ${daysUntil(job.followUpDate) <= 1 ? 'urgent' : ''}`}><Clock3 size={14}/> Follow-up · {prettyDate(job.followUpDate)}</div>}
    <div className="application-card-bottom"><span className="card-date">{job.appliedDate ? `Applied ${prettyDate(job.appliedDate)}` : 'Saved for later'}</span><div className="card-menu-wrap"><button className="subtle-icon-button" aria-label={`Options for ${job.company}`} title="Application options" onClick={() => setMenu(!menu)}><MoreHorizontal size={20}/></button>{menu && <div className="card-menu"><button onClick={() => { setMenu(false); onEdit(job); }}>Edit application</button><label>Move to stage<select aria-label="Move to stage" value={job.status} onChange={(e) => { onStageChange(job.id, e.target.value); setMenu(false); }}>{STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select></label><button className="menu-danger" onClick={() => { setMenu(false); onDelete(job); }}>Delete application</button></div>}</div></div>
  </div>;
}

function Dashboard({ jobs, onAdd, setView, onEdit, onStageChange, onDelete, demo }) {
  const counts = Object.fromEntries(STAGES.map(s => [s.id, jobs.filter(j => j.status === s.id).length]));
  const active = jobs.filter(j => !['Rejected', 'Offer', 'Wishlist'].includes(j.status)).length;
  const upcoming = jobs.filter(j => (j.interviewDate && j.status === 'Interview' && daysUntil(j.interviewDate) >= 0) || (j.followUpDate && j.status !== 'Rejected' && daysUntil(j.followUpDate) >= 0)).sort((a, b) => (a.interviewDate || a.followUpDate).localeCompare(b.interviewDate || b.followUpDate));
  const maxCount = Math.max(1, ...Object.values(counts));
  const recent = [...jobs].sort((a, b) => (b.appliedDate || b.createdAt || '').localeCompare(a.appliedDate || a.createdAt || '')).slice(0, 5);
  return <>
    {demo && <div className="demo-banner"><div className="demo-banner-icon"><Sparkles size={18}/></div><span><strong>You're exploring the demo workspace.</strong> These are sample applications. You can add your own or clear the sample data in Insights.</span><button onClick={() => setView('insights')}>Manage data <ArrowRight size={15}/></button></div>}
    <div className="welcome-strip"><div><span className="welcome-spark"><Sparkles size={18}/> YOUR JOURNEY, IN MOTION</span><h2>Keep the momentum going <span>✳</span></h2><p>Manage your applications, stay ahead of interviews, and celebrate every little win.</p><button className="btn btn-banner" onClick={onAdd}><Plus size={17}/> New application <ArrowRight size={16}/></button></div><div className="welcome-art" aria-hidden="true"><span className="orb orb-one"/><span className="orb orb-two"/><span className="orb orb-three"/><div className="art-ticket"><div className="art-ticket-top"><span>YOUR NEXT CHAPTER</span><span>✦</span></div><div className="art-big-check"><Check size={38}/></div><div className="art-ticket-footer"><span>Dream big.<br/>Apply bold.</span><span className="art-tag">#YOUVEGOTTHIS</span></div></div></div></div>
    <div className="section-header"><div><span className="eyebrow">AT A GLANCE</span><h3>Your overview</h3></div><span className="section-muted">Your applications, simplified</span></div>
    <div className="stats-grid"><StatCard label="Total opportunities" value={jobs.length} detail="View all applications" Icon={BriefcaseBusiness} onClick={() => setView('applications')} variant="purple" decorative="ALL TIME"/><StatCard label="In progress" value={active} detail="See pipeline" Icon={TrendingUp} onClick={() => setView('pipeline')} variant="blue"/><StatCard label="Interviews" value={counts.Interview} detail="Check your schedule" Icon={CalendarDays} onClick={() => setView('interviews')} variant="orange"/><StatCard label="Offers received" value={counts.Offer} detail="Celebrate the wins" Icon={CircleCheckBig} onClick={() => setView('applications')} variant="green"/></div>
    <div className="dashboard-bottom"><section className="panel pipeline-overview"><div className="panel-head"><div><div className="eyebrow">YOUR PROGRESS</div><h3>Pipeline snapshot</h3></div><button className="text-link" onClick={() => setView('pipeline')}>View board <ArrowUpRight size={16}/></button></div><p className="panel-subtitle">Where your opportunities stand right now.</p><div className="snapshot-list">{STAGES.map(s => <button className="snapshot-row" key={s.id} onClick={() => setView('pipeline')}><div className="snapshot-label"><span className="stage-dot" style={{ background: s.color }}/><span>{s.label}</span></div><div className="snapshot-track"><div style={{ width: `${(counts[s.id] / maxCount) * 100}%`, background: s.color }}/></div><strong>{counts[s.id]}</strong></button>)}</div><div className="snapshot-footer"><div className="tiny-avatars"><span>A</span><span>F</span><span>✓</span></div><span>Your career is a work in progress. Keep showing up.</span></div></section>
    <section className="panel upcoming-panel"><div className="panel-head"><div><div className="eyebrow">ON YOUR RADAR</div><h3>Coming up next</h3></div><button className="text-link" onClick={() => setView('interviews')}>View all <ArrowUpRight size={16}/></button></div><p className="panel-subtitle">Upcoming interviews and follow-ups.</p>{upcoming.length ? <div className="next-list">{upcoming.slice(0, 4).map(job => { const interview = job.interviewDate && job.status === 'Interview' && daysUntil(job.interviewDate) >= 0; const date = interview ? job.interviewDate : job.followUpDate; return <button key={job.id} className="next-item" onClick={() => onEdit(job)}><span className={`next-icon ${interview ? 'interview' : 'followup'}`}>{interview ? <CalendarDays size={18}/> : <Bell size={18}/>}</span><span className="next-copy"><strong>{interview ? 'Interview' : 'Follow-up'} · {job.company}</strong><small>{job.role}</small></span><span className="next-date">{dueLabel(date)}</span></button>; })}</div> : <EmptyState title="You're all caught up!" detail="No upcoming interviews or follow-ups." Icon={CircleCheckBig}/>}<button className="upcoming-foot" onClick={() => setView('interviews')}>Keep your schedule on track <ArrowRight size={16}/></button></section></div>
    <section className="panel recent-panel"><div className="panel-head"><div><div className="eyebrow">LATEST ACTIVITY</div><h3>Recent opportunities</h3></div><button className="text-link" onClick={() => setView('applications')}>See all <ArrowUpRight size={16}/></button></div>{recent.length ? <div className="recent-rows">{recent.map(job => <button className="recent-row" key={job.id} onClick={() => onEdit(job)}><CompanyMark company={job.company} size={42}/><span className="recent-role"><strong>{job.role}</strong><small>{job.company} · {job.location || 'Location not set'}</small></span><StagePill stage={job.status} small/><span className="recent-date">{job.appliedDate ? prettyDate(job.appliedDate) : 'Not applied'}</span><ArrowUpRight size={16} className="recent-chevron"/></button>)}</div> : <EmptyState action="Add an opportunity" onAction={onAdd}/>}</section>
  </>;
}

function Pipeline({ jobs, onAdd, onEdit, onStageChange, onDelete, search }) {
  const [overStage, setOverStage] = useState('');
  const filtered = jobs.filter(job => `${job.company} ${job.role} ${job.location}`.toLowerCase().includes(search.toLowerCase()));
  return <><div className="content-toolbar"><div className="toolbar-meta"><span className="toolbar-icon"><FolderKanban size={18}/></span><span><strong>{filtered.length} opportunities</strong><small>Tip: drag cards to update their stage</small></span></div><button className="btn btn-primary" onClick={onAdd}><Plus size={17}/> Add application</button></div>
  <div className="kanban-board">{STAGES.map(stage => { const stageJobs = filtered.filter(j => j.status === stage.id); return <div className={`kanban-column ${overStage === stage.id ? 'drop-active' : ''}`} key={stage.id} onDragOver={event => { event.preventDefault(); setOverStage(stage.id); }} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOverStage(''); }} onDrop={(event) => { event.preventDefault(); const id = event.dataTransfer.getData('text/plain'); if (id && jobs.some(j => j.id === id)) onStageChange(id, stage.id); setOverStage(''); }}><div className="kanban-head"><span className="kanban-head-dot" style={{ background: stage.color }}/><h3>{stage.label}</h3><span className="kanban-count">{stageJobs.length}</span><button onClick={onAdd} aria-label={`Add to ${stage.label}`}><Plus size={17}/></button></div><div className="kanban-list">{stageJobs.map(job => <ApplicationCard key={job.id} job={job} onEdit={onEdit} onStageChange={onStageChange} onDelete={onDelete}/>)}{stageJobs.length === 0 && <div className="kanban-placeholder">Drop an application here<br/><small>or add a new opportunity</small></div>}</div></div>; })}</div><div className="board-hint"><GripVertical size={15}/> On mobile, use the <MoreHorizontal size={16}/> menu on a card to change its stage.</div></>;
}

function Applications({ jobs, onAdd, onEdit, onDelete, onStageChange, search }) {
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState('newest');
  const list = jobs.filter(job => (filter === 'All' || job.status === filter) && `${job.company} ${job.role} ${job.location}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => { const dateA = a.appliedDate || a.createdAt || ''; const dateB = b.appliedDate || b.createdAt || ''; if (sort === 'oldest') return dateA.localeCompare(dateB); if (sort === 'company') return a.company.localeCompare(b.company); return dateB.localeCompare(dateA); });
  return <><div className="content-toolbar"><div className="filter-chips"><button className={`filter-chip ${filter === 'All' ? 'selected' : ''}`} onClick={() => setFilter('All')}>All <span>{jobs.length}</span></button>{STAGES.map(s => <button key={s.id} className={`filter-chip ${filter === s.id ? 'selected' : ''}`} onClick={() => setFilter(s.id)}>{s.label}</button>)}</div><button className="btn btn-primary" onClick={onAdd}><Plus size={17}/> Add application</button></div>
  <section className="panel table-panel"><div className="table-toolbar"><span><ListFilter size={17}/> Showing <strong>{list.length}</strong> opportunities</span><label>Sort by <select value={sort} onChange={e => setSort(e.target.value)}><option value="newest">Most recent</option><option value="oldest">Oldest first</option><option value="company">Company A–Z</option></select></label></div>{list.length ? <div className="table-scroll"><table className="jobs-table"><thead><tr><th>COMPANY & ROLE</th><th>LOCATION</th><th>STAGE</th><th>DATE APPLIED</th><th>ACTIONS</th></tr></thead><tbody>{list.map(job => <tr key={job.id}><td><button className="table-company" onClick={() => onEdit(job)}><CompanyMark company={job.company} size={42}/><span><strong>{job.role}</strong><small>{job.company}</small></span></button></td><td><span className="table-location"><MapPin size={14}/>{job.location || 'Not specified'}</span></td><td><StagePill stage={job.status} small/></td><td className="table-date">{job.appliedDate ? prettyDate(job.appliedDate, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td><td><div className="table-actions"><button className="icon-button" title="Edit application" aria-label={`Edit ${job.company}`} onClick={() => onEdit(job)}><Settings2 size={17}/></button><button className="icon-button danger-hover" title="Delete application" aria-label={`Delete ${job.company}`} onClick={() => onDelete(job)}><Trash2 size={17}/></button><label className="visually-hidden" htmlFor={`stage-${job.id}`}>Stage</label><select id={`stage-${job.id}`} aria-label={`Change ${job.company} stage`} className="table-stage-select" value={job.status} onChange={(e) => onStageChange(job.id, e.target.value)}>{STAGES.map(s => <option value={s.id} key={s.id}>{s.label}</option>)}</select></div></td></tr>)}</tbody></table></div> : <EmptyState title="No matching applications" detail="Try adjusting your search or stage filter." action="Add an application" onAction={onAdd}/>}</section>
  </>;
}

function Interviews({ jobs, onAdd, onEdit, onFollowUpDone }) {
  const interviews = jobs.filter(j => j.interviewDate && j.status === 'Interview').sort((a, b) => a.interviewDate.localeCompare(b.interviewDate));
  const followUps = jobs.filter(j => j.followUpDate && j.status !== 'Rejected').sort((a, b) => a.followUpDate.localeCompare(b.followUpDate));
  const upcomingInterviews = interviews.filter(j => daysUntil(j.interviewDate) >= 0);
  const upcomingFollowUps = followUps.filter(j => daysUntil(j.followUpDate) >= -30);
  return <><div className="content-toolbar"><div className="toolbar-meta"><span className="toolbar-icon"><CalendarDays size={18}/></span><span><strong>{upcomingInterviews.length} upcoming interviews</strong><small>You've got this. Stay prepared.</small></span></div><button className="btn btn-primary" onClick={onAdd}><Plus size={17}/> Add application</button></div><div className="schedule-grid"><section className="panel schedule-panel"><div className="panel-head"><div><div className="eyebrow">ON THE CALENDAR</div><h3>Interviews</h3></div><span className="panel-count">{upcomingInterviews.length} upcoming</span></div><p className="panel-subtitle">Your next chance to make an impression.</p>{interviews.length ? <div className="schedule-items">{interviews.map(job => <button className="schedule-item" key={job.id} onClick={() => onEdit(job)}><span className="date-tile"><strong>{asLocalDate(job.interviewDate)?.getDate()}</strong><small>{prettyDate(job.interviewDate, { month: 'short' })}</small></span><span className="schedule-copy"><strong>{job.role}</strong><small>{job.company} · {job.location || 'Location TBD'}</small><span className={daysUntil(job.interviewDate) < 0 ? 'date-past' : 'date-upcoming'}>{daysUntil(job.interviewDate) < 0 ? 'Past interview' : dueLabel(job.interviewDate)}</span></span><ChevronRight size={18}/></button>)}</div> : <EmptyState title="No interviews scheduled" detail="Add an interview date to any application and it will appear here." Icon={CalendarDays}/>}</section><section className="panel schedule-panel"><div className="panel-head"><div><div className="eyebrow">DON'T FORGET</div><h3>Follow-up reminders</h3></div><span className="panel-count">{upcomingFollowUps.length} to do</span></div><p className="panel-subtitle">A thoughtful follow-up can go a long way.</p>{followUps.length ? <div className="schedule-items">{followUps.map(job => <div className="follow-item" key={job.id}><span className="follow-icon"><Bell size={18}/></span><button className="follow-copy" onClick={() => onEdit(job)}><strong>{job.company}</strong><small>{job.role}</small><span className={daysUntil(job.followUpDate) <= 1 ? 'date-past' : 'date-upcoming'}>{dueLabel(job.followUpDate)} · {prettyDate(job.followUpDate)}</span></button><button className="done-btn" onClick={() => onFollowUpDone(job.id)} title="Mark follow-up complete" aria-label={`Mark ${job.company} follow-up complete`}><Check size={19}/></button></div>)}</div> : <EmptyState title="All follow-ups complete" detail="You have no follow-up reminders right now." Icon={CheckCheck}/>}</section></div><div className="schedule-note"><Sparkles size={20}/><div><strong>Pro tip: be ready before the interview.</strong><p>Research the company, prepare two or three questions, and practice explaining the projects you're proud of.</p></div></div></>;
}

function Insights({ jobs, demo, onReset, onClear, onExport }) {
  const count = (status) => jobs.filter(j => j.status === status).length;
  const applied = jobs.filter(j => j.appliedDate && j.status !== 'Wishlist').length;
  const interviews = count('Interview') + count('Offer');
  const responseRate = applied ? Math.round((interviews / applied) * 100) : 0;
  const active = jobs.filter(j => !['Rejected', 'Offer', 'Wishlist'].includes(j.status)).length;
  const last7 = Array.from({ length: 7 }, (_, i) => { const date = new Date(); date.setDate(date.getDate() - (6 - i)); const key = localISO(date); return { date: key, label: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date), count: jobs.filter(j => j.appliedDate === key).length }; });
  const maxWeek = Math.max(1, ...last7.map(d => d.count));
  return <><div className="insight-intro"><span className="insight-intro-icon"><Target size={28}/></span><div><strong>You're making progress.</strong><p>Every application is a step forward, even when the outcome isn't what you hoped for.</p></div><Sparkles className="insight-intro-spark" size={32}/></div><div className="insight-kpis"><div><span>APPLICATIONS SENT</span><strong>{applied}</strong><small>Excluding saved opportunities</small></div><div><span>ACTIVE PIPELINE</span><strong>{active}</strong><small>Applied or interviewing</small></div><div><span>INTERVIEW / OFFER RATE</span><strong>{responseRate}%</strong><small>Of sent applications, by current stage</small></div><div><span>OFFERS</span><strong>{count('Offer')}</strong><small>Every win counts</small></div></div>
  <div className="insights-grid"><section className="panel insights-chart"><div className="panel-head"><div><div className="eyebrow">LAST 7 DAYS</div><h3>Application activity</h3></div><Activity size={20} className="muted-icon"/></div><p className="panel-subtitle">Applications submitted each day.</p><div className="weekly-chart">{last7.map((day, i) => <div className="weekly-col" key={day.date}><span className="weekly-number">{day.count || ''}</span><div className="weekly-bar-track"><div className={`weekly-bar ${i === 6 ? 'current' : ''}`} style={{ height: `${Math.max(day.count ? 15 : 3, day.count / maxWeek * 100)}%` }}/></div><span>{day.label}</span></div>)}</div></section><section className="panel insights-chart"><div className="panel-head"><div><div className="eyebrow">YOUR JOURNEY</div><h3>Stage breakdown</h3></div><ChartNoAxesCombined size={20} className="muted-icon"/></div><p className="panel-subtitle">How your opportunities are distributed.</p><div className="insight-stage-list">{STAGES.map(s => <div className="insight-stage" key={s.id}><div className="insight-stage-label"><span className="stage-dot" style={{ background: s.color }}/>{s.label}<strong>{count(s.id)}</strong></div><div className="insight-stage-bar"><div style={{ width: `${jobs.length ? count(s.id) / jobs.length * 100 : 0}%`, background: s.color }}/></div></div>)}</div></section></div>
  <section className="panel data-panel"><div className="panel-head"><div><div className="eyebrow">YOUR DATA, YOUR CONTROL</div><h3>Workspace settings</h3></div><ShieldCheck size={20} className="muted-icon"/></div><p className="panel-subtitle">Everything is saved in this browser. No account or backend is required.</p><div className="setting-row"><span className="setting-icon"><FileSpreadsheet size={22}/></span><span><strong>Export applications</strong><small>Download your applications as a CSV spreadsheet.</small></span><button className="btn btn-outline" onClick={onExport}><CloudDownload size={17}/> Export CSV</button></div><div className="setting-row"><span className="setting-icon"><RotateCcw size={22}/></span><span><strong>Reset to sample workspace</strong><small>Replace your current list with example data.</small></span><button className="btn btn-outline" onClick={onReset}><RotateCcw size={17}/> Reset demo</button></div><div className="setting-row"><span className="setting-icon danger"><Trash2 size={22}/></span><span><strong>Clear all applications</strong><small>Remove saved entries from this browser. This cannot be undone.</small></span><button className="btn btn-danger-outline" onClick={onClear}><Trash2 size={17}/> Clear all</button></div><div className="privacy-note"><ShieldCheck size={16}/>{demo ? 'Demo records are fictional examples, not real applications.' : 'Your applications remain on this device until you clear browser storage.'} No information is sent to a server.</div></section></>;
}

function App() {
  const [jobs, setJobs] = useState(readJobs);
  const [demo, setDemo] = useState(() => { try { return localStorage.getItem(STORAGE_DEMO) !== 'false'; } catch { return true; } });
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem(STORAGE_THEME) === 'dark' ? 'dark' : 'light'; } catch { return 'light'; } });
  const [view, setView] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => { try { localStorage.setItem(STORAGE_JOBS, JSON.stringify(jobs)); } catch (error) { console.warn('Unable to save applications:', error); } }, [jobs]);
  useEffect(() => { try { localStorage.setItem(STORAGE_THEME, theme); localStorage.setItem(STORAGE_DEMO, String(demo)); } catch { /* Ignore storage errors */ } document.documentElement.setAttribute('data-theme', theme); }, [theme, demo]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 3500); return () => clearTimeout(t); }, [toast]);
  const notifCount = useMemo(() => jobs.filter(j => (j.status === 'Interview' && j.interviewDate && daysUntil(j.interviewDate) >= 0 && daysUntil(j.interviewDate) <= 3) || (j.followUpDate && j.status !== 'Rejected' && daysUntil(j.followUpDate) <= 1)).length, [jobs]);

  const saveJob = (job) => { const existed = jobs.some(j => j.id === job.id); setJobs(prev => existed ? prev.map(j => j.id === job.id ? job : j) : [job, ...prev]); setModal(null); setToast(existed ? 'Application updated successfully' : 'New opportunity added!'); };
  const setStage = (id, stage) => { if (!STAGE_IDS.includes(stage)) return; setJobs(prev => prev.map(j => j.id === id ? { ...j, status: stage } : j)); setToast(`Moved to ${STAGES.find(s => s.id === stage)?.label}`); };
  const deleteJob = (job) => { if (!window.confirm(`Delete ${job.role} at ${job.company}? This cannot be undone.`)) return; setJobs(prev => prev.filter(j => j.id !== job.id)); setToast('Application deleted'); };
  const clear = () => { if (!window.confirm('Clear ALL applications in this browser? This cannot be undone. Export a CSV first if you need a backup.')) return; setJobs([]); setDemo(false); setToast('Workspace cleared. Fresh start!'); };
  const reset = () => { if (!window.confirm('Replace ALL current applications with sample data? Export a CSV first if you need your existing entries.')) return; setJobs(sampleApplications()); setDemo(true); setToast('Demo workspace restored'); };
  const doneFollowUp = (id) => { setJobs(prev => prev.map(j => j.id === id ? { ...j, followUpDate: '' } : j)); setToast('Follow-up marked complete'); };
  const viewData = pageInfo[view];
  const searchEnabled = ['pipeline', 'applications'].includes(view);

  return <div className="app-shell">
    <Sidebar view={view} setView={setView} total={jobs.length} theme={theme} setTheme={setTheme} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}/>
    <main className="main-area">
      <header className="topbar"><button className="icon-button hamburger" aria-label="Open menu" onClick={() => setMobileOpen(true)}><Menu size={22}/></button><div className="breadcrumbs"><span>Workspace</span><ChevronRight size={15}/><strong>{navigation.find(n => n.id === view)?.title}</strong></div><div className="topbar-right"><div className="topbar-date"><CalendarDays size={16}/><span>{new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date())}</span></div><button className="topbar-notification" title="View upcoming reminders" aria-label={`View reminders: ${notifCount}`} onClick={() => setView('interviews')}><Bell size={19}/>{notifCount > 0 && <span className="notification-dot"/>}</button><span className="topbar-divider"/><span className="header-avatar">AF</span></div></header>
      <div className="page-content"><div className="page-heading"><div><span className="eyebrow">{viewData.eyebrow}</span><h1>{viewData.title}</h1><p>{viewData.subtitle}</p></div><div className="page-heading-actions">{searchEnabled && <label className="header-search"><Search size={18}/><input aria-label="Search opportunities" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search opportunities..."/>{search && <button onClick={() => setSearch('')} aria-label="Clear search"><X size={15}/></button>}</label>}{view !== 'dashboard' && view !== 'pipeline' && view !== 'applications' && <button className="btn btn-primary desktop-add" onClick={() => setModal({ type: 'create' })}><Plus size={17}/> New application</button>}</div></div>
      {view === 'dashboard' && <Dashboard jobs={jobs} demo={demo} onAdd={() => setModal({ type: 'create' })} onEdit={j => setModal({ type: 'edit', job: j })} setView={setView} onStageChange={setStage} onDelete={deleteJob}/>}
      {view === 'pipeline' && <Pipeline jobs={jobs} search={search} onAdd={() => setModal({ type: 'create' })} onEdit={j => setModal({ type: 'edit', job: j })} onDelete={deleteJob} onStageChange={setStage}/>}
      {view === 'applications' && <Applications jobs={jobs} search={search} onAdd={() => setModal({ type: 'create' })} onEdit={j => setModal({ type: 'edit', job: j })} onDelete={deleteJob} onStageChange={setStage}/>}
      {view === 'interviews' && <Interviews jobs={jobs} onAdd={() => setModal({ type: 'create' })} onEdit={j => setModal({ type: 'edit', job: j })} onFollowUpDone={doneFollowUp}/>}
      {view === 'insights' && <Insights jobs={jobs} demo={demo} onExport={() => { saveCSV(jobs); setToast('CSV downloaded'); }} onClear={clear} onReset={reset}/>}
      <footer className="page-footer"><span>© {new Date().getFullYear()} ApplyFlow · Made for your next chapter.</span><span><Heart size={13}/> Your progress matters.</span></footer></div>
    </main>
    {modal && <ApplicationForm initial={modal.type === 'edit' ? modal.job : null} onClose={() => setModal(null)} onSave={saveJob}/>}
    {toast && <div role="status" className="toast"><CircleCheckBig size={19}/>{toast}<button aria-label="Dismiss notification" onClick={() => setToast('')}><X size={15}/></button></div>}
    <button className="floating-add" title="Add application" aria-label="Add application" onClick={() => setModal({ type: 'create' })}><Plus size={24}/></button>
  </div>;
}

export default App;
