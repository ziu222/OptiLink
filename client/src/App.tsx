import { LoadingCircle } from './components/workspace/LoadingCircle/LoadingCircle';
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
import { QRCodePage } from './pages/Workspace/QRCodePage';

const BuilderRoute = lazy(() => import('./pages/Builder/BuilderRoute'));
const MagicTreeExperience = lazy(() => import('./components/MagicTreeWebGPU/MagicTreeWebGPUContainer').then(m => ({ default: m.MagicTreeWebGPUContainer })));
const MagicTreeWebGPUPage = lazy(() =>
  import('./pages/Workspace/MagicTreeWebGPUPage').then((m) => ({
    default: m.MagicTreeWebGPUPage,
  }))
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/s/:slug" element={<LinkGatePage />} />
          <Route path="/magic-tree" element={<RouteErrorBoundary><Suspense fallback={<p className="route-status">Đang gieo mầm…</p>}><MagicTreeExperience /></Suspense></RouteErrorBoundary>} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<WorkspaceLayout />}>
              <Route index element={<ShortenLinkPage />} />
              <Route path="qr" element={<QRCodePage />} />
              <Route
                path="magic-tree"
                element={
                  <Navigate to="/dashboard/magic-tree-webgpu" replace />
                }
              />
              <Route
                path="magic-tree-webgpu"
                element={
                  <RouteErrorBoundary>
                    <Suspense fallback={<LoadingCircle label="Đang tải trang…" />}>
                      <MagicTreeWebGPUPage />
                    </Suspense>
                  </RouteErrorBoundary>
                }
              />
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
                  <Suspense fallback={<LoadingCircle label="Đang tải Bio Page…" />}>
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
