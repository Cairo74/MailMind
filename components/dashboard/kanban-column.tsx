"use client"

import { useSortable, SortableContext } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "./tasks-content";
import KanbanCard from "./kanban-card";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
}

// Um wrapper para tornar o KanbanCard "sortable"
function SortableTaskItem({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanCard task={task} />
    </div>
  );
}

export function KanbanColumn({ id, title, tasks }: KanbanColumnProps) {
  const { setNodeRef } = useSortable({
    id: id,
    data: {
      type: 'COLUMN',
      children: tasks,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className="flex w-full flex-col rounded-lg bg-muted/50 p-4"
    >
      <h3 className="mb-4 text-lg font-semibold tracking-tight">
        {title} ({tasks.length})
      </h3>
      <div className="flex flex-grow flex-col gap-4">
        <SortableContext items={tasks.map(t => t.id)}>
          {tasks.map((task) => (
            <SortableTaskItem key={task.id} task={task} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
            <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20">
                <p className="text-sm text-muted-foreground">Arraste tarefas para cá</p>
            </div>
        )}
      </div>
    </div>
  );
}
