const symbols = [
  { icon: '🦈', name: 'Sunny Shark', weight: 7, pays: {3: 1.5, 4: 7, 5: 45} },
  { icon: '🐬', name: 'Dolphin Pal', weight: 9, pays: {3: 1.1, 4: 4, 5: 20} },
  { icon: '🐠', name: 'Reef Fish', weight: 14, pays: {3: 0.8, 4: 2.4, 5: 10} },
  { icon: '🪸', name: 'Coral', weight: 16, pays: {3: 0.55, 4: 1.6, 5: 6} },
  { icon: '🫧', name: 'Bubbles', weight: 18, pays: {3: 0.35, 4: 1.1, 5: 4} },
  { icon: '⭐', name: 'Starfish Wild', weight: 5, wild: true, pays: {3: 2, 4: 12, 5: 70} },
  { icon: '🧰', name: 'Treasure Scatter', weight: 3, scatter: true, pays: {} }
];

let balance = 1000;
let lastWin = 0;
let freeSpins = 0;
let bonusWin = 0;
let spinning = false;

const reelsEl = document.getElementById('reels');
const balanceEl = document.getElementById('balance');
const betSelect = document.getElementById('betSelect');
const betLabel = document.getElementById('betLabel');
const winLabel = document.getElementById('winLabel');
const modeLabel = document.getElementById('modeLabel');
const messageEl = document.getElementById('message');
const spinBtn = document.getElementById('spinBtn');
const extraBtn = document.getElementById('extraBtn');
const buyBtn = document.getElementById('buyBtn');
const resetBtn = document.getElementById('resetBtn');
const paytableEl = document.getElementById('paytable');
const bonusPanel = document.getElementById('bonusPanel');
const freeSpinsCount = document.getElementById('freeSpinsCount');
const bonusWinLabel = document.getElementById('bonusWinLabel');

const money = n => `$${n.toFixed(2)}`;
const bet = () => Number(betSelect.value);

function weightedPick(extraChance = false) {
  const adjusted = symbols.map(s => ({ ...s, weight: extraChance && s.scatter ? s.weight * 3.2 : s.weight }));
  const total = adjusted.reduce((sum, s) => sum + s.weight, 0);
  let roll = Math.random() * total;
  for (const s of adjusted) {
    roll -= s.weight;
    if (roll <= 0) return s;
  }
  return adjusted[0];
}

function makeGrid(extraChance = false) {
  return Array.from({ length: 5 }, () => Array.from({ length: 3 }, () => weightedPick(extraChance)));
}

function countScatters(grid) {
  return grid.flat().filter(s => s.scatter).length;
}

function evaluate(grid, stake) {
  let total = 0;
  const wins = [];
  const rows = [0, 1, 2];
  for (const row of rows) {
    const line = grid.map(col => col[row]);
    const base = line.find(s => !s.wild && !s.scatter) || line[0];
    if (base.scatter) continue;
    let count = 0;
    for (const s of line) {
      if (s.icon === base.icon || s.wild) count++; else break;
    }
    if (count >= 3) {
      const pay = (base.pays[count] || 0) * stake;
      total += pay;
      wins.push({ row, count, icon: base.icon, pay });
    }
  }
  const scatters = countScatters(grid);
  if (scatters >= 3) total += stake * [0,0,0,2,10,50][Math.min(scatters,5)];
  return { total, wins, scatters };
}

function renderGrid(grid, wins = []) {
  reelsEl.innerHTML = '';
  grid.forEach((col, c) => {
    const reel = document.createElement('div');
    reel.className = 'reel';
    col.forEach((s, r) => {
      const cell = document.createElement('div');
      const isWin = wins.some(w => w.row === r && c < w.count);
      cell.className = `symbol ${isWin ? 'win' : ''}`;
      cell.textContent = s.icon;
      reel.appendChild(cell);
    });
    reelsEl.appendChild(reel);
  });
}

function setUI() {
  balanceEl.textContent = money(balance);
  betLabel.textContent = money(bet());
  winLabel.textContent = money(lastWin);
  modeLabel.textContent = freeSpins > 0 ? 'Bonus' : 'Base';
  freeSpinsCount.textContent = freeSpins;
  bonusWinLabel.textContent = money(bonusWin);
  bonusPanel.classList.toggle('hidden', freeSpins <= 0 && bonusWin <= 0);
  spinBtn.textContent = freeSpins > 0 ? 'Free Spin' : 'Spin';
  spinBtn.disabled = spinning;
  extraBtn.disabled = spinning || freeSpins > 0 || balance < bet() * 3;
  buyBtn.disabled = spinning || freeSpins > 0 || balance < bet() * 100;
}

async function spin({ extraChance = false, bought = false } = {}) {
  if (spinning) return;
  const stake = bet();
  let cost = stake;
  if (extraChance) cost = stake * 3;
  if (bought) cost = stake * 100;
  if (freeSpins === 0 && balance < cost) return message('Not enough play-money balance.');

  spinning = true;
  lastWin = 0;
  setUI();
  reelsEl.querySelectorAll('.symbol').forEach(s => s.classList.add('spin'));
  await new Promise(r => setTimeout(r, 420));

  if (bought) {
    balance -= cost;
    freeSpins = 10;
    bonusWin = 0;
    message(`Bonus bought for ${money(cost)}. 10 free spins started!`);
    spinning = false;
    setUI();
    return;
  }

  if (freeSpins === 0) balance -= cost;
  else freeSpins -= 1;

  const grid = makeGrid(extraChance);
  const result = evaluate(grid, stake);
  let multiplier = 1;
  if (freeSpins >= 0 && modeLabel.textContent === 'Bonus') multiplier = 1 + Math.random() * 4;
  lastWin = result.total * multiplier;
  balance += lastWin;
  if (bonusPanel && (freeSpins > 0 || bonusWin > 0)) bonusWin += lastWin;

  renderGrid(grid, result.wins);

  if (result.scatters >= 3 && freeSpins === 0) {
    freeSpins = result.scatters === 3 ? 8 : result.scatters === 4 ? 12 : 20;
    bonusWin = 0;
    message(`${result.scatters} treasures! Free spins triggered.`);
  } else if (result.scatters >= 3 && freeSpins > 0) {
    freeSpins += 3;
    message(`${result.scatters} treasures retriggered +3 free spins! Won ${money(lastWin)}.`);
  } else if (lastWin > 0) {
    message(`Nice reef hit! Won ${money(lastWin)}${multiplier > 1 ? ` with ${multiplier.toFixed(2)}x bonus multiplier` : ''}.`);
  } else if (freeSpins === 0 && bonusWin > 0) {
    message(`Bonus complete! Total bonus win ${money(bonusWin)}.`);
    bonusWin = 0;
  } else {
    message('No win. The friendly shark is circling for the next one.');
  }

  spinning = false;
  setUI();
}

function message(text) { messageEl.textContent = text; }

function renderPaytable() {
  paytableEl.innerHTML = symbols.map(s => `
    <div class="pay-row">
      <div class="pay-symbol">${s.icon}</div>
      <div>${s.name}${s.wild ? ' • substitutes' : ''}${s.scatter ? ' • bonus trigger' : ''}</div>
      <div>${s.scatter ? '3+ = FS' : `5 = ${s.pays[5]}x`}</div>
    </div>`).join('');
}

spinBtn.addEventListener('click', () => spin());
extraBtn.addEventListener('click', () => spin({ extraChance: true }));
buyBtn.addEventListener('click', () => spin({ bought: true }));
resetBtn.addEventListener('click', () => { balance = 1000; lastWin = 0; freeSpins = 0; bonusWin = 0; message('Reset complete. Play-money balance restored.'); renderGrid(makeGrid()); setUI(); });
betSelect.addEventListener('change', setUI);

renderPaytable();
renderGrid(makeGrid());
setUI();
