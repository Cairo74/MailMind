"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/firebase/config"
import { GoogleAuthProvider, linkWithPopup, reauthenticateWithPopup } from "firebase/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Message } from "./dashboard-content" // Renomeado para Message
import EmailViewModal from "./email-view-modal"

interface EmailListProps {
  messages: Message[]; // Renomeado para messages
  isLoading: boolean;
  error: string | null;
}

export default function EmailList({ messages, isLoading, error }: EmailListProps) { // Renomeado para messages
  const { user, googleToken, setAndStoreGoogleToken } = useAuth()
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Message | null>(null) // Mudar para Message
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleEmailClick = (email: Message) => { // Mudar para Message
    setSelectedEmail(email)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedEmail(null)
  }

  const isGoogleLinked = user?.providerData.some(p => p.providerId === 'google.com');

  const handleGoogleAction = async () => {
    if (!auth.currentUser) {
        setActionError("Usuário não está logado.");
        return;
    }
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/gmail.readonly');

    const action = isGoogleLinked ? reauthenticateWithPopup : linkWithPopup;

    try {
        const result = await action(auth.currentUser, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const accessToken = credential?.accessToken;
        if (accessToken) {
            setAndStoreGoogleToken(accessToken); // Usa a função centralizada
            setActionError(null);
        }
    } catch (error: any) {
        if (error.code === 'auth/credential-already-in-use') {
          setActionError("Esta conta do Google já está vinculada a outro usuário.");
        } else {
          setActionError(`Falha ao conectar com o Google: ${error.message}`);
        }
    }
  };

  if (isLoading) {
    return <div>Carregando e-mails...</div>
  }

  if (error) {
    return <div className="text-red-500 p-4">Erro: {error}</div>
  }

  // Se não estamos carregando, não há erro, mas não há token, mostramos o botão
  if (!googleToken) {
    const message = isGoogleLinked 
      ? "Sua sessão com o Google expirou. Por favor, reconecte sua conta." 
      : "Por favor, conecte sua conta do Google para visualizar seus e-mails.";
      
    return (
        <div className="text-center p-8">
            <p className="mb-4">{actionError || message}</p>
            <Button onClick={handleGoogleAction}>
              {isGoogleLinked ? 'Reconectar com Google' : 'Conectar com Google'}
            </Button>
        </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>E-mails Recentes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {messages.length > 0 ? ( // Usar messages
            <ul className="divide-y divide-border">
              {messages.map((email) => { // Usar messages
                const fromMatch = email.from.match(/^(.*)<.*>$/);
                const fromName = fromMatch ? fromMatch[1].trim().replace(/"/g, '') : email.from;
                const fromInitial = fromName.charAt(0).toUpperCase();

                return (
                  <li 
                    key={email.id} 
                    className="flex items-start space-x-4 p-4 hover:bg-muted/50 cursor-pointer transition-colors duration-200"
                    onClick={() => handleEmailClick(email)}
                  >
                    <Avatar>
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${fromName}`} />
                      <AvatarFallback>{fromInitial}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-baseline">
                        <p className="font-semibold truncate pr-2">{fromName}</p>
                        <p className="text-xs text-gray-500 flex-shrink-0">{new Date(email.receivedAt).toLocaleDateString()}</p> 
                      </div>
                      <p className="font-medium text-sm truncate">{email.subject}</p>
                      <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-gray-600 truncate">{email.snippet}</p>
                          {email.category && <Badge variant="secondary">{email.category}</Badge>}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="text-center p-8">
              <p>Nenhum e-mail encontrado para os filtros selecionados.</p>
            </div>
          )}
        </CardContent>
        <EmailViewModal 
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          email={selectedEmail}
        />
      </Card>
    </>
  )
}
