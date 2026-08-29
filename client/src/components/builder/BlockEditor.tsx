import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { IBlock } from '../../types/bio';

// Từng item có thể kéo thả
const SortableBlockItem = ({ block }: { block: IBlock }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="block-item-editor">
      <div className="drag-handle" {...attributes} {...listeners}>
        ☰
      </div>
      <div className="block-info">
        <span className="block-type">{block.type}</span>
        <span className="block-title">{block.content.title || block.content.label || 'Khối không tên'}</span>
      </div>
      <div className="block-actions">
        <button className="btn-edit">Sửa</button>
      </div>
    </div>
  );
};

export const BlockEditor: React.FC = () => {
  const { bioData, setBioData } = useTheme();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!bioData) return null;

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setBioData((prev) => {
        if (!prev) return prev;
        const oldIndex = prev.blocks.findIndex((b) => b.id === active.id);
        const newIndex = prev.blocks.findIndex((b) => b.id === over.id);
        
        const newBlocks = arrayMove(prev.blocks, oldIndex, newIndex);
        // Cập nhật lại thuộc tính order
        const reordered = newBlocks.map((b, idx) => ({ ...b, order: idx }));
        
        return { ...prev, blocks: reordered };
      });
    }
  };

  return (
    <div className="block-editor">
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={bioData.blocks.map(b => b.id)}
          strategy={verticalListSortingStrategy}
        >
          {bioData.blocks.map((block) => (
            <SortableBlockItem key={block.id} block={block} />
          ))}
        </SortableContext>
      </DndContext>
      <button className="btn-add-block">+ Thêm khối mới</button>
    </div>
  );
};
