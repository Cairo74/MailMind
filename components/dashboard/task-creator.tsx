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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, FilePlus2, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useApiClient } from "@/hooks/use-api-client"; // Atualizado para o novo hook

interface TaskCreatorProps {
  isOpen: boolean
  onClose: () => void
  messageId?: string
  prefillData?: {
    title: string;
    dueDate: string | null;
  }
}

export default function TaskCreator({ isOpen, onClose, messageId, prefillData }: TaskCreatorProps) {
  const { toast } = useToast()
  const apiClient = useApiClient(); // Usar o hook
  const { user } = useAuth()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (prefillData) {
      setTitle(prefillData.title || "")
      if (prefillData.dueDate) {
        setDueDate(new Date(prefillData.dueDate))
      }
    }
  }, [prefillData])

  const handleSubmit = async () => {
    if (!title) {
      toast({ title: "Erro", description: "O título da tarefa é obrigatório.", variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      setIsLoading(true);
      const taskData = {
        sourceMessageId: messageId,
        title,
        description,
        dueDate: dueDate?.toISOString(),
        priority,
      };

      await apiClient.post("/api/tasks", taskData);

      toast({
        title: "Tarefa criada com sucesso!",
        description: "A tarefa foi criada.",
      });
      onClose() // Fechar o modal
      // Resetar o estado
      setTitle("");
      setDescription("");
      setDueDate(undefined);
      setPriority("medium");

    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FilePlus2 /> Criar Nova Tarefa
          </DialogTitle>
          <DialogDescription>
            Adicione uma nova tarefa à sua lista. Se originada de um e-mail, ela será vinculada.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Pagar fatura de energia" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Adicione mais detalhes..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Vencimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Defina a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar Tarefa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
