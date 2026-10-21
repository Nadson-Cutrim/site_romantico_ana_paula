// Site da Ana Paula — personalização
const startDate = new Date(2024, 9, 21, 0, 0, 0); // 21 de outubro de 2024
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = id => document.getElementById(id);

/* ---------- Contador ---------- */
const prev = {};
function setNum(id, text) {
  const el = $(id);
  if (el.textContent === text) return;
  el.textContent = text;
  if (prev[id] !== undefined && !reducedMotion) {
    el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick");
  }
  prev[id] = text;
}
function updateCounter() {
  const now = new Date();
  let diff = Math.max(0, now - startDate);
  const days = Math.floor(diff / 86400000); diff %= 86400000;
  const hours = Math.floor(diff / 3600000); diff %= 3600000;
  const minutes = Math.floor(diff / 60000); diff %= 60000;
  const seconds = Math.floor(diff / 1000);
  setNum("days", days.toLocaleString("pt-BR"));
  setNum("hours", String(hours).padStart(2, "0"));
  setNum("minutes", String(minutes).padStart(2, "0"));
  setNum("seconds", String(seconds).padStart(2, "0"));

  // "X anos, Y meses e Z dias"
  let y = now.getFullYear() - startDate.getFullYear();
  let m = now.getMonth() - startDate.getMonth();
  let d = now.getDate() - startDate.getDate();
  if (d < 0) { m--; d += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
  if (m < 0) { y--; m += 12; }
  const parts = [];
  if (y) parts.push(`${y} ${y === 1 ? "ano" : "anos"}`);
  if (m) parts.push(`${m} ${m === 1 ? "mês" : "meses"}`);
  if (d || !parts.length) parts.push(`${d} ${d === 1 ? "dia" : "dias"}`);
  const txt = parts.length > 1 ? parts.slice(0, -1).join(", ") + " e " + parts.slice(-1) : parts[0];
  $("spanText").textContent = txt + " de amor";
}
updateCounter();
setInterval(updateCounter, 1000);

/* ---------- Digitação (sem pulo de layout) ---------- */
function typeElement(el, done) {
  const phrase = el.dataset.typewriter || "";
  const speed = el.classList.contains("letter-typewriter") ? 38 : el.classList.contains("signature-typewriter") ? 55 : 48;
  const typed = document.createTextNode("");
  const caret = document.createElement("span"); caret.className = "t-caret";
  const rest = document.createElement("span"); rest.className = "t-rest";
  el.textContent = ""; el.append(typed, caret, rest);
  let i = 0;
  (function next() {
    typed.nodeValue = phrase.slice(0, i);
    rest.textContent = phrase.slice(i);
    if (i++ < phrase.length) {
      const ch = phrase[i - 2];
      setTimeout(next, speed + (/[,.!?]/.test(ch || "") ? 220 : 0) + Math.random() * 25);
    } else {
      el.classList.add("done");
      if (done) setTimeout(done, el.classList.contains("letter-typewriter") ? 500 : 250);
    }
  })();
}
function typeSequence(list, onEnd, i = 0) {
  if (i >= list.length) { onEnd && onEnd(); return; }
  typeElement(list[i], () => typeSequence(list, onEnd, i + 1));
}
const twAll = Array.from(document.querySelectorAll("[data-typewriter]"));
const twIntro = twAll.filter(e => e.closest(".hero"));
const twLetter = twAll.filter(e => e.closest(".letter"));
const hero = $("inicio");
function showAll(list) { list.forEach(e => { e.textContent = e.dataset.typewriter; e.classList.add("done"); }); }
if (reducedMotion) { showAll(twAll); hero.classList.add("go"); }

let letterStarted = false;
function startLetter() {
  if (letterStarted) return; letterStarted = true;
  reducedMotion ? showAll(twLetter) : typeSequence(twLetter);
}
if ("IntersectionObserver" in window && twLetter.length) {
  const lo = new IntersectionObserver(es => {
    if (es.some(e => e.isIntersecting) && introStarted) { startLetter(); lo.disconnect(); }
  }, { threshold: .35 });
  lo.observe(document.querySelector(".letter"));
  window.addEventListener("introstart", () => setTimeout(() => lo.takeRecords(), 0));
} else startLetter();

/* ---------- Portal de abertura ---------- */
let introStarted = false;
const gate = $("gate"), gateBtn = $("gateBtn");
const gs = gate.querySelector(".gate-stars");
for (let i = 0; i < 40; i++) {
  const s = document.createElement("i");
  s.style.left = Math.random() * 100 + "%"; s.style.top = Math.random() * 100 + "%";
  s.style.animationDelay = (Math.random() * 3) + "s";
  s.style.animationDuration = (2 + Math.random() * 3) + "s";
  gs.appendChild(s);
}
function openGate() {
  if (introStarted) return;
  introStarted = true;
  gate.classList.add("open");
  document.body.classList.remove("locked");
  window.scrollTo(0, 0);
  burstHearts(innerWidth / 2, innerHeight / 2, 14);
  tryPlayMusic(true);
  if (!reducedMotion) {
    setTimeout(() => typeSequence(twIntro, () => hero.classList.add("go")), 900);
  }
  setTimeout(() => { gate.style.display = "none"; }, 1600);
  window.dispatchEvent(new Event("introstart"));
  // Se a carta já estiver na tela (raro), começa
  setTimeout(() => { const r = document.querySelector(".letter").getBoundingClientRect(); if (r.top < innerHeight * .65 && r.bottom > 0) startLetter(); }, 100);
}
gateBtn.addEventListener("click", openGate);
// Para quem tem JS de rolagem bloqueada, garante que a carta comece ao rolar
window.addEventListener("scroll", () => {
  if (!introStarted || letterStarted) return;
  const r = document.querySelector(".letter").getBoundingClientRect();
  if (r.top < innerHeight * .7) startLetter();
}, { passive: true });

/* ---------- Revelar seções ---------- */
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const ob = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("is-visible"); ob.unobserve(e.target); }
  }), { threshold: .12 });
  revealEls.forEach(el => ob.observe(el));
} else revealEls.forEach(el => el.classList.add("is-visible"));

/* ---------- Barra de progresso ---------- */
const bar = $("progress");
function onScroll() {
  const h = document.documentElement.scrollHeight - innerHeight;
  bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + "%";
}
addEventListener("scroll", onScroll, { passive: true }); onScroll();

/* ---------- Pétalas e corações caindo ---------- */
const petalLayer = $("petalLayer");
function createPetal() {
  if (!petalLayer || reducedMotion || document.hidden || !introStarted) return;
  const p = document.createElement("span");
  const isHeart = Math.random() < .22;
  p.className = "petal" + (isHeart ? " heart" : "");
  const size = 9 + Math.random() * 12;
  if (isHeart) { p.textContent = "♥"; p.style.fontSize = size + 2 + "px"; }
  else { p.style.width = size + "px"; p.style.height = size * 1.35 + "px"; }
  if (Math.random() < .3) p.style.filter = "blur(1.5px)";
  p.style.left = Math.random() * 100 + "vw";
  p.style.setProperty("--drift", (Math.random() - .5) * 260 + "px");
  p.style.animationDuration = 9 + Math.random() * 8 + "s";
  petalLayer.appendChild(p);
  setTimeout(() => p.remove(), 18000);
}
if (!reducedMotion) setInterval(createPetal, 800);

/* ---------- Brilhos (canvas) ---------- */
(function sparkles() {
  const cv = $("sparkles"); if (!cv || reducedMotion) return;
  const ctx = cv.getContext("2d"); let W, H, dpr, stars = [];
  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr;
    stars = Array.from({ length: innerWidth < 600 ? 22 : 40 }, () => ({
      x: Math.random() * W, y: Math.random() * H, r: (Math.random() * 1.8 + .6) * dpr,
      t: Math.random() * 6.28, sp: .01 + Math.random() * .025
    }));
  }
  resize(); addEventListener("resize", resize);
  (function loop() {
    if (!document.hidden) {
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        s.t += s.sp; const a = (Math.sin(s.t) + 1) / 2;
        ctx.globalAlpha = a * .75; ctx.fillStyle = "#ffb3cb";
        ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(Math.PI / 4);
        const r = s.r * (.6 + a);
        ctx.beginPath(); // estrelinha de 4 pontas
        ctx.moveTo(0, -r * 3); ctx.quadraticCurveTo(0, 0, r * 3, 0);
        ctx.quadraticCurveTo(0, 0, 0, r * 3); ctx.quadraticCurveTo(0, 0, -r * 3, 0);
        ctx.quadraticCurveTo(0, 0, 0, -r * 3); ctx.fill(); ctx.restore();
      }
    }
    requestAnimationFrame(loop);
  })();
})();

/* ---------- Explosão de corações ao toque ---------- */
function burstHearts(x, y, n = 8) {
  if (reducedMotion) return;
  const glyphs = ["♥", "♡", "✿", "♥"];
  for (let i = 0; i < n; i++) {
    const b = document.createElement("span"); b.className = "burst";
    b.textContent = glyphs[i % glyphs.length];
    const ang = Math.random() * 6.28, dist = 50 + Math.random() * 110;
    b.style.left = x + "px"; b.style.top = y + "px";
    b.style.setProperty("--dx", Math.cos(ang) * dist + "px");
    b.style.setProperty("--dy", Math.sin(ang) * dist - 40 + "px");
    b.style.setProperty("--r", (Math.random() - .5) * 90 + "deg");
    b.style.setProperty("--s", .8 + Math.random() * 1.2);
    b.style.color = ["#e0457b", "#ff8fb1", "#c2185b", "#d9a566"][i % 4];
    document.body.appendChild(b);
    setTimeout(() => b.remove(), 1300);
  }
}
document.addEventListener("pointerdown", e => {
  if (!introStarted || e.target.closest("button,a,label,input")) return;
  burstHearts(e.clientX, e.clientY, 6);
});
$("bigHeart").addEventListener("click", e => {
  const r = e.currentTarget.getBoundingClientRect();
  burstHearts(r.left + r.width / 2, r.top + r.height / 2, 26);
});

/* ---------- Carrossel (setas, pontos, arrastar, automático) ---------- */
const track = $("galleryTrack"), viewport = $("viewport");
const upload = $("photoUpload"), dotsContainer = $("carouselDots");
let currentIndex = 0, photoUrls = [], autoTimer = null, dragX = null, dragDelta = 0;

function visibleCount() { return innerWidth <= 560 ? 1 : innerWidth <= 860 ? 2 : 3; }
function maxIndex() { return Math.max(0, track.children.length - visibleCount()); }
function renderDots() {
  dotsContainer.innerHTML = "";
  for (let i = 0; i <= maxIndex(); i++) {
    const d = document.createElement("button");
    d.type = "button"; d.className = "carousel-dot" + (i === currentIndex ? " active" : "");
    d.setAttribute("aria-label", `Ir para grupo de fotos ${i + 1}`);
    d.addEventListener("click", () => { currentIndex = i; updateCarousel(); restartAuto(); });
    dotsContainer.appendChild(d);
  }
}
function updateCarousel(extra = 0) {
  currentIndex = Math.min(currentIndex, maxIndex());
  const card = track.querySelector(".photo-card"); if (!card) return;
  const gap = parseFloat(getComputedStyle(track).gap) || 0;
  const dist = card.getBoundingClientRect().width / (1) + gap;
  // getBoundingClientRect inclui rotação/escala; usa offsetWidth para ser exato
  const w = card.offsetWidth + gap;
  track.style.transform = `translateX(${-currentIndex * w + extra}px)`;
  if (!extra) renderDots();
}
function go(dir) {
  if (dir > 0) currentIndex = currentIndex >= maxIndex() ? 0 : currentIndex + 1;
  else currentIndex = currentIndex <= 0 ? maxIndex() : currentIndex - 1;
  updateCarousel();
}
function restartAuto() {
  clearInterval(autoTimer);
  if (reducedMotion || maxIndex() === 0) return;
  autoTimer = setInterval(() => { if (!document.hidden) go(1); }, 5200);
}
$("prevPhoto").addEventListener("click", () => { go(-1); restartAuto(); });
$("nextPhoto").addEventListener("click", () => { go(1); restartAuto(); });
addEventListener("resize", () => { updateCarousel(); restartAuto(); });
viewport.addEventListener("keydown", e => { if (e.key === "ArrowLeft") go(-1); if (e.key === "ArrowRight") go(1); });
viewport.addEventListener("pointerdown", e => {
  dragX = e.clientX; dragDelta = 0; track.style.transition = "none"; viewport.style.cursor = "grabbing";
  clearInterval(autoTimer);
});
addEventListener("pointermove", e => {
  if (dragX === null) return;
  dragDelta = e.clientX - dragX; updateCarousel(dragDelta);
});
addEventListener("pointerup", () => {
  if (dragX === null) return;
  track.style.transition = ""; viewport.style.cursor = "";
  const moved = dragDelta; dragX = null;
  if (Math.abs(moved) > 50) go(moved < 0 ? 1 : -1); else updateCarousel();
  restartAuto();
});
track.addEventListener("dragstart", e => e.preventDefault());

// Prévia local das fotos escolhidas (para publicar, veja o LEIA-ME)
upload.addEventListener("change", () => {
  const files = Array.from(upload.files || []).filter(f => f.type.startsWith("image/"));
  if (!files.length) return;
  photoUrls.forEach(URL.revokeObjectURL); photoUrls = [];
  track.innerHTML = "";
  const caps = ["Um momento nosso ♡", "Seu sorriso favorito", "Só a gente entende", "Mais uma lembrança linda"];
  files.forEach((file, i) => {
    const url = URL.createObjectURL(file); photoUrls.push(url);
    const card = document.createElement("article"); card.className = "photo-card";
    const img = document.createElement("img"); img.src = url; img.alt = `Lembrança do casal ${i + 1}`; img.loading = "lazy";
    const cap = document.createElement("div"); cap.className = "photo-caption"; cap.textContent = caps[i % 4];
    card.append(img, cap); track.appendChild(card);
  });
  currentIndex = 0; updateCarousel(); restartAuto();
});
updateCarousel(); restartAuto();

/* ---------- Música ---------- */
const audio = $("loveAudio"), playButton = $("playMusic"), musicStatus = $("musicStatus");
const musicCard = $("musicCard"), mini = $("miniMusic");
let musicAvailable = true;
function setPlayingUI(on) {
  musicCard.classList.toggle("playing", on);
  mini.classList.toggle("playing", on);
}
async function tryPlayMusic(silent) {
  try {
    await audio.play();
    playButton.textContent = "Ⅱ Pausar música";
    musicStatus.textContent = "Tocando nossa música ❤️";
    setPlayingUI(true); mini.hidden = false;
  } catch (err) {
    if (!silent) musicStatus.textContent = "Para tocar aqui, coloque o arquivo MP3 em assets/tem-que-sorrir.mp3. Você também pode ouvir pelo YouTube abaixo.";
  }
}
function toggleMusic() {
  if (audio.paused) tryPlayMusic(false);
  else {
    audio.pause();
    playButton.textContent = "▶ Continuar música";
    musicStatus.textContent = "Música pausada.";
    setPlayingUI(false);
  }
}
playButton.addEventListener("click", toggleMusic);
mini.addEventListener("click", toggleMusic);
audio.addEventListener("error", () => { musicAvailable = false; mini.hidden = true; setPlayingUI(false); });
audio.addEventListener("ended", () => {
  playButton.textContent = "▶ Tocar música";
  musicStatus.textContent = "Terminou. Quer ouvir mais uma vez?";
  setPlayingUI(false);
});
