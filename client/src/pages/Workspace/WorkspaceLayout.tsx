import { Outlet } from 'react-router-dom';
import { Sidebar } from '../../components/workspace/Sidebar';
import './workspace.css';

export function WorkspaceLayout() {
  return (
    <div className="workspace-shell">
      <Sidebar />
      <main className="workspace-main">
        <Outlet />
      </main>
    </div>
  );
}
