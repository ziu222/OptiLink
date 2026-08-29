import './buildersidebar.css';

const iconProps = {
  width: 20,
  height: 20,
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 2,
};

const tabs = [
  {
    id: 'tab-links',
    label: 'Links & Blocks',
    icon: (
      <svg {...iconProps}>
        <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
  },
  {
    id: 'tab-design',
    label: 'Design',
    icon: (
      <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    id: 'tab-analytics',
    label: 'Analytics',
    icon: (
      <svg {...iconProps}>
        <path strokeLinecap="round" d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
  },
];

interface BuilderSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function BuilderSidebar({ activeTab, setActiveTab }: BuilderSidebarProps) {
  return (
    <aside className="builder-sidebar">
      <p className="builder-sidebar-title">Bio Page</p>
      <nav className="builder-sidebar-nav">
        {tabs.map(({ id, label, icon }) => (
          <button
            key={id}
            type="button"
            className={`builder-sidebar-link${activeTab === id ? ' is-active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            {icon}
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
