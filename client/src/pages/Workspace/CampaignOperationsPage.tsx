import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { Activity, FlaskConical, Globe2, HeartPulse, MousePointer2, Radio, ShieldCheck, Users } from 'lucide-react';
import { PageHeader } from '../../components/workspace/PageHeader/PageHeader';
import './CampaignOperationsPage.css';

gsap.registerPlugin(useGSAP);
const views = [
  { id: 'analytics', label: 'Campaign analytics', icon: Activity, title: 'Traffic, decoded', text: 'Theo dõi click, người dùng duy nhất, kênh và destination link của campaign.', cards: [['12.4k', 'Total clicks'], ['8.1k', 'Unique visitors'], ['4.2%', 'Conversion rate']] },
  { id: 'tracking', label: 'UTM & tracking', icon: MousePointer2, title: 'Một chuẩn tracking cho mọi kênh', text: 'Tạo UTM preset, giữ naming thống nhất và kiểm tra URL trước khi phát hành.', cards: [['social-paid', 'Source'], ['summer-26', 'Campaign'], ['Ready', 'URL status']] },
  { id: 'health', label: 'Link health', icon: HeartPulse, title: 'Biết trước khi traffic gặp lỗi', text: 'Xem response time, HTTP status và lịch sử kiểm tra của từng destination.', cards: [['99.98%', 'Availability'], ['182ms', 'Median response'], ['0', 'Critical links']] },
  { id: 'experiment', label: 'A/B testing', icon: FlaskConical, title: 'Chọn variant bằng dữ liệu', text: 'Phân bổ traffic, theo dõi conversion và publish biến thể chiến thắng.', cards: [['2', 'Active variants'], ['50 / 50', 'Traffic split'], ['+14%', 'Leading uplift']] },
  { id: 'events', label: 'Conversion events', icon: Radio, title: 'Tín hiệu sau click', text: 'Gắn pixel và định nghĩa event cho page view, button click, submit hoặc purchase.', cards: [['3', 'Live pixels'], ['7', 'Tracked events'], ['Healthy', 'Delivery']] },
  { id: 'workspace', label: 'Team & domain', icon: Users, title: 'Vận hành trên domain của bạn', text: 'Quản lý domain, SSL, roles và audit log trong một workspace.', cards: [['opti.link', 'Primary domain'], ['4', 'Members'], ['Protected', 'Workspace']] },
] as const;

export function CampaignOperationsPage() {
  const root = useRef<HTMLDivElement>(null); const [active, setActive] = useState('analytics'); const view = views.find((item) => item.id === active) ?? views[0]; const Icon = view.icon;
  useGSAP(() => { if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; gsap.from('[data-ops-enter]', { opacity: 0, y: 8, filter: 'blur(3px)', duration: .22, stagger: .04, ease: 'power2.out' }); }, { scope: root, dependencies: [active], revertOnUpdate: true });
  return <div ref={root} className="ops-page"><PageHeader title="Campaign operations" /><div className="ops-shell"><nav className="ops-nav" aria-label="Campaign operations">{views.map(({ id, label, icon: ItemIcon }) => <button key={id} onClick={() => setActive(id)} className={active === id ? 'is-active' : ''}><ItemIcon size={17}/>{label}</button>)}</nav><main className="ops-main"><header data-ops-enter className="ops-heading"><span className="ops-icon"><Icon size={22}/></span><div><h2>{view.title}</h2><p>{view.text}</p></div></header><section data-ops-enter className="ops-stats">{view.cards.map(([value,label]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</section><section data-ops-enter className="ops-workspace"><div className="ops-workspace-head"><div><span>WORKING VIEW</span><h3>{view.label}</h3></div><button><Globe2 size={16}/> Configure</button></div><div className="ops-lines"><div><span><ShieldCheck size={16}/> Data source connected</span><small>Updated just now</small></div><div><span><MousePointer2 size={16}/> Primary action ready</span><small>Workspace policy applied</small></div><div><span><Activity size={16}/> No action required</span><small>Last checked 2 minutes ago</small></div></div></section></main></div></div>;
}
