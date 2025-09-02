import Link from 'next/link';
import { Mail } from 'lucide-react';

export default function StaticLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center justify-center" href="/">
          <Mail className="h-6 w-6 text-primary" />
          <span className="ml-2 font-semibold text-lg">MailMind</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
            Login
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/dashboard">
            Dashboard
          </Link>
        </nav>
      </header>
      <main className="flex-1 py-12 md:py-24 lg:py-32">
        <div className="container mx-auto px-4 md:px-6">
          {children}
        </div>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} MailMind. Todos os direitos reservados.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="/sobre">
            Sobre Nós
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="/termos">
            Termos de Uso
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="/privacidade">
            Política de Privacidade
          </Link>
        </nav>
      </footer>
    </div>
  );
}
