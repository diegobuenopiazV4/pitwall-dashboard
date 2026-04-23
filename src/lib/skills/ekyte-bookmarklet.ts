/**
 * Gera HTML com bookmarklet arrastavel para criar tasks no Ekyte (mkt.lab V4 Company).
 */

interface Task {
  titulo: string;
  briefing: string;
  prioridade: 'P1' | 'P2' | 'P3';
  tipo: string;
}

interface Props {
  clientName: string;
  month: string;
  tasks: Task[];
}

/**
 * Codigo do bookmarklet que roda no Ekyte/mkt.lab.
 * Injeta tasks via UI simulando cliques.
 */
function bookmarkletCode(tasksJson: string): string {
  // Mantenha tudo em 1 linha JS minificada para funcionar como href="javascript:..."
  return `(function(){
try {
  var TASKS = JSON.parse(atob('${btoa(tasksJson)}'));
  if (!TASKS || !TASKS.length) { alert('Nenhuma task no bookmarklet'); return; }

  function wait(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
  function find(sel){ return document.querySelector(sel); }
  function fire(el, evt){ el.dispatchEvent(new Event(evt, { bubbles: true })); }
  function setVal(sel, val){
    var el = find(sel);
    if (!el) return false;
    el.focus();
    var proto = Object.getPrototypeOf(el);
    var setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
    setter.call(el, val);
    fire(el, 'input');
    fire(el, 'change');
    return true;
  }

  async function createTask(t, idx){
    try {
      var btn = Array.from(document.querySelectorAll('button')).find(function(b){
        return /nova tarefa|add task|criar|\\+/i.test(b.textContent);
      });
      if (btn) btn.click();
      await wait(500);

      setVal('input[name=\"title\"], input[placeholder*=\"titulo\"], input[placeholder*=\"nome\"]', t.titulo);
      await wait(100);
      var briefingEl = find('textarea[name=\"description\"], textarea[placeholder*=\"brief\"], textarea[placeholder*=\"descricao\"]');
      if (briefingEl) setVal('textarea[name=\"description\"], textarea[placeholder*=\"brief\"], textarea[placeholder*=\"descricao\"]', t.briefing);
      await wait(100);

      var save = Array.from(document.querySelectorAll('button')).find(function(b){
        return /salvar|save|criar task|confirm/i.test(b.textContent);
      });
      if (save) save.click();
      await wait(800);
    } catch(e) { console.error('Erro task ' + (idx+1), e); }
  }

  (async function(){
    var ok = confirm('Criar ' + TASKS.length + ' tasks no Ekyte?\\n\\nCertifique-se de estar no projeto/cliente correto.');
    if (!ok) return;
    for (var i = 0; i < TASKS.length; i++) {
      await createTask(TASKS[i], i);
    }
    alert('Concluido: ' + TASKS.length + ' tasks criadas (verifique manualmente).');
  })();
} catch(e) { alert('Erro: ' + e.message); }
})();`.replace(/\s+/g, ' ').replace(/\/\/.*$/gm, '');
}

export function generateEkyteBookmarkletHTML(p: Props): string {
  const { clientName, month, tasks } = p;
  const tasksJson = JSON.stringify(tasks);
  const bookmarkletJs = bookmarkletCode(tasksJson);
  const bookmarkletHref = `javascript:${bookmarkletJs}`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Ekyte Tasks - ${clientName}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',sans-serif;background:linear-gradient(135deg,#0a0a0f,#1a1a24);color:#e2e8f0;min-height:100vh;padding:40px 20px}
.container{max-width:900px;margin:0 auto}
.hero{background:linear-gradient(135deg,#e4243d15,#111118);border:1px solid #e4243d30;border-radius:20px;padding:40px;margin-bottom:32px}
.brand{display:flex;align-items:center;gap:12px;margin-bottom:20px}
.logo-sq{width:44px;height:44px;background:linear-gradient(135deg,#e4243d,#ff4d5a);border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-family:'Space Grotesk';font-size:20px}
h1{font-family:'Space Grotesk';font-size:36px;font-weight:800;letter-spacing:-1px;color:#f1f5f9}
.sub{color:#94a3b8;font-size:16px;margin-top:6px}
.meta{display:flex;gap:24px;margin-top:20px;color:#94a3b8;font-size:13px;flex-wrap:wrap}
.meta strong{color:#e4243d}
.drag-zone{background:linear-gradient(135deg,#e4243d10,transparent);border:2px dashed #e4243d50;border-radius:16px;padding:40px;text-align:center;margin-bottom:32px}
.drag-zone h2{font-family:'Space Grotesk';font-size:22px;color:#f1f5f9;margin-bottom:8px}
.drag-zone p{color:#94a3b8;margin-bottom:20px}
.bookmarklet{display:inline-block;background:linear-gradient(135deg,#e4243d,#ff4d5a);color:white;padding:16px 32px;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px;cursor:grab;box-shadow:0 6px 20px rgba(228,36,61,.3);transition:all .3s;font-family:'Space Grotesk'}
.bookmarklet:hover{transform:scale(1.05);box-shadow:0 8px 24px rgba(228,36,61,.5)}
.instructions{background:#111118;border:1px solid #334155;border-radius:12px;padding:24px;margin-bottom:32px}
.instructions h3{font-family:'Space Grotesk';font-size:18px;color:#f1f5f9;margin-bottom:16px}
.instructions ol{padding-left:20px;line-height:1.8;color:#cbd5e1}
.instructions li{margin-bottom:10px}
.instructions code{background:#1e293b;padding:2px 8px;border-radius:4px;font-family:'Courier New',monospace;color:#e4243d}
.tasks-list{background:#111118;border:1px solid #334155;border-radius:12px;padding:24px}
.tasks-list h3{font-family:'Space Grotesk';font-size:18px;color:#f1f5f9;margin-bottom:16px;display:flex;align-items:center;gap:8px}
.badge{background:#e4243d;color:white;padding:2px 8px;border-radius:12px;font-size:12px}
.task{background:#0a0a0f;border:1px solid #1e293b;border-radius:8px;padding:14px 18px;margin-bottom:8px;transition:all .2s}
.task:hover{border-color:#e4243d50}
.task-header{display:flex;align-items:center;gap:12px;margin-bottom:8px}
.task-prio{padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;letter-spacing:1px}
.task-prio.P1{background:#e4243d20;color:#ff4d5a}
.task-prio.P2{background:#f5942020;color:#f59420}
.task-prio.P3{background:#33415520;color:#94a3b8}
.task-title{font-weight:600;color:#f1f5f9;font-size:14px;flex:1}
.task-brief{font-size:12px;color:#94a3b8;line-height:1.6;padding-left:8px;border-left:2px solid #e4243d;max-height:3.2em;overflow:hidden}
.footer{margin-top:40px;text-align:center;color:#64748b;font-size:12px}
.footer-brand{color:#e4243d;font-weight:700;font-family:'Space Grotesk'}
@media(max-width:640px){h1{font-size:28px}.hero,.drag-zone,.instructions{padding:24px}}
</style>
</head>
<body>
<div class="container">

<div class="hero">
<div class="brand">
<div class="logo-sq">V4</div>
<div>
<div style="font-weight:700;font-size:14px;letter-spacing:2px;text-transform:uppercase">V4 Pit Wall</div>
<div style="font-size:10px;color:#64748b;letter-spacing:1px">Ruston &amp; Co</div>
</div>
</div>
<h1>Tasks para o Ekyte</h1>
<p class="sub">${clientName} · ${month}</p>
<div class="meta">
<span><strong>Total:</strong> ${tasks.length} tasks</span>
<span><strong>P1:</strong> ${tasks.filter(t => t.prioridade === 'P1').length}</span>
<span><strong>P2:</strong> ${tasks.filter(t => t.prioridade === 'P2').length}</span>
<span><strong>P3:</strong> ${tasks.filter(t => t.prioridade === 'P3').length}</span>
</div>
</div>

<div class="drag-zone">
<h2>\uD83D\uDE80 Arraste o botao abaixo para a barra de favoritos</h2>
<p>Depois, acesse o mkt.lab/Ekyte no projeto do cliente e clique no favorito.</p>
<a href="${bookmarkletHref}" class="bookmarklet" onclick="event.preventDefault();alert('Arraste este botao para a barra de favoritos do navegador — nao clique aqui.')">
\u25B6 Criar ${tasks.length} Tasks no Ekyte
</a>
</div>

<div class="instructions">
<h3>Como usar</h3>
<ol>
<li>Mostre a barra de favoritos: <code>Ctrl+Shift+B</code> (ou View \u2192 Show Bookmarks)</li>
<li>Arraste o botao vermelho acima para essa barra. Ele vira um favorito javascript:.</li>
<li>Entre no mkt.lab/Ekyte e selecione o projeto/cliente <strong>${clientName}</strong></li>
<li>Clique no favorito. Confirme quando aparecer o popup.</li>
<li>As tasks serao criadas uma por uma (verifique ao final)</li>
</ol>
</div>

<div class="tasks-list">
<h3>Tasks <span class="badge">${tasks.length}</span></h3>
${tasks.map((t) => `
<div class="task">
<div class="task-header">
<span class="task-prio ${t.prioridade}">${t.prioridade}</span>
<span class="task-title">${t.titulo}</span>
</div>
<div class="task-brief">${t.briefing.replace(/</g, '&lt;').slice(0, 250)}${t.briefing.length > 250 ? '...' : ''}</div>
</div>
`).join('')}
</div>

<div class="footer">
<div class="footer-brand">V4 PIT WALL</div>
<div>Gerado em ${new Date().toLocaleDateString('pt-BR')}</div>
</div>

</div>
</body>
</html>`;
}
