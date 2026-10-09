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
  { id: "network-analyzer", name: "Sentillis Network Analyzer", tag: "Redes", seed: 61, monthly: 39.90,
    short: "Descoberta de dispositivos, diagnóstico de conectividade, visualização de portas e serviços e relatórios em redes autorizadas." },
  { id: "security-audit", name: "Sentillis Security Audit", tag: "Auditoria", seed: 67, monthly: 49.90,
    short: "Verificações guiadas de configuração, serviços, permissões e controles básicos de segurança em sistemas autorizados." },
  { id: "log-analyzer", name: "Sentillis Log Analyzer", tag: "Logs", seed: 71, monthly: 29.90,
    short: "Leitura e análise de logs para identificar padrões suspeitos e facilitar a investigação inicial." },
  { id: "device-monitor", name: "Sentillis Device Monitor", tag: "Telemetria", seed: 73, monthly: 29.90,
    short: "Visualização de telemetria e estado de dispositivos compatíveis, com possível integração futura com as placas Sentillis." },
  { id: "firmware-inspector", name: "Sentillis Firmware Inspector", tag: "Firmware", seed: 79, monthly: 39.90,
    short: "Inspeção inicial de arquivos de firmware: identificação, hashes, strings, arquitetura e indicadores técnicos." }
];

var ALL = HARDWARE.map(function (p) { p.kind = "hw"; return p; }).concat(SOFTWARE.map(function (p) { p.kind = "sw"; return p; }));
var BY_ID = {}; ALL.forEach(function (p) { BY_ID[p.id] = p; });

/* Planos: desconto do plano anual sobre 12 mensalidades e desconto dos kits (placa + 12 meses de software). */
var ANNUAL_DISCOUNT = 0.20;
var KIT_DISCOUNT = 0.15;
var KITS = [
  { id: "rede", name: "Kit Rede", hw: "netprobe", sw: "network-analyzer", seed: 101 },
  { id: "iot-seguro", name: "Kit IoT Seguro", hw: "iot-secure-node", sw: "security-audit", seed: 103 },
  { id: "monitoramento", name: "Kit Monitoramento", hw: "environment-monitor", sw: "device-monitor", seed: 107 },
  { id: "firmware", name: "Kit Firmware", hw: "uart-guard", sw: "firmware-inspector", seed: 109 },
  { id: "depuracao", name: "Kit Depuração", hw: "debug-hub", sw: "log-analyzer", seed: 113 }
];
var KIT_BY_ID = {}; KITS.forEach(function (k) { KIT_BY_ID[k.id] = k; });
function money(n) { return Math.round(n * 100) / 100; }
function annualPrice(sw) { return Math.round(sw.monthly * 12 * (1 - ANNUAL_DISCOUNT)); }
function annualSaving(sw) { return money(sw.monthly * 12 - annualPrice(sw)); }
function kitFull(k) { return money(BY_ID[k.hw].price + annualPrice(BY_ID[k.sw])); }
function kitPrice(k) { return money(kitFull(k) * (1 - KIT_DISCOUNT)); }
function kitForHw(id) { var r = null; KITS.forEach(function (k) { if (k.hw === id) r = k; }); return r; }

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
var billing = "a";

function hwCard(p) {
  var s = stockInfo(p);
  var h = '<article class="card"><div class="card-art">' + art(p.seed, true) + '</div><div class="card-body">';
  h += '<span class="label">' + p.tag + '</span><h3>' + p.name + '</h3><p class="short">' + p.short + '</p>';
  h += '<div class="card-meta"><span class="price">' + fmt(p.price) + '<small>*</small></span><span class="status" data-s="' + s.s + '"><i></i>' + s.t + '</span></div>';
  h += '<div class="card-actions"><button class="btn btn-ghost btn-sm" type="button" data-detail="' + p.id + '">Ver detalhes</button>';
  h += '<button class="btn btn-primary btn-sm" type="button" data-add="hw:' + p.id + '"' + (s.ok ? "" : " disabled") + '>Adicionar ao carrinho</button></div>';
  return h + '</div></article>';
}

function swCard(p) {
  var annual = billing === "a", price = annual ? annualPrice(p) : p.monthly;
  var h = '<article class="card"><div class="card-art">' + art(p.seed, true) + '</div><div class="card-body">';
  h += '<span class="label">' + p.tag + '</span><h3>' + p.name + '</h3><p class="short">' + p.short + '</p>';
  h += '<div class="card-meta"><span class="price">' + fmt(price) + '<small>/' + (annual ? "ano" : "mês") + '*</small></span><span class="status"><i></i>Download digital</span></div>';
  h += annual
    ? '<p class="eq">Equivale a ' + fmt(price / 12) + '/mês. Economia de ' + fmt(annualSaving(p)) + ' no ano.</p>'
    : '<p class="eq">No plano anual: ' + fmt(annualPrice(p)) + '/ano, com ' + Math.round(ANNUAL_DISCOUNT * 100) + '% de desconto.</p>';
  h += '<div class="card-actions"><button class="btn btn-ghost btn-sm" type="button" data-detail="' + p.id + '">Ver planos</button>';
  h += '<button class="btn btn-primary btn-sm" type="button" data-add="sw:' + p.id + ':' + billing + '">Assinar ' + (annual ? "anual" : "mensal") + '</button></div>';
  return h + '</div></article>';
}

function kitCard(k) {
  var hw = BY_ID[k.hw], sw = BY_ID[k.sw], s = stockInfo(hw);
  var h = '<article class="card"><div class="card-art">' + art(k.seed, true) + '</div><div class="card-body">';
  h += '<span class="label">Kit / hardware + software</span><h3>' + k.name + '</h3>';
  h += '<ul class="incl"><li><span>' + hw.name + '</span><span class="mono">' + fmt(hw.price) + '</span></li>';
  h += '<li><span>' + sw.name + ', plano anual</span><span class="mono">' + fmt(annualPrice(sw)) + '</span></li></ul>';
  h += '<div class="card-meta"><span class="price"><s class="was">' + fmt(kitFull(k)) + '</s> ' + fmt(kitPrice(k)) + '<small>*</small></span><span class="badge">−' + Math.round(KIT_DISCOUNT * 100) + '%</span></div>';
  h += '<span class="status" data-s="' + s.s + '"><i></i>' + s.t + '</span>';
  h += '<div class="card-actions"><button class="btn btn-primary btn-sm" type="button" data-add="kit:' + k.id + '"' + (s.ok ? "" : " disabled") + '>Adicionar kit ao carrinho</button></div>';
  return h + '</div></article>';
}

function renderSoftware() {
  $("#sw-grid").innerHTML = SOFTWARE.map(swCard).join("");
  Array.prototype.forEach.call(document.querySelectorAll("[data-billing]"), function (b) {
    b.setAttribute("aria-pressed", b.dataset.billing === billing ? "true" : "false");
  });
}
$("#hw-grid").innerHTML = HARDWARE.map(hwCard).join("");
$("#kit-grid").innerHTML = KITS.map(kitCard).join("");
renderSoftware();
$("#hw-count").textContent = HARDWARE.length;
$("#sw-count").textContent = SOFTWARE.length;
$("#kit-count").textContent = KITS.length;
Array.prototype.forEach.call(document.querySelectorAll("[data-pct-annual]"), function (el) { el.textContent = Math.round(ANNUAL_DISCOUNT * 100); });
Array.prototype.forEach.call(document.querySelectorAll("[data-pct-kit]"), function (el) { el.textContent = Math.round(KIT_DISCOUNT * 100); });
$("#hero-art").innerHTML = art(97, false);

/* Contato */
$("#ch-email").textContent = CONTACT.email || "Em breve";
$("#ch-ig").textContent = CONTACT.instagram || "Em breve";

/* Itens do carrinho. Chaves: "hw:id", "sw:id:m", "sw:id:a", "kit:id". */
function resolve(key) {
  var a = key.split(":"), p, r;
  if (a[0] === "hw") {
    p = BY_ID[a[1]]; if (!p || p.kind !== "hw") return null;
    return { key: key, kind: "hw", name: p.name, unit: "Hardware, " + fmt(p.price) + " cada", price: p.price, max: p.stock, hw: p.id, saving: 0 };
  }
  if (a[0] === "sw") {
    p = BY_ID[a[1]]; if (!p || p.kind !== "sw" || (a[2] !== "m" && a[2] !== "a")) return null;
    var m = a[2] === "m", pr = m ? p.monthly : annualPrice(p);
    return { key: key, kind: "sw", name: p.name, unit: (m ? "Plano mensal, " + fmt(pr) + "/mês" : "Plano anual, " + fmt(pr) + "/ano"), price: pr, max: 1, sw: p.id, plan: a[2],
      saving: m ? 0 : annualSaving(p), renew: p.name + ": renova " + (m ? "todo mês por " + fmt(pr) : "todo ano por " + fmt(pr)) };
  }
  if (a[0] === "kit") {
    var k = KIT_BY_ID[a[1]]; if (!k) return null;
    r = BY_ID[k.hw];
    return { key: key, kind: "kit", name: k.name, unit: r.name + " + " + BY_ID[k.sw].name + " (12 meses), " + fmt(kitPrice(k)) + " cada", price: kitPrice(k), max: r.stock, hw: k.hw, sw: k.sw,
      saving: money(kitFull(k) - kitPrice(k)), renew: BY_ID[k.sw].name + ": renova todo ano por " + fmt(annualPrice(BY_ID[k.sw])) };
  }
  return null;
}

var cart = {};
function hwUsed(id) {
  var n = 0;
  Object.keys(cart).forEach(function (k) { var r = resolve(k); if (r && r.hw === id) n += cart[k]; });
  return n;
}
try {
  var saved = JSON.parse(localStorage.getItem("sentillis-cart") || "{}");
  Object.keys(saved).forEach(function (k0) {
    var k = BY_ID[k0] ? "hw:" + k0 : k0, r = resolve(k), q = parseInt(saved[k0], 10);
    if (!r || !(q > 0)) return;
    q = Math.min(q, r.max);
    if (r.hw) q = Math.min(q, BY_ID[r.hw].stock - hwUsed(r.hw));
    if (q > 0) cart[k] = q;
  });
} catch (e) {}
function persist() { try { localStorage.setItem("sentillis-cart", JSON.stringify(cart)); } catch (e) {} }
function cartItems() {
  var out = [];
  Object.keys(cart).forEach(function (k) { var r = resolve(k); if (r) { r.qty = cart[k]; out.push(r); } });
  return out;
}
function cartNeeds() {
  var n = { hw: false, sw: false };
  cartItems().forEach(function (r) { if (r.kind === "hw" || r.kind === "kit") n.hw = true; if (r.kind === "sw" || r.kind === "kit") n.sw = true; });
  return n;
}
var toastTimer;
function toast(msg) { var t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2400); }

function canAddMore(key, r) {
  if (r.kind === "sw") return (cart[key] || 0) < 1;
  if ((cart[key] || 0) >= r.max) return false;
  return !r.hw || hwUsed(r.hw) < BY_ID[r.hw].stock;
}
function addToCart(key) {
  var r = resolve(key); if (!r) return;
  if (!canAddMore(key, r)) {
    toast(r.kind === "sw" ? "Este plano já está no carrinho." : "Limite de " + BY_ID[r.hw].stock + " unidades por pedido neste lote.");
    return;
  }
  var msg = r.name + " adicionado ao carrinho";
  if (r.kind === "sw") {
    var other = "sw:" + r.sw + ":" + (r.plan === "m" ? "a" : "m");
    if (cart[other]) { delete cart[other]; msg = r.name + ": plano " + (r.plan === "m" ? "mensal" : "anual") + " no carrinho"; }
  }
  cart[key] = (cart[key] || 0) + 1; persist(); renderCart(); toast(msg);
}
function setQty(key, q) {
  var r = resolve(key); if (!r) return;
  if (q <= 0) delete cart[key];
  else {
    var cur = cart[key] || 0, room = r.hw ? BY_ID[r.hw].stock - (hwUsed(r.hw) - cur) : r.max;
    cart[key] = Math.min(q, r.max, room);
  }
  persist(); renderCart();
}
var checkoutMsg = "";
function renderCart() {
  var items = cartItems(), n = 0, total = 0, save = 0, hasHw = false, renew = [];
  items.forEach(function (r) {
    n += r.qty; total += r.price * r.qty; save += r.saving * r.qty;
    if (r.kind !== "sw") hasHw = true;
    if (r.renew) renew.push(r.renew);
  });
  total = money(total); save = money(save);
  var c = $("#cart-count"); c.textContent = n; c.dataset.empty = n === 0 ? "true" : "false";
  $("#open-cart").setAttribute("aria-label", "Abrir carrinho, " + n + (n === 1 ? " item" : " itens"));
  var body = $("#cart-body"), foot = $("#cart-foot");
  if (!items.length) {
    body.innerHTML = '<div class="empty"><p>Seu carrinho está vazio.</p><a class="btn btn-primary btn-sm" href="#produtos" data-close="cart">Ver produtos</a></div>';
    foot.innerHTML = ""; foot.hidden = true; return;
  }
  foot.hidden = false;
  var h = '<ul class="cart-items">';
  items.forEach(function (r) {
    var k = r.key, canInc = r.kind !== "sw" && canAddMore(k, r);
    h += '<li class="cart-item"><div><h4>' + r.name + '</h4><span class="unit">' + r.unit + '</span></div><div class="line">' + fmt(r.price * r.qty) + '</div>';
    if (r.kind === "sw") h += '<span class="unit">1 licença</span>';
    else h += '<div class="qty" role="group" aria-label="Quantidade de ' + r.name + '"><button type="button" data-dec="' + k + '" aria-label="Diminuir">−</button><output>' + r.qty + '</output><button type="button" data-inc="' + k + '" aria-label="Aumentar"' + (canInc ? "" : " disabled") + '>+</button></div>';
    h += '<div style="text-align:right"><button class="link-btn" type="button" data-rm="' + k + '">Remover</button></div></li>';
  });
  body.innerHTML = h + '</ul>';
  var f = '<div class="totals"><div><span>Subtotal</span><span class="num">' + fmt(total) + '</span></div>';
  f += '<div class="muted"><span>Frete</span><span>' + (hasHw ? "Informado antes do pagamento" : "Sem frete (download digital)") + '</span></div>';
  f += '<div class="grand"><span>Cobrado hoje</span><span class="num">' + fmt(total) + '</span></div>';
  if (save > 0) f += '<div class="save"><span>Economia já aplicada</span><span class="num">' + fmt(save) + '</span></div>';
  f += '</div>';
  if (renew.length) f += '<div class="renew"><span class="label">Renovações</span><ul>' + renew.map(function (t) { return "<li>" + t + "</li>"; }).join("") + '</ul></div>';
  if (window.Account) f += Account.cartSummary(cartNeeds());
  if (checkoutMsg) f += '<p class="checkout-msg" role="status">' + checkoutMsg + '</p>';
  f += '<button class="btn btn-primary" type="button" id="checkout">Finalizar com Mercado Pago</button>';
  f += '<div class="cart-actions"><span class="label">Preços provisórios</span><button class="link-btn" type="button" id="clear-cart">Esvaziar carrinho</button></div>';
  foot.innerHTML = f;
}

/* Detalhe */
function openDetail(id) {
  var p = BY_ID[id]; if (!p) return;
  $("#detail-tag").textContent = p.kind === "hw" ? "Hardware / " + p.tag : "Software / " + p.tag;
  $("#detail-title").textContent = p.name;
  var tbc = '<dd class="tbc">A confirmar com o produto final</dd>';
  var b = '<div class="detail-art">' + art(p.seed, true) + '</div>';
  var foot = "";
  if (p.kind === "hw") {
    var s = stockInfo(p), kit = kitForHw(p.id);
    b += '<div><h3 style="font-size:1.05rem;margin-bottom:8px">O que faz</h3><p style="color:var(--muted)">' + p.what + '</p></div>';
    b += '<dl class="spec"><dt>Preço</dt><dd><span class="mono">' + fmt(p.price) + '</span> <span style="color:var(--muted)">(provisório)</span></dd>';
    b += '<dt>Disponibilidade</dt><dd><span class="status" data-s="' + s.s + '"><i></i>' + s.t + '</span></dd>';
    b += '<dt>Prazo sob encomenda</dt><dd>' + p.lead + '</dd>';
    b += '<dt>Interfaces</dt><dd>' + p.interfaces + '</dd>';
    b += '<dt>Alimentação</dt>' + tbc + '<dt>Compatibilidade</dt>' + tbc + '<dt>Formato</dt><dd class="tbc">Placa montada, sem gabinete ou módulo: a confirmar</dd>';
    b += '<dt>Conteúdo da embalagem</dt>' + tbc + '<dt>Limitações</dt>' + tbc + '<dt>Versão hardware / firmware</dt>' + tbc + '</dl>';
    if (kit) b += '<p class="warn"><b>' + kit.name + ':</b> esta placa com ' + BY_ID[kit.sw].name + ' (12 meses) por ' + fmt(kitPrice(kit)) + ', com ' + Math.round(KIT_DISCOUNT * 100) + '% de desconto. <a href="#kits" data-close="detail">Ver kit</a></p>';
    b += '<p class="warn"><b>Antes de comprar:</b> este produto pode exigir conhecimento técnico. A ficha técnica completa será publicada junto com as fotos reais da placa final.</p>';
    foot = '<button class="btn btn-primary" type="button" data-add="hw:' + p.id + '"' + (s.ok ? "" : " disabled") + '>Adicionar ao carrinho</button>';
  } else {
    var ap = annualPrice(p);
    b += '<div><h3 style="font-size:1.05rem;margin-bottom:8px">O que faz</h3><p style="color:var(--muted)">' + p.short + '</p></div>';
    b += '<div class="plans"><div class="plan"><span class="label">Plano mensal</span><b class="price">' + fmt(p.monthly) + '<small>/mês*</small></b><p>Cobrança todo mês. Cancele quando quiser, conforme as políticas.</p></div>';
    b += '<div class="plan best"><span class="label">Plano anual <span class="badge">−' + Math.round(ANNUAL_DISCOUNT * 100) + '%</span></span><b class="price">' + fmt(ap) + '<small>/ano*</small></b><p>Equivale a ' + fmt(ap / 12) + '/mês. Economia de ' + fmt(annualSaving(p)) + ' no ano.</p></div></div>';
    b += '<dl class="spec"><dt>Entrega</dt><dd>Download digital e licença enviados ao e-mail de licenciamento da sua conta, depois da confirmação do pagamento</dd>';
    b += '<dt>Sistema e arquitetura</dt><dd class="tbc">A definir no lançamento</dd><dt>Versão mínima e dependências</dt><dd class="tbc">A definir no lançamento</dd>';
    b += '<dt>Incluído e não incluído</dt><dd class="tbc">A definir no lançamento</dd><dt>Limitações conhecidas</dt><dd class="tbc">A definir no lançamento</dd>';
    b += '<dt>Licença e atualizações</dt><dd class="tbc">A definir no lançamento</dd><dt>Suporte</dt><dd class="tbc">A definir no lançamento</dd></dl>';
    b += '<p class="warn"><b>Uso autorizado:</b> use esta ferramenta somente em redes, dispositivos e arquivos que você esteja autorizado a analisar.</p>';
    foot = '<div class="foot-btns"><button class="btn btn-ghost" type="button" data-add="sw:' + p.id + ':m">Assinar mensal</button><button class="btn btn-primary" type="button" data-add="sw:' + p.id + ':a">Assinar anual</button></div>';
  }
  $("#detail-body").innerHTML = b; $("#detail-foot").innerHTML = foot;
  $("#detail").showModal(); $("#detail-body").scrollTop = 0;
}

/* Eventos */
document.addEventListener("click", function (e) {
  var t = e.target.closest("button, a"); if (!t) return;
  if (t.dataset.billing) { billing = t.dataset.billing; renderSoftware(); return; }
  if (t.dataset.detail) return openDetail(t.dataset.detail);
  if (t.dataset.add) { addToCart(t.dataset.add); return; }
  if (t.dataset.inc) return setQty(t.dataset.inc, (cart[t.dataset.inc] || 0) + 1);
  if (t.dataset.dec) return setQty(t.dataset.dec, (cart[t.dataset.dec] || 0) - 1);
  if (t.dataset.rm) return setQty(t.dataset.rm, 0);
  if (t.dataset.close) { var d = $("#" + t.dataset.close); if (d.open) d.close(); return; }
  if (t.id === "open-cart") { checkoutMsg = ""; renderCart(); $("#cart").showModal(); return; }
  if (t.id === "clear-cart") { cart = {}; checkoutMsg = ""; persist(); renderCart(); return; }
  if (t.id === "checkout") {
    if (window.Account && !Account.gate(cartNeeds()).ok) return;
    checkoutMsg = "Seus dados estão completos. O checkout do Mercado Pago ainda não está conectado a esta página, e seu carrinho foi mantido.";
    renderCart(); return;
  }
  if (t.dataset.quote) { $("#assunto").value = t.dataset.quote; location.hash = "contato"; $("#mensagem").focus({ preventScroll: true }); return; }
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