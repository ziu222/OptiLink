import { useState } from 'react';
import { PageHeader } from '../../components/workspace/PageHeader/PageHeader';
import { ContentPanel } from '../../components/workspace/panels/ContentPanel/ContentPanel';
import { InfoRow, Cell, Main, Sub } from '../../components/workspace/InfoRow/InfoRow';
import { Field } from '../../components/workspace/Field/Field';
import { OptionTabs } from '../../components/workspace/OptionTabs/OptionTabs';
import { getTheme, setTheme } from '../../lib/theme';
import { getLang, setLang } from '../../lib/lang';
import type { Lang } from '../../lib/lang';
import './SettingsPage.css';

type SectionId = 'general';

const SECTIONS: { id: SectionId; label: string; description: string }[] = [
  { id: 'general', label: 'General', description: 'Appearance and language' },
];

const THEME_TABS: { id: 'light' | 'dark'; label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

const LANG_TABS: { id: Lang; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'vi', label: 'Tiếng Việt' },
];

export function SettingsPage() {
  const [active, setActive] = useState<SectionId>('general');
  const [theme, setThemeState] = useState(getTheme());
  const [lang, setLangState] = useState(getLang());

  return (
    <>
      <PageHeader title="Settings" />
      <section className="settings-page">
        <ContentPanel title="Settings configuration">
          <div className="settings-layout">
            <nav className="settings-nav" aria-label="Settings sections">
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
                  <Field label="Theme">
                    <OptionTabs
                      items={THEME_TABS}
                      value={theme}
                      ariaLabel="Theme"
                      onChange={(id) => {
                        setTheme(id);
                        setThemeState(id);
                      }}
                    />
                  </Field>

                  <Field label="Language">
                    <OptionTabs
                      items={LANG_TABS}
                      value={lang}
                      ariaLabel="Language"
                      onChange={(id) => {
                        setLang(id);
                        setLangState(id);
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
