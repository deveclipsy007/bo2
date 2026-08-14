<?php $meta = ['title' => 'Diagnóstico Operacional — OPERON', 'description' => 'Mapeie o lugar onde sua empresa mais depende do improviso ou do fundador.']; ?>
<section class="diagnostic wrap">
    <div class="diagnostic__intro">
        <p class="kicker">Diagnóstico Operacional</p>
        <h1>Antes de automatizar, encontre o lugar onde a empresa <em>para.</em></h1>
        <p>Compartilhe o ponto onde o trabalho costuma parar. Organizamos o contexto, avaliamos a aderência e indicamos a melhor forma de aprofundar.</p>
        <ul><li>Mapa inicial do gargalo</li><li>Hipóteses de causa</li><li>Próximo passo recomendado</li><li>Limites que ainda precisam ser verificados</li></ul>
        <div class="diagnostic-steps"><span><b>01</b>Você envia o contexto</span><span><b>02</b>A Operon avalia a aderência</span><span><b>03</b>Propomos a conversa certa</span></div>
    </div>
    <form class="diagnostic-form" method="post" action="/diagnostico" data-form>
        <?php if (!empty($flash)): ?><p class="form-flash form-flash--<?= htmlspecialchars($flash['type']) ?>" role="status"><?= htmlspecialchars($flash['message']) ?></p><?php endif; ?>
        <input type="hidden" name="csrf" value="<?= htmlspecialchars($csrf ?? '') ?>">
        <label>Seu nome<input name="name" autocomplete="name" required maxlength="160"></label>
        <label>E-mail de trabalho<input type="email" name="email" autocomplete="email" required maxlength="254"></label>
        <label>Empresa<input name="company" autocomplete="organization" required maxlength="180"></label>
        <label>Onde a operação mais depende de você?<textarea name="bottleneck" required minlength="20" maxlength="3000" rows="6" placeholder="Ex.: propostas esperam meu preço, exceções de clientes voltam para mim e o time não encontra decisões anteriores."></textarea></label>
        <label class="honeypot" aria-hidden="true">Site<input name="website" tabindex="-1" autocomplete="off"></label>
        <label class="consent"><input type="checkbox" name="consent" value="1" required><span>Autorizo o contato da OPERON sobre este diagnóstico.</span></label>
        <button class="button button--light" type="submit">Quero uma leitura inicial do gargalo</button>
        <p class="form-note">Analisamos cada contexto antes do contato. Seus dados serão usados somente para esta conversa com a OPERON.</p>
    </form>
</section>
