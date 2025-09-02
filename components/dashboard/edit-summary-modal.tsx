"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast" // Caminho corrigido
import { Loader2 } from "lucide-react"
import { useApiClient } from "@/hooks/use-api-client" // Atualizado para o novo hook

interface EditSummaryModalProps {
  isOpen: boolean
  onClose: () => void
  messageId: string
  currentSummary: string
  onSummaryUpdate: (newSummary: string) => void
}

export default function EditSummaryModal({ isOpen, onClose, messageId, currentSummary, onSummaryUpdate }: EditSummaryModalProps) {
  const [newSummary, setNewSummary] = useState(currentSummary)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const apiClient = useApiClient() // Usar o hook

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // 1. Salvar o resumo editado
      const { summary: updatedSummary } = await apiClient.patch<{ summary: { text: string } }>(
        `/api/messages/${messageId}/summary`,
        { text: newSummary }
      );
      
      // 2. Enviar feedback
      await apiClient.post('/api/feedback', {
        messageId: messageId,
        action: 'edit_summary',
        oldValue: currentSummary,
        newValue: newSummary,
      });

      toast({ title: "Sucesso!", description: "O novo resumo foi salvo.", variant: "success" })
      onSummaryUpdate(updatedSummary.text)
      onClose()
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o resumo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Resumo da IA</DialogTitle>
          <DialogDescription>
            Corrija o resumo gerado pela IA. Seu feedback nos ajuda a melhorar.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="summary-edit" className="sr-only">Resumo</Label>
          <Textarea
            id="summary-edit"
            value={newSummary}
            onChange={(e) => setNewSummary(e.target.value)}
            rows={5}
            className="mt-2"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar e Enviar Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
