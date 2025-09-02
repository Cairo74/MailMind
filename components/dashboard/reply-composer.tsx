"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, Send, Clipboard } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useApiClient } from '@/hooks/use-api-client'; // Atualizado para o novo hook
import { Input } from '@/components/ui/input';

type Tone = 'formal' | 'casual' | 'direto';
type Length = 'curto' | 'médio' | 'longo';

interface ReplyComposerProps {
  messageId: string;
  originalMessage: {
    from: string;
    body: string;
    subject: string;
  };
}

interface GeneratedReply {
  subject: string;
  body: string;
}

export function ReplyComposer({ messageId, originalMessage }: ReplyComposerProps) {
  const [tone, setTone] = useState<Tone>('formal');
  const [length, setLength] = useState<Length>('médio');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedReply, setGeneratedReply] = useState<GeneratedReply | null>(null);
  const { toast } = useToast();
  const apiClient = useApiClient(); // Usar o hook

  const handleGenerateReply = async () => {
    setIsLoading(true);
    setGeneratedReply(null);
    try {
      const reply = await apiClient.post<GeneratedReply>(`/api/messages/${messageId}/generate-reply`, {
        tone,
        length,
        originalMessage: originalMessage.body, // Enviar apenas o corpo do e-mail
      });
      setGeneratedReply(reply);
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar a resposta. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (generatedReply?.body) {
      navigator.clipboard.writeText(generatedReply.body);
      toast({
        title: 'Copiado!',
        description: 'O corpo do e-mail foi copiado para a área de transferência.',
      });
    }
  };

  const handleSendEmail = () => {
    if (generatedReply) {
      toast({
        title: "Preparando e-mail",
        description: "Abrindo seu cliente de e-mail padrão...",
      });
      const fromAddress = originalMessage.from.match(/<(.+)>/)?.[1] || originalMessage.from;
      const mailtoLink = `mailto:${fromAddress}?subject=${encodeURIComponent(generatedReply.subject)}&body=${encodeURIComponent(generatedReply.body)}`;
      window.location.href = mailtoLink;
    }
  };

  return (
    <Card className="mt-4 border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          Assistente de Resposta
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="tone">Tom</Label>
            <Select onValueChange={(value: Tone) => setTone(value)} defaultValue={tone}>
              <SelectTrigger id="tone">
                <SelectValue placeholder="Selecione o tom" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="direto">Direto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="length">Tamanho</Label>
            <Select onValueChange={(value: Length) => setLength(value)} defaultValue={length}>
              <SelectTrigger id="length">
                <SelectValue placeholder="Selecione o tamanho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="curto">Curto</SelectItem>
                <SelectItem value="médio">Médio</SelectItem>
                <SelectItem value="longo">Longo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleGenerateReply} disabled={isLoading} className="mt-4 w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Gerar Resposta
        </Button>

        {generatedReply && (
          <div className="mt-4 space-y-4 rounded-md border bg-muted/20 p-4">
            <div>
              <Label htmlFor="subject">Assunto</Label>
              <Input id="subject" readOnly value={generatedReply.subject} />
            </div>
            <div>
              <Label htmlFor="body">Corpo</Label>
              <Textarea id="body" readOnly value={generatedReply.body} rows={8} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
                <Clipboard className="mr-2 h-4 w-4" />
                Copiar
              </Button>
              <Button size="sm" onClick={handleSendEmail}>
                <Send className="mr-2 h-4 w-4" />
                Enviar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
