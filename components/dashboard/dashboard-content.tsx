"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import StatsCards from "./stats-cards"
import EmailList from "./email-list"
import { useAuth } from "@/components/auth-provider"
import EmailFilters, { FilterState } from "./email-filters"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useApiClient } from "@/hooks/use-api-client" // Atualizado para o novo hook
import { useToast } from "../ui/use-toast"

export interface Message {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  receivedAt: string; 
  labels: string[];
  unread: boolean;
  bodyText?: string;
  category?: string; 
}

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const initialFilterState: FilterState = {
  searchTerm: '',
  category: '',
  dateRange: undefined,
};

export default function DashboardContent() {
  const { googleToken, loading: authLoading } = useAuth();
  const apiClient = useApiClient(); // Usar o hook
  const { toast } = useToast();
  
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [filters, setFilters] = useState<FilterState>(initialFilterState);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!googleToken) return;

      setMessagesLoading(true);
      setError(null);

      try {
        // Usar apiClient diretamente em vez de useApi
        const response = await apiClient.get<{ messages: Message[] }>('/api/messages');
        const messages = response.messages || [];
        setAllMessages(messages);
        setFilteredMessages(messages);
      } catch (err: any) {
        console.error("Erro ao carregar e-mails:", err);
        const errorMessage = err.message || "Ocorreu um erro desconhecido.";
        setError(`Failed to fetch emails (Status: ${err.status || 500})`);
        toast({
          title: "Erro ao carregar e-mails",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setMessagesLoading(false);
      }
    };

    if (!authLoading && googleToken) {
      fetchMessages();
    } else if (!authLoading && !googleToken) {
      // Se não houver token do Google, paramos o carregamento.
      setMessagesLoading(false);
    }
  }, [googleToken, authLoading, toast]);

  const handleFilterChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    let messagesToFilter = [...allMessages];

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      messagesToFilter = messagesToFilter.filter(msg => 
        msg.subject.toLowerCase().includes(term) || 
        msg.from.toLowerCase().includes(term)
      );
    }

    if (filters.category && filters.category !== '') {
      messagesToFilter = messagesToFilter.filter(msg => msg.category === filters.category);
    }

    if (filters.dateRange?.from) {
      messagesToFilter = messagesToFilter.filter(msg => {
        const msgDate = new Date(msg.receivedAt);
        const fromDate = filters.dateRange!.from!;
        fromDate.setHours(0, 0, 0, 0);

        if (filters.dateRange?.to) {
          const toDate = filters.dateRange!.to!;
          toDate.setHours(23, 59, 59, 999);
          return msgDate >= fromDate && msgDate <= toDate;
        }
        return msgDate.toDateString() === fromDate.toDateString();
      });
    }

    setFilteredMessages(messagesToFilter);
  };
  
  const handleClearFilters = () => {
    setFilters(initialFilterState);
    setFilteredMessages([...allMessages]);
  };

  const isLoading = authLoading || messagesLoading;

  if (error) {
      return <div className="p-8 text-red-500">Erro ao carregar e-mails: {error}</div>
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <StatsCards messages={filteredMessages} isLoading={isLoading} />
      
      <motion.div variants={itemVariants}>
        <Card>
            <CardHeader>
                <CardTitle>E-mails Recentes</CardTitle>
                <CardDescription>Visualize, filtre e gerencie seus e-mails classificados.</CardDescription>
            </CardHeader>
            <EmailFilters 
              filters={filters}
              onFilterChange={handleFilterChange}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
            />
            <CardContent>
                <EmailList 
                  messages={filteredMessages} 
                  isLoading={isLoading}
                  error={error}
                />
            </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
