import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../src/contexts/AuthContext';
import BuilderRoute from '../src/pages/Builder/BuilderRoute';
import { ProfilePage } from '../src/pages/Workspace/ProfilePage';
import '../src/index.css';

// Local visual fixture only; never included in the production route graph.
if (import.meta.env.DEV) {
  const params = new URLSearchParams(location.search);
  createRoot(document.getElementById('root')!).render(
    params.has('mobile') ? <iframe title="Mobile preview" width="390" height="844" style={{ border: 0 }} src={`/qa/bio-profile.html?${params.has('profile') ? 'profile' : ''}`} /> :
      <BrowserRouter><AuthProvider>{params.has('profile') ? <div style={{ padding: 24 }}><ProfilePage /></div> : <BuilderRoute />}</AuthProvider></BrowserRouter>
  );
}
