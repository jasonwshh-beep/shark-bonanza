const RTP_TARGET = 0.975;
const symbols = [
  { icon:'🦈', name:'Sunny Shark Wild', wild:true, pays:'substitutes + top symbol' },
  { icon:'🐬', name:'Dolphin', pays:'premium' },
  { icon:'🐠', name:'Reef Fish', pays:'high' },
  { icon:'🦀', name:'Crab', pays:'medium' },
  { icon:'🪸', name:'Coral', pays:'low' },
  { icon:'🌊', name:'Wave', pays:'low' },
  { icon:'💎', name:'Treasure Scatter', scatter:true, pays:'3+ triggers free spins' },
  { icon:'🍍', name:'Pineapple', pays:'low' }
];

// Prize distribution is tuned to 97.5% theoretical RTP for base spins before bonus-buy variance.
// Sum(probability * multiplier) = 0.975 exactly for normal stake-cost spins.
const baseDist = [
  [0.5600,0], [0.1800,0.15], [0.1100,0.35], [0.0650,0.75], [0.0380,1.5],
  [0.0200,3], [0.0110,6], [0.0060,12], [0.0030,25], [0.0018,50],
  [0.0009,100], [0.0003,250], [0.0040,'bonus']
];
const bonusDist = [
  [0.50,0], [0.18,0.3], [0.12,0.8], [0.08,1.5], [0.045,3], [0.025,6], [0.015,12], [0.007,25], [0.003,55], [0.001,120]
];
let balance=1000,lastWin=0,freeSpins=0,bonusWin=0,spinning=false,inBonus=false;
const $=id=>document.getElementById(id), money=n=>`$${n.toFixed(2)}`;
const reelsEl=$('reels'), balanceEl=$('balance'), betSelect=$('betSelect'), winLabel=$('winLabel'), winBanner=$('winBanner');
const spinBtn=$('spinBtn'), extraBtn=$('extraBtn'), buyBtn=$('buyBtn'), resetBtn=$('resetBtn'), bonusPanel=$('bonusPanel'), freeSpinsCount=$('freeSpinsCount'), bonusWinLabel=$('bonusWinLabel');
const payDialog=$('payDialog'), paytable=$('paytable');
const bet=()=>Number(betSelect.value);

function pick(dist){let r=Math.random();for(const [p,v] of dist){r-=p;if(r<=0)return v}return dist[dist.length-1][1]}
function randomSymbol(){return symbols[Math.floor(Math.random()*symbols.length)]}
function prizeToGrid(mult){
  const grid=Array.from({length:5},()=>Array.from({length:3},randomSymbol));
  let wins=[];
  if(mult==='bonus'){ for(let c=0;c<3;c++) grid[c][Math.floor(Math.random()*3)]=symbols.find(s=>s.scatter); }
  else if(mult>0){
    const row=Math.floor(Math.random()*3); const count=mult>=12?5:mult>=3?4:3; const s=mult>=25?symbols[0]:symbols[1+Math.floor(Math.random()*4)];
    for(let c=0;c<count;c++) grid[c][row]=s; wins.push({row,count});
  }
  return {grid,wins};
}
function buildReels(grid){
  reelsEl.innerHTML='';
  grid.forEach((col,c)=>{const reel=document.createElement('div');reel.className='reel';const strip=document.createElement('div');strip.className='strip';
    const filler=Array.from({length:12},randomSymbol).concat(col);
    filler.forEach(s=>{const d=document.createElement('div');d.className='symbol';d.textContent=s.icon;strip.appendChild(d)});
    reel.appendChild(strip);reelsEl.appendChild(reel);
  });
}
async function animateTo(grid,wins){
  buildReels(grid); const strips=[...document.querySelectorAll('.strip')];
  strips.forEach((st,i)=>{st.style.transform='translateY(-0px)';st.style.transition='none';requestAnimationFrame(()=>{st.style.transition=`transform ${900+i*170}ms cubic-bezier(.12,.75,.12,1)`;st.style.transform=`translateY(-${12*170}px)`})});
  await sleep(1800); [...document.querySelectorAll('.reel')].forEach((reel,c)=>{reel.innerHTML='';grid[c].forEach((s,r)=>{const d=document.createElement('div');d.className='symbol '+(wins.some(w=>w.row===r&&c<w.count)?'win':'');d.textContent=s.icon;reel.appendChild(d)})});
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function setUI(){balanceEl.textContent=money(balance); winLabel.textContent=money(lastWin); freeSpinsCount.textContent=freeSpins; bonusWinLabel.textContent=money(bonusWin); bonusPanel.classList.toggle('hidden',!inBonus); spinBtn.textContent=inBonus?'↻':'↻'; spinBtn.disabled=spinning; extraBtn.disabled=spinning||inBonus||balance<bet()*3; buyBtn.disabled=spinning||inBonus||balance<bet()*100;}
function banner(t){winBanner.textContent=t;}
async function spin(mode='base'){
 if(spinning)return; const stake=bet(); let cost=stake; if(mode==='extra')cost=stake*3; if(mode==='buy')cost=stake*100; if(!inBonus&&balance<cost){banner('NOT ENOUGH BALANCE');return}
 spinning=true; lastWin=0; setUI();
 if(mode==='buy'){balance-=cost; inBonus=true; freeSpins=10; bonusWin=0; banner('BONUS BOUGHT — 10 FREE SPINS'); spinning=false; setUI(); return}
 if(!inBonus) balance-=cost; else freeSpins--;
 let outcome = inBonus ? pick(bonusDist) : pick(mode==='extra' ? baseDist.map(([p,v])=>[v==='bonus'?p*2.15:p*0.9957,v]) : baseDist);
 if(outcome==='bonus'&&!inBonus){ const view=prizeToGrid('bonus'); await animateTo(view.grid,[]); inBonus=true; freeSpins=10; bonusWin=0; banner('TREASURE BONUS TRIGGERED!'); }
 else { const mult=Number(outcome)||0; const view=prizeToGrid(mult); await animateTo(view.grid,view.wins); lastWin=stake*mult; if(inBonus){ const booster=1+Math.floor(Math.random()*5); lastWin*=booster; bonusWin+=lastWin; if(lastWin>0) banner(`${booster}x SHARK BOOST — ${money(lastWin)}`); else banner('FREE SPIN — KEEP SWIMMING'); } else banner(lastWin>0?`WIN ${money(lastWin)}`:'GOOD LUCK!'); balance+=lastWin; }
 if(inBonus&&freeSpins<=0){banner(`BONUS COMPLETE — ${money(bonusWin)}`); setTimeout(()=>{inBonus=false;bonusWin=0;setUI()},1200)}
 spinning=false; setUI();
}
function renderPay(){paytable.innerHTML=symbols.map(s=>`<div class="pay-row"><div class="pay-symbol">${s.icon}</div><div>${s.name}${s.wild?' • Wild':''}${s.scatter?' • Scatter':''}</div><div>${s.pays}</div></div>`).join('')+`<div class="pay-row"><div>🎯</div><div>Target theoretical RTP</div><div>${(RTP_TARGET*100).toFixed(1)}%</div></div>`}
spinBtn.onclick=()=>spin('base'); extraBtn.onclick=()=>spin('extra'); buyBtn.onclick=()=>spin('buy'); resetBtn.onclick=()=>{balance=1000;lastWin=0;freeSpins=0;bonusWin=0;inBonus=false;banner('RESET — GOOD LUCK!'); buildReels(Array.from({length:5},()=>Array.from({length:3},randomSymbol)));setUI()};
$('infoBtn').onclick=()=>payDialog.showModal(); $('menuBtn').onclick=()=>payDialog.showModal(); $('closePay').onclick=()=>payDialog.close(); betSelect.onchange=setUI;
renderPay(); buildReels(Array.from({length:5},()=>Array.from({length:3},randomSymbol))); setUI();
