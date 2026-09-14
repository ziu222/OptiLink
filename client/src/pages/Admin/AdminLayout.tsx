import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../../components/admin/AdminSidebar/AdminSidebar';
import '../Workspace/workspace.css';

export function AdminLayout() {
  return (
    <div className="workspace-shell">
      <AdminSidebar />
      <main className="workspace-main">
        <Outlet />
      </main>
    </div>
  );
}
