"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ShieldCheck, ShieldQuestion, Flag, Loader2 } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { useApiClient } from "@/hooks/use-api-client"; // Atualizado para o novo hook

export interface PhishingData {
  is_phishing: boolean;
  phishing_score: number;
  reasons: string[];
}

interface PhishingIndicatorProps {
  phishingData: PhishingData | null;
  isLoading: boolean;
  messageId: string;
}

export default function PhishingIndicator({ phishingData, isLoading, messageId }: PhishingIndicatorProps) {
  const { toast } = useToast();
  const apiClient = useApiClient(); // Usar o hook

  const handleReportFalsePositive = async () => {
    try {
      await apiClient.post('/api/feedback', {
        messageId,
        feedbackType: 'false_positive',
        details: 'User reported phishing detection as a false positive.',
      });
      toast({
        title: "Feedback Enviado",
        description: "Obrigado! Sua contribuição ajuda a melhorar nossa IA.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o feedback. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
        <Alert className="bg-muted/50">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Analisando segurança...</AlertTitle>
            <AlertDescription>
                Estamos verificando este e-mail em busca de sinais de phishing.
            </AlertDescription>
        </Alert>
    );
  }

  if (!phishingData) {
    return (
        <Alert variant="destructive">
            <ShieldQuestion className="h-4 w-4" />
            <AlertTitle>Análise de Segurança Indisponível</AlertTitle>
            <AlertDescription>
                Não foi possível analisar este e-mail. Tenha cuidado extra ao clicar em links ou baixar anexos.
            </AlertDescription>
        </Alert>
    );
  }
  
  const score = phishingData.phishing_score;
  let variant: "default" | "destructive" | "warning" = "default";
  let Icon = ShieldCheck;
  let title = "Este e-mail parece seguro";
  
  if (score > 0.8) {
    variant = "destructive";
    Icon = ShieldAlert;
    title = "Alerta de Phishing: Perigo Alto!";
  } else if (score > 0.5) {
    variant = "warning";
    Icon = ShieldQuestion;
    title = "Potencial Phishing: Tenha Cuidado";
  }

  return (
    <Alert variant={variant}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <div className="flex flex-col gap-2">
            {phishingData.reasons && phishingData.reasons.length > 0 && (
                <ul className="list-disc list-inside text-xs">
                    {phishingData.reasons.map((reason, index) => <li key={index}>{reason}</li>)}
                </ul>
            )}
            <p className="text-xs">
                {variant === 'default' 
                    ? 'Nossa análise não encontrou indicadores comuns de phishing.'
                    : 'Verifique o remetente e não clique em links ou baixe anexos se não confiar na fonte.'
                }
            </p>
            {variant !== 'default' && (
                <Button size="sm" variant="secondary" className="mt-2 h-7" onClick={handleReportFalsePositive}>
                    <Flag className="mr-2 h-3 w-3" /> Reportar Falso Positivo
                </Button>
            )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
