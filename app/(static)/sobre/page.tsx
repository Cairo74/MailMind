import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sobre Nós - MailMind',
  description: 'Saiba mais sobre a missão e a equipe por trás do MailMind.',
};

export default function AboutPage() {
  return (
    <article className="prose prose-gray dark:prose-invert max-w-3xl mx-auto">
      <h1>Sobre Nós</h1>
      <p className="lead">
        Bem-vindo ao MailMind, onde nossa missão é revolucionar a forma como você gerencia seus e-mails, transformando o caos da caixa de entrada em clareza e produtividade.
      </p>

      <h2>Nossa História</h2>
      <p>
        O MailMind nasceu da frustração pessoal de seus fundadores com a sobrecarga de e-mails. Passávamos horas todos os dias tentando organizar, priorizar e responder a um fluxo interminável de mensagens. Sabíamos que deveria haver uma maneira melhor. Com a paixão por tecnologia e um desejo de resolver problemas reais, nos propusemos a criar uma solução inteligente que fizesse o trabalho pesado para nós.
      </p>

      <h2>Nossa Visão</h2>
      <p>
        Nossa visão é criar um futuro onde a comunicação por e-mail seja eficiente, inteligente e livre de estresse. Acreditamos que a inteligência artificial pode ser uma aliada poderosa na automação de tarefas repetitivas, permitindo que as pessoas se concentrem no que realmente importa: conectar-se, criar e colaborar.
      </p>

      <h2>O Que Fazemos</h2>
      <p>
        Utilizamos modelos de IA de última geração para analisar e classificar automaticamente seus e-mails. Nossa plataforma pode:
      </p>
      <ul>
        <li><strong>Classificar e-mails</strong> em categorias como Trabalho, Pessoal, Promoções e Notificações.</li>
        <li><strong>Resumir o conteúdo</strong> de longas conversas para que você entenda o essencial rapidamente.</li>
        <li><strong>Identificar e extrair informações importantes</strong>, como datas, contatos e tarefas.</li>
        <li><strong>Ajudar a redigir respostas</strong> com o tom e o conteúdo adequados.</li>
      </ul>

      <h2>Nossa Equipe</h2>
      <p>
        Somos uma equipe dedicada de engenheiros, designers e entusiastas da produtividade, unidos pelo objetivo de construir uma ferramenta que amamos usar todos os dias. Estamos comprometidos com a inovação contínua e com a privacidade e segurança dos seus dados.
      </p>

      <p>
        Obrigado por se juntar a nós nesta jornada. Estamos animados para ver como o MailMind irá transformar sua experiência com e-mails.
      </p>
    </article>
  );
}
