"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Paintbrush, FileText } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle" // Importar o novo componente
import Link from "next/link"

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function SettingsContent() {
  return (
    <motion.div 
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    >
      <motion.div variants={itemVariants}>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">Gerencie as configurações da aplicação e sua conta.</p>
      </motion.div>

      {/* General Settings Card */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Paintbrush className="h-5 w-5 text-primary" />
              Aparência
            </CardTitle>
            <CardDescription>Personalize a aparência da aplicação.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Tema</p>
                <p className="text-sm text-muted-foreground">Selecione o tema claro, escuro ou o padrão do sistema.</p>
              </div>
              <div>
                <ThemeToggle />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* About Card */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Sobre & Legal
            </CardTitle>
            <CardDescription>Informações sobre o MailMind e termos legais.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-start space-y-2">
            <Link href="/sobre" passHref>
              <Button variant="link" className="p-0 h-auto">Sobre Nós</Button>
            </Link>
            <Link href="/termos" passHref>
              <Button variant="link" className="p-0 h-auto">Termos de Uso</Button>
            </Link>
            <Link href="/privacidade" passHref>
              <Button variant="link" className="p-0 h-auto">Política de Privacidade</Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

