"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { AlertTriangle, Trash2, Loader2 } from "lucide-react"
import { deleteUser } from "firebase/auth"
import { auth } from "@/lib/firebase/config"
import { useRouter } from "next/navigation"

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
}

const modalVariants = {
  // ... (variantes)
}

export default function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const [confirmationText, setConfirmationText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()
  const router = useRouter()
  const user = auth.currentUser;

  const expectedConfirmation = "EXCLUIR MINHA CONTA"
  const isConfirmationValid = confirmationText === expectedConfirmation

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmationValid) {
      setError("Texto de confirmação incorreto");
      return;
    }
    if (!user) {
      setError("Nenhum usuário autenticado para excluir.");
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      await deleteUser(user);
      toast({
        title: "Conta excluída com sucesso",
        description: "Você será redirecionado para a página de login.",
      });
      setTimeout(() => router.push('/login'), 2000);
    } catch (error: any) {
      setError("Erro ao excluir conta. Pode ser necessário fazer login novamente por segurança.");
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Você tem certeza absoluta?</DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente sua
            conta e removerá seus dados de nossos servidores.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleDelete}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="confirmation-text" className="text-right">
                Confirmação:
              </Label>
              <Input
                id="confirmation-text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                className="col-span-3"
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4" />
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Sim, excluir conta
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
