"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import DeleteAccountModal from "./delete-account-modal"
import ChangePasswordModal from "./change-password-modal" // Importar o novo modal
import { updateProfile } from "firebase/auth"
import { useToast } from "@/components/ui/use-toast"
import { User, Shield, Trash2, Save, Camera, Loader2 } from "lucide-react"
import { storage } from "@/lib/firebase/config"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import imageCompression from 'browser-image-compression'; // Importar a biblioteca

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
}

export default function ProfileContent() {
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const idToken = await user.getIdToken();
        const response = await fetch('/api/profile', {
          headers: { 'Authorization': `Bearer ${idToken}` },
        });
        if (!response.ok) throw new Error("Falha ao buscar perfil.");
        const data = await response.json();
        setProfileData({
          name: data.full_name || user.displayName || "",
          email: user.email || "",
          phone: data.phone || "",
          company: data.company || "",
        });
      } catch (error) {
        console.error(error);
        toast({ title: "Erro", description: "Não foi possível carregar seus dados.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [user, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const options = {
      maxSizeMB: 1,          // (max 1MB)
      maxWidthOrHeight: 800, // (dimensão máxima de 800px)
      useWebWorker: true,
    }

    try {
      setIsUploading(true);
      const compressedFile = await imageCompression(file, options);
      const storageRef = ref(storage, `profile_pictures/${user.uid}/${compressedFile.name}`);

      const snapshot = await uploadBytes(storageRef, compressedFile); // Envia o arquivo comprimido
      const photoURL = await getDownloadURL(snapshot.ref);
      await updateProfile(user, { photoURL });
      
      toast({ title: "Sucesso!", description: "Sua foto de perfil foi atualizada." });
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao enviar a foto.", variant: "destructive" });
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    try {
      // 1. Atualiza no Firebase Auth (o nome é a única coisa que o Firebase Auth armazena aqui)
      if (user.displayName !== profileData.name) {
        await updateProfile(user, { displayName: profileData.name });
      }

      // 2. Atualiza no Supabase via API
      const idToken = await user.getIdToken();
      const response = await fetch('/api/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({ 
            name: profileData.name,
            phone: profileData.phone,
            company: profileData.company
          }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao atualizar o perfil.");
      }

      toast({ title: "Sucesso!", description: "Seu perfil foi atualizado." });
    } catch (error: any) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || authLoading) {
    return <div>Carregando perfil...</div>;
  }
  
  const userInitial = profileData.name.charAt(0).toUpperCase();

  return (
    <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="visible">
      {/* Page header */}
      <motion.div variants={itemVariants}>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Perfil</h2>
        <p className="text-muted-foreground">Gerencie sua conta e preferências do MailMind</p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Settings */}
        <motion.form onSubmit={handleSaveProfile} className="lg:col-span-2">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Informações do Perfil
              </CardTitle>
              <CardDescription>Atualize suas informações pessoais e de contato</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar section */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${profileData.name}`} alt={profileData.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden accept="image/png, image/jpeg" />
                  <Button size="icon" className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full" onClick={handleAvatarClick} disabled={isUploading}>
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                    <span className="sr-only">Alterar foto</span>
                  </Button>
                </div>
                <div>
                  <h3 className="text-lg font-medium">{profileData.name}</h3>
                  <p className="text-sm text-muted-foreground">{profileData.email}</p>
                </div>
              </div>

              <Separator />

              {/* Form fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    name="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    placeholder="seu@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    placeholder="+55 11 99999-9999"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    id="company"
                    name="company"
                    value={profileData.company}
                    onChange={handleInputChange}
                    placeholder="Nome da empresa"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary/90">
                    {isSaving ? (
                      <>
                        <motion.div
                          className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar alterações
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.form>

        {/* Account Security & Actions */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Security Card */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Segurança
              </CardTitle>
              <CardDescription>Configurações de segurança da conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Autenticação em duas etapas</p>
                  <p className="text-xs text-muted-foreground">Adicione uma camada extra de segurança</p>
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" size="sm">
                    Configurar
                  </Button>
                </motion.div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Alterar senha</p>
                  <p className="text-xs text-muted-foreground">Última alteração há 3 meses</p>
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" size="sm" onClick={() => setIsChangePasswordModalOpen(true)}>
                    Alterar
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 hover:shadow-lg hover:shadow-red-100 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Zona de Perigo
              </CardTitle>
              <CardDescription>Ações irreversíveis da conta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-red-600">Excluir conta</p>
                  <p className="text-xs text-muted-foreground">
                    Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos.
                  </p>
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir conta
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
      <ChangePasswordModal isOpen={isChangePasswordModalOpen} onClose={() => setIsChangePasswordModalOpen(false)} />
    </motion.div>
  )
}
