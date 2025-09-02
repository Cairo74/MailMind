import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos de Uso - MailMind',
  description: 'Leia os termos e condições para usar o MailMind.',
};

export default function TermsPage() {
  return (
    <article className="prose prose-gray dark:prose-invert max-w-3xl mx-auto">
      <h1>Termos de Uso</h1>
      <p className="text-muted-foreground">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
      
      <p>
        Bem-vindo ao MailMind. Ao usar nosso serviço, você concorda em cumprir estes Termos de Uso. Por favor, leia-os com atenção.
      </p>

      <h2>1. Uso do Serviço</h2>
      <p>
        Você concorda em usar o MailMind apenas para fins lícitos e de acordo com estes Termos. Você é responsável por todas as atividades que ocorrem em sua conta.
      </p>

      <h2>2. Contas de Usuário</h2>
      <p>
        Para acessar certas funcionalidades, você deve se registrar e criar uma conta. Você concorda em fornecer informações precisas e completas e em manter essas informações atualizadas. Você é responsável por proteger sua senha e por qualquer uso não autorizado de sua conta.
      </p>

      <h2>3. Direitos de Propriedade Intelectual</h2>
      <p>
        O Serviço e seu conteúdo original, recursos e funcionalidades são e permanecerão propriedade exclusiva do MailMind e de seus licenciadores.
      </p>

      <h2>4. Conteúdo do Usuário</h2>
      <p>
        Ao conectar sua conta de e-mail, você nos concede permissão para acessar e processar seus e-mails com o único propósito de fornecer os recursos do MailMind. Não reivindicamos propriedade sobre seu conteúdo e garantimos que seus dados serão tratados de acordo com nossa Política de Privacidade.
      </p>

      <h2>5. Rescisão</h2>
      <p>
        Podemos rescindir ou suspender seu acesso ao nosso Serviço imediatamente, sem aviso prévio ou responsabilidade, por qualquer motivo, incluindo, sem limitação, se você violar os Termos.
      </p>

      <h2>6. Limitação de Responsabilidade</h2>
      <p>
        Em nenhuma circunstância o MailMind, nem seus diretores, funcionários, parceiros ou agentes, serão responsáveis por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos resultantes do seu acesso ou uso do Serviço.
      </p>

      <h2>7. Alterações nos Termos</h2>
      <p>
        Reservamo-nos o direito, a nosso exclusivo critério, de modificar ou substituir estes Termos a qualquer momento. Notificaremos sobre quaisquer alterações, atualizando a data da "Última atualização" destes Termos.
      </p>

      <h2>8. Contato</h2>
      <p>
        Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco.
      </p>
    </article>
  );
}
