import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import TasksContent from "@/components/dashboard/tasks-content";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "MailMind - Tarefas",
    description: "Gerencie suas tarefas com o Kanban.",
};

export default function TasksPage() {
    return (
        <DashboardLayout>
            <TasksContent />
        </DashboardLayout>
    );
}
