// Mock data for MailMind dashboard testing
export interface EmailData {
  id: string
  sender: string
  subject: string
  category: "trabalho" | "promocoes" | "financeiro" | "spam" | "pessoal"
  summary: string
  timestamp: string
  isRead: boolean
}

export interface DashboardStats {
  totalEmails: number
  categoryCounts: {
    trabalho: number
    promocoes: number
    financeiro: number
    spam: number
    pessoal: number
  }
  processedToday: number
  automationsTriggered: number
}

export const mockEmails: EmailData[] = [
  {
    id: "1",
    sender: "joao@empresa.com",
    subject: "Reunião de projeto - Quinta-feira",
    category: "trabalho",
    summary: "Convite para reunião sobre o novo projeto de IA. Quinta-feira às 14h.",
    timestamp: "2024-01-15T10:30:00Z",
    isRead: false,
  },
  {
    id: "2",
    sender: "noreply@amazon.com",
    subject: "Oferta especial - 50% de desconto",
    category: "promocoes",
    summary: "Promoção de produtos eletrônicos com desconto de até 50%.",
    timestamp: "2024-01-15T09:15:00Z",
    isRead: true,
  },
  {
    id: "3",
    sender: "banco@itau.com.br",
    subject: "Fatura do cartão de crédito",
    category: "financeiro",
    summary: "Fatura do cartão com vencimento em 25/01. Valor: R$ 1.250,00.",
    timestamp: "2024-01-15T08:00:00Z",
    isRead: false,
  },
  {
    id: "4",
    sender: "suspicious@fake.com",
    subject: "Você ganhou um prêmio!",
    category: "spam",
    summary: "Email suspeito alegando prêmio. Classificado automaticamente como spam.",
    timestamp: "2024-01-15T07:45:00Z",
    isRead: true,
  },
  {
    id: "5",
    sender: "maria@gmail.com",
    subject: "Fotos da viagem",
    category: "pessoal",
    summary: "Maria compartilhou fotos da viagem para a praia no final de semana.",
    timestamp: "2024-01-14T20:30:00Z",
    isRead: false,
  },
]

export const mockStats: DashboardStats = {
  totalEmails: 1247,
  categoryCounts: {
    trabalho: 342,
    promocoes: 189,
    financeiro: 67,
    spam: 423,
    pessoal: 226,
  },
  processedToday: 23,
  automationsTriggered: 8,
}

// Simulate API calls
export const fetchDashboardData = async (): Promise<{
  emails: EmailData[]
  stats: DashboardStats
}> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  return {
    emails: mockEmails,
    stats: mockStats,
  }
}

export const triggerAutomation = async (type: "calendar" | "drive", emailId: string) => {
  // Simulate automation trigger
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    success: true,
    message: `Automação ${type} acionada para o email ${emailId}`,
  }
}
