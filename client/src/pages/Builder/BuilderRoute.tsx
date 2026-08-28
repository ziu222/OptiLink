import { ThemeProvider } from '../../contexts/ThemeContext';
import { BuilderPage } from './BuilderPage';

/**
 * Lazy entry point for the bio builder. Kept as a separate module so the
 * builder's dependency graph is only evaluated when the /builder route is
 * visited (it currently throws at import time — see plan notes).
 */
export default function BuilderRoute() {
  return (
    <ThemeProvider>
      <BuilderPage />
    </ThemeProvider>
  );
}
