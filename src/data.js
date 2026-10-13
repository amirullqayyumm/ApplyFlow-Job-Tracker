import { localISO } from './utils.js';

export const STAGES = [
  { id: 'Wishlist', label: 'Wishlist', color: '#90a2b8', soft: '#edf1f7' },
  { id: 'Applied', label: 'Applied', color: '#665bfa', soft: '#edebff' },
  { id: 'Interview', label: 'Interview', color: '#db942a', soft: '#fff4dc' },
  { id: 'Offer', label: 'Offer', color: '#169973', soft: '#ddf9ec' },
  { id: 'Rejected', label: 'Closed', color: '#d66b83', soft: '#ffeaf0' },
];

export const STAGE_IDS = STAGES.map((s) => s.id);

function daysAgo(n) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - n);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function daysAhead(n) { return daysAgo(-n); }

export const sampleApplications = () => [
  { id: 'demo-1', company: 'Notion', role: 'Frontend Engineer', location: 'Remote', workMode: 'Remote', jobType: 'Full-time', status: 'Interview', appliedDate: daysAgo(12), interviewDate: daysAhead(2), followUpDate: '', salary: 'RM 7,000 – 9,000', url: 'https://www.notion.so/careers', contact: 'Talent acquisition team', notes: 'Prepare portfolio walkthrough and React component architecture.', createdAt: daysAgo(12) },
  { id: 'demo-2', company: 'Linear', role: 'Product Designer', location: 'Remote', workMode: 'Remote', jobType: 'Full-time', status: 'Applied', appliedDate: daysAgo(3), interviewDate: '', followUpDate: daysAhead(3), salary: 'RM 6,000 – 8,000', url: 'https://linear.app/careers', contact: '', notes: 'Highlight dashboard interaction and design systems.', createdAt: daysAgo(3) },
  { id: 'demo-3', company: 'Stripe', role: 'Software Engineer', location: 'Singapore', workMode: 'Hybrid', jobType: 'Full-time', status: 'Applied', appliedDate: daysAgo(8), interviewDate: '', followUpDate: daysAhead(1), salary: '', url: 'https://stripe.com/jobs', contact: '', notes: 'Backend systems and API experience.', createdAt: daysAgo(8) },
  { id: 'demo-4', company: 'Figma', role: 'UI Engineer', location: 'Remote', workMode: 'Remote', jobType: 'Full-time', status: 'Wishlist', appliedDate: '', interviewDate: '', followUpDate: '', salary: '', url: 'https://www.figma.com/careers/', contact: '', notes: 'Research UI engineering opportunities.', createdAt: daysAgo(1) },
  { id: 'demo-5', company: 'Grab', role: 'Frontend Developer', location: 'Kuala Lumpur', workMode: 'Hybrid', jobType: 'Full-time', status: 'Interview', appliedDate: daysAgo(18), interviewDate: daysAhead(5), followUpDate: '', salary: 'RM 6,500 – 8,500', url: 'https://www.grab.careers/', contact: 'Recruiting team', notes: 'Review JavaScript fundamentals and system design basics.', createdAt: daysAgo(18) },
  { id: 'demo-6', company: 'Canva', role: 'Product Engineer', location: 'Remote', workMode: 'Remote', jobType: 'Full-time', status: 'Offer', appliedDate: daysAgo(25), interviewDate: '', followUpDate: daysAhead(4), salary: '', url: 'https://www.lifeatcanva.com/', contact: '', notes: 'Review sample offer and benefits.', createdAt: daysAgo(25) },
  { id: 'demo-7', company: 'AirAsia', role: 'Software Engineer', location: 'Sepang', workMode: 'On-site', jobType: 'Full-time', status: 'Rejected', appliedDate: daysAgo(32), interviewDate: '', followUpDate: '', salary: '', url: '', contact: '', notes: 'Keep in touch for other roles.', createdAt: daysAgo(32) },
  { id: 'demo-8', company: 'Shopee', role: 'Web Developer', location: 'Kuala Lumpur', workMode: 'On-site', jobType: 'Full-time', status: 'Applied', appliedDate: daysAgo(1), interviewDate: '', followUpDate: daysAhead(7), salary: '', url: '', contact: '', notes: 'Check application portal next week.', createdAt: daysAgo(1) },
];

export const blankApplication = () => ({
  company: '', role: '', location: '', workMode: 'Hybrid', jobType: 'Full-time',
  status: 'Applied', appliedDate: localISO(),
  interviewDate: '', followUpDate: '', salary: '', url: '', contact: '', notes: '',
});
