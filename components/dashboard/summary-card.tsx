"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Lightbulb, Edit, FilePlus2, Sparkles } from "lucide-react"

// Definindo a estrutura dos dados do resumo que o componente espera
export interface SummaryData {
  text: string;
  action: 'pay' | 'reply' | 'schedule' | 'review' | 'none';
  deadline: string | null;
  generatedAt: string;
}

interface SummaryCardProps {
  summary: SummaryData | null;
  isLoading: boolean;
  authLoading: boolean; // Adicionar prop para o estado de autenticação
  onEdit: () => void;
  onCreateTask: () => void;
  onGenerateReply: () => void;
}

const actionTextMap = {
  pay: "Pagar fatura",
  reply: "Responder",
  schedule: "Agendar reunião",
  review: "Revisar documento",
  none: "Nenhuma ação sugerida",
};

export default function SummaryCard({
  summary,
  isLoading,
  authLoading, // Receber a nova prop
  onEdit,
  onCreateTask,
  onGenerateReply
}: SummaryCardProps) {
  
  if (isLoading) {
    return (
      <Card className="bg-muted/30 border-dashed">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <CardTitle>Análise da IA</CardTitle>
          </div>
          <CardDescription>Gerando resumo e sugestões...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex items-center gap-2 pt-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!summary) {
    return null // Ou poderia mostrar uma mensagem de erro
  }
  
  const actionLabel = actionTextMap[summary.action] || "Ação Sugerida";

  return (
    <Card className="bg-muted/40">
      <CardHeader>
        <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <CardTitle>Análise da IA</CardTitle>
        </div>
        <CardDescription>Resumo e ações sugeridas pelo MailMind AI</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-foreground italic">"{summary.text}"</p>
        
        <div className="flex flex-wrap items-center gap-2 pt-2 text-sm">
            <strong className="text-primary">Ação Sugerida:</strong> 
            <span className="font-medium">{actionLabel}</span>
            {summary.deadline && (
                <>
                    <span className="text-muted-foreground">|</span>
                    <strong>Prazo:</strong>
                    <span className="font-medium">{new Date(summary.deadline).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                </>
            )}
        </div>

        <div className="flex items-center gap-2 pt-4">
          <Button variant="outline" size="sm" onClick={onEdit} disabled={authLoading}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button variant="outline" size="sm" onClick={onCreateTask} disabled={authLoading}>
            <FilePlus2 className="mr-2 h-4 w-4" />
            Criar Tarefa
          </Button>
          <Button variant="outline" size="sm" onClick={onGenerateReply} disabled={authLoading}>
            <Sparkles className="mr-2 h-4 w-4" />
            Gerar Resposta
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
