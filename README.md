<div align="center">
  <h1 align="center">MailMind</h1>
  <p align="center">
    <strong>Caixa de entrada inteligente com o poder da IA generativa</strong>
    <br />
    Classifique, resuma e responda e-mails com uma eficiência sem precedentes.
  </p>
</div>

---

## 🚀 Sobre o Projeto

O **MailMind** é uma aplicação web moderna que transforma a maneira como você gerencia seus e-mails. Utilizando a API do Gmail para leitura e a potência dos modelos de linguagem da Groq (Llama 3.3), o MailMind automatiza tarefas demoradas, permitindo que você foque no que realmente importa.

A plataforma não apenas organiza sua caixa de entrada, mas também oferece ferramentas de IA para extrair informações, detectar ameaças de phishing, gerar resumos e até mesmo compor respostas inteligentes, otimizando seu fluxo de trabalho e produtividade.

## ✨ Funcionalidades Principais

- **📊 Dashboard Intuitivo:** Visualize estatísticas, filtre e gerencie seus e-mails em uma interface limpa e moderna.
- **🤖 Classificação Automática com IA:** E-mails são automaticamente categorizados como `Importante`, `Promocional`, `Social` ou `Fóruns`.
- **📝 Resumos Inteligentes:** Obtenha o resumo de e-mails longos em uma única frase, com a ação principal e prazos destacados.
- **🔍 Extração de Entidades:** A IA identifica e extrai automaticamente informações cruciais como datas de vencimento, valores, números de fatura e links.
- **🛡️ Detecção de Phishing:** Um modelo de IA avançado analisa o conteúdo em busca de sinais de phishing, atribuindo um score de segurança e destacando os motivos da suspeita.
- **✍️ Assistente de Resposta:** Gere respostas de e-mail contextuais, ajustando o tom (`formal`, `casual`, `direto`) e o tamanho (`curto`, `médio`, `longo`).
- **📋 Gerenciador de Tarefas Kanban:** Crie tarefas a partir de e-mails com um clique e gerencie seu fluxo de trabalho em um quadro Kanban.
- **🔐 Autenticação Segura:** Sistema de autenticação robusto utilizando Firebase (para login social e com e-mail/senha) e Supabase (para gerenciamento de sessão no backend).

## 🛠️ Tecnologias Utilizadas

- **Frontend:** [Next.js](https://nextjs.org/), [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- **UI:** [Shadcn/UI](https://ui.shadcn.com/), [Framer Motion](https://www.framer.com/motion/)
- **Backend:** Next.js (API Routes)
- **Inteligência Artificial:** [Groq](https://groq.com/) (Llama 3.1)
- **Autenticação:** [Firebase Authentication](https://firebase.google.com/docs/auth), [Supabase](https://supabase.io/)
- **Banco de Dados:** [Supabase (PostgreSQL)](https://supabase.io/docs/guides/database)
- **APIs Externas:** [Gmail API](https://developers.google.com/gmail/api)

## 🏁 Como Começar

Para executar este projeto localmente, siga os passos abaixo.

### Pré-requisitos

- Node.js (v18 ou superior)
- npm, yarn ou pnpm
- Keys do [Firebase](https://firebase.google.com/)
- Keys do [Supabase](https://supabase.io/)
- API Key do [GroqCloud](https://console.groq.com/)
- Key da API do Google (OAuth 2.0)

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/MailMind.git
    cd MailMind
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    - Renomeie o arquivo `.env.example` para `.env.local`.
    - Preencha as variáveis com as suas chaves do Firebase, Supabase, Groq e Google API.

4.  **Execute o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

5.  **Abra no navegador:**
    Acesse [`http://localhost:3000`](http://localhost:3000) para ver a aplicação em funcionamento.

---

<p align="center">
  Feito com ❤️ por <strong>Cairo74</strong>
</p>
