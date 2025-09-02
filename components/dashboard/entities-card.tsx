"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarClock, Hash, Link, DollarSign, Clock } from "lucide-react"

// Estrutura das entidades extraídas, alinhada com a API
export interface EntitiesData {
  due_date: string | null;
  amount: {
    raw: string;
    currency: string;
    value: number;
  } | null;
  invoice_number: string | null;
  urls: string[];
  meeting_datetime: string | null;
}

interface EntitiesCardProps {
  entities: EntitiesData | null;
  isLoading: boolean;
}

// Componente para renderizar um item da lista de entidades
function EntityItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}

export default function EntitiesCard({ entities, isLoading }: EntitiesCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados Extraídos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    )
  }

  if (!entities || Object.values(entities).every(v => v === null || (Array.isArray(v) && v.length === 0))) {
    return null; // Não renderiza o card se não houver nenhuma entidade
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Dados Extraídos</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <EntityItem 
          icon={<DollarSign size={16} />} 
          label="Valor" 
          value={entities.amount?.raw} 
        />
        <EntityItem 
          icon={<CalendarClock size={16} />} 
          label="Vencimento" 
          value={entities.due_date ? new Date(entities.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : null} 
        />
        <EntityItem 
          icon={<Hash size={16} />} 
          label="Fatura / Pedido" 
          value={entities.invoice_number} 
        />
        <EntityItem 
          icon={<Clock size={16} />} 
          label="Reunião" 
          value={entities.meeting_datetime ? new Date(entities.meeting_datetime).toLocaleString('pt-BR', { timeZone: 'UTC' }) : null} 
        />
        <EntityItem 
          icon={<Link size={16} />} 
          label="Links Importantes" 
          value={entities.urls && entities.urls.length > 0 ? (
            <ul className="list-disc list-inside">
              {entities.urls.map((url, i) => (
                <li key={i} className="truncate">
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          ) : null} 
        />
      </CardContent>
    </Card>
  )
}
