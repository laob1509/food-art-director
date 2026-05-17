// ── FOOD ART DIRECTOR AI — WIZARD LOGIC ──────────────────────────
import { supabase } from './supabase'


var S={intent:null,food:null,style:null,angle:'eyelevel',intensity:'balanced',format:null,context:'normal',seasonal:null,photo:null,env:null,lang:'pt',model:'gpt'};
var curStep=1,totalSteps=10,curPrompt='';
var stepTitles=['O que o público vai sentir?','O que está fotografando?','Qual o ambiente?','Ângulo e intensidade','Formato de saída','Contexto da cena','Como a câmera olha?','Onde vai fotografar?','Avançado','Prompt final'];

// ── ROTATING PLACEHOLDER ─────────────────────────────────────────────────────
var PLACEHOLDERS = [
  'Ex: vapor denso saindo do prato...',
  'Ex: gotículas de água na superfície...',
  'Ex: fundo de pedra escura com reflexos sutis...',
  'Ex: luz de vela criando sombras longas...',
  'Ex: fio de mel escorrendo lentamente...',
  'Ex: fumaça real saindo da chapa quente...',
  'Ex: flores secas como props ao redor...',
  'Ex: gelo cristalino com condensação intensa...',
  'Ex: folhas de hortelã frescas sobre o prato...',
  'Ex: manteiga derretendo nas bordas do pão...',
  'Ex: chocolate escorrendo em fio fino e lento...',
  'Ex: superfície de mármore verde como base...',
  'Ex: luz entrando pela janela em ângulo dourado...',
  'Ex: toalha de linho cru ao fundo desfocado...',
  'Ex: reflexo da luz na superfície molhada...'
];

function rotatePlaceholder() {
  var nota = document.getElementById('nota');
  if(!nota || nota.value) return;
  var idx = Math.floor(Math.random() * PLACEHOLDERS.length);
  nota.placeholder = PLACEHOLDERS[idx];
}

function startWizard(){
  document.getElementById('screen-welcome').style.display='none';
  document.getElementById('screen-wizard').style.display='block';
  document.getElementById('nav-bar').style.display='flex';
  renderDots();updateProgress();updateNav();
}

function renderDots(){
  var d=document.getElementById('prog-dots');d.innerHTML='';
  for(var i=1;i<=totalSteps;i++){
    var dot=document.createElement('div');
    dot.className='pdot'+(i<curStep?' done':i===curStep?' active':'');
    (function(s){dot.onclick=function(){if(s<=curStep)goToStep(s);};})(i);
    d.appendChild(dot);
  }
}
function updateProgress(){
  document.getElementById('prog-lbl').textContent='Passo '+curStep+' de '+totalSteps;
  document.getElementById('prog-title').textContent=stepTitles[curStep-1]||'';
  document.getElementById('prog-fill').style.width=(curStep/totalSteps*100)+'%';
  renderDots();
}
function updateNav(){
  var ni=document.getElementById('nav-inner');
  if(curStep===10){
    ni.innerHTML='<button class="btn-back" onclick="goBack()">← Voltar</button><button class="btn-copy" id="btn-copy" onclick="copyPrompt()">⬡ Copiar Prompt</button><button class="btn-restart" onclick="restart()">↺ Novo prompt</button>';
  } else {
    var dis=!canAdvance();
    var backStyle=curStep===1?'display:none':'';
    ni.innerHTML='<button class="btn-back" style="'+backStyle+'" onclick="goBack()">← Voltar</button><button class="btn-next"'+(dis?' disabled':'')+' onclick="goNext()">Próximo →</button>';
  }
}
function canAdvance(){
  if(curStep===1)return!!S.intent;
  if(curStep===2)return!!S.food;
  if(curStep===3)return!!S.style;
  if(curStep===5)return!!S.format;
  if(curStep===6&&S.context==='seasonal')return!!S.seasonal;
  return true;
}
function goNext(){if(!canAdvance()){showToast('Selecione uma opção','amber');return;}if(curStep<totalSteps)goToStep(curStep+1);}
function goBack(){if(curStep>1)goToStep(curStep-1);}
function skipStep(){if(curStep<totalSteps)goToStep(curStep+1);}
function goToStep(n){
  document.getElementById('step-'+curStep).classList.remove('active');
  curStep=n;
  document.getElementById('step-'+n).classList.add('active');
  updateProgress();updateNav();
  window.scrollTo({top:0,behavior:'smooth'});
  if(n===10)generatePrompt();
  if(n===9)rotatePlaceholder();
}

document.querySelectorAll('[data-g]').forEach(function(el){
  el.addEventListener('click',function(){
    var g=el.dataset.g,v=el.dataset.v;
    if(g==='context'){
      var cbox=document.getElementById('ctx-desc-box');
      var ctxt=document.getElementById('ctx-desc-txt');
      if(cbox&&ctxt&&el.dataset.desc){ctxt.textContent=el.dataset.desc;cbox.style.display='block';}
      document.querySelectorAll('[data-g="context"]').forEach(function(b){b.classList.remove('active');});
      el.classList.add('active');S.context=v;
      document.getElementById('seasonal-opts').style.display=v==='seasonal'?'block':'none';
      if(v!=='seasonal')S.seasonal=null;
      updateNav();return;
    }
    document.querySelectorAll('[data-g="'+g+'"]').forEach(function(b){b.classList.remove('active');});
    el.classList.add('active');S[g]=v;
    if(g==='intent'&&el.dataset.color)el.style.setProperty('--ic',el.dataset.color);
    if(g==='food'){
      // close all accordion cats and show selected name on open btn
      document.querySelectorAll('.food-cat-body').forEach(function(b){b.style.display='none';});
      document.querySelectorAll('.food-cat-btn').forEach(function(b){
        b.classList.remove('open');
        // reset label (remove badge if any)
        var sp=b.querySelector('span:first-child');
        if(sp&&sp.dataset.orig) sp.textContent=sp.dataset.orig;
      });
      // find which accordion contains the selected item and badge it
      var parent=el.closest('.food-accordion');
      if(parent){
        var catBtn=parent.querySelector('.food-cat-btn');
        var sp=catBtn.querySelector('span:first-child');
        if(!sp.dataset.orig) sp.dataset.orig=sp.textContent;
        sp.textContent=sp.dataset.orig+' — '+el.textContent;
        catBtn.style.borderColor='var(--amber)';
      }
    }
    if(g==='intent'){
      var box=document.getElementById('intent-desc-box');
      var txt=document.getElementById('intent-desc-txt');
      if(box&&txt&&el.dataset.desc){
        txt.textContent=el.dataset.desc;
        box.style.display='block';
        box.style.borderLeftColor=el.dataset.color||'var(--amber)';
      }
    }
    updateNav();
  });
});
document.querySelectorAll('[data-g="intent"]').forEach(function(el){if(el.dataset.color)el.style.setProperty('--ic',el.dataset.color);});
// Open first food category by default
(function(){
  var firstBody=document.getElementById('cat-padaria');
  var firstBtn=firstBody&&firstBody.previousElementSibling;
  if(firstBody){firstBody.style.display='block';}
  if(firstBtn){firstBtn.classList.add('open');}
})();

function generatePrompt(){
  var ob=document.getElementById('output-body');
  ob.innerHTML='<div class="gen-state"><div class="gen-dots"><div class="gen-dot"></div><div class="gen-dot"></div><div class="gen-dot"></div></div><div class="gen-txt">Gerando seu prompt...</div></div>';
  document.getElementById('output-tags').style.display='none';
  renderSummary();
  setTimeout(function(){
    curPrompt=buildPrompt();
    renderPrompt();
    renderMoodSummary();
    var vb=document.getElementById('btn-variation');
    if(vb) vb.style.display='inline-block';
    var vbf=document.getElementById('btn-variation-full');
    if(vbf) vbf.style.display='block';
  },700);
}
function buildPrompt(){
  var l=S.lang,food=FD[S.food];if(!food)return '';
  var parts=[],intent=S.intent?INTENTS[S.intent]:null;
  if(document.getElementById('t-str').checked)parts.push(l==='pt'?STR_PT:STR_EN);
  if(S.photo&&PH[S.photo])parts.push(PH[S.photo][l==='pt'?'pt':'en']);
  if(S.env&&ENV[S.env])parts.push(ENV[S.env][l==='pt'?'pt':'en']);
  if(intent){
    var id=intent[l==='pt'?'pt':'en'];
    parts.push((l==='pt'?'INTENÇÃO CRIATIVA: ':'CREATIVE INTENT: ')+intent.name+'\n'+id.open);
  }
  if(l==='pt'){
    parts.push('SUJEITO PRINCIPAL\nUse o '+food.pt+' como sujeito principal.\n\nFOCO DE TEXTURA E REALISMO\nÊnfase em: '+food.fpt+'.\nMicro-detalhes com realismo extremo. Imperfeições naturais obrigatórias.');
  } else {
    parts.push('MAIN SUBJECT\nUse the '+food.en+' as main subject.\n\nTEXTURE AND REALISM FOCUS\nEmphasis on: '+food.fen+'.\nMicro-details with extreme realism. Natural imperfections mandatory.');
  }
  if(S.style&&ST[S.style])parts.push(ST[S.style][l==='pt'?'pt':'en']);
  if(intent){
    var id=intent[l==='pt'?'pt':'en'];
    parts.push((l==='pt'?'DIREÇÃO DE LUZ\n':'LIGHTING DIRECTION\n')+id.light+'\n\n'+(l==='pt'?'PALETA E CORES\n':'PALETTE AND COLORS\n')+id.color+'\n\n'+(l==='pt'?'ATMOSFERA\n':'ATMOSPHERE\n')+id.mood);
  }
  if(S.angle&&ANG[S.angle])parts.push(ANG[S.angle][l==='pt'?'pt':'en']);
  if(document.getElementById('t-cam').checked&&S.style&&ST[S.style])parts.push(ST[S.style].cam[l==='pt'?'pt':'en']);
  if(S.intensity&&INT[S.intensity])parts.push(INT[S.intensity][l==='pt'?'pt':'en']);
  if(S.format&&FMT[S.format])parts.push(FMT[S.format][l==='pt'?'pt':'en']);
  if(S.context&&S.context!=='normal'&&CTX[S.context])parts.push(CTX[S.context][l==='pt'?'pt':'en']);
  if(S.seasonal&&SEA[S.seasonal])parts.push(SEA[S.seasonal][l==='pt'?'pt':'en']);
  if(document.getElementById('t-sty').checked){var st=l==='pt'?(food.spt||''):(food.sen||'');if(st)parts.push(st);}
  if(document.getElementById('t-rea').checked)parts.push(l==='pt'?REAL_PT:REAL_EN);
  if(document.getElementById('t-neg').checked&&food.neg_pt){
    parts.push(l==='pt'?'NEGATIVOS — O QUE EVITAR\n'+food.neg_pt+'\nSem aparência CGI.':'NEGATIVES — WHAT TO AVOID\n'+food.neg_en+'\nNo CGI look.');
  }
  var nota=document.getElementById('nota').value.trim();
  if(nota)parts.push((l==='pt'?'— OBSERVAÇÃO ADICIONAL —\n':'— ADDITIONAL NOTE —\n')+nota);
  parts.push(l==='pt'?'QUALIDADE FINAL\nFotorrealista. Ultra-detalhado. 4K–8K. Fotografia comercial profissional.\nZero artefatos CGI.':'FINAL QUALITY\nPhotorealistic. Ultra-detailed. 4K–8K. Professional commercial photography.\nZero CGI artifacts.');
  var result=parts.join('\n\n');
  if(S.model==='midjourney'){result=result.replace(/^([A-ZÁÀÉÊÍÓÔÚÇ][A-ZÁÀÉÊÍÓÔÚÇ\s&\/\-]+)\n/gm,'');result=result.split('\n').filter(function(x){return x.trim();}).join(', ');if(result.length>600)result=result.substring(0,600)+'...';}
  else if(S.model==='dalle'&&result.length>1200)result=result.substring(0,1200)+'...';
  else if(S.model==='gemini')result=(l==='pt'?'Imagine uma cena de fotografia editorial de alimentos de altíssimo nível. ':'Imagine a high-end editorial food photography scene. ')+result;
  return result;
}
function renderPrompt(){
  var ob=document.getElementById('output-body'),tags=document.getElementById('output-tags');
  if(!curPrompt){ob.innerHTML='<div style="padding:20px;text-align:center;color:var(--text3);font-family:DM Mono,monospace;font-size:11px">Erro ao gerar prompt. Tente novamente.</div>';return;}
  var isMJ=S.model==='midjourney';
  var rendered=isMJ?curPrompt:curPrompt.replace(/^([A-ZÁÀÉÊÍÓÔÚÇ][A-ZÁÀÉÊÍÓÔÚÇ\s&\/\-]+\n)/gm,'<span class="st">$1</span>').replace(/\n/g,'<br>');
  ob.innerHTML='<div class="ptxt">'+rendered+'</div>';
  var td=[];
  if(S.intent&&INTENTS[S.intent])td.push(INTENTS[S.intent].icon+' '+INTENTS[S.intent].name);
  if(S.food&&FD[S.food])td.push(FD[S.food][S.lang==='pt'?'pt':'en']);
  if(S.style&&ST[S.style])td.push(ST[S.style].label);
  if(S.format&&FMT[S.format])td.push(FMT[S.format].res);
  if(S.model)td.push(S.model.toUpperCase());
  tags.innerHTML=td.map(function(t){return '<span class="otag">'+t+'</span>';}).join('');
  tags.style.display='flex';
}
function renderSummary(){
  var bar=document.getElementById('summary-bar'),items=[];
  if(S.intent&&INTENTS[S.intent])items.push(INTENTS[S.intent].icon+' '+INTENTS[S.intent].name);
  if(S.food&&FD[S.food])items.push(FD[S.food][S.lang==='pt'?'pt':'en']);
  if(S.style&&ST[S.style])items.push(ST[S.style].label);
  if(S.format)items.push(S.format.toUpperCase());
  if(S.angle)items.push(S.angle);
  bar.innerHTML=items.map(function(t){return '<span class="sum-tag">'+t+'</span>';}).join('');
}
function setLang(l){
  S.lang=l;
  document.getElementById('lpt').classList.toggle('active',l==='pt');
  document.getElementById('len').classList.toggle('active',l==='en');
  curPrompt=buildPrompt();renderPrompt();
}
function setModel(m,btn){
  S.model=m;
  document.querySelectorAll('.model-btn').forEach(function(b){b.classList.remove('active');});
  btn.classList.add('active');
  curPrompt=buildPrompt();renderPrompt();
}
function copyPrompt(){
  if(!curPrompt){showToast('Gere um prompt primeiro','amber');return;}
  navigator.clipboard.writeText(curPrompt).then(function(){
    var b=document.getElementById('btn-copy');
    if(b){b.textContent='✓ Copiado!';b.classList.add('copied');setTimeout(function(){b.textContent='⬡ Copiar Prompt';b.classList.remove('copied');},2000);}
    showToast('✓ Prompt copiado!','success');
  }).catch(function(){
    var ta=document.createElement('textarea');ta.value=curPrompt;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);showToast('✓ Copiado!','success');
  });
}
function restart(){
  S={intent:null,food:null,style:null,angle:'eyelevel',intensity:'balanced',format:null,context:'normal',seasonal:null,photo:null,env:null,lang:'pt',model:'gpt'};
  curPrompt='';
  document.querySelectorAll('[data-g]').forEach(function(el){el.classList.remove('active');});
  document.querySelectorAll('[data-g="angle"][data-v="eyelevel"]').forEach(function(el){el.classList.add('active');});
  document.querySelectorAll('[data-g="intensity"][data-v="balanced"]').forEach(function(el){el.classList.add('active');});
  document.querySelectorAll('[data-g="context"][data-v="normal"]').forEach(function(el){el.classList.add('active');});
  document.getElementById('seasonal-opts').style.display='none';
  document.getElementById('nota').value='';
  document.getElementById('t-cam').checked=false;
  document.getElementById('t-sty').checked=false;
  document.getElementById('t-rea').checked=true;
  document.getElementById('t-neg').checked=true;
  document.getElementById('t-str').checked=false;
  goToStep(1);
}
function showToast(msg,type){
  var t=document.getElementById('toast');
  t.textContent=msg;t.className='toast show'+(type?' '+type:'');
  clearTimeout(window._tt);window._tt=setTimeout(function(){t.classList.remove('show');},2500);
}

function toggleCat(id, btn) {
  var body = document.getElementById(id);
  var isOpen = body.style.display === 'block';
  // close all
  document.querySelectorAll('.food-cat-body').forEach(function(b){b.style.display='none';});
  document.querySelectorAll('.food-cat-btn').forEach(function(b){b.classList.remove('open');});
  // open clicked if was closed
  if(!isOpen){
    body.style.display='block';
    btn.classList.add('open');
    // scroll to show the opened category
    setTimeout(function(){body.scrollIntoView({behavior:'smooth',block:'nearest'});},50);
  }
}

// ── MOOD ATMOSPHERE ───────────────────────────────────────────────────────────
var MOODS = {
  crave:{
    overlay:'radial-gradient(ellipse 70% 50% at 15% 20%, rgba(200,40,10,0.09) 0%, transparent 60%), radial-gradient(ellipse 80% 60% at 85% 80%, rgba(180,70,5,0.07) 0%, transparent 55%)',
    progress:'linear-gradient(90deg,#c0392b,#e8a020)',
    desc:'linear-gradient(135deg,rgba(192,57,43,0.15),rgba(200,134,10,0.08))'
  },
  comfort:{
    overlay:'radial-gradient(ellipse 90% 60% at 50% 0%, rgba(200,140,30,0.07) 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 20% 90%, rgba(180,100,20,0.05) 0%, transparent 55%)',
    progress:'linear-gradient(90deg,#e67e22,#f5b830)',
    desc:'linear-gradient(135deg,rgba(230,126,34,0.12),rgba(200,134,10,0.06))'
  },
  luxury:{
    overlay:'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(180,150,20,0.05) 0%, transparent 70%), radial-gradient(ellipse 40% 30% at 80% 10%, rgba(200,180,80,0.04) 0%, transparent 50%)',
    progress:'linear-gradient(90deg,#b8960c,#e8d060)',
    desc:'linear-gradient(135deg,rgba(184,150,12,0.12),rgba(200,180,80,0.06))'
  },
  nostalgia:{
    overlay:'radial-gradient(ellipse 80% 60% at 30% 30%, rgba(160,100,50,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 70% 70%, rgba(140,80,30,0.05) 0%, transparent 55%)',
    progress:'linear-gradient(90deg,#8e6b3e,#d4956a)',
    desc:'linear-gradient(135deg,rgba(142,107,62,0.14),rgba(180,120,60,0.07))'
  },
  indulgence:{
    overlay:'radial-gradient(ellipse 60% 70% at 10% 80%, rgba(100,30,80,0.09) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 90% 20%, rgba(80,20,60,0.06) 0%, transparent 50%)',
    progress:'linear-gradient(90deg,#6c3483,#a04070)',
    desc:'linear-gradient(135deg,rgba(108,52,131,0.15),rgba(100,30,80,0.08))'
  },
  freshness:{
    overlay:'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(30,140,60,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 90%, rgba(20,120,50,0.05) 0%, transparent 55%)',
    progress:'linear-gradient(90deg,#27ae60,#52c878)',
    desc:'linear-gradient(135deg,rgba(39,174,96,0.12),rgba(30,140,60,0.06))'
  },
  craft:{
    overlay:'radial-gradient(ellipse 70% 50% at 20% 50%, rgba(120,80,40,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 30%, rgba(100,60,20,0.05) 0%, transparent 55%)',
    progress:'linear-gradient(90deg,#7d5a3c,#c8860a)',
    desc:'linear-gradient(135deg,rgba(125,90,60,0.14),rgba(100,60,20,0.07))'
  },
  dopamine:{
    overlay:'radial-gradient(ellipse 80% 50% at 50% 10%, rgba(220,20,120,0.08) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(200,10,100,0.06) 0%, transparent 50%)',
    progress:'linear-gradient(90deg,#e91e8c,#ff6b35)',
    desc:'linear-gradient(135deg,rgba(233,30,140,0.12),rgba(200,10,100,0.06))'
  }
};

function applyMoodAtmosphere(intent) {
  var mood = MOODS[intent];
  if(!mood) return;

  // Update background overlay
  var overlay = document.getElementById('mood-overlay');
  if(overlay) overlay.style.background = mood.overlay;

  // Update progress bar color
  var fill = document.getElementById('prog-fill');
  if(fill) fill.style.background = mood.progress;

  // Update intent desc box border gradient
  var box = document.getElementById('intent-desc-box');
  if(box) box.style.background = mood.desc;

  // Subtle body tint via CSS var
  document.documentElement.style.setProperty('--mood-glow', mood.overlay);
}


// ── FOOD SEARCH ──────────────────────────────────────────────────────────────
var FOOD_LABELS = {
  paofrances:'🥖 Pão Francês',paointeg:'🌾 Pão Integral',baguete:'🥖 Baguete',
  brioche:'🫓 Brioche',paodece:'🍞 Pão de Forma',focaccia:'🫓 Focaccia',
  paodequeijo:'🧀 Pão de Queijo',paodoce:'🍞 Pão Doce',paodelicia:'🍞 Pão Delícia',
  paodebatata:'🥔 Pão de Batata',paonachapa:'🍞 Pão na Chapa',mistoq:'🥪 Misto Quente',
  croissant:'🥐 Croissant',tapioca:'🫓 Tapioca',crepioca:'🫓 Crepioca',
  enroladinhosal:'🌭 Enroladinho Salsicha',empada:'🫙 Empada',esfiha:'🫓 Esfiha',
  bolachas:'🍪 Bolachas',crostini:'🥖 Crostini',grissini:'🥖 Grissini',
  petiscodequeijo:'🧀 Petisco de Queijo',biscoitopolvilho:'🍪 Biscoito Polvilho',
  sopa:'🍲 Sopa',caldo:'🍵 Caldo',cake:'🎂 Bolo',bolofatia:'🎂 Bolo em Fatia',
  bolosemgluten:'🎂 Bolo Especial',cupcake:'🧁 Cupcake',brownie:'🍫 Brownie',
  pudim:'🍮 Pudim',tortadoce:'🥧 Torta',tortafatia:'🥧 Torta em Fatia',
  deliciafrutas:'🍓 Delícia de Frutas',sonho:'🍩 Sonho',roscadovo:'🍩 Rosca de Ovos',
  carolina:'🍮 Carolina',eclair:'🍫 Éclair',milfolhas:'🥐 Mil-Folhas',
  brigadeiro:'🍫 Brigadeiro',brigadeirogourmet:'🍫 Brigadeiro Gourmet',
  balabaiana:'🍬 Bala Baiana',dessert:'🍮 Sobremesa',cheesecake:'🍰 Cheesecake',
  cinnamonroll:'🌀 Cinnamon Roll',cookienyc:'🍪 Cookie NYC',tiramisu:'☕ Tiramisu',
  espresso:'☕ Espresso',coffee:'☕ Café',cafecoad:'☕ Café Coado',
  cafeleite:'☕ Café com Leite',cappuccino:'☕ Cappuccino',latte:'🥛 Latte',
  macchiato:'☕ Macchiato',mocha:'🍫 Mocha',coldbrew:'🧊 Cold Brew',
  chocolatequente:'🍫 Chocolate Quente',suconatural:'🍊 Suco Natural',
  sucopop:'🥤 Suco de Polpa',cha:'🍵 Chá Quente',limonada:'🍋 Limonada',
  matchalatte:'🍵 Matcha Latte',icedlatte:'🧊 Iced Latte',affogato:'☕ Affogato',
  burger:'🍔 Hambúrguer',sandwich:'🥪 Sanduíche',savory:'🥐 Salgado',
  pizza:'🍕 Pizza',pastel:'🥟 Pastel',coxinha:'🍗 Coxinha',
  tortafrango:'🥧 Torta de Frango',chicken:'🍗 Frango',salad:'🥗 Salada',
  drink:'🥤 Bebida',generic:'🍽️ Genérico',acai:'🫐 Açaí',
  hotdog:'🌭 Hot Dog',batatafrita:'🍟 Batata Frita',onionrings:'🧅 Onion Rings'
};

function filterFoods(q) {
  var res = document.getElementById('food-search-results');
  if(!q || q.length < 1) { res.style.display='none'; return; }
  var qn = q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  var matches = Object.entries(FOOD_LABELS).filter(function(e){
    var label = e[1].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    var ptName = FD[e[0]] ? (FD[e[0]].pt||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'') : '';
    return label.indexOf(qn) >= 0 || ptName.indexOf(qn) >= 0;
  });
  if(!matches.length){
    res.innerHTML = '<div class="food-search-empty">Nenhum alimento encontrado</div>';
    res.style.display='block'; return;
  }
  res.innerHTML = matches.slice(0,10).map(function(e){
    var isSelected = S.food === e[0];
    return '<div class="food-search-item'+(isSelected?' food-search-item-active':'')+'" onclick="selectFoodFromSearch(\''+e[0]+'\',\''+e[1]+'\')">'
      + e[1] + (isSelected?' ✓':'') + '</div>';
  }).join('');
  res.style.display='block';
}

function selectFoodFromSearch(v, label) {
  // Clear all active states in accordions
  document.querySelectorAll('[data-g="food"]').forEach(function(b){b.classList.remove('active');});
  // Set state
  S.food = v;
  // Update search input
  var inp = document.getElementById('food-search');
  inp.value = label;
  inp.style.borderColor = 'var(--amber)';
  // Hide results
  document.getElementById('food-search-results').style.display='none';
  // Reset category badges
  document.querySelectorAll('.food-cat-btn').forEach(function(b){
    var sp=b.querySelector('span:first-child');
    if(sp&&sp.dataset.orig) sp.textContent=sp.dataset.orig;
    b.style.borderColor='';
  });
  // Enable next button immediately
  updateNav();
  showToast('✓ '+label+' selecionado','success');
}

// Close search on outside click
document.addEventListener('click', function(e){
  if(!e.target.closest('.food-search-wrap'))
    document.getElementById('food-search-results').style.display='none';
});

// ── MOOD SUMMARY ─────────────────────────────────────────────────────────────
var MOOD_SUMMARIES = {
  crave:{
    dark:'Uma cena visceral e urgente — luz cirúrgica no escuro, alimento que domina o frame com violência elegante.',
    clean:'Fundo limpo que amplifica o desejo — foco total no objeto da fome.',
    rustic:'Calor artesanal com tensão — textura que provoca antes de acolher.',
    cinematic:'Drama cinematográfico máximo — a câmera ataca, não observa.',
    flatlay:'Composição aérea intensa — o alimento como objeto de obsessão.',
    hand:'Presença humana crua — a mão que não resiste.'
  },
  comfort:{
    dark:'Conforto íntimo na escuridão quente — como uma cozinha à noite.',
    clean:'Leveza acolhedora — pureza visual que traz paz.',
    rustic:'Memória afetiva em madeira e luz dourada — o lar em forma de imagem.',
    cinematic:'Drama suave — luz cinematográfica que abraça em vez de cortar.',
    flatlay:'Vista aérea calorosa — organização que transmite cuidado.',
    hand:'Toque humano — a mão que prepara com carinho.'
  },
  luxury:{
    dark:'Silêncio absoluto no escuro — o alimento como objeto raro e intocável.',
    clean:'Perfeição em fundo neutro — produto elevado acima do cotidiano.',
    rustic:'Artesanal sofisticado — imperfeição como luxo consciente.',
    cinematic:'Cinema de alta costura — cada sombra é intencional.',
    flatlay:'Composição geométrica premium — ordem como linguagem de poder.',
    hand:'Toque refinado — a mão como gesto aristocrático.'
  },
  nostalgia:{
    dark:'Memória em tons escuros — como recordar algo que a luz apagou.',
    clean:'Passado limpo e idealizado — simplicidade que comove.',
    rustic:'Madeira com história — cada marca é uma lembrança.',
    cinematic:'Filme que já foi — frames desbotados de um tempo melhor.',
    flatlay:'Vista de cima do passado — como uma fotografia encontrada numa gaveta.',
    hand:'A mão de quem já fez isso antes — memória no gesto.'
  },
  indulgence:{
    dark:'Rendição noturna — luz baixa, escuridão que envolve, prazer proibido.',
    clean:'Prazer sem culpa em fundo puro — o objeto do desejo em destaque total.',
    rustic:'Indulgência artesanal — textura que convida ao toque.',
    cinematic:'Cinema sensorial — câmera que se aproxima devagar.',
    flatlay:'Vista íntima de cima — como olhar de perto algo que não deveria.',
    hand:'A entrega — mão que finalmente cede.'
  },
  freshness:{
    dark:'Frescor contrastante — vitalidade no escuro.',
    clean:'Pureza máxima — leveza em fundo neutro que respira.',
    rustic:'Frescor natural — vida bruta em superfície orgânica.',
    cinematic:'Vitalidade cinematográfica — luz que energiza cada quadro.',
    flatlay:'Vista aérea vibrante — composição que desperta.',
    hand:'Toque vivo — a mão colhendo o frescor.'
  },
  craft:{
    dark:'Artesanal no escuro — a luz revela o trabalho humano.',
    clean:'Simplicidade autoral — cada detalhe tem intenção.',
    rustic:'Imperfeição como assinatura — textura que prova presença humana.',
    cinematic:'Drama do fazer — câmera que testemunha o processo.',
    flatlay:'Organização de quem criou — composição intencional.',
    hand:'A mão que fez — conexão direta com o criador.'
  },
  dopamine:{
    dark:'Impacto no escuro — explosão de cor e contraste.',
    clean:'Energia máxima em fundo puro — recompensa visual imediata.',
    rustic:'Dopamina artesanal — textura que dispara o instinto.',
    cinematic:'Cinema que explode — cada frame é uma recompensa.',
    flatlay:'Composição que ataca os olhos — organização impossível de ignorar.',
    hand:'A mão que entrega — gesto que dispara o desejo.'
  }
};

function renderMoodSummary() {
  var box = document.getElementById('mood-summary');
  var txt = document.getElementById('mood-summary-txt');
  var ico = document.getElementById('mood-summary-icon');
  if(!S.intent || !S.style) { if(box) box.style.display='none'; return; }
  var summaries = MOOD_SUMMARIES[S.intent];
  var summary = summaries ? (summaries[S.style] || summaries['dark']) : null;
  if(!summary || !box) return;
  txt.textContent = summary;
  box.style.display = 'block';
  // Update icon based on intent
  var icons = {crave:'🔥',comfort:'🤗',luxury:'💎',nostalgia:'🌅',indulgence:'🌙',freshness:'🌿',craft:'🏺',dopamine:'⚡'};
  if(ico && S.intent) ico.textContent = icons[S.intent] || '✦';
}

// ── VARIATION ────────────────────────────────────────────────────────────────
var variationSeed = 0;
function generateVariation() {
  variationSeed = Math.floor(Math.random() * 9999);
  var ob = document.getElementById('output-body');
  ob.innerHTML = '<div class="gen-state"><div class="gen-dots"><div class="gen-dot"></div><div class="gen-dot"></div><div class="gen-dot"></div></div><div class="gen-txt">Gerando variação...</div></div>';
  setTimeout(function(){
    curPrompt = buildPrompt();
    // inject slight variation marker
    curPrompt = curPrompt + '\n\n[v.' + variationSeed + ']';
    renderPrompt();
    showToast('↺ Nova variação gerada','amber');
  }, 600);
}
}

window.startWizard = startWizard;
window.goNext = goNext;
window.goBack = goBack;
window.copyPrompt = copyPrompt;
window.restart = restart;
window.generateVariation = generateVariation;
window.setLang = setLang;
window.setModel = setModel;
window.toggleCat = toggleCat;
window.selectFoodFromSearch = selectFoodFromSearch;

// ══════════════════════════════════════════════════════════════════
// PANINI FLOW — lógica dedicada
// Feature flag: tabela `features` no Supabase, key='panini_enabled'
// Para desativar: UPDATE features SET value='false' WHERE key='panini_enabled'
// ══════════════════════════════════════════════════════════════════

var PAN = { food: null, foodLabel: '', tipo: null, pais: null };

var PANINI_TIPOS = {
  dorada: { nome:'Dorada', pt:'TIPO: FIGURINHA DORADA\nFundo inteiramente dourado metalizado com textura cristalizada facetada — foil dourado cobre toda a superfície. Reflexos variando entre ouro claro, ouro escuro e champagne. Acabamento de máximo prestígio.', en:'TYPE: GOLD STICKER\nFully metallic gold background with faceted crystalline texture — gold foil covers the entire surface. Shifting reflections: light gold, dark gold, champagne. Maximum prestige finish.' },
  base:   { nome:'Base',   pt:'TIPO: FIGURINHA BASE\nFundo com degradê nas cores da seleção — transição da cor primária para tons mais escuros. O numeral "26" em branco semitransparente por trás do sujeito. Acabamento glossy standard.', en:'TYPE: BASE STICKER\nBackground gradient in team colors — transition from primary color to darker tones. Numeral "26" in semi-transparent white behind the subject. Standard glossy finish.' },
  extra:  { nome:'Extra Sticker', pt:'TIPO: EXTRA STICKER\nFundo amarelo-dourado vibrante com elementos geométricos coloridos. Badge "EXTRA STICKER" em vermelho-laranja no canto superior direito. Sujeito em corpo inteiro saindo do card. Alta energia e exclusividade.', en:'TYPE: EXTRA STICKER\nVibrant yellow-gold background with colorful geometric elements. Red-orange "EXTRA STICKER" badge at top right. Subject in full body shot breaking out of the card. High energy.' },
  holo:   { nome:'Holográfica', pt:'TIPO: FIGURINHA HOLOGRÁFICA\nSuperfície inteiramente prateada iridescente — foil muda de cor conforme o ângulo de visão. Pattern geométrico repetitivo visível por baixo. Brilho espectral máximo.', en:'TYPE: HOLOGRAPHIC STICKER\nFully iridescent silver surface — foil shifts color with viewing angle. Subtle repeating geometric pattern underneath. Maximum spectral shine.' }
};

var PANINI_PAISES = {
  BRA:{nome:'Brasil',      cores:'verde #009c3b e amarelo #FFDF00 e azul #002776', bandeira:'🇧🇷'},
  ARG:{nome:'Argentina',   cores:'azul celeste #74ACDF e branco',                  bandeira:'🇦🇷'},
  FRA:{nome:'França',      cores:'azul #002395 e vermelho #ED2939 e branco',        bandeira:'🇫🇷'},
  ENG:{nome:'Inglaterra',  cores:'branco e vermelho #CF081F',                       bandeira:'🏴󠁧󠁢󠁥󠁮󠁧󠁿'},
  ESP:{nome:'Espanha',     cores:'vermelho #c60b1e e amarelo #ffc400',              bandeira:'🇪🇸'},
  GER:{nome:'Alemanha',    cores:'preto e vermelho #DD0000 e dourado #FFCE00',      bandeira:'🇩🇪'},
  POR:{nome:'Portugal',    cores:'verde #006600 e vermelho #FF0000',                bandeira:'🇵🇹'},
  ITA:{nome:'Itália',      cores:'azul #003399 (Azzurri)',                          bandeira:'🇮🇹'},
  USA:{nome:'USA',         cores:'azul #002868 e vermelho #BF0A30 e branco',        bandeira:'🇺🇸'},
  MEX:{nome:'México',      cores:'verde #006847 e branco e vermelho #CE1126',       bandeira:'🇲🇽'},
  CAN:{nome:'Canadá',      cores:'vermelho #FF0000 e branco',                       bandeira:'🇨🇦'},
  URU:{nome:'Uruguai',     cores:'azul celeste #5EB6E4 e branco',                   bandeira:'🇺🇾'},
  COL:{nome:'Colômbia',    cores:'amarelo #FCD116 e azul #003087 e vermelho #CE1126',bandeira:'🇨🇴'},
  NED:{nome:'Holanda',     cores:'laranja #FF6600 e azul #003DA5',                  bandeira:'🇳🇱'},
  CRO:{nome:'Croácia',     cores:'vermelho #FF0000 e branco quadriculado',          bandeira:'🇭🇷'},
  MAR:{nome:'Marrocos',    cores:'vermelho #C1272D e verde #006233',                bandeira:'🇲🇦'},
  JPN:{nome:'Japão',       cores:'azul #003DA5 e vermelho',                         bandeira:'🇯🇵'},
  SEN:{nome:'Senegal',     cores:'verde #00853F e amarelo #FDEF42 e vermelho #E31B23',bandeira:'🇸🇳'},
  NOR:{nome:'Noruega',     cores:'vermelho #EF2B2D e azul #002868 e branco',        bandeira:'🇳🇴'},
  GEN:{nome:'Genérica',    cores:'dourado e branco e azul FIFA',                    bandeira:'🌐'}
};

// ── Feature flag: fetch direto ao Supabase ────────────────────────
async function initPaniniFlag() {
  try {
    var res = await fetch(
      'https://yclvvfapkdwltayuiivy.supabase.co/rest/v1/features?key=eq.panini_enabled',
      { headers: { 'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljbHZ2ZmFwa2R3bHRheXVpaXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NzExMDMsImV4cCI6MjA5NDU0NzEwM30.O4fuDlL_KGPPO9WHaazrOtbkfO5KVpbVwpND5sVH0IA' } }
    );
    var data = await res.json();
    if (data && data[0] && data[0].value === 'true') {
      var card = document.getElementById('panini-entry-card');
      if (card) card.style.display = 'block';
    }
  } catch(e) {}
}

// ── Abrir / fechar tela Panini ────────────────────────────────────
function openPaniniFlow() {
  document.getElementById('screen-panini').style.display = 'block';
  document.body.style.overflow = 'hidden';
  panGoTo(1);
  panBuildFoodCats();
}

function closePaniniFlow() {
  document.getElementById('screen-panini').style.display = 'none';
  document.body.style.overflow = '';
}

// ── Navegação interna ─────────────────────────────────────────────
function panGoTo(n) {
  if (n === 2 && !PAN.food) { showToast('Selecione um alimento','amber'); return; }
  if (n === 3) {
    if (!PAN.tipo) { showToast('Escolha o tipo de figurinha','amber'); return; }
    if (!PAN.pais) { showToast('Escolha a seleção','amber'); return; }
    panBuildPrompt();
  }
  [1,2,3].forEach(function(i) {
    var el = document.getElementById('pan-step-' + i);
    if (el) el.style.display = i === n ? 'block' : 'none';
  });
  var lbl = document.getElementById('pan-step-lbl');
  if (lbl) lbl.textContent = n + ' / 3';
  window.scrollTo({top:0,behavior:'smooth'});
}

// ── Busca de alimento (reutiliza FD do main.js) ───────────────────
function panFilterFoods(q) {
  var res = document.getElementById('pan-food-results');
  if (!q || q.length < 2) { res.style.display='none'; return; }
  var l = S.lang === 'pt' ? 'pt' : 'en';
  var matches = Object.entries(FD).filter(function(e) {
    return e[1][l] && e[1][l].toLowerCase().includes(q.toLowerCase());
  }).slice(0,8);
  res.innerHTML = matches.map(function(e) {
    return '<div class="food-search-item" onclick="panSelectFood(\''+e[0]+'\')">'+e[1][l]+'</div>';
  }).join('') || '<div class="food-search-empty">Nenhum resultado</div>';
  res.style.display = 'block';
}

function panSelectFood(key) {
  PAN.food = key;
  PAN.foodLabel = FD[key] ? (FD[key][S.lang==='pt'?'pt':'en'] || key) : key;
  document.getElementById('pan-food-search').value = '';
  document.getElementById('pan-food-results').style.display = 'none';
  var sel = document.getElementById('pan-food-selected');
  sel.textContent = '✓ ' + PAN.foodLabel;
  sel.style.display = 'block';
}

// ── Categorias de alimento simplificadas ─────────────────────────
function panBuildFoodCats() {
  var container = document.getElementById('pan-food-cats');
  if (!container || !window.FOOD_CATS) return;
  container.innerHTML = '';
  FOOD_CATS.forEach(function(cat) {
    var div = document.createElement('div');
    div.style.cssText = 'margin-bottom:10px;';
    div.innerHTML = '<button onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display===\'none\'?\'block\':\'none\'" style="width:100%;text-align:left;padding:10px 14px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-sm);font-family:\'Syne\',sans-serif;font-size:12px;font-weight:600;color:var(--text2);cursor:pointer;">'+cat.label+'</button><div style="display:none;padding:10px;display:none;"><div class="opts-grid">' +
      cat.items.map(function(k) {
        if (!FD[k]) return '';
        var lbl = FD[k][S.lang==='pt'?'pt':'en'] || k;
        return '<button class="opt-card" onclick="panSelectFood(\''+k+'\')" style="font-size:11px;">'+lbl+'</button>';
      }).join('') + '</div></div>';
    container.appendChild(div);
  });
}

// ── pan-card listeners ────────────────────────────────────────────
document.addEventListener('click', function(e) {
  var el = e.target.closest('[data-pan]');
  if (!el) return;
  var g = el.dataset.pan, v = el.dataset.v;
  document.querySelectorAll('[data-pan="'+g+'"]').forEach(function(b){ b.classList.remove('active'); });
  el.classList.add('active');
  PAN[g] = v;
});

// ── Gerar prompt ──────────────────────────────────────────────────
function panBuildPrompt() {
  if (!PAN.food || !PAN.tipo || !PAN.pais) return;
  var food = FD[PAN.food];
  var tipo = PANINI_TIPOS[PAN.tipo];
  var pais = PANINI_PAISES[PAN.pais];
  var l = S.lang === 'pt' ? 'pt' : 'en';
  var nota = (document.getElementById('pan-nota') || {}).value || '';

  var prompt = '';
  if (l === 'pt') {
    prompt = 'SUJEITO PRINCIPAL\nUse o ' + food.pt + ' como sujeito central.\n\n';
    prompt += tipo.pt + '\n\n';
    prompt += 'SELEÇÃO / PAÍS\nFiguirinha da seleção de ' + pais.nome + '. ';
    prompt += 'Cores dominantes: ' + pais.cores + '. Bandeira ' + pais.bandeira + ' integrada no design.\n\n';
    prompt += 'CARD FIFA WORLD CUP 2026™\nProporção 2:3 vertical. Bordas arredondadas 6px. O numeral "26" gigante semitransparente em branco por trás do sujeito — tipografia bold arredondada oficial. Logo FIFA World Cup 2026 no canto superior direito em branco. Rodapé com nome do prato em caps bold e informações em fonte monospace. Logo Panini no canto inferior direito. Sombra suave abaixo do card. Ultra detalhado, hiper-realista, 4K.';
  } else {
    prompt = 'MAIN SUBJECT\nUse the ' + food.en + ' as central subject.\n\n';
    prompt += tipo.en + '\n\n';
    prompt += 'NATIONAL TEAM\n' + pais.nome + ' team sticker. ';
    prompt += 'Dominant colors: ' + pais.cores + '. Flag ' + pais.bandeira + ' integrated in the design.\n\n';
    prompt += 'FIFA WORLD CUP 2026™ CARD\n2:3 vertical ratio. Rounded corners 6px. Giant "26" numeral semi-transparent in white behind the subject — official bold rounded typography. FIFA World Cup 2026 logo at top right in white. Footer with dish name in bold caps and info in monospace font. Panini logo at bottom right. Soft shadow below the card. Ultra detailed, hyper-realistic, 4K.';
  }

  if (nota.trim()) prompt += '\n\n— OBSERVAÇÃO —\n' + nota.trim();

  // Exibir
  var box = document.getElementById('pan-prompt-box');
  if (box) box.textContent = prompt;

  // Tags
  var tags = document.getElementById('pan-tags');
  if (tags) {
    tags.innerHTML = [
      '✦ Panini 2026',
      tipo.nome,
      pais.bandeira + ' ' + pais.nome,
      PAN.foodLabel
    ].map(function(t){ return '<span class="sum-tag">'+t+'</span>'; }).join('');
  }

  return prompt;
}

function panCopy() {
  var prompt = panBuildPrompt();
  if (!prompt) return;
  navigator.clipboard.writeText(prompt).then(function(){ showToast('Prompt copiado!','green'); }).catch(function(){ showToast('Erro ao copiar','red'); });
}

function panReset() {
  PAN = { food: null, foodLabel: '', tipo: null, pais: null };
  document.querySelectorAll('[data-pan]').forEach(function(b){ b.classList.remove('active'); });
  var sel = document.getElementById('pan-food-selected');
  if (sel) { sel.style.display='none'; sel.textContent=''; }
  var search = document.getElementById('pan-food-search');
  if (search) search.value = '';
  var nota = document.getElementById('pan-nota');
  if (nota) nota.value = '';
  panGoTo(1);
}

// Inicializar flag ao carregar
document.addEventListener('DOMContentLoaded', function(){ initPaniniFlag(); });
// fallback se DOMContentLoaded já disparou
if (document.readyState !== 'loading') initPaniniFlag();
