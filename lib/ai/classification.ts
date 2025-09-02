import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const CATEGORIES = ["Pessoal", "Trabalho", "Promoções", "Notificações", "Spam"];

const systemPrompt = `
Você é um especialista em organização de e-mails. Sua tarefa é classificar um e-mail em uma das seguintes categorias: ${CATEGORIES.join(', ')}.
Analise o remetente, assunto e corpo do e-mail para decidir a categoria mais apropriada.

Aqui estão as definições de cada categoria para te guiar:
- **Pessoal:** Conversas diretas entre indivíduos, amigos, família. E-mails que não se encaixam em nenhuma outra categoria. Ex: "Vamos marcar um café?", "Fotos da viagem".
- **Trabalho:** Comunicações profissionais, de colegas, clientes, relacionadas a projetos, tarefas, reuniões. E-mails de ferramentas de produtividade (Slack, Jira, Asana).
- **Promoções:** Marketing, ofertas, newsletters de lojas, cupons, anúncios de produtos ou serviços. Ex: "Desconto de 20% só hoje!", "Nossa nova coleção chegou".
- **Notificações:** Alertas automáticos de serviços, redes sociais, atualizações de status de pedidos, confirmações de conta, alertas de segurança. Ex: "Sua fatura está disponível", "Alguém comentou na sua foto", "Seu pedido foi enviado".
- **Spam:** E-mails indesejados, fraudulentos, phishing, ou marketing extremamente agressivo e irrelevante.

Sua resposta DEVE ser um objeto JSON válido, contendo apenas uma chave "category".
Por exemplo: {"category": "Trabalho"}
Não inclua nenhum texto, explicação ou caracteres fora do formato JSON.
`;

interface EmailContent {
    subject: string;
    body: string;
}

/**
 * Classifica o conteúdo de um e-mail em uma categoria predefinida usando a API Groq.
 * @param content O assunto e o corpo do e-mail.
 * @returns A categoria classificada ou "Não classificado" em caso de falha.
 */
export async function classifyEmail(content: EmailContent): Promise<string> {
    const { subject, body } = content;

    if (!subject && !body) {
        return "Não classificado";
    }

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Assunto: ${subject}\n\nCorpo: ${body.substring(0, 2000)}` },
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0,
            max_tokens: 50,
            response_format: { type: 'json_object' },
        });

        const responseContent = chatCompletion.choices[0]?.message?.content;
        if (!responseContent) {
            return "Não classificado";
        }

        const parsedResponse = JSON.parse(responseContent);
        const category = parsedResponse.category;

        if (!category || !CATEGORIES.includes(category)) {
            return "Não classificado";
        }

        return category;
    } catch (error) {
        console.error('Groq API Error during classification:', error);
        return "Não classificado"; // Retorna um valor padrão em caso de erro
    }
}

