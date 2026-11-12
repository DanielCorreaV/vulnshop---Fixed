"use strict";
var params = new URLSearchParams(location.search);
function $id(i) { return document.getElementById(i); }
// Construye nodos con textContent: nunca interpreta HTML
function el(tag, cls, text) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}
var books = [];
var COVER_RE = /^https:\/\/covers\.openlibrary\.org\/b\/id\/\d+-M\.jpg$/;

/* ---------- Navegación, temas y avisos ---------- */
(function () {
  var THEMES = ["miel", "coral", "salvia"];
  var page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav a").forEach(function (a) {
    if (a.getAttribute("href") === page) a.classList.add("active");
  });
  function setTheme(t) {
    if (THEMES.indexOf(t) < 0) t = "miel";
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("theme", t);
  }
  setTheme(localStorage.getItem("theme"));
  document.querySelectorAll(".themes button").forEach(function (b) {
    b.addEventListener("click", function () { setTheme(b.getAttribute("data-theme")); });
  });
  $id("burger").addEventListener("click", function () {
    var open = $id("nav").classList.toggle("open");
    this.setAttribute("aria-expanded", open);
  });
})();

function toast(msg) {
  var t = $id("toast");
  t.textContent = msg;
  t.className = "show";
  clearTimeout(toast.t);
  toast.t = setTimeout(function () { t.className = ""; }, 1800);
}

/* ---------- Favoritos (localStorage, validados al leer) ---------- */
function clean(b) {
  if (!b || typeof b !== "object" || !/^\/works\/OL\d+W$/.test(String(b.key))) return null;
  return {
    key: String(b.key),
    title: String(b.title || "").slice(0, 200),
    author: String(b.author || "").slice(0, 200),
    year: String(b.year || "s/f").slice(0, 10),
    cover: COVER_RE.test(b.cover) ? b.cover : ""
  };
}
function getFavs() {
  try {
    var f = JSON.parse(localStorage.getItem("favorites") || "[]");
    return Array.isArray(f) ? f.map(clean).filter(Boolean) : [];
  } catch (e) { return []; }
}
function saveFavs(f) {
  localStorage.setItem("favorites", JSON.stringify(f));
  updateBadge();
}
function isFav(key) { return getFavs().some(function (x) { return x.key === key; }); }
function updateBadge() {
  var n = getFavs().length, b = $id("badge");
  b.textContent = n;
  b.className = n ? "badge on" : "badge";
}
function card(b, i) {
  var fav = isFav(b.key), a = el("article", "book"), c = el("div", "cover");
  if (b.cover) {
    var im = el("img");
    im.src = b.cover; im.alt = ""; im.loading = "lazy";
    c.appendChild(im);
  }
  var h = el("button", "heart" + (fav ? " on" : ""), "\u2665");
  h.type = "button";
  h.setAttribute("aria-pressed", fav);
  h.setAttribute("aria-label", "Favorito: " + b.title);
  h.addEventListener("click", function () { toggleFav(i, h); });
  c.appendChild(h);
  a.appendChild(c);
  a.appendChild(el("h3", null, b.title));
  a.appendChild(el("p", null, b.author + " \u00b7 " + b.year));
  return a;
}
function renderBooks(box, list) {
  books = list;
  box.textContent = "";
  if (!list.length) {
    var p = el("p", "empty", "Aún no hay libros aquí. "), a = el("a", null, "Explora el catálogo");
    a.href = "index.html#catalogo";
    p.appendChild(a);
    box.appendChild(p);
    return;
  }
  list.forEach(function (b, i) { box.appendChild(card(b, i)); });
}
function toggleFav(i, btn) {
  var b = books[i], f = getFavs();
  var idx = f.findIndex(function (x) { return x.key === b.key; });
  if (idx >= 0) { f.splice(idx, 1); toast("Quitado de favoritos"); }
  else { f.push(b); toast("Guardado en favoritos"); }
  saveFavs(f);
  if ($id("favs")) renderBooks($id("favs"), f);
  else { btn.classList.toggle("on", idx < 0); btn.setAttribute("aria-pressed", idx < 0); }
}
updateBadge();
if ($id("favs")) {
  renderBooks($id("favs"), getFavs());
  $id("clear-favs").addEventListener("click", function () {
    saveFavs([]); renderBooks($id("favs"), []); toast("Lista vaciada");
  });
}

/* ---------- Parámetros de la URL (siempre como texto) ---------- */
var q = (params.get("q") || "").slice(0, 100);
if (q && $id("results")) $id("results").textContent = "Resultados para: " + q;

if (location.hash.length > 1 && $id("welcome") && !$id(location.hash.slice(1))) {
  var name = "";
  try { name = decodeURIComponent(location.hash.slice(1)); } catch (e) { name = ""; }
  if (name) $id("welcome").textContent = "Bienvenido, " + name.slice(0, 50);
}

/* ---------- Libro de visitas (renderizado como texto) ---------- */
function renderGuestbook() {
  var items, box = $id("guestbook");
  try { items = JSON.parse(localStorage.getItem("guestbook") || "[]"); } catch (e) { items = []; }
  box.textContent = "";
  if (!Array.isArray(items)) return;
  items.forEach(function (i) {
    var n = el("div", "note");
    n.appendChild(el("b", null, String(i.name).slice(0, 40)));
    n.appendChild(el("p", null, String(i.msg).slice(0, 300)));
    box.appendChild(n);
  });
}
if ($id("gb-send")) {
  $id("gb-send").addEventListener("click", function () {
    var name = $id("gb-name").value.trim().slice(0, 40), msg = $id("gb-msg").value.trim().slice(0, 300);
    if (!name || !msg) { toast("Completa nombre y mensaje"); return; }
    var items;
    try { items = JSON.parse(localStorage.getItem("guestbook") || "[]"); } catch (e) { items = []; }
    if (!Array.isArray(items)) items = [];
    items.push({ name: name, msg: msg });
    localStorage.setItem("guestbook", JSON.stringify(items.slice(-50)));
    $id("gb-name").value = ""; $id("gb-msg").value = "";
    renderGuestbook();
  });
  renderGuestbook();
}

/* ---------- Login: demo estática, sin credenciales ni sesión ---------- */
if ($id("login-form")) {
  $id("login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    $id("msg").textContent = "Esta demo estática no tiene servidor de autenticación: no se envían ni se guardan credenciales.";
    this.reset();
  });
}

/* ---------- Catálogo desde Open Library (API pública, sin API key) ---------- */
if ($id("catalog")) {
  var query = q || "gabriel garcia marquez";
  var page = 1, total = 0, loaded = [];
  for (var s = 0; s < 8; s++) {
    var sk = el("div", "book sk");
    sk.appendChild(el("div", "cover"));
    $id("catalog").appendChild(sk);
  }
  var loadPage = function () {
    var btn = $id("more");
    btn.disabled = true;
    fetch("https://openlibrary.org/search.json?limit=12&page=" + page + "&q=" + encodeURIComponent(query))
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (d) {
        var docs = Array.isArray(d.docs) ? d.docs : [];
        total = Number(d.numFound) || 0;
        loaded = loaded.concat(docs.map(function (b) {
          return clean({
            key: b.key, title: b.title,
            author: Array.isArray(b.author_name) ? b.author_name.join(", ") : "Desconocido",
            year: b.first_publish_year || "s/f",
            cover: b.cover_i ? "https://covers.openlibrary.org/b/id/" + Number(b.cover_i) + "-M.jpg" : ""
          });
        }).filter(Boolean));
        renderBooks($id("catalog"), loaded);
        $id("count").textContent = "Mostrando " + loaded.length + " de " + total.toLocaleString("es") + " resultados";
        page++;
        btn.disabled = false;
        btn.hidden = !docs.length || loaded.length >= total;
      })
      .catch(function () {
        if (!loaded.length) { $id("catalog").textContent = ""; $id("catalog").appendChild(el("p", "empty", "No se pudo cargar el catálogo.")); }
        else toast("No se pudo cargar más");
        btn.disabled = false;
      });
  };
  $id("more").addEventListener("click", loadPage);
  loadPage();
}
