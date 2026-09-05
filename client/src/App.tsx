import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RouteErrorBoundary } from './routes/RouteErrorBoundary';
import { HomePage } from './pages/Home/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { LinkGatePage } from './pages/LinkGatePage';
import { WorkspaceLayout } from './pages/Workspace/WorkspaceLayout';
import { ShortenLinkPage } from './pages/Workspace/ShortenLinkPage';
import { LinkDetailPage } from './pages/Workspace/LinkDetailPage';
import { AnalyticsPage } from './pages/Workspace/AnalyticsPage';
import { LinkAnalyticsPage } from './pages/Workspace/LinkAnalyticsPage';
import { SettingsPage } from './pages/Workspace/SettingsPage';
import { ProfilePage } from './pages/Workspace/ProfilePage';

const BuilderRoute = lazy(() => import('./pages/Builder/BuilderRoute'));

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/s/:slug" element={<LinkGatePage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<WorkspaceLayout />}>
              <Route index element={<ShortenLinkPage />} />
              <Route path="links/:id" element={<LinkDetailPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="analytics/:id" element={<LinkAnalyticsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            <Route
              path="/builder"
              element={
                <RouteErrorBoundary>
                  <Suspense fallback={<p className="route-status">Loading builder…</p>}>
                    <BuilderRoute />
                  </Suspense>
                </RouteErrorBoundary>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
