// Lightbox – shows any list of {href, caption}
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');
const lbCap = document.getElementById('lb-cap');
let list = [], idx = 0, title = '';

function show(i) {
  idx = (i + list.length) % list.length;
  const p = list[idx];
  lbImg.src = p.href;
  lbImg.alt = p.caption;
  const head = title && !p.caption.startsWith(title.split(' ')[0]) ? title + '  ·  ' : '';
  lbCap.textContent = `${head}${p.caption}  ·  ${idx + 1} / ${list.length}`;
  if (list.length > 1) new Image().src = list[(idx + 1) % list.length].href;
}
function openList(photos, start = 0, heading = '') {
  list = photos; title = heading;
  lb.classList.toggle('single', list.length < 2);
  lb.hidden = false;
  document.body.style.overflow = 'hidden';
  show(start);
}
function close() {
  lb.hidden = true;
  document.body.style.overflow = '';
}
lb.querySelector('.lb-close').addEventListener('click', close);
lb.querySelector('.lb-prev').addEventListener('click', () => show(idx - 1));
lb.querySelector('.lb-next').addEventListener('click', () => show(idx + 1));
lb.addEventListener('click', e => { if (e.target === lb) close(); });
document.addEventListener('keydown', e => {
  if (lb.hidden) return;
  if (e.key === 'Escape') close();
  if (e.key === 'ArrowLeft') show(idx - 1);
  if (e.key === 'ArrowRight') show(idx + 1);
});
let touchX = null;
lb.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', e => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
  touchX = null;
});

// Clickable floor plan: room -> its photos
const ROOMS = window.ROOMS || {};
const roomLabel = r => r.name.startsWith('Sypialnia') ? r.name.replace(' · ', ' ') : r.name.split(' · ')[0];
function openRoom(id) {
  const r = ROOMS[id];
  if (!r) return;
  openList(r.photos.map(([f, c]) => ({ href: `img/${f}.jpg`, caption: c })), 0, roomLabel(r));
}
const roomEls = document.querySelectorAll('.plan-hotspots .room');
roomEls.forEach(g => {
  g.addEventListener('click', () => openRoom(g.dataset.room));
  g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openRoom(g.dataset.room); } });
});
const chipsBox = document.getElementById('room-chips');
if (chipsBox) {
  Object.entries(ROOMS).forEach(([id, r]) => {
    const b = document.createElement('button');
    b.className = 'chip';
    b.textContent = `${roomLabel(r)} (${r.photos.length})`;
    b.addEventListener('click', () => openRoom(id));
    const hl = on => document.querySelector(`.plan-hotspots .room[data-room="${id}"]`)?.classList.toggle('hl', on);
    b.addEventListener('mouseenter', () => hl(true));
    b.addEventListener('mouseleave', () => hl(false));
    chipsBox.appendChild(b);
  });
}

// Map
if (window.L) {
  const home = [52.3411, 20.9412];
  const map = L.map('map', { scrollWheelZoom: false }).setView([52.3392, 20.9405], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  L.marker(home).addTo(map).bindPopup('<b>Dom na sprzedaż</b><br>ul. Sprawna, Białołęka').openPopup();
  L.circle(home, { radius: 400, color: '#a0612b', weight: 1.5, fillOpacity: .06 }).addTo(map)
    .bindTooltip('Promień 400 m');
}
