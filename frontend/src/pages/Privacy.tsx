import { LegalLayout } from '../layouts/LegalLayout';
import { LegalSection } from '../components/LegalSection';

export function Privacy() {
  return (
    <LegalLayout title="Política de Privacidade" updatedAt="10 de Setembro de 2026">
      <LegalSection title="1. Quem somos">
        <p>
          A XKWANZA é uma plataforma digital angolana que liga compradores, produtores, comerciantes e
          transportadores, e acompanha a evolução económica dos seus utilizadores — do comércio à
          formalização. Esta política explica que dados pessoais recolhemos, para quê, e quais os teus
          direitos sobre eles.
        </p>
      </LegalSection>

      <LegalSection title="2. Dados que recolhemos">
        <p>Recolhemos apenas os dados necessários para a plataforma funcionar:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Conta:</strong> nome, telefone, email (opcional), palavra-passe (guardada apenas em forma
            de hash — nunca em texto simples), província, município e perfil (comprador, produtor,
            comerciante, transportador).
          </li>
          <li>
            <strong>Actividade:</strong> produtos publicados, pedidos, moradas de entrega, pedidos de
            transporte e respectivo estado.
          </li>
          <li>
            <strong>Pagamentos:</strong> estado de pagamentos, saldo de carteira e dados de contas bancárias
            que adiciones para receber levantamentos.
          </li>
          <li>
            <strong>Histórico económico e formalização:</strong> indicadores de vendas/rendimento, respostas ao
            diagnóstico de formalização, documentos que submetas nesse processo.
          </li>
          <li>
            <strong>INSS:</strong> apenas se deres consentimento explícito nessa secção da app — ver ponto 6.
          </li>
          <li>
            <strong>Técnicos:</strong> endereço IP e registos de acesso, usados para segurança (ex: limitar
            tentativas de login) e auditoria interna.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Para que usamos os teus dados">
        <p>
          Usamos os teus dados para: criar e gerir a tua conta; processar compras, vendas e pedidos de
          transporte; calcular o teu histórico económico e nível de confiança na plataforma; conduzir o
          processo de formalização que escolheres iniciar; e manter a plataforma segura (prevenção de fraude e
          abuso).
        </p>
        <p>Não vendemos os teus dados pessoais a terceiros, nem os usamos para publicidade de terceiros.</p>
      </LegalSection>

      <LegalSection title="4. Com quem partilhamos dados">
        <p>
          Os dados de um pedido (nome, morada, contacto) são partilhados apenas com a contraparte necessária
          para o cumprir — o vendedor, o comprador ou o transportador envolvidos nesse pedido específico. A
          equipa de suporte/administração da XKWANZA pode aceder a dados de pagamentos e pedidos para
          confirmar transacções e responder a problemas (ver ponto 5). Não partilhamos os teus dados com
          entidades externas para fins comerciais.
        </p>
      </LegalSection>

      <LegalSection title="5. Pagamentos — XKWANZA Protect">
        <p>
          Nesta fase, a confirmação de pagamentos é feita manualmente pela nossa equipa de suporte: quando
          marcas um pagamento como enviado, um membro da equipa confirma-o depois de verificar o extracto
          bancário correspondente. A plataforma ainda não está ligada automaticamente a nenhum banco ou
          serviço de pagamento — por isso os dados que introduzes em contas bancárias são usados apenas para
          processar os teus levantamentos manualmente.
        </p>
      </LegalSection>

      <LegalSection title="6. INSS — dados de protecção social">
        <p>
          A secção INSS da plataforma funciona actualmente em modo <strong>sandbox/simulação</strong>: os
          dados que aí introduzas (com o teu consentimento explícito) são usados apenas para calcular
          simulações e preparar o teu processo dentro da XKWANZA. Não existe, nesta fase, qualquer envio
          automático desses dados ao INSS ou a outra entidade governamental — isso só acontecerá após um
          acordo institucional formal, e seremos claros na app quando isso mudar.
        </p>
      </LegalSection>

      <LegalSection title="7. Quanto tempo guardamos os teus dados">
        <p>
          Guardamos os dados da tua conta enquanto esta estiver activa. Se pedires o encerramento da conta,
          eliminamos ou anonimizamos os dados pessoais que não sejamos legalmente obrigados a conservar (por
          exemplo, registos de transacções, para efeitos fiscais/contabilísticos).
        </p>
      </LegalSection>

      <LegalSection title="8. Segurança">
        <p>
          As palavras-passe são guardadas com hash (argon2), as ligações usam HTTPS, e o acesso à API é
          protegido por tokens com expiração curta e limitação de tentativas (rate limiting) em rotas
          sensíveis como o login. Nenhum sistema é 100% seguro — se identificares uma falha de segurança,
          contacta-nos imediatamente (ver ponto 13).
        </p>
      </LegalSection>

      <LegalSection title="9. Os teus direitos">
        <p>
          Podes, a qualquer momento, pedir acesso aos teus dados, a sua correcção, ou o encerramento da tua
          conta e eliminação dos teus dados pessoais (sujeito às excepções legais do ponto 7). Para exercer
          estes direitos, contacta o suporte (ponto 13).
        </p>
      </LegalSection>

      <LegalSection title="10. Cookies e armazenamento local">
        <p>
          A XKWANZA não usa cookies de publicidade nem de terceiros. Usamos apenas armazenamento local do
          teu browser (<code>localStorage</code>) para manter a tua sessão iniciada entre visitas.
        </p>
      </LegalSection>

      <LegalSection title="11. Menores de idade">
        <p>A plataforma destina-se a maiores de 18 anos, capazes de contratar nos termos da lei angolana.</p>
      </LegalSection>

      <LegalSection title="12. Alterações a esta política">
        <p>
          Podemos actualizar esta política à medida que a plataforma evolui. Alterações relevantes serão
          assinaladas na app.
        </p>
      </LegalSection>

      <LegalSection title="13. Contacto">
        <p>Para questões sobre privacidade ou para exercer os teus direitos, contacta o suporte XKWANZA.</p>
      </LegalSection>
    </LegalLayout>
  );
}
