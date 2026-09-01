import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/workspace/PageHeader/PageHeader';
import './workspace.css';

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <>
      <PageHeader title="Setting" />
      <section className="workspace-placeholder">
        <p>This section is under construction.</p>

        <div className="workspace-account">
          <div className="workspace-account-row">
            <span>Email:</span>
            <strong>{user?.email}</strong>
          </div>
          <div className="workspace-account-row">
            <span>Role:</span>
            <strong>{user?.role}</strong>
          </div>
          <div className="workspace-account-row">
            <span>Tier:</span>
            <strong>{user?.tier}</strong>
          </div>
        </div>
      </section>
    </>
  );
}
