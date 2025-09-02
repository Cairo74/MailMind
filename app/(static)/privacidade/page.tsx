import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidade - MailMind',
  description: 'Entenda como o MailMind coleta, usa e protege seus dados.',
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-gray dark:prose-invert max-w-3xl mx-auto">
      <h1>Política de Privacidade</h1>
      <p className="text-muted-foreground">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

      <p>
        Esta Política de Privacidade descreve nossas políticas sobre a coleta, uso e divulgação de suas informações quando você usa o Serviço MailMind.
      </p>

      <h2>1. Coleta e Uso de Informações</h2>
      <p>
        Coletamos várias informações para fornecer e melhorar nosso Serviço para você.
      </p>
      <ul>
        <li><strong>Dados Pessoais:</strong> Ao criar uma conta, podemos solicitar que você nos forneça informações de identificação pessoal, como seu nome e endereço de e-mail.</li>
        <li><strong>Dados de E-mail:</strong> Para fornecer os recursos principais, nosso serviço acessa o conteúdo de seus e-mails (cabeçalhos, corpo e metadados). Esses dados são processados para fins de classificação, resumo e extração de entidades, e não são armazenados permanentemente em nossos servidores, exceto por metadados de classificação em cache para melhorar o desempenho.</li>
      </ul>

      <h2>2. Segurança dos Dados</h2>
      <p>
        A segurança de seus dados é extremamente importante para nós. Usamos tokens de autenticação seguros (OAuth 2.0) para acessar sua conta de e-mail e todas as comunicações são criptografadas usando SSL/TLS. No entanto, lembre-se de que nenhum método de transmissão pela Internet ou método de armazenamento eletrônico é 100% seguro.
      </p>

      <h2>3. Compartilhamento de Dados</h2>
      <p>
        Não vendemos, trocamos ou alugamos suas informações de identificação pessoal a terceiros. Os dados de e-mail são processados por APIs de IA de terceiros (como Groq) para fornecer os recursos de classificação e resumo. Exigimos que esses terceiros mantenham a confidencialidade de suas informações.
      </p>

      <h2>4. Seus Direitos</h2>
      <p>
        Você tem o direito de acessar, atualizar ou excluir suas informações pessoais a qualquer momento através das configurações de sua conta. Você também pode revogar nosso acesso à sua conta de e-mail a qualquer momento através das configurações de segurança do seu provedor de e-mail (por exemplo, Google).
      </p>

      <h2>5. Alterações nesta Política de Privacidade</h2>
      <p>
        Podemos atualizar nossa Política de Privacidade de tempos em tempos. Notificaremos sobre quaisquer alterações publicando a nova Política de Privacidade nesta página.
      </p>

      <h2>6. Contato</h2>
      <p>
        Se você tiver alguma dúvida sobre esta Política de Privacidade, entre em contato conosco.
      </p>
    </article>
  );
}
