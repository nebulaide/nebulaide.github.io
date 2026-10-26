/* ============================================================
   Nébula · Página de presentación — lógica de las demostraciones
   1. Logo   2. IDE del inicio   3. Plantillas   4. Selector de íconos
   5. Terminal   6. Vista responsiva   7. Comprobador de errores
   ============================================================ */
'use strict';
(() => {

/* ---------- utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ic = n => `<svg class="ic" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = ms => new Promise(r => setTimeout(r, RM ? 0 : ms));
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

let toastT;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 1800);
}
function onVisible(el, fn, once = true) {
  if (!('IntersectionObserver' in window)) { fn(true); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (once && !e.isIntersecting) return; fn(e.isIntersecting); if (once) io.disconnect(); }), { threshold: .35 });
  io.observe(el);
}

/* ---------- 1. logo (logo.svg, luego logo.png, y si no existe se oculta) ---------- */
(() => {
  const logo = $('#logo'); let png = false;
  if (logo.complete && logo.naturalWidth === 0) { png = true; logo.src = 'logo.png'; }
  logo.addEventListener('error', () => { if (!png) { png = true; logo.src = 'logo.png'; } else logo.hidden = true; });
  if (logo.complete && logo.naturalWidth === 0 && png) setTimeout(() => { if (logo.naturalWidth === 0) logo.hidden = true; }, 400);
})();

/* ---------- resaltado de sintaxis mínimo ---------- */
const RE = /(\{%.*?%\}|\{\{.*?\}\})|(<\/?[A-Za-z][\w-]*|\/?>)|(\/\/.*)|("[^"]*"|'[^']*'|`[^`]*`)|\b(const|let|var|function|return|for|of|if|else|import|from|export|def|class|override|fun|val|new|in|true|false|null|None|self|await|async|package)\b|\b(\d+(?:\.\d+)?)\b|([A-Za-z_]\w*)(?=\()/g;
const RE_PY = new RegExp(RE.source.replace('(\\/\\/.*)', '(#.*)'), 'g');
const CLS = ['', 'lq', 'tg', 'cm', 'st', 'kw', 'nm', 'fn'];
function classify(raw, lang) {
  const cls = new Array(raw.length).fill('');
  const re = new RegExp((lang === 'py' ? RE_PY : RE).source, 'g'); let m;
  while ((m = re.exec(raw))) {
    if (!m[0]) { re.lastIndex++; continue; }
    let k = 1; while (k < 8 && m[k] === undefined) k++;
    for (let i = m.index; i < m.index + m[0].length; i++) cls[i] = CLS[k];
  }
  return cls;
}
function lineHtml(raw, lang, marks = []) {
  const cls = classify(raw, lang), mk = new Array(raw.length).fill('');
  marks.forEach(({ s, e, c }) => { for (let i = s; i < e; i++) mk[i] = c; });
  let out = '', i = 0;
  while (i < raw.length) {
    let j = i + 1; while (j < raw.length && cls[j] === cls[i] && mk[j] === mk[i]) j++;
    const c = [cls[i], mk[i]].filter(Boolean).join(' '), t = esc(raw.slice(i, j));
    out += c ? `<span class="${c}">${t}</span>` : t; i = j;
  }
  return out || ' ';
}

/* ============================================================
   2. IDE del inicio
   ============================================================ */
const PROJECTS = {
  shopify: {
    name: 'mi-tienda', label: 'Tienda Shopify', lang: 'Liquid', cm: ['<!-- ', ' -->'],
    files: ['layout/theme.liquid', 'sections/header.liquid', 'sections/product-carousel.liquid', 'snippets/icon.liquid', 'templates/index.json', 'templates/collection.json', 'assets/theme.css', 'assets/theme.js', 'config/settings_schema.json'],
    open: 'sections/product-carousel.liquid',
    code: `{% comment %} Carrusel de productos {% endcomment %}
<section class="carousel" data-autoplay="{{ section.settings.autoplay }}">
  {% for producto in collection.products limit: 8 %}
    <article class="carousel__item">
      {{ producto.featured_image | image_url: width: 480 | image_tag }}
      <h3>{{ producto.title }}</h3>
      <p>{{ producto.price | money }}</p>
    </article>
  {% endfor %}
</section>`,
    term: [{ cmd: 'nebula new mi-tienda --tipo shopify' }, { s: 'Creando la estructura del tema…' }, { s: '+ 9 archivos en 6 carpetas', c: 'g' }, { s: 'Íconos: selector conectado a snippets/icon.liquid' }, { s: 'Listo. Abre sections/product-carousel.liquid', c: 'g' }]
  },
  python: {
    name: 'mi-api', label: 'API en Python', lang: 'Python', lg: 'py', cm: ['# ', ''],
    files: ['app/main.py', 'app/models.py', 'app/routes/usuarios.py', 'app/routes/productos.py', 'tests/test_usuarios.py', 'requirements.txt', 'README.md'],
    open: 'app/main.py',
    code: `from fastapi import FastAPI
from app.routes import usuarios, productos

app = FastAPI(title="API de la tienda")
app.include_router(usuarios.router, prefix="/usuarios")
app.include_router(productos.router, prefix="/productos")

@app.get("/salud")
def salud():
    return {"estado": "ok"}`,
    term: [{ cmd: 'nebula new mi-api --tipo python' }, { s: 'Creando entorno virtual…' }, { s: '+ 7 archivos en 3 carpetas', c: 'g' }, { s: 'Dependencias instaladas desde requirements.txt' }, { s: 'Listo. Ejecuta nebula run para iniciar el servidor', c: 'g' }]
  },
  android: {
    name: 'mi-app', label: 'App Android', lang: 'Kotlin', cm: ['// ', ''],
    files: ['app/src/main/AndroidManifest.xml', 'app/src/main/java/mi/app/MainActivity.kt', 'app/src/main/java/mi/app/ui/Tema.kt', 'app/src/main/java/mi/app/ui/Pantalla.kt', 'app/src/main/res/values/strings.xml', 'app/build.gradle.kts', 'settings.gradle.kts'],
    open: 'app/src/main/java/mi/app/MainActivity.kt',
    code: `class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            Tema {
                Pantalla()
            }
        }
    }
}`,
    term: [{ cmd: 'nebula new mi-app --tipo android' }, { s: 'Creando módulo app con Jetpack Compose…' }, { s: '+ 7 archivos en 9 carpetas', c: 'g' }, { s: 'Gradle sincronizado' }, { s: 'Listo. Abre MainActivity.kt', c: 'g' }]
  },
  web: {
    name: 'mi-sitio', label: 'Sitio web', lang: 'HTML', cm: ['<!-- ', ' -->'],
    files: ['index.html', 'styles.css', 'app.js', 'fonts/', 'imagenes/logo.svg', 'imagenes/portada.jpg'],
    open: 'index.html',
    code: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mi sitio</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <main id="app"></main>
  <script src="app.js"></script>
</body>
</html>`,
    term: [{ cmd: 'nebula new mi-sitio --tipo web' }, { s: 'Creando estructura…' }, { s: '+ 6 archivos en 3 carpetas', c: 'g' }, { s: 'Vista responsiva activada para celular, tableta y laptop' }, { s: 'Listo. Abre index.html', c: 'g' }]
  },
  juego: {
    name: 'mi-juego', label: 'Juego HTML', lang: 'JavaScript', cm: ['// ', ''],
    files: ['index.html', 'styles.css', 'juego/motor.js', 'juego/jugador.js', 'juego/niveles.json', 'sprites/jugador.png', 'sprites/fondo.png', 'sonidos/salto.mp3'],
    open: 'juego/motor.js',
    code: `const lienzo = document.querySelector("#juego");
const ctx = lienzo.getContext("2d");
let ultimo = 0;

function bucle(t) {
  const dt = (t - ultimo) / 1000;
  ultimo = t;
  actualizar(dt);
  dibujar(ctx);
  requestAnimationFrame(bucle);
}
requestAnimationFrame(bucle);`,
    term: [{ cmd: 'nebula new mi-juego --tipo juego' }, { s: 'Creando lienzo y bucle principal…' }, { s: '+ 8 archivos en 4 carpetas', c: 'g' }, { s: 'Recursos: sprites y sonidos listos para reemplazar' }, { s: 'Listo. Abre juego/motor.js', c: 'g' }]
  }
};
const ORDER = ['shopify', 'python', 'android', 'web', 'juego'];

const ide = {
  el: $('#ide'), tree: $('#tree'), code: $('#code'), tabs: $('#tabs'), term: $('#hterm'),
  cur: 'shopify', run: 0, touched: false, vis: false
};

function buildTree(files) {
  const root = {};
  files.forEach(p => {
    const isDir = p.endsWith('/'); const parts = p.replace(/\/$/, '').split('/'); let n = root;
    parts.forEach((seg, i) => { const last = i === parts.length - 1; if (last && !isDir) n[seg] = null; else n = n[seg] = n[seg] || {}; });
  });
  return root;
}
function treeItems(node, prefix, st) {
  const keys = Object.keys(node).sort((a, b) => { const da = node[a] !== null, db = node[b] !== null; return da === db ? a.localeCompare(b) : da ? -1 : 1; });
  return keys.map(key => {
    // une las carpetas que solo contienen otra carpeta (app/src/main/java), como hacen los IDE
    let name = key, child = node[key];
    while (child !== null) { const ks = Object.keys(child); if (ks.length !== 1 || child[ks[0]] === null) break; name += '/' + ks[0]; child = child[ks[0]]; }
    const path = prefix + name, d = `style="animation-delay:${Math.min(st.i++ * 40, 700)}ms"`;
    return child === null
      ? `<li><button class="it pop" ${d} data-p="${esc(path)}">${ic('archivo')}<span>${esc(name)}</span></button></li>`
      : `<li><div class="it dir pop" ${d}>${ic('carpeta')}<span>${esc(name)}</span></div><ul>${treeItems(child, path + '/', st)}</ul></li>`;
  }).join('');
}
function stub(p, pr) {
  const [a, b] = pr.cm;
  return `${a}${p}${b}\n${a}Archivo creado por la plantilla. Empieza a escribir aquí.${b}\n`;
}
function openFile(p) {
  const pr = PROJECTS[ide.cur], lang = pr.lg || '';
  const text = p === pr.open ? pr.code : stub(p, pr);
  ide.tabs.innerHTML = `<span>${ic('archivo')}${esc(p.split('/').pop())}</span>`;
  ide.code.innerHTML = text.split('\n').map((l, i) =>
    `<div class="ln in" style="animation-delay:${RM ? 0 : Math.min(i * 35, 600)}ms"><i>${i + 1}</i><span>${lineHtml(l, lang)}</span></div>`).join('');
  $$('.it[data-p]', ide.tree).forEach(b => b.classList.toggle('on', b.dataset.p === p));
  $('#stLang').textContent = /\.(css)$/.test(p) ? 'CSS' : /\.json$/.test(p) ? 'JSON' : /\.md$/.test(p) ? 'Markdown' : p === pr.open ? pr.lang : pr.lang;
}
async function playTerm(lines) {
  const id = ++ide.run, el = ide.term; el.innerHTML = '';
  for (const ln of lines) {
    if (id !== ide.run) return;
    const d = document.createElement('div'); d.className = 'l ' + (ln.c || ''); el.append(d);
    if (ln.cmd) {
      d.classList.add('t'); d.innerHTML = '<span class="p">$</span> ';
      for (const ch of ln.cmd) { d.append(ch); if (RM) continue; await sleep(16); if (id !== ide.run) return; }
      await sleep(260);
    } else { d.textContent = ln.s; await sleep(230); }
    el.scrollTop = el.scrollHeight;
  }
  if (id === ide.run) { const d = document.createElement('div'); d.className = 'l'; d.innerHTML = '<span class="p">$</span> <span class="cur"></span>'; el.append(d); }
}
function setProject(key) {
  const pr = PROJECTS[key]; ide.cur = key;
  $$('#types button').forEach(b => b.setAttribute('aria-selected', b.dataset.type === key));
  $('#treeName').textContent = pr.name;
  ide.tree.innerHTML = treeItems(buildTree(pr.files), '', { i: 0 });
  const n = pr.files.filter(f => !f.endsWith('/')).length;
  $('#stFiles').textContent = n + ' archivos';
  openFile(pr.open);
  playTerm(pr.term);
}
$('#types').addEventListener('click', e => { const b = e.target.closest('button[data-type]'); if (!b) return; ide.touched = true; setProject(b.dataset.type); });
ide.tree.addEventListener('click', e => { const b = e.target.closest('button[data-p]'); if (!b) return; ide.touched = true; openFile(b.dataset.p); });
setProject('shopify');
onVisible(ide.el, v => { ide.vis = v; }, false);
if (!RM) setInterval(() => {
  if (ide.touched || document.hidden || !ide.vis) return;
  setProject(ORDER[(ORDER.indexOf(ide.cur) + 1) % ORDER.length]);
}, 9000);

/* regla con el ancho de la ventana */
(() => {
  const out = $('#rulerW'), upd = () => { out.textContent = Math.round(ide.el.getBoundingClientRect().width) + ' px'; };
  upd(); if ('ResizeObserver' in window) new ResizeObserver(upd).observe(ide.el); else addEventListener('resize', upd);
})();

/* ============================================================
   3. Plantillas
   ============================================================ */
const box = (w = '100%') => `<div class="w-box w-col"><div class="w-l" style="width:30%;background:var(--y)"></div><div class="w-l m"></div><div class="w-l" style="width:${w}"></div></div>`;
const card = () => `<div class="w-col"><div class="w-ph" style="height:64px"></div><div class="w-l m"></div><div class="w-l s"></div></div>`;
const TPL = {
  landing: {
    files: ['index.html', 'sections/beneficios.html', 'styles/landing.css', 'scripts/landing.js'],
    wire: () => `<div class="w-bar"><b></b><i></i><i></i><i></i></div>
      <div class="w-row" style="grid-template-columns:1.1fr 1fr;align-items:center"><div class="w-col"><div class="w-l t"></div><div class="w-l m"></div><div class="w-l s"></div><div class="w-btn"></div></div><div class="w-ph" style="height:140px"></div></div>
      <div class="w-row" style="grid-template-columns:repeat(3,1fr)">${box()}${box('80%')}${box('60%')}</div>
      <div class="w-box" style="display:flex;justify-content:space-between;align-items:center"><div class="w-l t" style="width:40%"></div><div class="w-btn" style="margin:0"></div></div>`
  },
  catalogo: {
    files: ['catalogo.html', 'components/filtros.js', 'components/tarjeta-producto.html', 'styles/catalogo.css', 'data/productos.json'],
    wire: () => `<div class="w-bar"><b></b><i></i><i></i><i></i></div>
      <div class="w-row" style="grid-template-columns:1fr 3.2fr;flex:1"><div class="w-box w-col"><div class="w-l" style="width:50%;background:var(--faint)"></div><div class="w-chk on"><div class="w-l m"></div></div><div class="w-chk"><div class="w-l m"></div></div><div class="w-chk on"><div class="w-l m"></div></div><div class="w-chk"><div class="w-l m"></div></div><div class="w-l" style="width:50%;background:var(--faint);margin-top:8px"></div><div class="w-l"></div></div>
      <div class="w-row" style="grid-template-columns:repeat(3,1fr);align-content:start">${card()}${card()}${card()}${card()}${card()}${card()}</div></div>`
  },
  panel: {
    files: ['panel.html', 'components/tabla.js', 'components/grafica.js', 'styles/panel.css', 'data/metricas.json'],
    wire: () => `<div class="w-row" style="grid-template-columns:1fr 4fr;flex:1"><div class="w-box w-col"><div class="w-bar"><b style="width:40px"></b></div><div class="w-l m"></div><div class="w-l m" style="background:var(--y)"></div><div class="w-l m"></div><div class="w-l m"></div></div>
      <div class="w-col" style="gap:10px"><div class="w-row" style="grid-template-columns:repeat(3,1fr)">${[1, 2, 3].map(() => `<div class="w-box w-col"><div class="w-l s"></div><div class="w-l t" style="width:50%"></div></div>`).join('')}</div>
      <div class="w-box"><div class="w-bars"><i style="height:40%"></i><i style="height:62%"></i><i style="height:48%"></i><i class="y" style="height:90%"></i><i style="height:70%"></i><i style="height:55%"></i><i style="height:80%"></i></div></div>
      <div class="w-box w-col">${[1, 2, 3].map(() => `<div class="w-row" style="grid-template-columns:1fr 2fr 1fr"><div class="w-l"></div><div class="w-l"></div><div class="w-l"></div></div>`).join('')}</div></div></div>`
  },
  blog: {
    files: ['blog.html', 'articulo.html', 'components/lista-articulos.js', 'styles/blog.css', 'data/articulos.json'],
    wire: () => `<div class="w-bar"><b></b><i></i><i></i><i></i></div>
      <div class="w-ph" style="height:118px"></div><div class="w-l t" style="width:70%"></div><div class="w-l m"></div>
      ${[1, 2, 3].map(() => `<div class="w-row" style="grid-template-columns:54px 1fr;align-items:center"><div class="w-ph" style="height:46px"></div><div class="w-col"><div class="w-l m"></div><div class="w-l s"></div></div></div>`).join('')}`
  }
};
function setTpl(k) {
  $$('#tpls button').forEach(b => b.setAttribute('aria-selected', b.dataset.t === k));
  $('#wire').innerHTML = TPL[k].wire();
  $('#tplFiles').innerHTML = TPL[k].files.map((f, i) => `<li style="animation-delay:${i * 60}ms">${esc(f)}</li>`).join('');
}
$('#tpls').addEventListener('click', e => { const b = e.target.closest('button[data-t]'); if (b) setTpl(b.dataset.t); });
setTpl('landing');

/* ============================================================
   4. Selector de íconos
   ============================================================ */
const ICONS = [
  ['casa', 'Casa'], ['buscar', 'Buscar'], ['usuario', 'Usuario'], ['usuarios', 'Usuarios'], ['carrito', 'Carrito'], ['bolsa', 'Bolsa'],
  ['corazon', 'Corazón'], ['estrella', 'Estrella'], ['campana', 'Campana'], ['ajustes', 'Ajustes'], ['carpeta', 'Carpeta'], ['archivo', 'Archivo'],
  ['imagen', 'Imagen'], ['camara', 'Cámara'], ['correo', 'Correo'], ['telefono', 'Teléfono'], ['candado', 'Candado'], ['reloj', 'Reloj'],
  ['calendario', 'Calendario'], ['ubicacion', 'Ubicación'], ['etiqueta', 'Etiqueta'], ['nube', 'Nube'], ['descargar', 'Descargar'], ['subir', 'Subir'],
  ['editar', 'Editar'], ['papelera', 'Papelera'], ['enlace', 'Enlace'], ['mundo', 'Mundo'], ['rayo', 'Rayo'], ['codigo', 'Código'],
  ['terminal', 'Terminal'], ['capas', 'Capas'], ['tarjeta', 'Tarjeta'], ['grafica', 'Gráfica'], ['mensaje', 'Mensaje'], ['compartir', 'Compartir'],
  ['copiar', 'Copiar'], ['check', 'Confirmar'], ['alerta', 'Alerta'], ['info', 'Información'], ['ojo', 'Ojo'], ['ramas', 'Ramas'],
  ['reproducir', 'Reproducir'], ['base', 'Base de datos'], ['celular', 'Celular'], ['tableta', 'Tableta'], ['monitor', 'Monitor'], ['mas', 'Más'], ['cerrar', 'Cerrar']
];
const pk = { id: 'casa', size: 24 };
function pkGrid() {
  const q = norm($('#pkQ').value.trim());
  const list = ICONS.filter(([id, n]) => !q || norm(n).includes(q) || id.includes(q));
  $('#pkGrid').innerHTML = list.map(([id, n]) => `<button role="option" data-id="${id}" aria-selected="${id === pk.id}" aria-label="${esc(n)}" title="${esc(n)}">${ic(id)}</button>`).join('');
  $('#pkEmpty').hidden = list.length > 0;
}
function pkShow() {
  const n = ICONS.find(i => i[0] === pk.id)[1];
  $('#pkName').textContent = n;
  const big = $('#pkBig'); big.style.width = big.style.height = pk.size + 'px'; $('use', big).setAttribute('href', '#i-' + pk.id);
  $('#pkCode').textContent = `<svg class="icono" width="${pk.size}" height="${pk.size}" aria-hidden="true">\n  <use href="#${pk.id}"/>\n</svg>`;
  $$('#pkSize button').forEach(b => b.setAttribute('aria-pressed', +b.dataset.s === pk.size));
  $$('#pkGrid button').forEach(b => b.setAttribute('aria-selected', b.dataset.id === pk.id));
}
$('#pkQ').addEventListener('input', () => { pkGrid(); });
$('#pkGrid').addEventListener('click', e => { const b = e.target.closest('button[data-id]'); if (!b) return; pk.id = b.dataset.id; pkShow(); });
$('#pkSize').addEventListener('click', e => { const b = e.target.closest('button[data-s]'); if (!b) return; pk.size = +b.dataset.s; pkShow(); });
async function copyText(t) {
  try { await navigator.clipboard.writeText(t); return true; } catch (e) {
    try { const a = document.createElement('textarea'); a.value = t; a.style.cssText = 'position:fixed;opacity:0'; document.body.append(a); a.select(); const ok = document.execCommand('copy'); a.remove(); return ok; } catch (x) { return false; }
  }
}
$('#pkCopy').addEventListener('click', async () => toast(await copyText($('#pkCode').textContent) ? 'Código copiado' : 'No se pudo copiar. Selecciona el código y cópialo'));
pkGrid(); pkShow();

/* ============================================================
   5. Terminal
   ============================================================ */
const T = { out: $('#termOut'), inp: $('#termIn'), proj: 'web', hist: [], hi: -1, busy: false };
const TYPES = { web: 'web', api: 'python', android: 'android', juego: 'juego', shopify: 'shopify' };
function tPrint(s, c = '') { const d = document.createElement('div'); d.className = 'l ' + c; d.textContent = s; T.out.append(d); T.out.scrollTop = T.out.scrollHeight; return d; }
async function tLines(lines, gap = 120) { T.busy = true; for (const [s, c] of lines) { tPrint(s, c || ''); await sleep(gap); } T.busy = false; }
function tCmd(s) { const d = document.createElement('div'); d.className = 'l cmd'; d.innerHTML = `<b>mi-proyecto $</b> ${esc(s)}`; T.out.append(d); }
async function runCmd(raw) {
  const line = raw.trim().replace(/\s+/g, ' '); if (!line) return;
  tCmd(line); T.hist.push(line); T.hi = T.hist.length;
  const c = norm(line), pr = PROJECTS[T.proj];
  if (c === 'limpiar' || c === 'clear') { T.out.innerHTML = ''; return; }
  if (c === 'ayuda' || c === 'help') return tLines([
    ['Comandos disponibles:'], ['  ayuda               muestra esta lista'], ['  ls                  lista los archivos del proyecto'],
    ['  nebula new <tipo>   crea un proyecto: web, api, android, juego, shopify'], ['  nebula check        revisa errores en todo el proyecto'],
    ['  nebula run          inicia el servidor de desarrollo'], ['  limpiar             borra la pantalla']], 60);
  if (c === 'ls') return tLines(pr.files.map(f => [f]), 50);
  if (c === 'nebula check') return tLines([
    [`Revisando ${pr.files.filter(f => !f.endsWith('/')).length} archivos…`], ['app.js:12  aviso  «ultimo» se declara pero nunca se usa', 'w'],
    ['app.js:27  error  «jugador» no está definido', 'e'], ['1 error y 1 aviso. Corrígelos desde el panel de problemas.']], 260);
  if (c === 'nebula run') return tLines([
    ['Compilando…'], ['Servidor listo en http://localhost:5173', 'g'], ['Vista responsiva disponible para celular, tableta y laptop'], ['Recarga automática activada. Guarda un archivo para ver los cambios.']], 320);
  if (c.startsWith('nebula new')) {
    const t = c.split(' ')[2];
    if (!t) return tLines([['Falta el tipo de proyecto. Prueba: nebula new web', 'e']]);
    if (!TYPES[t]) return tLines([[`No existe el tipo «${t}». Tipos disponibles: web, api, android, juego, shopify.`, 'e']]);
    T.proj = TYPES[t]; const p = PROJECTS[T.proj], n = p.files.filter(f => !f.endsWith('/')).length;
    return tLines([[`Creando ${p.name} (${p.label})…`], [`+ ${n} archivos creados`, 'g'], ['Escribe ls para verlos.']], 280);
  }
  return tLines([[`No se reconoce «${line}». Escribe ayuda para ver los comandos.`, 'e']]);
}
$('#termForm').addEventListener('submit', e => { e.preventDefault(); const v = T.inp.value; T.inp.value = ''; if (!T.busy) runCmd(v); });
T.inp.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp' && T.hist.length) { e.preventDefault(); T.hi = Math.max(0, T.hi - 1); T.inp.value = T.hist[T.hi] || ''; }
  if (e.key === 'ArrowDown' && T.hist.length) { e.preventDefault(); T.hi = Math.min(T.hist.length, T.hi + 1); T.inp.value = T.hist[T.hi] || ''; }
});
$('#termChips').addEventListener('click', e => { const b = e.target.closest('button[data-c]'); if (b && !T.busy) runCmd(b.dataset.c); });
$('#termClear').addEventListener('click', () => { T.out.innerHTML = ''; T.inp.focus(); });
tPrint('Bienvenido a la terminal de Nébula. Escribe ayuda para empezar.');
onVisible($('#term'), async () => {
  const s = 'nebula run'; const d = document.createElement('div'); d.className = 'l cmd'; d.innerHTML = '<b>mi-proyecto $</b> '; T.out.append(d); T.busy = true;
  for (const ch of s) { d.append(ch); await sleep(60); }
  await sleep(250); T.busy = false; T.hist.push(s); T.hi = T.hist.length;
  await tLines([['Compilando…'], ['Servidor listo en http://localhost:5173', 'g'], ['Recarga automática activada.']], 300);
});

/* ============================================================
   6. Vista responsiva
   ============================================================ */
const DEV = { cel: { w: 390, h: 780 }, tab: { w: 820, h: 1000 }, lap: { w: 1280, h: 800 } };
const rv = { w: 390, stage: $('#rvStage'), wrap: $('#rvWrap'), frame: $('#rvFrame'), range: $('#rvW') };
const kindOf = w => w < 600 ? 'cel' : w < 1000 ? 'tab' : 'lap';
function rvFit() {
  const k = kindOf(rv.w), h = k === 'cel' ? 780 : k === 'tab' ? 1000 : 800;
  const avail = rv.stage.clientWidth - 48, s = Math.min(1, avail / rv.w, 520 / h);
  rv.wrap.style.width = rv.w * s + 'px'; rv.wrap.style.height = h * s + 'px';
  rv.frame.style.width = rv.w + 'px'; rv.frame.style.height = h + 'px'; rv.frame.style.transform = `scale(${s})`;
  rv.frame.dataset.kind = k;
}
function rvApply() {
  const k = kindOf(rv.w);
  $$('#rvDev button').forEach(b => b.setAttribute('aria-pressed', b.dataset.d === k));
  $('#rvPx').textContent = rv.w + ' px';
  $('#rvNote').textContent = k === 'cel' ? 'Menú plegado, 2 columnas' : k === 'tab' ? 'Menú completo, 3 columnas' : 'Menú completo, 4 columnas';
  rv.range.value = rv.w; rvFit();
}
$('#rvDev').addEventListener('click', e => { const b = e.target.closest('button[data-d]'); if (!b) return; rv.w = DEV[b.dataset.d].w; rvApply(); });
rv.range.addEventListener('input', () => { rv.w = +rv.range.value; rvApply(); });
if ('ResizeObserver' in window) new ResizeObserver(rvFit).observe(rv.stage); else addEventListener('resize', rvFit);
rvApply();

/* ============================================================
   7. Comprobador de errores
   ============================================================ */
const CHK0 = [
  'const IVA = 0.16;',
  'const carrito = [{ precio: 120, cantidad: 2 }];',
  '',
  'function total(items) {',
  '  let suma = 0;',
  '  for (const it of items) suma += it.precio * it.cantidad',
  '  return sum;',
  '}',
  '',
  'console.log(total(carritos));'
];
const PROBS = [
  { id: 1, line: 0, find: /\bIVA\b/, kind: 'w', msg: '«IVA» se declara pero nunca se usa.', fix: 'Usar en el total', apply: L => { L[6] = L[6].replace(/return (sum|suma);/, 'return $1 * (1 + IVA);'); } },
  { id: 2, line: 5, find: /it\.cantidad$/, kind: 'w', msg: 'Falta el punto y coma al final de la línea.', fix: 'Agregar «;»', apply: L => { L[5] += ';'; } },
  { id: 3, line: 6, find: /\bsum\b/, kind: 'e', msg: '«sum» no está definido. ¿Quisiste decir «suma»?', fix: 'Cambiar a «suma»', apply: L => { L[6] = L[6].replace(/\bsum\b/, 'suma'); } },
  { id: 4, line: 9, find: /\bcarritos\b/, kind: 'e', msg: '«carritos» no está definido. ¿Quisiste decir «carrito»?', fix: 'Cambiar a «carrito»', apply: L => { L[9] = L[9].replace(/\bcarritos\b/, 'carrito'); } }
];
const chk = { lines: CHK0.slice(), done: new Set(), hot: -1 };
function chkRender() {
  const open = PROBS.filter(p => !chk.done.has(p.id));
  $('#chkCode').innerHTML = chk.lines.map((l, i) => {
    const marks = open.filter(p => p.line === i).map(p => { const m = p.find.exec(l); return m ? { s: m.index, e: m.index + m[0].length, c: p.kind === 'e' ? 'sq-e' : 'sq-w' } : null; }).filter(Boolean);
    return `<div class="ln${chk.hot === i ? ' hot' : ''}"><i>${i + 1}</i><span>${lineHtml(l, '', marks)}</span></div>`;
  }).join('');
  const ne = open.filter(p => p.kind === 'e').length, nw = open.length - ne;
  $('#chkCount').textContent = open.length ? [ne && `${ne} error${ne === 1 ? '' : 'es'}`, nw && `${nw} aviso${nw === 1 ? '' : 's'}`].filter(Boolean).join(' y ') : 'Sin problemas';
  $('#chkAll').disabled = !open.length;
  $('#chkList').innerHTML = open.length
    ? open.map(p => `<li class="${p.kind}" data-id="${p.id}">${ic('alerta')}<div>${esc(p.msg)}<small>línea ${p.line + 1}</small></div><button class="fix" data-id="${p.id}">${esc(p.fix)}</button></li>`).join('')
    : `<li class="done">${ic('check')}<span>Sin problemas. Listo para ejecutar.</span></li>`;
}
function chkFix(id) { const p = PROBS.find(x => x.id === id); if (!p || chk.done.has(id)) return; p.apply(chk.lines); chk.done.add(id); chk.hot = -1; chkRender(); }
$('#chkList').addEventListener('click', e => {
  const f = e.target.closest('button.fix'); if (f) return chkFix(+f.dataset.id);
  const li = e.target.closest('li[data-id]'); if (!li) return;
  chk.hot = PROBS.find(p => p.id === +li.dataset.id).line; chkRender();
  setTimeout(() => { chk.hot = -1; chkRender(); }, 1400);
});
$('#chkAll').addEventListener('click', async () => {
  for (const p of PROBS) { if (!chk.done.has(p.id)) { chkFix(p.id); await sleep(260); } }
});
chkRender();

})();
