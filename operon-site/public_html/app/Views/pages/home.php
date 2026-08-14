<?php
$meta = [
    'title' => 'OPERON — Capacidade para operar além de você',
    'description' => 'A OPERON transforma inteligência dispersa em capacidade operacional para empresas dependerem menos do improviso e da presença constante do fundador.',
];
?>
<section class="hero hero--orbital scene" data-scene="dispersed">
    <video class="hero__orbital-film" autoplay muted loop playsinline preload="metadata" poster="/assets/images/generated/hero-orbit.webp" aria-label="Nanopartículas dispersas entram em órbita e formam uma estrutura">
        <source src="/assets/media/orbital-mobile.webm" type="video/webm">
        <source src="/assets/media/orbital-mobile.mp4" type="video/mp4">
    </video>
    <div class="hero__orbital-veil"></div>
    <div class="hero__minimal wrap">
        <p class="kicker reveal">OPERON — Harness Operacional</p>
        <div class="hero__promise reveal">
            <span>Menos improviso.</span>
            <h1 class="hero__particle-promise">
                <canvas data-fx="vapor" data-words="Mais capacidade" aria-hidden="true"></canvas>
                <span class="sr-only">Mais capacidade.</span>
            </h1>
        </div>
        <p class="hero__definition reveal">Transformamos conhecimento, processos e decisões dispersas em capacidade operacional — conectando pessoas, automações e inteligência artificial.</p>
        <p class="hero__minimal-copy reveal">Sua empresa continua operando — com você na direção, não em cada etapa.</p>
        <a class="button button--light reveal" href="/diagnostico">Descobrir por onde começar</a>
    </div>
    <a class="hero__scroll" href="#tensao"><span>Descer para a operação</span><i></i></a>
</section>

<section class="proof-ribbon" aria-label="Sinais de capacidade operacional">
    <div class="wrap">
        <article><span>01</span><strong>Contexto preservado</strong><p>A informação certa chega antes da decisão.</p></article>
        <article><span>02</span><strong>Recorrência estruturada</strong><p>O trabalho comum segue sem recomeçar.</p></article>
        <article><span>03</span><strong>Direção humana</strong><p>Só a exceção volta para julgamento.</p></article>
    </div>
</section>

<section class="state-shift section wrap" aria-labelledby="state-shift-title">
    <p class="kicker">Antes → Harness → Depois</p>
    <h2 id="state-shift-title">A operação deixa de depender de memória informal.<br><em>Passa a carregar contexto.</em></h2>
    <div class="state-shift__grid">
        <article class="state-shift__before"><span>Antes</span><h3>Conhecimento disperso</h3><ul><li>Preço na cabeça de alguém</li><li>Exceções perdidas em conversas</li><li>Decisões começando do zero</li></ul></article>
        <article class="state-shift__core"><span>Harness Operacional</span><h3>A camada que conecta</h3><p>Contexto, critérios, processos, ferramentas, memória e revisão humana trabalhando como um sistema legível.</p><canvas data-fx="morph" data-shapes="ruido|rede|camadas" data-hold="2600" aria-hidden="true"></canvas></article>
        <article class="state-shift__after"><span>Depois</span><h3>Capacidade rastreável</h3><ul><li>Informação antes da decisão</li><li>Rotina continua, exceção sobe</li><li>Cada ciclo melhora o próximo</li></ul></article>
    </div>
</section>

<section class="manifesto scene" aria-label="Da dependência à capacidade">
    <div class="manifesto__track">
        <p>O que está só na sua cabeça</p>
        <span aria-hidden="true">→</span>
        <p>vira capacidade da empresa.</p>
    </div>
</section>

<section class="kinetic-chapter scene" data-kinetic-chapter>
    <img src="/assets/images/generated-v2/operational-flow.webp" alt="Fluxos de nanopartículas convergem em uma estrutura operacional" width="1920" height="1080" loading="lazy">
    <div class="kinetic-chapter__shade"></div>
    <canvas class="semantic-morph semantic-morph--flow" data-fx="morph" data-shapes="ruido|seta|rede" data-hold="4200" aria-hidden="true"></canvas>
    <div class="kinetic-chapter__copy wrap">
        <p class="kicker">Inteligência não falta. Falta estrutura.</p>
        <h2>O que hoje está<br><span>espalhado</span><br>precisa aprender<br>a trabalhar <em>junto.</em></h2>
        <p>Conversas, decisões, planilhas, repertório, processos e ferramentas deixam de ser ilhas e passam a compor um sistema operacional legível.</p>
    </div>
</section>

<section class="particle-triad section wrap scene">
    <div class="particle-triad__intro">
        <p class="kicker">Três mudanças de estado</p>
        <h2>Conhecimento só vira ativo quando ganha forma.</h2>
    </div>
    <div class="particle-triad__words">
        <article><span>01 / saber o que importa</span><canvas data-fx="morph" data-shapes="pasta" aria-hidden="true"></canvas><h3>Contexto</h3><p>A informação certa chega antes da decisão — não depois do erro.</p></article>
        <article><span>02 / decidir sem adivinhar</span><canvas data-fx="morph" data-shapes="exclamacao" aria-hidden="true"></canvas><h3>Critério</h3><p>O recorrente segue uma lógica. Só a exceção pede julgamento humano.</p></article>
        <article><span>03 / não reaprender</span><canvas data-fx="morph" data-shapes="cerebro" aria-hidden="true"></canvas><h3>Memória</h3><p>Cada ciclo preserva decisões, sinais e aprendizados para o próximo.</p></article>
    </div>
</section>

<section id="tensao" class="tension section wrap scene" data-scene="converging">
    <canvas class="semantic-morph semantic-morph--tension" data-fx="morph" data-shapes="balao|cerebro|camadas" data-hold="4600" aria-hidden="true"></canvas>
    <div class="section__intro">
        <p class="kicker">Você virou a infraestrutura</p>
        <h2>Quando tudo passa por você, a empresa aprende a <em>depender de você.</em></h2>
    </div>
    <div class="signal-list">
        <?php foreach ([
            ['01', 'Uma proposta esperando seu preço.'],
            ['02', 'Um cliente esperando sua exceção.'],
            ['03', 'Um time esperando sua palavra final.'],
            ['04', 'Uma informação que só aparece quando perguntam para você.'],
        ] as [$number, $copy]): ?>
            <article class="signal reveal"><span><?= $number ?></span><p><?= htmlspecialchars($copy) ?></p><i aria-hidden="true"></i></article>
        <?php endforeach; ?>
    </div>
    <p class="statement reveal">O heroísmo parece eficiência porque resolve o agora. Mas ensina a operação a voltar sempre para a mesma pessoa.</p>
</section>

<section id="harness" class="harness section scene" data-scene="layered">
    <img class="harness__image" src="/assets/images/generated-v2/memory-layers.webp" alt="Camadas de nanopartículas preservam a memória operacional" width="1920" height="1080" loading="lazy">
    <canvas class="semantic-morph semantic-morph--harness" data-fx="morph" data-shapes="blocos|engrenagem|orbita" data-hold="4800" aria-hidden="true"></canvas>
    <div class="wrap harness__content">
        <p class="kicker">O que é um Harness Operacional</p>
        <h2>Não é uma automação solta.<br>É a estrutura que faz as partes <em>trabalharem juntas.</em></h2>
        <p class="section-copy">Um Harness organiza o que a empresa sabe, define como decisões acontecem e conecta pessoas, processos e tecnologia para o trabalho recorrente ganhar contexto, rastro e direção.</p>
        <ol class="layer-list">
            <li><span>01</span><strong>Contexto</strong><p>O que precisa ser conhecido para agir bem.</p></li>
            <li><span>02</span><strong>Processos</strong><p>Como o trabalho realmente acontece.</p></li>
            <li><span>03</span><strong>Critérios</strong><p>Como a decisão deixa de voltar toda vez.</p></li>
            <li><span>04</span><strong>Fluxos</strong><p>Como pessoas, informação e ferramentas se conectam.</p></li>
            <li><span>05</span><strong>Memória</strong><p>O que a empresa não pode reaprender do zero.</p></li>
        </ol>
    </div>
</section>

<section class="autonomy-scene scene">
    <img src="/assets/images/generated-v2/autonomy-core.webp" alt="Núcleo de partículas organiza fluxos contínuos" width="1920" height="1080" loading="lazy">
    <div class="autonomy-scene__veil"></div>
    <div class="autonomy-scene__content wrap">
        <p class="kicker">O ponto de chegada</p>
        <canvas data-fx="vapor" data-words="Autonomia|Ritmo|Direção" aria-hidden="true"></canvas>
        <h2>A operação continua.<br>Você escolhe <em>onde entrar.</em></h2>
        <p>Capacidade não elimina pessoas. Elimina a obrigação de uma pessoa sustentar tudo o tempo todo.</p>
        <a class="text-link" href="/capacidades">Ver capacidades <span>↗</span></a>
    </div>
</section>

<section class="demo section wrap scene" data-scene="flowing">
    <div class="section__intro section__intro--split">
        <div><p class="kicker">Uma capacidade em operação</p><h2>Uma proposta não deveria começar do zero — nem terminar sempre em você.</h2></div>
        <p class="section-copy">Demonstração ilustrativa de como um Harness pode transformar uma recorrência comercial em capacidade rastreável.</p>
    </div>
    <div class="flow" data-flow>
        <?php foreach ([
            ['Entrada', 'Briefing e histórico chegam organizados.'],
            ['Contexto', 'O sistema recupera cliente, escopo e decisões anteriores.'],
            ['Critérios', 'Preço, limites e exceções ficam explícitos.'],
            ['Preparo', 'A equipe recebe uma proposta consistente para revisar.'],
            ['Humano', 'Somente o que exige julgamento volta para decisão.'],
            ['Memória', 'A decisão alimenta o próximo ciclo.'],
        ] as $index => [$title, $copy]): ?>
            <button class="flow__step<?= $index === 0 ? ' is-active' : '' ?>" type="button" data-flow-step="<?= $index ?>">
                <span><?= str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT) ?></span><strong><?= $title ?></strong><small><?= $copy ?></small>
            </button>
        <?php endforeach; ?>
        <div class="flow__line" aria-hidden="true"><i></i></div>
    </div>
</section>

<section class="method section scene" data-scene="review">
    <div class="wrap">
        <p class="kicker">Tecnologia entra depois que a operação faz sentido</p>
        <h2>Primeiro encontramos o nó.<br>Depois construímos a capacidade.</h2>
        <div class="method__grid">
            <?php foreach ([
                ['Diagnosticar', 'Ver a operação real, suas dependências e o lugar onde ela para.'],
                ['Estruturar', 'Organizar contexto, processos, responsáveis, critérios e limites.'],
                ['Aplicar', 'Conectar ferramentas, integrações, automações, skills e agentes.'],
                ['Evoluir', 'Revisar sinais, preservar memória e ampliar somente o que funciona.'],
            ] as $index => [$title, $copy]): ?>
                <article class="method__item reveal"><span>0<?= $index + 1 ?></span><h3><?= $title ?></h3><p><?= $copy ?></p></article>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<section class="human section scene" data-scene="human">
    <img src="/assets/images/generated/human-direction.webp" alt="Empresário em momento silencioso de pensamento e direção" width="1600" height="853" loading="lazy">
    <div class="human__veil"></div>
    <div class="wrap human__content">
        <p class="kicker">Humanos mantêm a direção</p>
        <h2>Sua empresa não precisa de menos de você.<br><em>Precisa depender menos do seu operacional.</em></h2>
        <p>A estrutura cuida da recorrência. O julgamento, a responsabilidade e o futuro continuam humanos.</p>
    </div>
</section>

<section class="operational-case section">
    <div class="wrap operational-case__head"><div><p class="kicker">Case validado · Luiz Contabilidade</p><span class="case-disclosure">Estrutura operacional aplicada em um escritório de contabilidade.</span></div><h2>Da demanda dispersa<br><em>ao contexto pronto para decisão.</em></h2></div>
    <figure class="wrap operational-case__artifact"><img src="/assets/images/generated-v3/operational-case-system.webp" alt="Sistema operacional demonstrativo conecta solicitação, contexto, critérios, revisão humana e memória" width="1920" height="1080" loading="lazy"><figcaption><span>Entrada dispersa</span><span>Contexto + critérios</span><span>Revisão humana</span><span>Memória preservada</span></figcaption></figure>
    <div class="wrap operational-case__story">
        <article><span>01 · Contexto</span><h3>Onde a operação parava</h3><p>Demandas chegavam com informações espalhadas. Histórico, documentos e particularidades precisavam ser reconstruídos antes da ação.</p></article>
        <article><span>02 · Sistema desenhado</span><h3>O que ganhou forma</h3><p>Entrada organizada, contexto do cliente, critérios operacionais, pendências explícitas e uma rota própria para exceções.</p></article>
        <article><span>03 · Capacidade validada</span><h3>O que passou a continuar</h3><p>A estrutura prepara o caso com contexto. O profissional contábil recebe a exceção no ponto em que seu julgamento é necessário.</p></article>
    </div>
    <div class="wrap operational-case__signals"><span><b>Contexto</b> recuperado antes da ação</span><span><b>Critérios</b> visíveis para revisão</span><span><b>Exceções</b> encaminhadas ao humano</span><span><b>Memória</b> alimentada a cada ciclo</span></div>
</section>

<section class="harness-simulator section" data-harness-simulator>
    <div class="wrap harness-simulator__intro"><div><p class="kicker">Simulação interativa</p><h2>Veja um Harness<br><em>pensar a recorrência.</em></h2></div><p>Avance pelas etapas ou deixe a simulação rodar. O trabalho comum segue; somente a exceção sobe para decisão humana.</p></div>
    <div class="wrap harness-simulator__shell">
        <div class="harness-simulator__top"><span>FLUXO REAL · LUIZ CONTABILIDADE</span><div><button type="button" data-sim-play aria-label="Pausar simulação">Pausar</button><button type="button" data-sim-restart>Reiniciar</button></div></div>
        <div class="harness-simulator__stage" data-sim-state="0">
            <div class="sim-flow-board" aria-hidden="true">
                <article class="sim-flow-card" data-sim-card="0"><span>Entrada</span><b>Nova demanda contábil</b><small>Cliente enviou solicitação</small><i>Recebido agora</i></article>
                <article class="sim-flow-card" data-sim-card="1"><span>Contexto</span><b>Cliente identificado</b><small>Histórico + regime + documentos</small><i>3 fontes conectadas</i></article>
                <article class="sim-flow-card" data-sim-card="2"><span>Critérios</span><b>Checklist aplicado</b><small>Regras e pendências verificadas</small><i>1 ponto fora da rota</i></article>
                <article class="sim-flow-card sim-flow-card--exception" data-sim-card="3"><span>Alerta</span><b>Exceção encontrada</b><small>Caso exige leitura profissional</small><i>Rotina pausada aqui</i></article>
                <article class="sim-flow-card sim-flow-card--human" data-sim-card="4"><span>Humano</span><b>Contador responsável</b><small>Recebe contexto para decidir</small><i>Decisão confirmada</i></article>
                <article class="sim-flow-card" data-sim-card="5"><span>Memória</span><b>Decisão registrada</b><small>Motivo e nova referência salvos</small><i>Próximo ciclo atualizado</i></article>
                <div class="sim-flow-line"><i></i></div><span class="sim-flow-pulse"></span>
            </div>
            <div class="sim-status" aria-live="polite"><span data-sim-counter>01 / 06</span><h3 data-sim-title>Solicitação recebida</h3><p data-sim-copy>O pedido entra com origem, responsável e objetivo identificados.</p><dl><div><dt>Evento</dt><dd data-sim-event>Briefing comercial recebido</dd></div><div><dt>Ator</dt><dd data-sim-actor>Sistema</dd></div></dl></div>
        </div>
        <div class="harness-simulator__steps" role="tablist" aria-label="Etapas da simulação">
            <?php foreach ([['Solicitação','A entrada ganha forma.'],['Contexto','Histórico e memória chegam.'],['Critérios','Limites orientam a ação.'],['Exceção','O incomum muda de rota.'],['Humano','Julgamento entra no ponto certo.'],['Memória','A decisão melhora o próximo ciclo.']] as $i => [$title,$copy]): ?><button type="button" role="tab" aria-selected="<?= $i === 0 ? 'true' : 'false' ?>" class="<?= $i === 0 ? 'is-current' : '' ?>" data-sim-step="<?= $i ?>"><span>0<?= $i + 1 ?></span><strong><?= $title ?></strong><small><?= $copy ?></small></button><?php endforeach; ?>
        </div>
        <div class="harness-simulator__progress" aria-hidden="true"><i data-sim-progress></i></div>
    </div>
</section>

<section class="objections section wrap">
    <p class="kicker">O que a Operon não faz</p>
    <h2>Estrutura antes da ferramenta.<br><em>Clareza antes da escala.</em></h2>
    <div class="objection-grid">
        <article><span>01</span><h3>Não substitui pessoas</h3><p>Retira delas a obrigação de sustentar toda recorrência na memória.</p></article>
        <article><span>02</span><h3>Não exige trocar tudo</h3><p>Primeiro entendemos o que já existe e conectamos somente o que faz sentido.</p></article>
        <article><span>03</span><h3>Não automatiza o caos</h3><p>O nó é revelado, os critérios ganham forma e só então a tecnologia entra.</p></article>
    </div>
</section>

<section class="outcome section wrap scene" data-scene="orbit">
    <p class="kicker">O que a estrutura devolve</p>
    <div class="outcome__words">
        <span>Clareza para pensar.</span>
        <span>Ritmo para operar.</span>
        <span>Autonomia para decidir.</span>
        <span>Tempo para escolher onde estar.</span>
    </div>
</section>

<section class="final-cta section wrap">
    <p class="kicker">O próximo passo não é automatizar tudo</p>
    <h2>Comece pelo lugar onde a empresa <em>para.</em></h2>
    <p>Conte onde o trabalho costuma parar. A Operon organiza o contexto, avalia a aderência e indica a melhor forma de aprofundar.</p>
    <a class="button button--light" href="/diagnostico">Conversar sobre minha operação</a>
    <small class="cta-assurance">Sem preparação complexa. Primeiro entendemos o contexto; depois propomos a conversa certa.</small>
</section>
