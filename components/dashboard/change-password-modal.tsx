"use client"

import { useState } from "react"
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
import { useToast } from "@/components/ui/use-toast"
import { auth } from "@/lib/firebase/config"
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth"
import { Loader2 } from "lucide-react"

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const { toast } = useToast()
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("As novas senhas não coincidem.");
      return;
    }
    if (passwords.newPassword.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    const user = auth.currentUser;
    if (!user || !user.email) {
      setError("Usuário não encontrado.");
      return;
    }

    setIsSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, passwords.currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwords.newPassword);

      toast({
        title: "Sucesso!",
        description: "Sua senha foi alterada.",
      });
      onClose();
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        setError("A senha antiga está incorreta.");
      } else {
        setError("Ocorreu um erro ao alterar a senha. Tente novamente.");
        console.error("Password Change Error:", error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setError('');
    setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar Senha</DialogTitle>
          <DialogDescription>
            Para sua segurança, insira sua senha antiga, a nova senha e confirme-a.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha Antiga</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={passwords.currentPassword}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwords.newPassword}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwords.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose} type="button">Cancelar</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Nova Senha
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
