import { PageHeader } from '../../components/workspace/PageHeader/PageHeader';
import { ContentPanel } from '../../components/workspace/panels/ContentPanel/ContentPanel';
import { MagicTreeContainer } from '../../components/MagicTreeQR/MagicTreeContainer';
import './workspace.css';

export function MagicTreePage() {
  return (
    <>
      <PageHeader title="Magic Tree QR" />
      <ContentPanel className="magic-tree-panel">
        <MagicTreeContainer />
      </ContentPanel>
    </>
  );
}
