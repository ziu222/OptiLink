import { useState } from 'react';
import { PageHeader } from '../../components/workspace/PageHeader/PageHeader';
import { ContentPanel } from '../../components/workspace/panels/ContentPanel/ContentPanel';
import { InfoRow, Cell, Main, Sub } from '../../components/workspace/InfoRow/InfoRow';
import { Field } from '../../components/workspace/Field/Field';
import { OptionTabs } from '../../components/workspace/OptionTabs/OptionTabs';
import { getTheme, setTheme } from '../../lib/theme';
import './SettingsPage.css';

type SectionId = 'general';

const SECTIONS: { id: SectionId; label: string; description: string }[] = [
  { id: 'general', label: 'Chung', description: 'Giao diện' },
];

const THEME_TABS: { id: 'light' | 'dark'; label: string }[] = [
  { id: 'light', label: 'Sáng' },
  { id: 'dark', label: 'Tối' },
];

export function SettingsPage() {
  const [active, setActive] = useState<SectionId>('general');
  const [theme, setThemeState] = useState(getTheme());

  return (
    <>
      <PageHeader title="Cài đặt" />
      <section className="settings-page">
        <ContentPanel title="Cấu hình cài đặt">
          <div className="settings-layout">
            <nav className="settings-nav" aria-label="Các mục cài đặt">
              {SECTIONS.map((section) => (
                <InfoRow
                  key={section.id}
                  columns={1}
                  selected={active === section.id}
                  onSelect={() => setActive(section.id)}
                  ariaLabel={section.label}
                >
                  <Cell>
                    <Main>{section.label}</Main>
                    <Sub>{section.description}</Sub>
                  </Cell>
                </InfoRow>
              ))}
            </nav>

            <div className="settings-detail">
              {active === 'general' && (
                <>
                  <Field label="Chủ đề">
                    <OptionTabs
                      items={THEME_TABS}
                      value={theme}
                      ariaLabel="Chủ đề"
                      onChange={(id) => {
                        setTheme(id);
                        setThemeState(id);
                      }}
                    />
                  </Field>
                </>
              )}
            </div>
          </div>
        </ContentPanel>
      </section>
    </>
  );
}
