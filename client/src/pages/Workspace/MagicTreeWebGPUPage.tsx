import { PageHeader } from '../../components/workspace/PageHeader/PageHeader';
import { ContentPanel } from '../../components/workspace/panels/ContentPanel/ContentPanel';
import { MagicTreeWebGPUContainer } from '../../components/MagicTreeWebGPU/MagicTreeWebGPUContainer';
import './workspace.css';

export function MagicTreeWebGPUPage() {
  return (
    <>
      <PageHeader title="Magic Tree WebGPU" />
      <ContentPanel className="magic-tree-panel">
        <MagicTreeWebGPUContainer />
      </ContentPanel>
    </>
  );
}
