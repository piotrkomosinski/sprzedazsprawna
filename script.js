// Gallery filters
const chips = document.querySelectorAll('.chip');
const items = [...document.querySelectorAll('#gallery a')];
chips.forEach(chip => chip.addEventListener('click', () => {
  chips.forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  const f = chip.dataset.filter;
  items.forEach(a => a.classList.toggle('hide', f !== 'all' && a.dataset.cat !== f));
}));

// Lightbox (navigates only through currently visible photos)
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');
const lbCap = document.getElementById('lb-cap');
let visible = [], idx = 0;

function show(i) {
  idx = (i + visible.length) % visible.length;
  const a = visible[idx];
  lbImg.src = a.href;
  lbImg.alt = a.dataset.caption || '';
  lbCap.textContent = `${a.dataset.caption || ''}  ·  ${idx + 1} / ${visible.length}`;
  const next = visible[(idx + 1) % visible.length];
  new Image().src = next.href;
}
function open(a) {
  visible = items.filter(x => !x.classList.contains('hide'));
  lb.hidden = false;
  document.body.style.overflow = 'hidden';
  show(visible.indexOf(a));
}
function close() {
  lb.hidden = true;
  document.body.style.overflow = '';
}
items.forEach(a => a.addEventListener('click', e => { e.preventDefault(); open(a); }));
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
