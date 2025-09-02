"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, LineChart, Package, Settings, Users, LogOut, Mail, X, ClipboardCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase/config"
import { useRouter } from "next/navigation"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Relatórios", href: "/dashboard/reports", icon: LineChart },
  { name: "Automações", href: "/dashboard/automations", icon: Package },
  { name: "Configurações", href: "/dashboard/profile", icon: Users },
]

const sidebarVariants = {
  open: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  closed: {
    x: "-100%",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
}

const navItemVariants = {
  hover: {
    x: 4,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
}

const logoVariants = {
  hover: {
    scale: 1.05,
    rotate: 5,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const navLinks = [
    { href: "/dashboard", icon: Home, text: "Dashboard" },
    { href: "/dashboard/profile", icon: Users, text: "Perfil" },
    { href: "/dashboard/tasks", icon: ClipboardCheck, text: "Tarefas" }, // Ícone atualizado
    { href: "/dashboard/settings", icon: Settings, text: "Configurações" }
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-sidebar border-r border-sidebar-border px-6 pb-4">
          <motion.div className="flex h-16 shrink-0 items-center" whileHover="hover" variants={logoVariants}>
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Mail className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-sidebar-foreground">MailMind</h1>
                <p className="text-xs text-sidebar-foreground/60">AI Email Assistant</p>
              </div>
            </div>
          </motion.div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  pathname === link.href && "bg-sidebar-accent text-sidebar-foreground"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.text}
              </Link>
            ))}
          </nav>

          <div className="mt-auto">
            <Button variant="ghost" className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground" onClick={handleSignOut}>
              <LogOut className="mr-3 h-5 w-5" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      <motion.div
        className="fixed inset-y-0 z-50 flex w-64 flex-col lg:hidden"
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
      >
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-sidebar border-r border-sidebar-border px-6 pb-4">
          {/* Mobile header with close button */}
          <div className="flex h-16 shrink-0 items-center justify-between">
            <motion.div className="flex items-center space-x-3" whileHover="hover" variants={logoVariants}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Mail className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-sidebar-foreground">MailMind</h1>
                <p className="text-xs text-sidebar-foreground/60">AI Email Assistant</p>
              </div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <X className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>

          {/* Navigation - same as desktop */}
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <Users className="h-4 w-4" />
              Perfil
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <Settings className="h-4 w-4" />
              Configurações
            </Link>
            <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleSignOut}
            >
                <LogOut className="mr-3 h-5 w-5" />
                Sair
            </Button>
          </nav>
        </div>
      </motion.div>
    </>
  )
}
