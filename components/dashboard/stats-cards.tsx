"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Briefcase, Tag, Bell } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Message } from "./dashboard-content"

interface StatsCardsProps {
  messages: Message[];
  isLoading: boolean;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
}

const stats_template = [
    { name: "Total de E-mails", icon: Mail },
    { name: "Trabalho", icon: Briefcase },
    { name: "Promoções", icon: Tag },
    { name: "Notificações", icon: Bell },
]

export default function StatsCards({ messages, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats_template.map((item) => (
          <Card key={item.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.name}</CardTitle>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  
  const totalEmails = messages.length;
  
  const categories = {
    Trabalho: messages.filter(e => e.category === 'Trabalho').length,
    Pessoal: messages.filter(e => e.category === 'Pessoal').length,
    Promoções: messages.filter(e => e.category === 'Promoções').length,
    Notificações: messages.filter(e => e.category === 'Notificações').length,
  };

  const stats = [
    { name: "Total de E-mails", stat: totalEmails, icon: Mail },
    { name: "Trabalho", stat: categories.Trabalho, icon: Briefcase },
    { name: "Promoções", stat: categories.Promoções, icon: Tag },
    { name: "Notificações", stat: categories.Notificações, icon: Bell },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((item) => (
        <motion.div key={item.name} variants={itemVariants}>
          <Card className="hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.name}</CardTitle>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.stat}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
