import { LegalLayout } from '../layouts/LegalLayout';
import { LegalSection } from '../components/LegalSection';

export function Terms() {
  return (
    <LegalLayout title="Termos de Uso" updatedAt="10 de Setembro de 2026">
      <LegalSection title="1. Aceitação">
        <p>
          Ao criar uma conta ou usar a plataforma XKWANZA, aceitas estes Termos de Uso e a nossa Política de
          Privacidade. Se não concordares, não deves usar a plataforma.
        </p>
      </LegalSection>

      <LegalSection title="2. O que é o XKWANZA">
        <p>
          O XKWANZA é uma plataforma digital que liga compradores, produtores, comerciantes e transportadores
          em Angola, e acompanha a evolução da tua actividade económica — do comércio à formalização e
          protecção social. A XKWANZA actua como intermediária: não é o vendedor, comprador nem transportador
          de nenhum produto ou serviço listado por terceiros.
        </p>
      </LegalSection>

      <LegalSection title="3. Contas">
        <p>
          Deves ter pelo menos 18 anos e fornecer dados verdadeiros no registo. És responsável por manter a
          tua palavra-passe em segurança e por toda a actividade realizada a partir da tua conta.
        </p>
      </LegalSection>

      <LegalSection title="4. Perfis e responsabilidades">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Compradores</strong> são responsáveis por verificar os produtos antes de comprar e por
            cumprir as condições de pagamento e entrega acordadas.
          </li>
          <li>
            <strong>Produtores e comerciantes</strong> são responsáveis pela veracidade das suas descrições de
            produto, preços, e pelo cumprimento dos pedidos aceites.
          </li>
          <li>
            <strong>Transportadores</strong> são responsáveis pela recolha e entrega segura dos pedidos que
            aceitem transportar.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Pagamentos — XKWANZA Protect">
        <p>
          Nesta fase, os pagamentos funcionam por confirmação manual: o comprador marca que efectuou o
          pagamento, e a equipa de suporte confirma-o após verificar o extracto bancário correspondente. A
          XKWANZA <strong>ainda não está ligada a nenhum banco ou gateway de pagamento</strong> — pelo que a
          confirmação pode demorar, e é da responsabilidade do utilizador guardar comprovativo da sua
          transferência. A XKWANZA reserva-se o direito de recusar ou reverter uma confirmação de pagamento
          em caso de suspeita de fraude.
        </p>
      </LegalSection>

      <LegalSection title="6. Transporte e entregas">
        <p>
          Os pedidos de transporte, propostas e confirmações por código (OTP) servem para reduzir o risco de
          entregas erradas ou disputadas, mas não eliminam a responsabilidade das partes envolvidas em
          combinar correctamente local, prazo e condições de entrega.
        </p>
      </LegalSection>

      <LegalSection title="7. Formalização e INSS">
        <p>
          As funcionalidades de formalização (diagnóstico, dossiê, documentos) ajudam-te a organizar o teu
          processo, mas <strong>não substituem</strong> os procedimentos oficiais junto das entidades
          angolanas competentes. A secção INSS funciona em modo sandbox/simulação: os cálculos e estados
          apresentados são estimativas internas da XKWANZA, e não constituem, nesta fase, um registo oficial
          junto do INSS nem de qualquer entidade governamental.
        </p>
      </LegalSection>

      <LegalSection title="8. Conduta proibida">
        <p>
          Não é permitido: publicar produtos ilegais ou enganosos; contornar os mecanismos de pagamento e
          confirmação da plataforma para prejudicar outra parte; assediar ou ameaçar outros utilizadores;
          tentar aceder sem autorização a contas ou dados de terceiros; ou usar a plataforma para lavagem de
          dinheiro ou outra actividade ilícita.
        </p>
      </LegalSection>

      <LegalSection title="9. Propriedade intelectual">
        <p>
          A marca, o logótipo e o design da XKWANZA pertencem à XKWANZA. O conteúdo que publicas (fotos,
          descrições de produto) continua teu, mas concedes à XKWANZA licença para o exibir na plataforma no
          âmbito normal do serviço.
        </p>
      </LegalSection>

      <LegalSection title="10. Limitação de responsabilidade">
        <p>
          A XKWANZA disponibiliza a plataforma "tal como está". Não garantimos disponibilidade
          ininterrupta, nem somos responsáveis por disputas entre compradores, vendedores e transportadores
          fora do que estiver directamente sob o nosso controlo (ex: confirmação manual de pagamentos).
        </p>
      </LegalSection>

      <LegalSection title="11. Suspensão e encerramento de conta">
        <p>
          Podemos suspender ou encerrar contas que violem estes termos, sem prejuízo de outras medidas
          legalmente disponíveis. Podes encerrar a tua conta a qualquer momento contactando o suporte.
        </p>
      </LegalSection>

      <LegalSection title="12. Alterações a estes termos">
        <p>
          Podemos actualizar estes termos à medida que a plataforma evolui. Alterações relevantes serão
          assinaladas na app.
        </p>
      </LegalSection>

      <LegalSection title="13. Lei aplicável">
        <p>Estes termos regem-se pela lei angolana.</p>
      </LegalSection>

      <LegalSection title="14. Contacto">
        <p>Para questões sobre estes termos, contacta o suporte XKWANZA.</p>
      </LegalSection>
    </LegalLayout>
  );
}
