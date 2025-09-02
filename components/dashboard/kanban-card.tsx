"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Task } from "./tasks-content";
import { Calendar, MessageSquare } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface KanbanCardProps {
  task: Task;
}

const priorityClasses = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-red-100 text-red-800 border-red-200',
};

export default function KanbanCard({ task }: KanbanCardProps) {
  const { title, description, due_date, priority, message_id } = task;

  return (
    <Card className="mb-4 bg-card hover:shadow-md transition-shadow duration-200">
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
            <CardTitle className="text-base font-semibold leading-tight">{title}</CardTitle>
            {priority && <Badge variant="outline" className={`${priorityClasses[priority]}`}>{priority}</Badge>}
        </div>
      </CardHeader>
      {description && (
        <CardContent className="p-4 pt-0">
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      )}
      <CardContent className="p-4 pt-0 flex justify-between items-center text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
            {due_date && (
                <>
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(due_date), "dd MMM", { locale: ptBR })}</span>
                </>
            )}
        </div>
        {message_id && (
            <div className="flex items-center gap-1" title="Originado de um e-mail">
                <MessageSquare className="h-4 w-4" />
            </div>
        )}
      </CardContent>
    </Card>
  );
}
