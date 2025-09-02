"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { auth } from "@/lib/firebase/config"
import { useAuth } from "@/components/auth-provider"
import apiClient from "@/lib/api-client";

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { toast } = useToast()
  const { setAndStoreGoogleToken, syncSupabaseSession } = useAuth();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      // O AuthProvider irá detectar a mudança de estado e chamar o syncSupabaseSession automaticamente.
      // A chamada manual aqui é removida para evitar a condição de corrida.
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Erro no login:", error);
      let errorMessage = "Ocorreu um erro desconhecido.";
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Credenciais inválidas. Verifique seu e-mail e senha.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'E-mail inválido.';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Credenciais inválidas. Verifique seu e-mail e senha.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Muitas tentativas de login. Tente novamente mais tarde.';
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(""); // Limpar erros anteriores
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
      provider.setCustomParameters({ prompt: 'consent' }); // Força a tela de consentimento
      const result = await signInWithPopup(auth, provider);
      
      // Essencial: Obter o token de acesso OAuth para as APIs do Google a partir da credencial
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const googleApiAccessToken = credential?.accessToken;

      if (googleApiAccessToken) {
        setAndStoreGoogleToken(googleApiAccessToken);
      }
      // O AuthProvider cuidará da sincronização da sessão do Supabase.
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Erro no login com Google:", error);
      let errorMessage = "Falha ao fazer login com o Google.";
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Login com Google cancelado pelo usuário.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Login com Google bloqueado pelo navegador.';
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-up">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 animate-pulse-glow">
            <Mail className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">MailMind</h1>
          <p className="text-muted-foreground mt-2">Inteligência artificial para seus e-mails</p>
        </div>

        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Entrar na sua conta</CardTitle>
            <CardDescription>Digite seu email e senha para acessar o dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={handleEmailChange}
                    className="pl-10"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={handlePasswordChange}
                    className="pl-10 pr-10"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* reCAPTCHA placeholder */}
              <div className="bg-muted/50 border border-border rounded-lg p-4 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary rounded-sm"></div>
                  <span className="text-sm text-muted-foreground">Não sou um robô</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">reCAPTCHA placeholder</p>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Ou continue com</span>
              </div>
            </div>

            <Button variant="outline" className="w-full bg-transparent" onClick={handleGoogleSignIn}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuar com Google
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Não tem uma conta? </span>
              <Link href="/signup" className="text-primary hover:underline font-medium">
                Criar conta
              </Link>
            </div>
          </CardContent>
        </Card>

        <footer className="text-center text-xs text-muted-foreground mt-8">
          <nav className="flex justify-center gap-4">
            <Link className="hover:underline" href="/sobre">
              Sobre Nós
            </Link>
            <Link className="hover:underline" href="/termos">
              Termos de Uso
            </Link>
            <Link className="hover:underline" href="/privacidade">
              Política de Privacidade
            </Link>
          </nav>
          <p className="mt-2">&copy; {new Date().getFullYear()} MailMind. Todos os direitos reservados.</p>
        </footer>
        
        <p className="text-center text-xs text-muted-foreground mt-4">Demo: admin@mailmind.com / password</p>
      </div>
    </div>
  )
}
