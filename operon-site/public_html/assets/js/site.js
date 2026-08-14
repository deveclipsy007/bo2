(() => {
  const root = document.documentElement;
  root.classList.add('js');

  const header = document.querySelector('[data-header]');
  const menu = document.querySelector('#site-nav');
  const toggle = document.querySelector('.menu-toggle');
  const syncHeader = () => header?.classList.toggle('is-scrolled', scrollY > 24);
  syncHeader();
  addEventListener('scroll', syncHeader, { passive: true });

  const setMenu = open => {
    toggle?.setAttribute('aria-expanded', String(open));
    menu?.classList.toggle('is-open', open);
    root.classList.toggle('menu-open', open);
    if (toggle) toggle.textContent = open ? 'Fechar' : 'Menu';
  };
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveal = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        reveal.unobserve(entry.target);
      }
    });
  }, { threshold: .16 });
  document.querySelectorAll('.reveal').forEach(element => reduced ? element.classList.add('is-visible') : reveal.observe(element));

  const steps = [...document.querySelectorAll('[data-flow-step]')];
  steps.forEach(step => step.addEventListener('click', () => {
    steps.forEach(item => item.classList.remove('is-active'));
    step.classList.add('is-active');
  }));

  const canvas = document.querySelector('[data-particles]');
  if (!canvas || reduced) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let frame = 0;
  let active = true;
  let width = 0;
  let height = 0;
  let mx = -9999;
  let my = -9999;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(innerWidth < 700 ? 130 : 260, Math.round(width * height / 4500));
    particles = Array.from({ length: count }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      angle: index / count * Math.PI * 2,
      speed: .08 + Math.random() * .16,
      alpha: .08 + Math.random() * .28,
    }));
  };

  const draw = () => {
    if (!active) return;
    ctx.clearRect(0, 0, width, height);
    const cx = width * .73;
    const cy = height * .46;
    const radius = Math.min(width, height) * .31;
    particles.forEach(p => {
      p.angle += p.speed * .006;
      const targetX = cx + Math.cos(p.angle) * radius * (1 + Math.sin(p.angle * 3) * .08);
      const targetY = cy + Math.sin(p.angle) * radius * .72;
      p.x += (targetX - p.x) * .003;
      p.y += (targetY - p.y) * .003;
      const dx = p.x - mx;
      const dy = p.y - my;
      const distance = Math.hypot(dx, dy);
      if (distance < 110 && distance > 0) {
        p.x += dx / distance * 1.5;
        p.y += dy / distance * 1.5;
      }
      ctx.fillStyle = `rgba(244,244,239,${p.alpha})`;
      ctx.fillRect(p.x, p.y, 1.2, 1.2);
    });
    frame = requestAnimationFrame(draw);
  };

  canvas.addEventListener('pointermove', event => {
    const rect = canvas.getBoundingClientRect();
    mx = event.clientX - rect.left;
    my = event.clientY - rect.top;
  });
  canvas.addEventListener('pointerleave', () => { mx = my = -9999; });
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([entry]) => {
    active = entry.isIntersecting && !document.hidden;
    cancelAnimationFrame(frame);
    if (active) draw();
  }).observe(canvas);
  document.addEventListener('visibilitychange', () => {
    active = !document.hidden && canvas.getBoundingClientRect().bottom > 0;
    cancelAnimationFrame(frame);
    if (active) draw();
  });
  resize();
  draw();
})();

(() => {
  const simulator = document.querySelector('[data-harness-simulator]');
  if (!simulator) return;
  const steps = [...simulator.querySelectorAll('[data-sim-step]')];
  const stage = simulator.querySelector('.harness-simulator__stage');
  const title = simulator.querySelector('[data-sim-title]');
  const copy = simulator.querySelector('[data-sim-copy]');
  const event = simulator.querySelector('[data-sim-event]');
  const actor = simulator.querySelector('[data-sim-actor]');
  const counter = simulator.querySelector('[data-sim-counter]');
  const progress = simulator.querySelector('[data-sim-progress]');
  const play = simulator.querySelector('[data-sim-play]');
  const restart = simulator.querySelector('[data-sim-restart]');
  const cards = [...simulator.querySelectorAll('[data-sim-card]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const states = [
    ['Demanda recebida','A solicitação entra identificada e deixa de ser apenas mais uma mensagem solta.','Nova demanda contábil','Entrada'],
    ['Contexto reunido','O sistema conecta cadastro, histórico, regime e documentos antes do trabalho começar.','Contexto do cliente recuperado','Harness'],
    ['Critérios verificados','Checklist, regras e pendências mostram o que pode seguir e o que exige atenção.','Validação operacional concluída','Harness'],
    ['Exceção encontrada','O ponto fora da rotina ganha uma rota própria, sem interromper todo o restante.','Caso fora do fluxo padrão','Exceção'],
    ['Profissional decide','O contador recebe o caso já contextualizado e entra somente onde seu julgamento importa.','Decisão profissional confirmada','Contador responsável'],
    ['Decisão vira memória','Motivo, resposta e nova referência ficam disponíveis para o próximo caso semelhante.','Ciclo operacional atualizado','Sistema + memória']
  ];
  let current = 0, timer, paused = reduced, visible = false;
  const render = index => {
    current = index; stage.dataset.simState = String(index);
    steps.forEach((button, i) => { button.classList.toggle('is-current', i === index); button.setAttribute('aria-selected', String(i === index)); });
    cards.forEach((card, i) => { card.classList.toggle('is-active', i === index); card.classList.toggle('is-complete', i < index); });
    [title.textContent, copy.textContent, event.textContent, actor.textContent] = states[index];
    counter.textContent = `0${index + 1} / 06`; progress.style.width = `${((index + 1) / states.length) * 100}%`;
  };
  const schedule = () => { clearInterval(timer); if (!paused && visible) timer = setInterval(() => render((current + 1) % states.length), 3800); };
  steps.forEach((button, index) => button.addEventListener('click', () => { paused = true; play.textContent = 'Continuar'; play.setAttribute('aria-label','Continuar simulação'); render(index); schedule(); }));
  play.addEventListener('click', () => { paused = !paused; play.textContent = paused ? 'Continuar' : 'Pausar'; play.setAttribute('aria-label', paused ? 'Continuar simulação' : 'Pausar simulação'); schedule(); });
  restart.addEventListener('click', () => { paused = false; play.textContent = 'Pausar'; play.setAttribute('aria-label','Pausar simulação'); render(0); schedule(); });
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }, {threshold:.25}).observe(simulator);
  render(0); schedule();
})();
