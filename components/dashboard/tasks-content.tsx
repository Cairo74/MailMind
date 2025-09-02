"use client";

import { useState, useEffect, useMemo } from 'react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanColumn } from './kanban-column';
import { useApi } from '@/hooks/use-api';
import { useApiClient } from '@/hooks/use-api-client'; // Atualizado para o novo hook
import { useAuth } from '../auth-provider';
import { useToast } from '../ui/use-toast';
import { Loader2 } from 'lucide-react';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  created_at: string;
  message_id: string | null;
}

type TaskStatus = 'todo' | 'in_progress' | 'done';

const columnTitles: Record<TaskStatus, string> = {
  todo: 'A Fazer',
  in_progress: 'Em Andamento',
  done: 'Concluído',
};

export default function TasksContent() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const apiClient = useApiClient(); // Usar o hook
  const [tasks, setTasks] = useState<Task[]>([]);
  const { data: fetchedTasks, isLoading, error } = useApi<Task[]>('/api/tasks', {
    enabled: !authLoading && !!user, // Só busca as tarefas quando o usuário estiver carregado
  });

  useEffect(() => {
    if (fetchedTasks) {
      setTasks(fetchedTasks);
    }
  }, [fetchedTasks]);

  const tasksByColumn = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      done: [],
    };
    tasks.forEach((task) => {
      grouped[task.status].push(task);
    });
    return grouped;
  }, [tasks]);
  
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
        const activeContainer = active.data.current?.sortable.containerId;
        const overContainer = over.data.current?.sortable.containerId;
        const taskId = active.id as string;
        const newStatus = overContainer as TaskStatus;

        // Atualização otimista da UI
        const originalTasks = [...tasks];
        const taskIndex = tasks.findIndex((t) => t.id === taskId);
        if (taskIndex === -1) return;

        const updatedTasks = [...tasks];
        updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], status: newStatus };
        
        // Reordenar dentro da mesma coluna
        if (activeContainer === overContainer) {
            const oldIndex = tasksByColumn[activeContainer].findIndex(t => t.id === active.id);
            const newIndex = tasksByColumn[overContainer].findIndex(t => t.id === over.id);
            const reorderedColumn = arrayMove(tasksByColumn[activeContainer], oldIndex, newIndex);
            
            const otherTasks = tasks.filter(t => t.status !== activeContainer);
            setTasks([...otherTasks, ...reorderedColumn]);
        } else {
            // Mover para uma nova coluna
            setTasks(updatedTasks);
        }

        try {
            await apiClient.patch(`/api/tasks/${taskId}`, { status: newStatus });
            toast({
                title: "Tarefa atualizada!",
                description: `A tarefa foi movida para "${columnTitles[newStatus]}".`,
            });
        } catch (error) {
            // Reverter em caso de erro
            setTasks(originalTasks);
            toast({
                title: "Erro",
                description: "Não foi possível atualizar a tarefa. Tente novamente.",
                variant: "destructive",
            });
        }
    }
  };


  if (isLoading || authLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">Erro ao carregar tarefas: {error.message}</div>;
  }
  
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Quadro de Tarefas</h2>
        </div>
        <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(Object.keys(tasksByColumn) as TaskStatus[]).map((status) => (
                    <SortableContext key={status} items={tasksByColumn[status].map(t => t.id)} strategy={verticalListSortingStrategy}>
                        <KanbanColumn
                            id={status}
                            title={columnTitles[status]}
                            tasks={tasksByColumn[status]}
                        />
                    </SortableContext>
                ))}
            </div>
        </DndContext>
    </div>
  );
}
