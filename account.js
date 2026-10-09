/*
  Contas da loja Sentillis Security.
  A camada "Backend" abaixo guarda tudo no localStorage do navegador, só para demonstração.
  Para vender de verdade, troque os métodos do Backend por chamadas ao seu servidor
  (mesmos nomes e mesmos retornos em Promise) e a interface continua igual.
*/
(function () {
  "use strict";

  var USERS_KEY = "sentillis-users";
  var SESSION_KEY = "sentillis-session";
  var UFS = "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ");
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function $(s, r) { return (r || document).querySelector(s); }
  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function digits(s) { return String(s || "").replace(/\D/g, ""); }
  function uid() {
    return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }

  /* ---------- Máscaras e validações ---------- */
  function fmtCep(v) { var d = digits(v).slice(0, 8); return d.length > 5 ? d.slice(0, 5) + "-" + d.slice(5) : d; }
  function fmtPhone(v) {
    var d = digits(v).slice(0, 11), cut = d.length > 10 ? 7 : 6, o = "";
    if (d.length) o = "(" + d.slice(0, 2);
    if (d.length > 2) o += ") " + d.slice(2, cut);
    if (d.length > cut) o += "-" + d.slice(cut);
    return o;
  }
  function fmtDoc(v) {
    var d = digits(v).slice(0, 14);
    if (d.length <= 11) {
      return d.replace(/(\d{3})(\d{0,3})(\d{0,3})(\d{0,2})/, function (_, a, b, c, e) {
        return a + (b ? "." + b : "") + (c ? "." + c : "") + (e ? "-" + e : "");
      });
    }
    return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, function (_, a, b, c, e, f) {
      return a + "." + b + "." + c + "/" + e + (f ? "-" + f : "");
    });
  }
  function validCPF(s) {
    if (s.length !== 11 || /^(\d)\1+$/.test(s)) return false;
    for (var t = 9; t < 11; t++) {
      var d = 0;
      for (var c = 0; c < t; c++) d += +s[c] * ((t + 1) - c);
      d = ((10 * d) % 11) % 10;
      if (+s[t] !== d) return false;
    }
    return true;
  }
  function validCNPJ(s) {
    if (s.length !== 14 || /^(\d)\1+$/.test(s)) return false;
    var w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2], w2 = [6].concat(w1);
    function dv(w) { var sum = 0; for (var i = 0; i < w.length; i++) sum += +s[i] * w[i]; var r = sum % 11; return r < 2 ? 0 : 11 - r; }
    return dv(w1) === +s[12] && dv(w2) === +s[13];
  }

  /* ---------- Senha: PBKDF2 com sal por usuário ---------- */
  function b64(buf) { var s = ""; new Uint8Array(buf).forEach(function (b) { s += String.fromCharCode(b); }); return btoa(s); }
  function unb64(str) { var s = atob(str), a = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; }
  function needCrypto() {
    return (window.crypto && crypto.subtle) ? null : new Error("Este navegador não oferece a criptografia necessária. Abra o site por HTTPS.");
  }
  function hashPass(pass, salt) {
    var enc = new TextEncoder();
    return crypto.subtle.importKey("raw", enc.encode(pass), "PBKDF2", false, ["deriveBits"]).then(function (k) {
      return crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: salt, iterations: 150000 }, k, 256);
    }).then(b64);
  }

  /* ---------- Camada de dados (trocar por servidor) ---------- */
  var Backend = {
    _db: function () { try { return JSON.parse(localStorage.getItem(USERS_KEY) || "{}") || {}; } catch (e) { return {}; } },
    _save: function (db) {
      try { localStorage.setItem(USERS_KEY, JSON.stringify(db)); }
      catch (e) { throw new Error("Este navegador bloqueou o armazenamento local. Não foi possível salvar."); }
    },
    _session: function () { try { return localStorage.getItem(SESSION_KEY) || ""; } catch (e) { return ""; } },
    _setSession: function (email) {
      try { if (email) localStorage.setItem(SESSION_KEY, email); else localStorage.removeItem(SESSION_KEY); } catch (e) {}
    },
    _pub: function (u) {
      return u ? { id: u.id, name: u.name, email: u.email, createdAt: u.createdAt, addresses: u.addresses || [], licensing: u.licensing || null, licenses: u.licenses || [] } : null;
    },
    _update: function (fn) {
      var db = Backend._db(), u = db[Backend._session()];
      if (!u) return Promise.reject(new Error("Sua sessão expirou. Entre novamente."));
      try { fn(u); Backend._save(db); } catch (e) { return Promise.reject(e); }
      return Promise.resolve(Backend._pub(u));
    },
    hasUsers: function () { return Object.keys(Backend._db()).length > 0; },
    me: function () { return Promise.resolve(Backend._pub(Backend._db()[Backend._session()])); },
    register: function (d) {
      var guard = needCrypto(); if (guard) return Promise.reject(guard);
      var email = d.email.trim().toLowerCase();
      if (Backend._db()[email]) return Promise.reject(new Error("Já existe uma conta com este e-mail. Use a aba Entrar."));
      var salt = crypto.getRandomValues(new Uint8Array(16));
      return hashPass(d.password, salt).then(function (h) {
        var u = { id: uid(), name: d.name.trim(), email: email, salt: b64(salt), hash: h, createdAt: new Date().toISOString(), addresses: [], licensing: null, licenses: [] };
        var db = Backend._db(); db[email] = u; Backend._save(db); Backend._setSession(email);
        return Backend._pub(u);
      });
    },
    login: function (d) {
      var guard = needCrypto(); if (guard) return Promise.reject(guard);
      var email = d.email.trim().toLowerCase(), u = Backend._db()[email], bad = new Error("E-mail ou senha incorretos.");
      if (!u) return hashPass(d.password, crypto.getRandomValues(new Uint8Array(16))).then(function () { throw bad; });
      return hashPass(d.password, unb64(u.salt)).then(function (h) {
        if (h !== u.hash) throw bad;
        Backend._setSession(email);
        return Backend._pub(u);
      });
    },
    logout: function () { Backend._setSession(""); return Promise.resolve(); },
    saveAddress: function (a) {
      return Backend._update(function (u) {
        var list = u.addresses || [], i = -1;
        if (a.id) list.forEach(function (x, k) { if (x.id === a.id) i = k; });
        if (i >= 0) list[i] = a; else { a.id = uid(); list.push(a); }
        if (a.isDefault || list.length === 1) list.forEach(function (x) { x.isDefault = x.id === a.id; });
        else if (!list.some(function (x) { return x.isDefault; })) list[0].isDefault = true;
        u.addresses = list;
      });
    },
    setDefaultAddress: function (id) {
      return Backend._update(function (u) { (u.addresses || []).forEach(function (x) { x.isDefault = x.id === id; }); });
    },
    removeAddress: function (id) {
      return Backend._update(function (u) {
        var list = (u.addresses || []).filter(function (x) { return x.id !== id; });
        if (list.length && !list.some(function (x) { return x.isDefault; })) list[0].isDefault = true;
        u.addresses = list;
      });
    },
    saveLicensing: function (l) { return Backend._update(function (u) { u.licensing = l; }); },
    deleteAccount: function () {
      var db = Backend._db(); delete db[Backend._session()];
      try { Backend._save(db); } catch (e) { return Promise.reject(e); }
      Backend._setSession("");
      return Promise.resolve();
    }
  };

  /* ---------- Estado e utilitários de interface ---------- */
  var dlg, lookedUp = "";
  var S = { user: null, tab: "login", editing: null, notice: "", pending: null, confirmDelete: false };

  function needs() { return typeof cartNeeds === "function" ? cartNeeds() : { hw: false, sw: false }; }
  function defaultAddr(u) {
    var l = (u && u.addresses) || [], d = null;
    l.forEach(function (a) { if (a.isDefault) d = a; });
    return d || l[0] || null;
  }
  function findAddr(u, id) { var r = null; (u.addresses || []).forEach(function (a) { if (a.id === id) r = a; }); return r; }
  function say(f, msg, ok) { var p = f.querySelector(".form-status"); if (p) { p.textContent = msg; p.className = "form-status" + (ok ? " ok" : ""); } }
  function val(id) { var el = $("#ac-" + id); return el ? el.value.trim() : ""; }
  function check(rules) {
    var ok = true;
    rules.forEach(function (r) {
      var m = r[1](), w = $("#fw-" + r[0]);
      if (!w) return;
      w.classList.toggle("err", !!m);
      w.querySelector(".msg").textContent = m || "";
      if (m) ok = false;
    });
    if (!ok) { var f = dlg.querySelector(".field.err input, .field.err select"); if (f) f.focus(); }
    return ok;
  }

  function F(id, label, o) {
    o = o || {};
    var h = '<div class="field' + (o.span ? " span2" : "") + '" id="fw-' + id + '"><label for="ac-' + id + '">' + label + (o.opt ? ' <span class="opt">(opcional)</span>' : "") + "</label>";
    if (o.options) {
      h += '<select id="ac-' + id + '" name="' + id + '">' + o.options + "</select>";
    } else {
      h += '<input id="ac-' + id + '" name="' + id + '" type="' + (o.type || "text") + '"' +
        (o.ac ? ' autocomplete="' + o.ac + '"' : "") + (o.mode ? ' inputmode="' + o.mode + '"' : "") +
        (o.max ? ' maxlength="' + o.max + '"' : "") + (o.val != null && o.val !== "" ? ' value="' + esc(o.val) + '"' : "") + ">";
    }
    if (o.hint) h += '<span class="hint">' + o.hint + "</span>";
    return h + '<span class="msg" role="alert"></span></div>';
  }
  function C(id, label, checked) {
    return '<div class="field check span2" id="fw-' + id + '"><label class="chk"><input type="checkbox" id="ac-' + id + '" name="' + id + '"' + (checked ? " checked" : "") + "><span>" + label + '</span></label><span class="msg" role="alert"></span></div>';
  }
  function tabs(list) {
    return '<div class="tabs" role="tablist">' + list.map(function (t) {
      return '<button type="button" role="tab" class="tab" aria-selected="' + (S.tab === t[0]) + '" data-tab="' + t[0] + '">' + t[1] + "</button>";
    }).join("") + "</div>";
  }
  function ufOptions(sel) {
    return '<option value="">UF</option>' + UFS.map(function (u) { return '<option value="' + u + '"' + (u === sel ? " selected" : "") + ">" + u + "</option>"; }).join("");
  }

  /* ---------- Telas ---------- */
  function viewLogin() {
    return '<form class="stack" data-form="login" novalidate>' +
      F("l-email", "E-mail", { type: "email", ac: "email" }) +
      F("l-pass", "Senha", { type: "password", ac: "current-password" }) +
      '<div><button class="btn btn-primary" type="submit">Entrar</button></div><p class="form-status" role="status"></p>' +
      '<p class="lead">Ainda não tem conta? <button class="link-btn neutral" type="button" data-tab="signup">Criar conta</button></p></form>';
  }
  function viewSignup() {
    return '<form class="stack" data-form="signup" novalidate>' +
      F("s-name", "Nome completo", { ac: "name" }) +
      F("s-email", "E-mail", { type: "email", ac: "email" }) +
      F("s-pass", "Senha", { type: "password", ac: "new-password", hint: "Mínimo de 8 caracteres." }) +
      F("s-pass2", "Confirmar senha", { type: "password", ac: "new-password" }) +
      C("s-terms", 'Li e aceito os <a href="#politicas" data-close="account">termos de uso e a política de privacidade</a>.', false) +
      '<div><button class="btn btn-primary" type="submit">Criar conta</button></div><p class="form-status" role="status"></p>' +
      '<p class="lead">Já tem conta? <button class="link-btn neutral" type="button" data-tab="login">Entrar</button></p></form>';
  }
  function addrCard(a) {
    var id = esc(a.id);
    return '<li class="addr"><div class="addr-top"><b>' + esc(a.name) + "</b>" + (a.isDefault ? '<span class="badge">Padrão</span>' : "") + "</div>" +
      "<p>" + esc(a.street) + ", " + esc(a.number) + (a.comp ? " – " + esc(a.comp) : "") + "</p><p>" + esc(a.hood) + "</p>" +
      "<p>" + esc(a.city) + "/" + esc(a.uf) + " · CEP " + esc(a.cep) + "</p>" + (a.ref ? "<p>Referência: " + esc(a.ref) + "</p>" : "") +
      "<p>" + esc(a.phone) + "</p>" +
      '<div class="addr-actions"><button class="link-btn neutral" type="button" data-act="addr-edit" data-id="' + id + '">Editar</button>' +
      (a.isDefault ? "" : '<button class="link-btn neutral" type="button" data-act="addr-def" data-id="' + id + '">Tornar padrão</button>') +
      '<button class="link-btn" type="button" data-act="addr-del" data-id="' + id + '">Remover</button></div></li>';
  }
  function addressForm(a) {
    a = a || {};
    var first = !S.user.addresses.length;
    return '<form class="fgrid" data-form="address" data-id="' + esc(a.id || "") + '" novalidate>' +
      F("a-name", "Nome do destinatário", { span: 1, ac: "name", val: a.name || S.user.name }) +
      F("a-phone", "Telefone", { ac: "tel", mode: "tel", max: 15, val: a.phone }) +
      F("a-cep", "CEP", { ac: "postal-code", mode: "numeric", max: 9, val: a.cep }) +
      F("a-street", "Rua, avenida", { span: 1, ac: "address-line1", val: a.street }) +
      F("a-number", "Número", { max: 10, val: a.number }) +
      F("a-comp", "Complemento", { opt: 1, ac: "address-line2", val: a.comp }) +
      F("a-hood", "Bairro", { val: a.hood }) +
      F("a-city", "Cidade", { ac: "address-level2", val: a.city }) +
      F("a-uf", "Estado", { options: ufOptions(a.uf || "") }) +
      F("a-ref", "Ponto de referência", { span: 1, opt: 1, val: a.ref }) +
      C("a-default", "Usar como endereço de entrega padrão", a.isDefault || first) +
      '<div class="span2 addr-actions"><button class="btn btn-primary" type="submit">Salvar endereço</button>' +
      (S.user.addresses.length ? '<button class="btn btn-ghost" type="button" data-act="addr-cancel">Cancelar</button>' : "") +
      '</div><p class="span2 form-status" role="status"></p></form>';
  }
  function viewAddresses() {
    var u = S.user, h = '<p class="lead">Endereços para entrega de produtos físicos. Software é entregue por download e não precisa de endereço.</p>';
    if (S.editing) return h + addressForm(S.editing === "new" ? null : findAddr(u, S.editing));
    if (!u.addresses.length) {
      return h + '<div class="empty"><p>Nenhum endereço cadastrado.</p><button class="btn btn-primary btn-sm" type="button" data-act="addr-new">Adicionar endereço</button></div>';
    }
    return h + '<ul class="addr-list">' + u.addresses.map(addrCard).join("") + '</ul><div><button class="btn btn-ghost btn-sm" type="button" data-act="addr-new">Adicionar outro endereço</button></div>';
  }
  function licList(u) {
    var l = u.licenses || [];
    if (!l.length) return '<p class="lead">Nenhuma licença ainda. Elas aparecem aqui quando um pagamento de software for confirmado.</p>';
    return '<ul class="addr-list">' + l.map(function (x) {
      return '<li class="addr"><div class="addr-top"><b>' + esc(x.product) + '</b><span class="badge">' + esc(x.status || "Ativa") + "</span></div>" +
        (x.version ? "<p>Versão " + esc(x.version) + "</p>" : "") + (x.key ? '<p class="mono" style="user-select:all">' + esc(x.key) + "</p>" : "") + "</li>";
    }).join("") + "</ul>";
  }
  function viewLicensing() {
    var u = S.user, l = u.licensing || {};
    return '<p class="lead">Dados para emitir as licenças dos softwares. Depois da confirmação do pagamento, a licença e o link de download são enviados ao e-mail abaixo.</p>' +
      '<form class="fgrid" data-form="licensing" novalidate>' +
      F("lc-name", "Licenciado (nome completo ou empresa)", { span: 1, ac: "name", val: l.name || u.name }) +
      F("lc-mail", "E-mail para receber a licença", { type: "email", ac: "email", val: l.email || u.email }) +
      F("lc-doc", "CPF ou CNPJ", { opt: 1, mode: "numeric", max: 18, val: l.doc, hint: "Usado na nota fiscal." }) +
      C("lc-auth", "Declaro que usarei as ferramentas somente em redes, dispositivos e arquivos que estou autorizado a analisar.", !!l.authorizedUse) +
      '<div class="span2"><button class="btn btn-primary" type="submit">Salvar dados de licenciamento</button></div><p class="span2 form-status" role="status"></p></form>' +
      '<h3 class="sec-title">Minhas licenças</h3>' + licList(u);
  }
  function viewAccount() {
    var u = S.user, d = new Date(u.createdAt);
    var h = '<dl class="spec"><dt>Nome</dt><dd>' + esc(u.name) + "</dd><dt>E-mail</dt><dd>" + esc(u.email) + "</dd><dt>Conta criada em</dt><dd>" +
      (isNaN(d) ? "" : d.toLocaleDateString("pt-BR")) + "</dd><dt>Endereços salvos</dt><dd>" + u.addresses.length + "</dd></dl>";
    h += '<div><button class="btn btn-ghost btn-sm" type="button" data-act="logout">Sair da conta</button></div>';
    if (S.confirmDelete) {
      h += '<div class="notice"><p>Excluir a conta e todos os dados salvos (endereços e licenciamento)? Isso não pode ser desfeito.</p><div class="addr-actions" style="margin-top:12px"><button class="btn btn-danger btn-sm" type="button" data-act="del-ok">Sim, excluir conta</button><button class="btn btn-ghost btn-sm" type="button" data-act="del-cancel">Cancelar</button></div></div>';
    } else {
      h += '<div><button class="link-btn" type="button" data-act="del-ask">Excluir conta</button></div>';
    }
    return h;
  }

  function render() {
    var u = S.user, t, v;
    $("#account-title").textContent = u ? "Minha conta" : "Entrar ou criar conta";
    if (u) {
      t = tabs([["addresses", "Endereços"], ["licensing", "Licenças"], ["account", "Conta"]]);
      v = S.tab === "licensing" ? viewLicensing() : S.tab === "account" ? viewAccount() : viewAddresses();
    } else {
      t = tabs([["login", "Entrar"], ["signup", "Criar conta"]]);
      v = S.tab === "signup" ? viewSignup() : viewLogin();
    }
    $("#account-body").innerHTML = t + (S.notice ? '<p class="notice" role="status">' + esc(S.notice) + "</p>" : "") + v;
    $("#account-foot").innerHTML = '<p class="warn demo"><b>Versão de demonstração:</b> a conta fica salva só neste navegador. Para vender, os cadastros precisam ir para um servidor.</p>';
  }

  function updateHeader() {
    var b = $("#open-account"); if (!b) return;
    var u = S.user, l = $(".acct-label", b);
    l.textContent = u ? u.name.trim().split(/\s+/)[0] : "Entrar";
    b.setAttribute("aria-label", u ? "Minha conta: " + u.name : "Entrar ou criar conta");
    if (u) {
      var n = $("#nome"), m = $("#email");
      if (n && !n.value) n.value = u.name;
      if (m && !m.value) m.value = u.email;
    }
  }

  /* ---------- Fluxo ---------- */
  function nextStep() {
    var u = S.user, n = S.pending;
    if (!n) return null;
    if (!u) return "signup";
    if (n.hw && !defaultAddr(u)) return "addresses";
    if (n.sw && !u.licensing) return "licensing";
    return null;
  }
  function afterChange(okMsg) {
    if (S.pending) {
      var nx = nextStep();
      if (nx) {
        S.tab = nx;
        S.editing = nx === "addresses" ? "new" : null;
        S.notice = nx === "addresses" ? "Cadastre o endereço de entrega para continuar a compra." : "Preencha os dados de licenciamento para continuar a compra.";
        render();
        return;
      }
      S.pending = null;
      dlg.close();
      var cb = $("#open-cart"); if (cb) cb.click();
      return;
    }
    S.notice = okMsg || "";
    render();
  }
  function afterAuth(msg) { S.tab = "addresses"; S.editing = null; S.confirmDelete = false; afterChange(msg); }

  function openAccount(tab, notice, pending) {
    Backend.me().then(function (u) {
      S.user = u; S.pending = pending || null; S.editing = null; S.confirmDelete = false; S.notice = notice || "";
      var valid = u ? ["addresses", "licensing", "account"] : ["login", "signup"];
      S.tab = valid.indexOf(tab) >= 0 ? tab : (u ? "addresses" : (Backend.hasUsers() ? "login" : "signup"));
      if (u && S.tab === "addresses" && !u.addresses.length && S.pending) S.editing = "new";
      updateHeader(); render();
      if (!dlg.open) dlg.showModal();
    });
  }

  /* ---------- Envio dos formulários ---------- */
  function doLogin(f) {
    var email = val("l-email"), pass = $("#ac-l-pass").value;
    if (!check([["l-email", function () { return EMAIL_RE.test(email) ? "" : "Informe um e-mail válido."; }], ["l-pass", function () { return pass ? "" : "Informe sua senha."; }]])) return say(f, "Revise os campos destacados.");
    var btn = f.querySelector("[type=submit]"); btn.disabled = true; say(f, "Verificando…", true);
    Backend.login({ email: email, password: pass }).then(function (u) {
      S.user = u; updateHeader(); afterAuth("Você entrou na sua conta.");
    }).catch(function (err) { btn.disabled = false; say(f, err.message); });
  }
  function doSignup(f) {
    var name = val("s-name"), email = val("s-email"), p1 = $("#ac-s-pass").value, p2 = $("#ac-s-pass2").value;
    var ok = check([
      ["s-name", function () { return name.length >= 2 ? "" : "Informe seu nome."; }],
      ["s-email", function () { return EMAIL_RE.test(email) ? "" : "Informe um e-mail válido."; }],
      ["s-pass", function () { return p1.length >= 8 ? "" : "Use pelo menos 8 caracteres."; }],
      ["s-pass2", function () { return p1 === p2 ? "" : "As senhas não são iguais."; }],
      ["s-terms", function () { return $("#ac-s-terms").checked ? "" : "Aceite os termos para criar a conta."; }]
    ]);
    if (!ok) return say(f, "Revise os campos destacados.");
    var btn = f.querySelector("[type=submit]"); btn.disabled = true; say(f, "Criando conta…", true);
    Backend.register({ name: name, email: email, password: p1 }).then(function (u) {
      S.user = u; updateHeader(); afterAuth("Conta criada. Cadastre seu endereço de entrega ou os dados de licenciamento.");
    }).catch(function (err) { btn.disabled = false; say(f, err.message); });
  }
  function doAddress(f) {
    var id = f.dataset.id || "", d = {
      name: val("a-name"), phone: val("a-phone"), cep: val("a-cep"), street: val("a-street"), number: val("a-number"),
      comp: val("a-comp"), hood: val("a-hood"), city: val("a-city"), uf: val("a-uf"), ref: val("a-ref"), isDefault: $("#ac-a-default").checked
    };
    var ok = check([
      ["a-name", function () { return d.name ? "" : "Informe o nome de quem recebe."; }],
      ["a-phone", function () { var n = digits(d.phone).length; return n === 10 || n === 11 ? "" : "Informe o telefone com DDD."; }],
      ["a-cep", function () { return digits(d.cep).length === 8 ? "" : "Informe um CEP com 8 números."; }],
      ["a-street", function () { return d.street ? "" : "Informe a rua ou avenida."; }],
      ["a-number", function () { return d.number ? "" : "Informe o número ou S/N."; }],
      ["a-hood", function () { return d.hood ? "" : "Informe o bairro."; }],
      ["a-city", function () { return d.city ? "" : "Informe a cidade."; }],
      ["a-uf", function () { return UFS.indexOf(d.uf) >= 0 ? "" : "Escolha o estado."; }]
    ]);
    if (!ok) return say(f, "Revise os campos destacados.");
    if (id) d.id = id;
    Backend.saveAddress(d).then(function (u) {
      S.user = u; S.editing = null; afterChange("Endereço salvo.");
    }).catch(function (err) { say(f, err.message); });
  }
  function doLicensing(f) {
    var d = { name: val("lc-name"), email: val("lc-mail"), doc: val("lc-doc") };
    var raw = digits(d.doc);
    var ok = check([
      ["lc-name", function () { return d.name.length >= 2 ? "" : "Informe o nome do licenciado."; }],
      ["lc-mail", function () { return EMAIL_RE.test(d.email) ? "" : "Informe um e-mail válido."; }],
      ["lc-doc", function () { return !raw || (raw.length === 11 && validCPF(raw)) || (raw.length === 14 && validCNPJ(raw)) ? "" : "CPF ou CNPJ inválido."; }],
      ["lc-auth", function () { return $("#ac-lc-auth").checked ? "" : "Confirme o uso autorizado para continuar."; }]
    ]);
    if (!ok) return say(f, "Revise os campos destacados.");
    d.authorizedUse = true; d.updatedAt = new Date().toISOString();
    Backend.saveLicensing(d).then(function (u) {
      S.user = u; afterChange("Dados de licenciamento salvos.");
    }).catch(function (err) { say(f, err.message); });
  }

  /* ---------- CEP: preenchimento automático quando o serviço responde ---------- */
  function fill(id, v) { var el = $("#ac-" + id); if (el && !el.value && v) el.value = v; }
  function lookup(cep) {
    if (lookedUp === cep) return;
    lookedUp = cep;
    try {
      fetch("https://viacep.com.br/ws/" + cep + "/json/").then(function (r) { return r.json(); }).then(function (d) {
        var el = $("#ac-a-cep");
        if (!d || d.erro || !el || digits(el.value) !== cep) return;
        fill("a-street", d.logradouro); fill("a-hood", d.bairro); fill("a-city", d.localidade);
        var uf = $("#ac-a-uf"); if (uf && !uf.value && UFS.indexOf(d.uf) >= 0) uf.value = d.uf;
      }).catch(function () {});
    } catch (e) {}
  }

  /* ---------- Resumo no carrinho e bloqueio do checkout ---------- */
  function cartSummary(n) {
    var u = S.user, h = '<div class="deliv">';
    if (!u) {
      var tab = Backend.hasUsers() ? "login" : "signup";
      return h + "<p>Para finalizar, entre ou crie uma conta.</p>" + '<button class="link-btn neutral" type="button" data-account-tab="' + tab + '">' + (tab === "login" ? "Entrar" : "Criar conta") + "</button></div>";
    }
    if (n.hw) {
      var a = defaultAddr(u);
      h += '<span class="label">Entrega</span>';
      h += a
        ? "<p><b>" + esc(a.name) + "</b><br>" + esc(a.street) + ", " + esc(a.number) + (a.comp ? " – " + esc(a.comp) : "") + "<br>" + esc(a.city) + "/" + esc(a.uf) + " · CEP " + esc(a.cep) + '</p><button class="link-btn neutral" type="button" data-account-tab="addresses">Alterar endereço</button>'
        : '<p>Falta cadastrar o endereço de entrega.</p><button class="link-btn neutral" type="button" data-account-tab="addresses">Cadastrar endereço</button>';
    }
    if (n.sw) {
      var l = u.licensing;
      h += '<span class="label">Licença</span>';
      h += l
        ? "<p><b>" + esc(l.name) + "</b><br>" + esc(l.email) + '</p><button class="link-btn neutral" type="button" data-account-tab="licensing">Alterar dados</button>'
        : '<p>Faltam os dados de licenciamento.</p><button class="link-btn neutral" type="button" data-account-tab="licensing">Preencher dados</button>';
    }
    return h + "</div>";
  }
  function gate(n) {
    var u = S.user, tab = null, msg = "";
    if (!u) { tab = Backend.hasUsers() ? "login" : "signup"; msg = "Entre ou crie uma conta para finalizar a compra."; }
    else if (n.hw && !defaultAddr(u)) { tab = "addresses"; msg = "Cadastre o endereço de entrega para continuar a compra."; }
    else if (n.sw && !u.licensing) { tab = "licensing"; msg = "Preencha os dados de licenciamento para continuar a compra."; }
    if (!tab) return { ok: true };
    var c = $("#cart"); if (c && c.open) c.close();
    openAccount(tab, msg, n);
    return { ok: false };
  }

  /* ---------- Eventos ---------- */
  function init() {
    dlg = $("#account");
    if (!dlg) return;

    dlg.addEventListener("mousedown", function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("close", function () { S.pending = null; });

    dlg.addEventListener("click", function (e) {
      var b = e.target.closest("[data-act],[data-tab]"); if (!b) return;
      if (b.dataset.tab) { S.tab = b.dataset.tab; S.editing = null; S.notice = ""; S.confirmDelete = false; render(); return; }
      var id = b.dataset.id, act = b.dataset.act;
      if (act === "addr-new") { S.editing = "new"; S.notice = ""; render(); }
      else if (act === "addr-edit") { S.editing = id; S.notice = ""; render(); }
      else if (act === "addr-cancel") { S.editing = null; render(); }
      else if (act === "addr-def") Backend.setDefaultAddress(id).then(function (u) { S.user = u; afterChange("Endereço padrão atualizado."); });
      else if (act === "addr-del") Backend.removeAddress(id).then(function (u) { S.user = u; afterChange("Endereço removido."); });
      else if (act === "logout") Backend.logout().then(function () {
        S.user = null; updateHeader(); dlg.close();
        if (typeof toast === "function") toast("Você saiu da conta.");
      });
      else if (act === "del-ask") { S.confirmDelete = true; render(); }
      else if (act === "del-cancel") { S.confirmDelete = false; render(); }
      else if (act === "del-ok") Backend.deleteAccount().then(function () {
        S.user = null; S.confirmDelete = false; updateHeader(); dlg.close();
        if (typeof toast === "function") toast("Conta excluída.");
      }).catch(function (err) { S.notice = err.message; render(); });
    });

    dlg.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = e.target, k = f.dataset.form;
      if (k === "login") doLogin(f);
      else if (k === "signup") doSignup(f);
      else if (k === "address") doAddress(f);
      else if (k === "licensing") doLicensing(f);
    });

    dlg.addEventListener("input", function (e) {
      var t = e.target;
      if (t.id === "ac-a-cep") { t.value = fmtCep(t.value); if (digits(t.value).length === 8) lookup(digits(t.value)); }
      else if (t.id === "ac-a-phone") t.value = fmtPhone(t.value);
      else if (t.id === "ac-lc-doc") t.value = fmtDoc(t.value);
    });

    document.addEventListener("click", function (e) {
      var b = e.target.closest("#open-account,[data-account-tab]"); if (!b) return;
      var c = $("#cart"), fromCart = !!(c && c.open);
      if (fromCart) c.close();
      openAccount(b.dataset.accountTab || null, "", fromCart ? needs() : null);
    });

    Backend.me().then(function (u) { S.user = u; updateHeader(); });
  }

  window.Account = { gate: gate, cartSummary: cartSummary };
  init();
})();
