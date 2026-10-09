/* Dados editáveis: preencha antes de publicar. */
var CONTACT = { email: "", instagram: "" };

var HARDWARE = [
  { id: "netprobe", name: "Sentillis NetProbe", tag: "Diagnóstico de rede", seed: 11, price: 199.90, stock: 3, lead: "7–12 dias úteis*",
    short: "Ferramenta compacta para diagnóstico de conectividade Ethernet e informações básicas da rede.",
    what: "Ferramenta compacta para diagnóstico de conectividade Ethernet e informações básicas da rede.",
    interfaces: "Ethernet" },
  { id: "iot-secure-node", name: "Sentillis IoT Secure Node", tag: "Nó IoT", seed: 23, price: 179.90, stock: 3, lead: "7–12 dias úteis*",
    short: "Nó IoT com sensores e conectividade sem fio, voltado a telemetria e comunicação protegida.",
    what: "Nó IoT com sensores e conectividade sem fio, com foco em telemetria e comunicação protegida conforme o firmware implementado.",
    interfaces: "Sensores e conectividade sem fio" },
  { id: "uart-guard", name: "Sentillis UART Guard", tag: "Interface USB/UART", seed: 37, price: 129.90, stock: 3, lead: "5–10 dias úteis*",
    short: "Interface USB/UART para desenvolvimento e análise autorizada de sistemas embarcados.",
    what: "Interface USB/UART para desenvolvimento e análise autorizada de sistemas embarcados.",
    interfaces: "USB e UART" },
  { id: "environment-monitor", name: "Sentillis Environment Monitor", tag: "Monitor ambiental", seed: 41, price: 179.90, stock: 3, lead: "7–12 dias úteis*",
    short: "Monitoramento de condições ambientais com sensores e transmissão de leituras.",
    what: "Monitoramento de condições ambientais com sensores e transmissão de leituras.",
    interfaces: "Sensores ambientais e transmissão de leituras" },
  { id: "debug-hub", name: "Sentillis Debug Hub", tag: "Apoio ao desenvolvimento", seed: 53, price: 229.90, stock: 3, lead: "7–14 dias úteis*",
    short: "Interface de apoio ao desenvolvimento, com protocolos e pinos compatíveis com a versão final da placa.",
    what: "Interface de apoio ao desenvolvimento, com protocolos e pinos compatíveis com a versão final da placa.",
    interfaces: "Protocolos e pinos a confirmar na versão final" }
];

var SOFTWARE = [
  { id: "network-analyzer", name: "Sentillis Network Analyzer", tag: "Redes", seed: 61,
    short: "Descoberta de dispositivos, diagnóstico de conectividade, visualização de portas e serviços e relatórios em redes autorizadas." },
  { id: "security-audit", name: "Sentillis Security Audit", tag: "Auditoria", seed: 67,
    short: "Verificações guiadas de configuração, serviços, permissões e controles básicos de segurança em sistemas autorizados." },
  { id: "log-analyzer", name: "Sentillis Log Analyzer", tag: "Logs", seed: 71,
    short: "Leitura e análise de logs para identificar padrões suspeitos e facilitar a investigação inicial." },
  { id: "device-monitor", name: "Sentillis Device Monitor", tag: "Telemetria", seed: 73,
    short: "Visualização de telemetria e estado de dispositivos compatíveis, com possível integração futura com as placas Sentillis." },
  { id: "firmware-inspector", name: "Sentillis Firmware Inspector", tag: "Firmware", seed: 79,
    short: "Inspeção inicial de arquivos de firmware: identificação, hashes, strings, arquitetura e indicadores técnicos." }
];

var ALL = HARDWARE.map(function (p) { p.kind = "hw"; return p; }).concat(SOFTWARE.map(function (p) { p.kind = "sw"; return p; }));
var BY_ID = {}; ALL.forEach(function (p) { BY_ID[p.id] = p; });

function $(s, r) { return (r || document).querySelector(s); }
function fmt(n) { return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }

/* Arte de placeholder: trilhas de PCB geradas, sem componentes. Substituir por fotografia real. */
function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function art(seed, caption) {
  var r = rng(seed), W = 400, H = 300, p = "";
  p += '<rect x="16" y="16" width="368" height="268" rx="10" fill="none" stroke="var(--line)" stroke-width="1.5"/>';
  [[38, 38], [362, 38], [38, 262], [362, 262]].forEach(function (c) { p += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="6" fill="none" stroke="var(--line)" stroke-width="1.5"/>'; });
  for (var i = 0; i < 9; i++) {
    var y0 = 62 + i * 21, x1 = 16 + 40 + r() * 50, dy = (r() - 0.5) * 56, y2 = Math.max(54, Math.min(238, y0 + dy)), d = Math.abs(y2 - y0), x2 = x1 + d, x3 = x2 + 30 + r() * 50;
    p += '<path d="M16 ' + y0 + ' H' + x1.toFixed(1) + ' L' + x2.toFixed(1) + ' ' + y2.toFixed(1) + ' H' + x3.toFixed(1) + '" fill="none" stroke="var(--accent)" stroke-opacity=".55" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    p += '<circle cx="' + x3.toFixed(1) + '" cy="' + y2.toFixed(1) + '" r="3.5" fill="var(--bg)" stroke="var(--accent-soft)" stroke-width="1.5"/>';
    var m = 400 - x3, m1 = 400 - x1, m2 = 400 - x2, y0b = 62 + (8 - i) * 21, y2b = Math.max(54, Math.min(238, y0b + (r() - 0.5) * 56));
    var d2 = Math.abs(y2b - y0b), mx2 = (400 - 16 - 40 - r() * 50) - d2, mx3 = mx2 - 30 - r() * 40;
    p += '<path d="M384 ' + y0b + ' H' + (mx2 + d2).toFixed(1) + ' L' + mx2.toFixed(1) + ' ' + y2b.toFixed(1) + ' H' + mx3.toFixed(1) + '" fill="none" stroke="var(--accent-soft)" stroke-opacity=".28" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    p += '<circle cx="' + mx3.toFixed(1) + '" cy="' + y2b.toFixed(1) + '" r="3" fill="var(--bg)" stroke="var(--accent-soft)" stroke-opacity=".6" stroke-width="1.3"/>';
  }
  if (caption) p += '<text x="200" y="274" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="10" letter-spacing="1.5" fill="var(--muted)">FOTO REAL EM BREVE</text>';
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Imagem provisória do produto" xmlns="http://www.w3.org/2000/svg">' + p + '</svg>';
}

function stockInfo(p) {
  if (p.stock > 1) return { t: "Disponível", s: "ok", ok: true };
  if (p.stock === 1) return { t: "Últimas unidades", s: "last", ok: true };
  if (p.preorder) return { t: "Sob encomenda", s: "order", ok: true };
  return { t: "Esgotado", s: "out", ok: false };
}

/* Vitrine */
function card(p) {
  var h = '<article class="card"><div class="card-art">' + art(p.seed, true) + '</div><div class="card-body">';
  h += '<span class="label">' + p.tag + '</span><h3>' + p.name + '</h3><p class="short">' + p.short + '</p>';
  if (p.kind === "hw") {
    var s = stockInfo(p);
    h += '<div class="card-meta"><span class="price">' + fmt(p.price) + '<small>*</small></span><span class="status" data-s="' + s.s + '"><i></i>' + s.t + '</span></div>';
    h += '<div class="card-actions"><button class="btn btn-ghost btn-sm" type="button" data-detail="' + p.id + '">Ver detalhes</button>';
    h += '<button class="btn btn-primary btn-sm" type="button" data-add="' + p.id + '"' + (s.ok ? "" : " disabled") + '>Adicionar ao carrinho</button></div>';
  } else {
    h += '<div class="card-meta"><span class="price tbd">Preço a definir</span><span class="status"><i></i>Download digital</span></div>';
    h += '<div class="card-actions"><button class="btn btn-ghost btn-sm" type="button" data-detail="' + p.id + '">Ver detalhes</button></div>';
  }
  return h + '</div></article>';
}
$("#hw-grid").innerHTML = HARDWARE.map(card).join("");
$("#sw-grid").innerHTML = SOFTWARE.map(card).join("");
$("#hw-count").textContent = HARDWARE.length;
$("#sw-count").textContent = SOFTWARE.length;
$("#hero-art").innerHTML = art(97, false);

/* Contato */
$("#ch-email").textContent = CONTACT.email || "Em breve";
$("#ch-ig").textContent = CONTACT.instagram || "Em breve";

/* Carrinho */
var cart = {};
try {
  var saved = JSON.parse(localStorage.getItem("sentillis-cart") || "{}");
  Object.keys(saved).forEach(function (k) { var p = BY_ID[k]; if (p && p.kind === "hw" && saved[k] > 0) cart[k] = Math.min(saved[k], p.stock); });
} catch (e) {}
function persist() { try { localStorage.setItem("sentillis-cart", JSON.stringify(cart)); } catch (e) {} }
var toastTimer;
function toast(msg) { var t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2200); }
function addToCart(id) {
  var p = BY_ID[id]; if (!p) return;
  var q = cart[id] || 0;
  if (q >= p.stock) { toast("Limite de " + p.stock + " unidades por pedido neste lote."); return; }
  cart[id] = q + 1; persist(); renderCart(); toast(p.name + " adicionado ao carrinho");
}
function setQty(id, q) {
  var p = BY_ID[id];
  if (q <= 0) delete cart[id]; else cart[id] = Math.min(q, p.stock);
  persist(); renderCart();
}
var checkoutMsg = "";
function renderCart() {
  var ids = Object.keys(cart), n = 0, sub = 0;
  ids.forEach(function (id) { n += cart[id]; sub += cart[id] * BY_ID[id].price; });
  var c = $("#cart-count"); c.textContent = n; c.dataset.empty = n === 0 ? "true" : "false";
  $("#open-cart").setAttribute("aria-label", "Abrir carrinho, " + n + (n === 1 ? " item" : " itens"));
  var body = $("#cart-body"), foot = $("#cart-foot");
  if (!ids.length) {
    body.innerHTML = '<div class="empty"><p>Seu carrinho está vazio.</p><a class="btn btn-primary btn-sm" href="#produtos" data-close="cart">Ver produtos</a></div>';
    foot.innerHTML = ""; foot.hidden = true; return;
  }
  foot.hidden = false;
  var h = '<ul class="cart-items">';
  ids.forEach(function (id) {
    var p = BY_ID[id], q = cart[id];
    h += '<li class="cart-item"><div><h4>' + p.name + '</h4><span class="unit">' + fmt(p.price) + ' cada</span></div><div class="line">' + fmt(p.price * q) + '</div>';
    h += '<div class="qty" role="group" aria-label="Quantidade de ' + p.name + '"><button type="button" data-dec="' + id + '" aria-label="Diminuir">−</button><output>' + q + '</output><button type="button" data-inc="' + id + '" aria-label="Aumentar"' + (q >= p.stock ? " disabled" : "") + '>+</button></div>';
    h += '<div style="text-align:right"><button class="link-btn" type="button" data-rm="' + id + '">Remover</button></div></li>';
  });
  body.innerHTML = h + '</ul>';
  var f = '<div class="totals"><div><span>Subtotal</span><span class="num">' + fmt(sub) + '</span></div>';
  f += '<div class="muted"><span>Frete</span><span>Informado antes do pagamento</span></div>';
  f += '<div class="grand"><span>Total dos produtos</span><span class="num">' + fmt(sub) + '</span></div></div>';
  if (checkoutMsg) f += '<p class="checkout-msg" role="status">' + checkoutMsg + '</p>';
  f += '<button class="btn btn-primary" type="button" id="checkout">Finalizar com Mercado Pago</button>';
  f += '<div class="cart-actions"><span class="label">Preços provisórios</span><button class="link-btn" type="button" id="clear-cart">Esvaziar carrinho</button></div>';
  foot.innerHTML = f;
}

/* Detalhe */
var detailId = null;
function openDetail(id) {
  var p = BY_ID[id]; if (!p) return; detailId = id;
  $("#detail-tag").textContent = p.kind === "hw" ? "Hardware / " + p.tag : "Software / " + p.tag;
  $("#detail-title").textContent = p.name;
  var tbc = '<dd class="tbc">A confirmar com o produto final</dd>';
  var b = '<div class="detail-art">' + art(p.seed, true) + '</div>';
  var foot = "";
  if (p.kind === "hw") {
    var s = stockInfo(p);
    b += '<div><h3 style="font-size:1.05rem;margin-bottom:8px">O que faz</h3><p style="color:var(--muted)">' + p.what + '</p></div>';
    b += '<dl class="spec"><dt>Preço</dt><dd><span class="mono">' + fmt(p.price) + '</span> <span style="color:var(--muted)">(provisório)</span></dd>';
    b += '<dt>Disponibilidade</dt><dd><span class="status" data-s="' + s.s + '"><i></i>' + s.t + '</span></dd>';
    b += '<dt>Prazo sob encomenda</dt><dd>' + p.lead + '</dd>';
    b += '<dt>Interfaces</dt><dd>' + p.interfaces + '</dd>';
    b += '<dt>Alimentação</dt>' + tbc + '<dt>Compatibilidade</dt>' + tbc + '<dt>Formato</dt><dd class="tbc">Placa montada, sem gabinete ou módulo: a confirmar</dd>';
    b += '<dt>Conteúdo da embalagem</dt>' + tbc + '<dt>Limitações</dt>' + tbc + '<dt>Versão hardware / firmware</dt>' + tbc + '</dl>';
    b += '<p class="warn"><b>Antes de comprar:</b> este produto pode exigir conhecimento técnico. A ficha técnica completa será publicada junto com as fotos reais da placa final.</p>';
    foot = '<button class="btn btn-primary" type="button" data-add="' + p.id + '"' + (s.ok ? "" : " disabled") + '>Adicionar ao carrinho</button>';
  } else {
    b += '<div><h3 style="font-size:1.05rem;margin-bottom:8px">O que faz</h3><p style="color:var(--muted)">' + p.short + '</p></div>';
    b += '<dl class="spec"><dt>Preço</dt><dd class="tbc">A definir</dd><dt>Entrega</dt><dd>Download digital após a confirmação do pagamento</dd>';
    b += '<dt>Sistema e arquitetura</dt><dd class="tbc">A definir no lançamento</dd><dt>Versão mínima e dependências</dt><dd class="tbc">A definir no lançamento</dd>';
    b += '<dt>Incluído e não incluído</dt><dd class="tbc">A definir no lançamento</dd><dt>Limitações conhecidas</dt><dd class="tbc">A definir no lançamento</dd>';
    b += '<dt>Licença e atualizações</dt><dd class="tbc">A definir no lançamento</dd><dt>Suporte</dt><dd class="tbc">A definir no lançamento</dd></dl>';
    b += '<p class="warn"><b>Uso autorizado:</b> use esta ferramenta somente em redes, dispositivos e arquivos que você esteja autorizado a analisar.</p>';
    foot = '<button class="btn btn-ghost" type="button" disabled>Compra disponível após definir preço e licença</button>';
  }
  $("#detail-body").innerHTML = b; $("#detail-foot").innerHTML = foot;
  $("#detail").showModal(); $("#detail-body").scrollTop = 0;
}

/* Eventos */
document.addEventListener("click", function (e) {
  var t = e.target.closest("button, a, dialog"); if (!t) return;
  if (t.dataset.detail) return openDetail(t.dataset.detail);
  if (t.dataset.add) { addToCart(t.dataset.add); return; }
  if (t.dataset.inc) return setQty(t.dataset.inc, (cart[t.dataset.inc] || 0) + 1);
  if (t.dataset.dec) return setQty(t.dataset.dec, (cart[t.dataset.dec] || 0) - 1);
  if (t.dataset.rm) return setQty(t.dataset.rm, 0);
  if (t.dataset.close) { var d = $("#" + t.dataset.close); if (d.open) d.close(); return; }
  if (t.id === "open-cart") { checkoutMsg = ""; renderCart(); $("#cart").showModal(); return; }
  if (t.id === "clear-cart") { cart = {}; checkoutMsg = ""; persist(); renderCart(); return; }
  if (t.id === "checkout") { checkoutMsg = "O checkout do Mercado Pago ainda não está conectado a esta página. Seu carrinho foi mantido."; renderCart(); return; }
  if (t.dataset.quote) { $("#assunto").value = t.dataset.quote; location.hash = "contato"; $("#mensagem").focus({ preventScroll: true }); return; }
  if (t.tagName === "DIALOG") t.close();
});
/* Fecha o diálogo ao clicar fora do conteúdo */
["detail", "cart"].forEach(function (id) {
  var d = $("#" + id);
  d.addEventListener("mousedown", function (e) { if (e.target === d) d.close(); });
});

/* Formulário */
$("#contact-form").addEventListener("submit", function (e) {
  e.preventDefault();
  var rules = { nome: "Informe seu nome.", email: "Informe um e-mail válido.", assunto: "Informe o assunto.", mensagem: "Escreva sua mensagem." };
  var ok = true;
  Object.keys(rules).forEach(function (k) {
    var v = $("#" + k).value.trim(), bad = !v || (k === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
    var f = $("#f-" + k); f.classList.toggle("err", bad); f.querySelector(".msg").textContent = bad ? rules[k] : "";
    if (bad) ok = false;
  });
  var st = $("#form-status");
  if (!ok) { st.className = "form-status"; st.textContent = "Revise os campos destacados."; return; }
  st.className = "form-status ok";
  st.textContent = "Formulário validado. O envio ainda não está conectado a um serviço de e-mail, então a mensagem não foi enviada.";
});

renderCart();