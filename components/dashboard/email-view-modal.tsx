"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Archive, CornerUpLeft } from "lucide-react"
import type { Message } from "./dashboard-content"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useAuth } from "@/components/auth-provider"
import SummaryCard, { SummaryData } from "./summary-card"
import EntitiesCard, { EntitiesData } from "./entities-card" // Importar EntitiesCard
import { ReplyComposer } from "./reply-composer" // Importar ReplyComposer
import TaskCreator from "./task-creator" // Importar TaskCreator
import PhishingIndicator, { PhishingData } from "./phishing-indicator" // Importar
import EditSummaryModal from "./edit-summary-modal" // Importar
import { useApiClient } from "@/hooks/use-api-client" // Atualizado para o novo hook
import { useToast } from "../ui/use-toast"

interface EmailViewModalProps {
  isOpen: boolean
  onClose: () => void
  email: Message | null
}

interface ParseResponse {
    summary: SummaryData;
    entities: EntitiesData;
    phishing: PhishingData;
}

export default function EmailViewModal({ isOpen, onClose, email }: EmailViewModalProps) {
  const { googleToken, loading: authLoading } = useAuth()
  const apiClient = useApiClient(); // Usar o hook
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [entities, setEntities] = useState<EntitiesData | null>(null) // Novo estado para entidades
  const [phishingData, setPhishingData] = useState<PhishingData | null>(null) // Novo estado
  const [isLoading, setIsLoading] = useState(false) // Um único estado de loading
  const [error, setError] = useState<string | null>(null)
  const [showReplyComposer, setShowReplyComposer] = useState(false) // Novo estado
  const [isTaskCreatorOpen, setIsTaskCreatorOpen] = useState(false) // Novo estado
  const [taskPrefillData, setTaskPrefillData] = useState<{ title: string; dueDate: string | null }>() // Novo estado
  const [isEditSummaryOpen, setIsEditSummaryOpen] = useState(false) // Novo estado
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && email) { // O apiClient já lida com o token
      const parseEmail = async () => {
        setIsLoading(true)
        setSummary(null)
        setEntities(null) // Resetar entidades
        setPhishingData(null) // Resetar
        setError(null)
        try {
          const data = await apiClient.post<ParseResponse>(`/api/messages/${email.id}/parse`, {});
          setSummary(data.summary)
          setEntities(data.entities) // Salvar as entidades
          setPhishingData(data.phishing) // Salvar dados de phishing
        } catch (error: any) {
          setError(error.message)
        } finally {
          setIsLoading(false)
        }
      }
      parseEmail()
    }
    // Resetar o compositor ao fechar o modal ou mudar de e-mail
    if (!isOpen) {
        setShowReplyComposer(false)
        setIsTaskCreatorOpen(false)
    }
  }, [isOpen, email]) // Remover googleToken, apiClient o obtém internamente

  if (!email) return null

  const fromAddress = email.from.match(/<(.+)>/)?.[1] || email.from;

  const handleReplyClick = () => {
    const subject = `Re: ${email.subject}`;
    const body = `\n\nOn ${formattedDate}, ${email.from} wrote:\n> ${email.bodyText?.split('\n').join('\n> ')}`;
    window.location.href = `mailto:${fromAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleArchiveAction = () => {
    toast({
      title: "Funcionalidade em breve",
      description: "A capacidade de arquivar e-mails estará disponível em breve.",
    });
  };

  const fromMatch = email.from.match(/^(.*)<.*>$/)
  const fromName = fromMatch ? fromMatch[1].trim().replace(/"/g, '') : email.from
  const fromInitial = fromName.charAt(0).toUpperCase()
  const formattedDate = format(new Date(email.receivedAt), "PPP p", { locale: ptBR })

  const handleCreateTaskClick = () => {
    setTaskPrefillData({
      title: summary?.text || '',
      dueDate: entities?.due_date || null,
    });
    setIsTaskCreatorOpen(true);
  };

  const handleSummaryUpdate = (newSummaryText: string) => {
    if (summary) {
      setSummary({ ...summary, text: newSummaryText });
    }
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-3xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold truncate">{email.subject}</DialogTitle>
            <DialogDescription asChild>
              <div className="flex items-center gap-2 pt-1">
                {email.category && <Badge variant="secondary">{email.category}</Badge>}
                <span className="text-xs text-muted-foreground">{formattedDate}</span>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 pr-6 -mr-6">
            <PhishingIndicator 
              phishingData={phishingData} 
              isLoading={isLoading}
              messageId={email.id} // Passar o messageId
            />
            
            <SummaryCard 
              summary={summary}
              isLoading={isLoading}
              authLoading={authLoading} // Passar o estado de autenticação
              onEdit={() => setIsEditSummaryOpen(true)} // Conectar botão
              onCreateTask={handleCreateTaskClick} // Conectar nova função
              onGenerateReply={() => setShowReplyComposer(true)} // Conectar botão
            />

            <EntitiesCard entities={entities} isLoading={isLoading} />

            <Separator />
            
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${fromName}`} />
                <AvatarFallback>{fromInitial}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{fromName}</p>
                <p className="text-sm text-gray-500">{email.from}</p>
              </div>
            </div>

            <Separator />
            
            <div className="text-sm text-foreground/80 whitespace-pre-wrap">
              {email.bodyText}
            </div>

            {showReplyComposer && (
              <ReplyComposer 
                messageId={email.id} 
                originalMessage={{
                  from: email.from,
                  body: email.bodyText || '',
                  subject: email.subject
                }} 
              />
            )}
          </div>
          
          <DialogFooter className="mt-auto pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <Button onClick={handleReplyClick}>
              <CornerUpLeft className="mr-2 h-4 w-4" />
              Responder
            </Button>
            <Button variant="secondary" onClick={handleArchiveAction}>
              <Archive className="mr-2 h-4 w-4" />
              Arquivar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* O TaskCreator é renderizado fora do Dialog principal para evitar problemas de aninhamento de modais */}
      <TaskCreator
        isOpen={isTaskCreatorOpen}
        onClose={() => setIsTaskCreatorOpen(false)}
        messageId={email.id}
        prefillData={taskPrefillData}
      />
      
      {summary && (
        <EditSummaryModal
          isOpen={isEditSummaryOpen}
          onClose={() => setIsEditSummaryOpen(false)}
          messageId={email.id}
          currentSummary={summary.text}
          onSummaryUpdate={handleSummaryUpdate}
        />
      )}
    </>
  )
}
