import { supabase } from './supabase'

// ══════════════════════════════════════════════════════════════════
// NANO BANANA — Geração de Imagem via Gemini Flash (Gratuito)
// ══════════════════════════════════════════════════════════════════
var GEMINI_API_KEY = 'AIzaSyDKk978zFNslN5XlHAG4cgSHN9Itl9bv34';

async function generateImage() {
  if (!curPrompt) { showToast('Gere um prompt primeiro', 'amber'); return; }

  var btn = document.getElementById('btn-generate-image');
  var imgSection = document.getElementById('image-section');

  // Estado de loading
  btn.disabled = true;
  btn.textContent = '⏳ Gerando imagem...';
  imgSection.innerHTML = '<div class="img-loading"><div class="gen-dots"><div class="gen-dot"></div><div class="gen-dot"></div><div class="gen-dot"></div></div><div class="gen-txt">Gerando sua imagem com Nano Banana...</div></div>';
  imgSection.style.display = 'block';

  // Monta prompt para geração de imagem
  var imgPrompt = (S.lang === 'pt'
    ? 'Imagine uma cena de fotografia editorial de alimentos de altíssimo nível. '
    : 'Imagine a high-end editorial food photography scene. ')
    + curPrompt.replace(/<[^>]+>/g, '').replace(/\n/g, ' ');

  try {
    var response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=' + GEMINI_API_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: imgPrompt }] }],
          generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
        })
      }
    );

    var data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Erro na API');
    }

    // Extrai imagem da resposta
    var imagePart = null;
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      data.candidates[0].content.parts.forEach(function(part) {
        if (part.inlineData) imagePart = part.inlineData;
      });
    }

    if (imagePart) {
      var src = 'data:' + imagePart.mimeType + ';base64,' + imagePart.data;
      imgSection.innerHTML =
        '<div class="img-result">' +
          '<img src="' + src + '" alt="Imagem gerada" class="generated-img" />' +
          '<div class="img-actions">' +
            '<a href="' + src + '" download="foodart-' + Date.now() + '.jpg" class="btn-download">⬇ Baixar imagem</a>' +
          '</div>' +
        '</div>';
      btn.textContent = '🔄 Gerar nova imagem';
    } else {
      throw new Error('Nenhuma imagem retornada');
    }
  } catch (err) {
    console.error('Erro ao gerar imagem:', err);
    imgSection.innerHTML = '<div class="img-error">❌ Erro ao gerar imagem: ' + (err.message || 'Tente novamente') + '</div>';
    btn.textContent = '✨ Gerar Imagem';
  }

  btn.disabled = false;
}

var INTENTS={
  crave:{name:'DESEJO',icon:'🔥',pt:{open:'INSTINTO. A câmera invade o alimento. Impulso imediato.',light:'Luz dura e direcional. Highlights especulares agressivos.',color:'Âmbar queimado, vermelho profundo, dourado intenso.',mood:'URGENTE. VISCERAL. Sensação: Preciso comer isso AGORA.'},en:{open:'INSTINCT. Camera invades the food. Immediate impulse.',light:'Hard directional light. Aggressive specular highlights.',color:'Burnt amber, deep red, intense gold.',mood:'URGENT. VISCERAL. Feeling: I need to eat this NOW.'}},
  comfort:{name:'CONFORTO',icon:'🤗',pt:{open:'SEGURANÇA EMOCIONAL. A câmera acolhe. Evoca lar e memória afetiva.',light:'Luz natural difusa. Temperatura 4000K–4800K.',color:'Creme, caramelo, marrom dourado.',mood:'Quente, aconchegante, autêntico.'},en:{open:'EMOTIONAL SAFETY. Camera welcomes. Evokes home and affective memory.',light:'Soft diffused natural light. Temperature 4000K–4800K.',color:'Cream, caramel, golden brown.',mood:'Warm, cozy, authentic.'}},
  luxury:{name:'LUXO',icon:'💎',pt:{open:'INACESSIBILIDADE EMOCIONAL. Parece intocável. Distância privilegiada.',light:'Uma única fonte de luz controlada. Sombras elegantes.',color:'Negro profundo, dourado fosco, champanhe, platina.',mood:'SILENCIOSO. INTOCÁVEL. O vazio é tão luxuoso quanto o alimento.'},en:{open:'EMOTIONAL INACCESSIBILITY. Untouchable. Privileged distance.',light:'A single controlled light source. Elegant shadows.',color:'Deep black, matte gold, champagne, platinum.',mood:'SILENT. UNTOUCHABLE. The void is as luxurious as the food.'}},
  nostalgia:{name:'NOSTALGIA',icon:'🌅',pt:{open:'MEMÓRIA AFETIVA IDEALIZADA. O observador sente que já viveu aquele momento.',light:'Luz quente e levemente desbotada. Halo suave, âmbar.',color:'Terracota, mostarda, verde musgo, sépia.',mood:'MELANCÓLICO. AVELUDADO. Como fotografia encontrada numa gaveta.'},en:{open:'IDEALIZED AFFECTIVE MEMORY. Viewer feels they have already lived this moment.',light:'Warm slightly faded light. Soft halo, amber temperature.',color:'Terracotta, mustard, moss green, sepia.',mood:'MELANCHOLIC. VELVETY. Like a photograph found in a drawer.'}},
  indulgence:{name:'PRAZER',icon:'🌙',pt:{open:'RENDIÇÃO LENTA. Não é fome — é permissão. Cena privada, quase proibida.',light:'Luz noturna baixíssima. Como vela próxima. 2400K–2800K.',color:'Bordeaux, chocolate escuro, caramelo, ouro antigo.',mood:'SENSUAL. DECADENTE. PRIVADO.'},en:{open:'SLOW SURRENDER. Not hunger — permission. Private, almost forbidden.',light:'Very low nocturnal light. Like a nearby candle. 2400K–2800K.',color:'Bordeaux, dark chocolate, caramel, antique gold.',mood:'SENSUAL. DECADENT. PRIVATE.'}},
  freshness:{name:'FRESCOR',icon:'🌿',pt:{open:'VITALIDADE NATURAL. O observador sente o corpo mais leve só de olhar.',light:'Luz natural de meio-dia. 5500K–6500K. Claridade.',color:'Verdes vivos, brancos brilhantes, amarelos limão.',mood:'VIBRANTE. LIMPO. ENERGIZANTE.'},en:{open:'NATURAL VITALITY. Viewer feels lighter just by looking.',light:'Natural midday light. 5500K–6500K. Clarity.',color:'Vivid greens, bright whites, lemon yellows.',mood:'VIBRANT. CLEAN. ENERGIZING.'}},
  craft:{name:'ARTESANAL',icon:'🏺',pt:{open:'CONEXÃO HUMANA. Respeito por quem fez. Textura protagonista.',light:'Luz lateral de janela. 3500K–4200K.',color:'Terracota, ocre, marrom natural, creme.',mood:'HONESTO. IMPERFEITO. REAL.'},en:{open:'HUMAN CONNECTION. Respect for the maker. Texture as protagonist.',light:'Lateral window light. 3500K–4200K.',color:'Terracotta, ochre, natural brown, cream.',mood:'HONEST. IMPERFECT. REAL.'}},
  dopamine:{name:'ENERGIA',icon:'⚡',pt:{open:'RECOMPENSA IMEDIATA. O cérebro explode de recompensa.',light:'Luz alta e saturada. Cores vivas. 5000K+.',color:'Cores quentes e saturadas. Contraste alto.',mood:'EXPLOSIVO. IRRESISTÍVEL. AGORA.'},en:{open:'IMMEDIATE REWARD. The brain explodes with reward.',light:'High saturated light. Vivid colors. 5000K+.',color:'Warm saturated colors. High contrast.',mood:'EXPLOSIVE. IRRESISTIBLE. NOW.'}}
};
var FD={
  paofrances:{pt:'pão francês',en:'french bread',fpt:'casca crocante e dourada com micro-rachaduras, miolo branco aerado com bolhas no corte, farinha na casca',fen:'crispy golden crust with micro-cracks, white airy crumb with bubbles in cut, flour dusted',neg_pt:'Sem pão emborrachado. Sem crosta lisa.',neg_en:'No rubbery bread. No smooth crust.',spt:'Casca estilhada expondo miolo aerado. Farinha natural.',sen:'Cracked crust exposing airy crumb. Natural flour.'},
  croissant:{pt:'croissant',en:'croissant',fpt:'camadas folhadas visíveis e separadas, casca dourada com brilho amanteigado',fen:'visible separate flaky layers, golden crust with buttery sheen',neg_pt:'Sem massa densa.',neg_en:'No dense dough.',spt:'Camadas visíveis. Brilho de manteiga.',sen:'Visible layers. Butter sheen.'},
  burger:{pt:'hambúrguer',en:'burger',fpt:'carne com borda carbonizada e suculência, queijo derretendo, pão com gergelim tostado',fen:'meat with charred edge and juiciness, cheese melting, sesame bun toasted',neg_pt:'Sem pão murcho. Sem carne seca.',neg_en:'No soggy bun. No dry meat.',spt:'Queijo derretendo em fios. Molho escorrendo. Carne suculenta.',sen:'Cheese melting in strings. Sauce dripping. Juicy meat.'},
  cake:{pt:'bolo',en:'cake',fpt:'fatia com camadas e recheio, cobertura cremosa texturizada, migalha úmida',fen:'slice with layers and filling, textured creamy frosting, moist crumb',neg_pt:'Sem bolo seco.',neg_en:'No dry cake.',spt:'Camadas de recheio visíveis. Cobertura texturizada.',sen:'Filling layers visible. Textured frosting.'},
  cupcake:{pt:'cupcake',en:'cupcake',fpt:'buttercream em espiral sedosa, base de massa visível',fen:'silky spiral buttercream, visible cake base',neg_pt:'Sem buttercream derretido.',neg_en:'No melted buttercream.',spt:'Espiral sedosa. Decoração elegante.',sen:'Silky spiral. Elegant decoration.'},
  brownie:{pt:'brownie',en:'brownie',fpt:'crosta fudgy craquelada, interior denso e úmido, bordas crocantes',fen:'crackled fudgy crust, dense moist interior, crispy edges',neg_pt:'Sem aparência seca.',neg_en:'No dry appearance.',spt:'Crosta fudgy. Interior denso exposto.',sen:'Fudgy crust. Dense exposed interior.'},
  pizza:{pt:'pizza',en:'pizza',fpt:'queijo dourado e borbulhante com caramelização, bordas altas crocantes',fen:'golden bubbling cheese with caramelization, high crispy edges',neg_pt:'Sem queijo artificial.',neg_en:'No artificial cheese.',spt:'Queijo borbulhante. Bordas crocantes.',sen:'Bubbling cheese. Crispy edges.'},
  coffee:{pt:'café',en:'coffee',fpt:'crema dourada densa, vapor fino subindo, temperatura implícita',fen:'dense golden crema, fine steam rising, implied temperature',neg_pt:'Sem café frio.',neg_en:'No cold coffee.',spt:'Crema dourada. Vapor real.',sen:'Golden crema. Real steam.'},
  espresso:{pt:'espresso',en:'espresso',fpt:'crema avelã espessa e persistente, cor intensa nas bordas',fen:'thick persistent hazelnut crema, intense color at edges',neg_pt:'Sem crema fina.',neg_en:'No thin crema.',spt:'Crema espessa. Intensidade de cor.',sen:'Thick crema. Color intensity.'},
  cappuccino:{pt:'cappuccino',en:'cappuccino',fpt:'espuma densa e sedosa com micro-bolhas, contraste espuma e crema',fen:'dense silky foam with micro-bubbles, foam and crema contrast',neg_pt:'Sem espuma aguada.',neg_en:'No watery foam.',spt:'Espuma sedosa. Arte latte. Vapor.',sen:'Silky foam. Latte art. Steam.'},
  latte:{pt:'latte',en:'latte',fpt:'espuma leve e aveludada, arte latte, camadas de leite e café',fen:'light velvety foam, latte art, milk and coffee layers',neg_pt:'Sem arte latte borrada.',neg_en:'No smudged latte art.',spt:'Arte latte precisa. Espuma leve.',sen:'Precise latte art. Light foam.'},
  coldbrew:{pt:'cold brew',en:'cold brew',fpt:'líquido escuro e translúcido, gelo com condensação densa, sem vapor',fen:'dark translucent liquid, ice with dense condensation, no steam',neg_pt:'Sem aparência quente.',neg_en:'No warm appearance.',spt:'Condensação densa no copo. Gelo escuro.',sen:'Dense condensation on glass. Dark ice.'},
  brigadeiro:{pt:'brigadeiro',en:'brigadeiro',fpt:'superfície brilhante de chocolate com granulado uniforme, esfera perfeita',fen:'shiny chocolate surface with uniform granules, perfect sphere',neg_pt:'Sem aparência seca.',neg_en:'No dry appearance.',spt:'Superfície brilhante. Granulado uniforme.',sen:'Shiny surface. Uniform granules.'},
  pudim:{pt:'pudim',en:'flan pudding',fpt:'superfície lisa e brilhante com calda de caramelo escorrendo, textura aveludada',fen:'smooth shiny surface with dripping caramel, velvety texture',neg_pt:'Sem aparência rígida.',neg_en:'No rigid appearance.',spt:'Calda escorrendo. Superfície aveludada.',sen:'Dripping caramel. Velvety surface.'},
  sonho:{pt:'sonho',en:'cream donut',fpt:'massa fofinha e dourada, recheio de creme visível, açúcar polvilhado',fen:'fluffy golden dough, visible cream filling, powdered sugar',neg_pt:'Sem massa densa.',neg_en:'No dense dough.',spt:'Massa fofa. Recheio cremoso. Açúcar.',sen:'Fluffy dough. Creamy filling. Sugar.'},
  eclair:{pt:'éclair',en:'eclair',fpt:'massa choux com ganache brilhante, recheio de creme no corte',fen:'choux pastry with shiny ganache, cream filling in cut',neg_pt:'Sem cobertura opaca.',neg_en:'No dull coating.',spt:'Ganache brilhante. Creme no corte.',sen:'Shiny ganache. Cream in cut.'},
  milfolhas:{pt:'mil-folhas',en:'mille-feuille',fpt:'camadas de massa folhada com creme, cobertura marmorizada',fen:'puff pastry layers with cream, marbled coating',neg_pt:'Sem massa mole.',neg_en:'No soggy pastry.',spt:'Camadas precisas. Cobertura marmorizada.',sen:'Precise layers. Marbled coating.'},
  tortadoce:{pt:'torta',en:'tart',fpt:'massa amanteigada dourada, recheio generoso, borda canelada',fen:'golden buttery crust, generous filling, fluted edge',neg_pt:'Sem massa crua.',neg_en:'No raw pastry.',spt:'Massa amanteigada. Borda canelada.',sen:'Buttery crust. Fluted edge.'},
  sandwich:{pt:'sanduíche',en:'sandwich',fpt:'pão dourado, recheio generoso no corte diagonal, molho escorrendo',fen:'golden bread, generous filling in diagonal cut, sauce dripping',neg_pt:'Sem pão murcho.',neg_en:'No soggy bread.',spt:'Corte diagonal. Recheio generoso. Molho.',sen:'Diagonal cut. Generous filling. Sauce.'},
  coxinha:{pt:'coxinha',en:'coxinha',fpt:'casca dourada e crocante, formato de gota, recheio visível',fen:'golden crispy shell, drop shape, visible filling',neg_pt:'Sem massa pálida.',neg_en:'No pale dough.',spt:'Casca crocante. Formato de gota.',sen:'Crispy shell. Drop shape.'},
  pastel:{pt:'pastel',en:'pastel',fpt:'massa folhada crocante com bolhas de ar, dourado intenso, borda dobrada',fen:'crispy flaky pastry with air bubbles, intense golden, folded edge',neg_pt:'Sem massa pálida.',neg_en:'No pale pastry.',spt:'Massa borbulhada e folhada.',sen:'Bubbled flaky pastry.'},
  pizza:{pt:'pizza',en:'pizza',fpt:'queijo dourado borbulhante com caramelização, bordas altas crocantes com bolhas',fen:'golden bubbling cheese with caramelization, high crispy edges with bubbles',neg_pt:'Sem queijo artificial.',neg_en:'No artificial cheese.',spt:'Queijo borbulhante. Bordas crocantes.',sen:'Bubbling cheese. Crispy edges.'},
  salad:{pt:'salada',en:'salad',fpt:'folhas frescas e vibrantes com gotas de água, ingredientes coloridos, molho em fio',fen:'fresh vibrant leaves with water drops, colorful ingredients, dressing drizzle',neg_pt:'Sem folhas murchas.',neg_en:'No wilted leaves.',spt:'Folhas frescas. Gotas de água.',sen:'Fresh leaves. Water drops.'},
  chicken:{pt:'frango',en:'chicken',fpt:'pele dourada e crocante com marcas de grelha, carne suculenta no corte',fen:'golden crispy skin with grill marks, juicy meat in cut',neg_pt:'Sem frango ressecado.',neg_en:'No dry chicken.',spt:'Pele crocante. Marcas de grelha. Suculento.',sen:'Crispy skin. Grill marks. Juicy.'},
  acai:{pt:'açaí',en:'acai bowl',fpt:'roxo profundo e aveludado com toppings coloridos, textura cremosa',fen:'deep velvety purple with colorful toppings, creamy texture',neg_pt:'Sem açaí líquido.',neg_en:'No liquid acai.',spt:'Roxo cremoso. Toppings frescos e coloridos.',sen:'Creamy purple. Fresh colorful toppings.'},
  drink:{pt:'bebida',en:'drink',fpt:'condensação densa no copo, gelo cristalino, bolhas visíveis, cor vibrante',fen:'dense condensation on glass, crystalline ice, visible bubbles, vibrant color',neg_pt:'Sem gelo falso.',neg_en:'No fake ice.',spt:'Condensação densa. Gelo cristalino.',sen:'Dense condensation. Crystalline ice.'},
  limonada:{pt:'limonada',en:'lemonade',fpt:'condensação intensa, rodelas de limão na borda, gelo, amarelo vibrante',fen:'intense condensation, lemon slices on rim, ice, vibrant yellow',neg_pt:'Sem aparência aquosa.',neg_en:'No watery appearance.',spt:'Condensação. Rodelas de limão. Vibrante.',sen:'Condensation. Lemon slices. Vibrant.'},
  chocolatequente:{pt:'chocolate quente',en:'hot chocolate',fpt:'cor marrom escura e rica, chantilly ou marshmallow, vapor denso',fen:'rich dark brown, whipped cream or marshmallow, dense steam',neg_pt:'Sem aparência fria.',neg_en:'No cold appearance.',spt:'Cor rica. Chantilly. Vapor denso.',sen:'Rich color. Whipped cream. Dense steam.'},
  brioche:{pt:'brioche',en:'brioche',fpt:'superfície amanteigada e dourada brilhante, massa rica e fofa, miolo sedoso',fen:'buttery shiny golden surface, rich fluffy dough, silky crumb',neg_pt:'Sem massa seca.',neg_en:'No dry dough.',spt:'Brilho dourado. Massa fofa.',sen:'Golden sheen. Fluffy dough.'},
  baguete:{pt:'baguete',en:'baguette',fpt:'casca ultra-crocante com cortes diagonais, miolo aerado com alvéolos grandes',fen:'ultra-crispy crust with diagonal cuts, airy crumb with large alveoli',neg_pt:'Sem casca lisa.',neg_en:'No smooth crust.',spt:'Cortes diagonais. Casca ultra-crocante.',sen:'Diagonal cuts. Ultra-crispy crust.'},
  paodequeijo:{pt:'pão de queijo',en:'cheese bread',fpt:'superfície dourada irregular com rachadura característica, interior elástico',fen:'irregular golden surface with characteristic crack, elastic interior',neg_pt:'Sem aparência industrial.',neg_en:'No industrial appearance.',spt:'Rachadura característica. Dourado irregular.',sen:'Characteristic crack. Irregular golden.'},
  tapioca:{pt:'tapioca',en:'tapioca',fpt:'massa fina e translúcida com textura granulada, bordas levemente douradas',fen:'thin translucent dough with granulated texture, slightly golden edges',neg_pt:'Sem massa borrachuda.',neg_en:'No rubbery dough.',spt:'Massa translúcida e granulada. Bordas douradas.',sen:'Translucent granulated dough. Golden edges.'},
  mistoq:{pt:'misto quente',en:'grilled ham and cheese',fpt:'pão tostado com marcas de sanduicheira, queijo derretendo nas bordas',fen:'toasted bread with press marks, cheese melting at edges',neg_pt:'Sem queijo artificial.',neg_en:'No artificial cheese.',spt:'Queijo derretendo. Marcas de sanduicheira.',sen:'Cheese melting. Sandwich press marks.'},
  esfiha:{pt:'esfiha',en:'esfiha',fpt:'massa dourada e levemente brilhante, recheio visível, bordas crocantes',fen:'golden slightly shiny dough, visible filling, crispy edges',neg_pt:'Sem massa crua.',neg_en:'No raw dough.',spt:'Massa dourada. Recheio visível.',sen:'Golden dough. Visible filling.'},
  focaccia:{pt:'focaccia',en:'focaccia',fpt:'superfície dourada com cavidades de dedo, azeite brilhando, ervas e sal grosso',fen:'golden surface with finger dimples, shining olive oil, herbs and coarse salt',neg_pt:'Sem massa pálida.',neg_en:'No pale dough.',spt:'Cavidades de dedo. Azeite. Ervas e sal.',sen:'Finger dimples. Olive oil. Herbs and salt.'},
  generic:{pt:'prato',en:'dish',fpt:'apresentação cuidadosa, ingredientes frescos, temperatura implícita',fen:'careful presentation, fresh ingredients, implied temperature',neg_pt:'Sem aparência descuidada.',neg_en:'No careless appearance.',spt:'Apresentação cuidadosa. Ingredientes frescos.',sen:'Careful presentation. Fresh ingredients.'},
  paointeg:{pt:'pão integral',en:'whole grain bread',fpt:'casca escura e rústica com sementes visíveis, miolo denso e texturizado',fen:'dark rustic crust with visible seeds, dense textured crumb',neg_pt:'Sem aparência industrial.',neg_en:'No industrial appearance.',spt:'Casca rústica com sementes. Miolo denso no corte.',sen:'Rustic crust with seeds. Dense crumb in cut.'},
  paodece:{pt:'pão de forma',en:'sandwich bread',fpt:'casca macia e levemente dourada, miolo branco e uniforme',fen:'soft slightly golden crust, white uniform crumb',neg_pt:'Sem aparência industrial crua.',neg_en:'No raw industrial appearance.',spt:'Casca macia e dourada. Miolo uniforme branco.',sen:'Soft golden crust. White uniform crumb.'},
  paodoce:{pt:'pão doce',en:'sweet bread',fpt:'superfície brilhante de ovo com dourado intenso, massa fofa, recheio visível nas dobras',fen:'shiny egg wash golden, fluffy dough, filling visible in folds',neg_pt:'Sem massa densa. Sem cor pálida.',neg_en:'No dense dough. No pale color.',spt:'Brilho de ovo dourado. Recheio visível nas dobras.',sen:'Golden egg sheen. Filling visible in folds.'},
  paodelicia:{pt:'pão delícia',en:'delicia bread',fpt:'massa muito macia e branca, crosta fina quase imperceptível, formato roliço',fen:'very soft white dough, thin almost invisible crust, round shape',neg_pt:'Sem massa densa. Sem crosta grossa.',neg_en:'No dense dough. No thick crust.',spt:'Massa extremamente macia. Crosta quase invisível.',sen:'Extremely soft dough. Almost invisible crust.'},
  paodebatata:{pt:'pão de batata',en:'potato bread',fpt:'massa levemente amarelada e macia, crosta fina e brilhante, textura úmida',fen:'slightly yellowish soft dough, thin shiny crust, moist texture',neg_pt:'Sem massa seca.',neg_en:'No dry dough.',spt:'Massa amarelada natural. Crosta brilhante.',sen:'Natural yellowish dough. Shiny crust.'},
  crepioca:{pt:'crepioca',en:'crepioca',fpt:'massa fina e translúcida com textura granulada de tapioca, bordas levemente douradas',fen:'thin translucent dough with tapioca granulated texture, slightly golden edges',neg_pt:'Sem massa borrachuda.',neg_en:'No rubbery dough.',spt:'Massa translúcida e granulada. Bordas douradas.',sen:'Translucent granulated dough. Golden edges.'},
  enroladinhosal:{pt:'enroladinho de salsicha',en:'sausage roll',fpt:'massa folhada dourada em espiral, salsicha visível nas extremidades, superfície brilhante',fen:'golden puff pastry spiral, sausage visible at ends, shiny surface',neg_pt:'Sem massa crua.',neg_en:'No raw dough.',spt:'Massa folhada em espiral. Salsicha visível nas pontas.',sen:'Spiral puff pastry. Sausage visible at tips.'},
  empada:{pt:'empada',en:'empada',fpt:'massa amanteigada dourada com borda canelada, tampa levemente inflada',fen:'buttery golden dough with fluted edge, slightly inflated lid',neg_pt:'Sem massa crua. Sem borda deformada.',neg_en:'No raw dough. No deformed edge.',spt:'Massa amanteigada dourada. Borda canelada.',sen:'Golden buttery dough. Fluted edge.'},
  bolachas:{pt:'bolachas artesanais',en:'artisan crackers',fpt:'superfície irregular e crocante, sal grosso ou ervas visíveis, cor dourada natural',fen:'irregular crispy surface, coarse salt or herbs visible, natural golden color',neg_pt:'Sem aparência industrial.',neg_en:'No industrial appearance.',spt:'Superfície irregular. Sal grosso visível. Cor natural.',sen:'Irregular surface. Coarse salt visible. Natural color.'},
  crostini:{pt:'crostini',en:'crostini',fpt:'fatias finas de pão tostadas com dourado intenso, cobertura realçando a textura',fen:'thin toasted bread slices with intense golden, topping enhancing texture',neg_pt:'Sem tostagem excessiva.',neg_en:'No excessive toasting.',spt:'Fatias douradas. Cobertura artesanal. Fio de azeite.',sen:'Golden slices. Artisanal topping. Olive oil drizzle.'},
  grissini:{pt:'grissini',en:'grissini breadsticks',fpt:'palitos finos e crocantes com dourado irregular, sementes na superfície',fen:'thin crispy sticks with irregular golden, seeds on surface',neg_pt:'Sem aparência mole.',neg_en:'No soft appearance.',spt:'Palitos crocantes. Sementes visíveis.',sen:'Crispy sticks. Visible seeds.'},
  petiscodequeijo:{pt:'petisco de queijo',en:'cheese snack',fpt:'queijo dourado e borbulhante com manchas de caramelização, bordas crocantes',fen:'golden bubbling cheese with caramelization spots, crispy edges',neg_pt:'Sem queijo ressecado.',neg_en:'No dried cheese.',spt:'Queijo borbulhante. Caramelização. Bordas crocantes.',sen:'Bubbling cheese. Caramelization. Crispy edges.'},
  biscoitopolvilho:{pt:'biscoito de polvilho',en:'polvilho biscuit',fpt:'formato irregular e leve, micro-rachaduras superficiais, cor dourada pálida',fen:'irregular light shape, surface micro-cracks, pale golden color',neg_pt:'Sem aparência pesada. Sem cor escura.',neg_en:'No heavy appearance. No dark color.',spt:'Formato irregular e orgânico. Cor dourada pálida.',sen:'Irregular organic shape. Pale golden color.'},
  sopa:{pt:'sopa',en:'soup',fpt:'vapor denso subindo, ingredientes visíveis no caldo, textura rica e encorpada',fen:'dense steam rising, ingredients visible in broth, rich thick texture',neg_pt:'Sem aparência aguada. Sem temperatura fria.',neg_en:'No watery appearance. No cold temperature.',spt:'Vapor denso. Ingredientes visíveis. Caldo rico.',sen:'Dense steam. Visible ingredients. Rich broth.'},
  caldo:{pt:'caldo',en:'broth',fpt:'líquido dourado e translúcido com vapor, ingredientes flutuando, temperatura implícita',fen:'golden translucent liquid with steam, floating ingredients, implied temperature',neg_pt:'Sem aparência fria.',neg_en:'No cold appearance.',spt:'Líquido dourado. Vapor real. Temperatura implícita.',sen:'Golden liquid. Real steam. Implied temperature.'},
  bolofatia:{pt:'bolo em fatia',en:'cake slice',fpt:'fatia revelando camadas internas com recheio, cobertura cremosa, migalha úmida e densa',fen:'slice revealing internal layers with filling, creamy frosting, moist dense crumb',neg_pt:'Sem bolo seco.',neg_en:'No dry cake.',spt:'Camadas visíveis no corte. Recheio generoso. Cobertura texturizada.',sen:'Layers visible in cut. Generous filling. Textured frosting.'},
  bolosemgluten:{pt:'bolo especial',en:'special cake',fpt:'apresentação elaborada com cobertura artesanal, camadas visíveis no corte',fen:'elaborate presentation with artisan frosting, visible layers in cut',neg_pt:'Sem aparência industrializada.',neg_en:'No industrial appearance.',spt:'Cobertura artesanal. Camadas visíveis. Apresentação elaborada.',sen:'Artisan frosting. Visible layers. Elaborate presentation.'},
  tortafatia:{pt:'torta em fatia',en:'tart slice',fpt:'corte revelando camadas de massa e recheio, borda canelada dourada',fen:'cut revealing pastry and filling layers, golden fluted edge',neg_pt:'Sem massa crua.',neg_en:'No raw pastry.',spt:'Camadas de massa e recheio. Borda canelada.',sen:'Pastry and filling layers. Fluted edge.'},
  deliciafrutas:{pt:'delícia de frutas',en:'fruit dessert',fpt:'frutas frescas e brilhantes sobre base cremosa, cores vibrantes contrastantes',fen:'fresh shiny fruits on creamy base, contrasting vibrant colors',neg_pt:'Sem frutas sem vida.',neg_en:'No lifeless fruits.',spt:'Frutas frescas e brilhantes. Base cremosa. Cores vibrantes.',sen:'Fresh shiny fruits. Creamy base. Vibrant colors.'},
  roscadovo:{pt:'rosca de ovos',en:'egg ring bread',fpt:'massa trançada dourada e brilhante, textura macia com crosta levemente crocante',fen:'golden shiny braided dough, soft texture with slightly crispy crust',neg_pt:'Sem massa seca.',neg_en:'No dry dough.',spt:'Massa trançada e dourada. Brilho de ovo.',sen:'Braided golden dough. Egg sheen.'},
  carolina:{pt:'carolina',en:'carolina cream puff',fpt:'massa choux redonda com cobertura de chocolate brilhante, recheio de creme no interior',fen:'round choux pastry with shiny chocolate coating, cream filling inside',neg_pt:'Sem cobertura opaca.',neg_en:'No dull coating.',spt:'Cobertura brilhante. Creme interior generoso.',sen:'Shiny coating. Generous cream interior.'},
  brigadeirogourmet:{pt:'brigadeiro gourmet',en:'gourmet brigadeiro',fpt:'superfície ultra brilhante com decoração elaborada, formato perfeito, cobertura premium',fen:'ultra shiny surface with elaborate decoration, perfect shape, premium coating',neg_pt:'Sem aparência simples.',neg_en:'No simple appearance.',spt:'Ultra brilhante. Decoração elaborada. Formato perfeito.',sen:'Ultra shiny. Elaborate decoration. Perfect shape.'},
  balabaiana:{pt:'bala baiana',en:'baiana candy',fpt:'superfície brilhante de açúcar, cores vibrantes, formato esférico característico',fen:'shiny sugar surface, vibrant colors, characteristic spherical shape',neg_pt:'Sem aparência opaca.',neg_en:'No dull appearance.',spt:'Superfície brilhante. Cores vibrantes. Formato característico.',sen:'Shiny surface. Vibrant colors. Characteristic shape.'},
  cafecoad:{pt:'café coado',en:'filtered coffee',fpt:'líquido âmbar escuro e transparente, vapor fino, temperatura implícita na xícara aquecida',fen:'dark amber transparent liquid, fine steam, implied temperature in warm cup',neg_pt:'Sem café frio.',neg_en:'No cold coffee.',spt:'Líquido âmbar. Vapor fino. Xícara aquecida.',sen:'Amber liquid. Fine steam. Warm cup.'},
  cafeleite:{pt:'café com leite',en:'coffee with milk',fpt:'contraste entre café escuro e leite branco, temperatura implícita, vapor suave',fen:'contrast between dark coffee and white milk, implied temperature, soft steam',neg_pt:'Sem aparência fria.',neg_en:'No cold appearance.',spt:'Contraste de cores. Vapor suave. Temperatura implícita.',sen:'Color contrast. Soft steam. Implied temperature.'},
  macchiato:{pt:'macchiato',en:'macchiato',fpt:'espresso escuro com mancha de espuma branca no centro, crema dourada visível',fen:'dark espresso with white foam spot in center, visible golden crema',neg_pt:'Sem espuma aguada.',neg_en:'No watery foam.',spt:'Mancha de espuma central. Crema dourada.',sen:'Central foam spot. Golden crema.'},
  mocha:{pt:'mocha',en:'mocha',fpt:'camadas de espresso, chocolate e leite vaporizado, arte latte opcional',fen:'layers of espresso, chocolate and steamed milk, optional latte art',neg_pt:'Sem aparência fria.',neg_en:'No cold appearance.',spt:'Camadas visíveis. Chocolate e café. Arte latte.',sen:'Visible layers. Chocolate and coffee. Latte art.'},
  sucopop:{pt:'suco de polpa',en:'fruit pulp juice',fpt:'cor vibrante e densa, polpa visível, copo com condensação',fen:'vibrant dense color, visible pulp, glass with condensation',neg_pt:'Sem aparência industrializada.',neg_en:'No industrial appearance.',spt:'Cor vibrante. Polpa natural. Condensação.',sen:'Vibrant color. Natural pulp. Condensation.'},
  cha:{pt:'chá quente',en:'hot tea',fpt:'líquido âmbar ou verde translúcido com vapor fino, folhas ou sachê visíveis',fen:'amber or green translucent liquid with fine steam, visible leaves or sachet',neg_pt:'Sem aparência fria.',neg_en:'No cold appearance.',spt:'Vapor fino. Cor translúcida. Sachê ou folhas visíveis.',sen:'Fine steam. Translucent color. Visible sachet or leaves.'},
  cheesecake:{pt:'cheesecake',en:'cheesecake',fpt:'base de biscoito compacta, creme denso e aveludado, cobertura de fruta ou calda brilhante',fen:'compact biscuit base, dense velvety cream, fruit or shiny sauce topping',neg_pt:'Sem aparência industrial.',neg_en:'No industrial appearance.',spt:'Base compacta. Creme aveludado. Cobertura brilhante.',sen:'Compact base. Velvety cream. Shiny topping.'},
  cinnamonroll:{pt:'cinnamon roll',en:'cinnamon roll',fpt:'massa enrolada e dourada com camadas visíveis, cobertura de cream cheese derretendo, açúcar e canela caramelizados',fen:'rolled golden dough with visible layers, cream cheese frosting melting, caramelized sugar and cinnamon',neg_pt:'Sem massa crua.',neg_en:'No raw dough.',spt:'Camadas visíveis. Cream cheese derretendo. Açúcar caramelizado.',sen:'Visible layers. Melting cream cheese. Caramelized sugar.'},
  cookienyc:{pt:'cookie NYC',en:'NYC cookie',fpt:'borda crocante e centro macio, chocolate derretendo, superfície irregular e artesanal',fen:'crispy edge and soft center, melting chocolate, irregular artisanal surface',neg_pt:'Sem aparência industrial.',neg_en:'No industrial appearance.',spt:'Borda crocante. Centro macio. Chocolate derretendo.',sen:'Crispy edge. Soft center. Melting chocolate.'},
  tiramisu:{pt:'tiramisu',en:'tiramisu',fpt:'camadas de creme mascarpone e biscoito encharcado de café, cacau polvilhado na superfície',fen:'mascarpone cream and coffee-soaked biscuit layers, cocoa dusted on surface',neg_pt:'Sem aparência industrial.',neg_en:'No industrial appearance.',spt:'Camadas visíveis. Cacau polvilhado. Creme aveludado.',sen:'Visible layers. Dusted cocoa. Velvety cream.'},
  matchalatte:{pt:'matcha latte',en:'matcha latte',fpt:'verde vibrante e intenso, espuma leve na superfície, arte latte opcional',fen:'vibrant intense green, light foam on surface, optional latte art',neg_pt:'Sem cor apagada.',neg_en:'No faded color.',spt:'Verde vibrante. Espuma leve. Arte latte.',sen:'Vibrant green. Light foam. Latte art.'},
  icedlatte:{pt:'iced latte',en:'iced latte',fpt:'gelo cristalino, leite e espresso em camadas distintas, condensação no copo',fen:'crystalline ice, milk and espresso in distinct layers, glass condensation',neg_pt:'Sem gelo falso.',neg_en:'No fake ice.',spt:'Camadas distintas. Gelo cristalino. Condensação.',sen:'Distinct layers. Crystalline ice. Condensation.'},
  affogato:{pt:'affogato',en:'affogato',fpt:'espresso escuro derramando sobre gelato branco, contraste de temperatura implícito',fen:'dark espresso pouring over white gelato, implied temperature contrast',neg_pt:'Sem aparência fria.',neg_en:'No cold appearance.',spt:'Espresso escuro sobre gelato. Contraste de temperatura.',sen:'Dark espresso over gelato. Temperature contrast.'},
  hotdog:{pt:'hot dog',en:'hot dog',fpt:'pão macio com salsicha grelhada, mostarda e ketchup em fio artístico, vapor implícito',fen:'soft bun with grilled sausage, artistic mustard and ketchup drizzle, implied steam',neg_pt:'Sem aparência industrial.',neg_en:'No industrial appearance.',spt:'Salsicha grelhada. Molhos em fio artístico. Pão macio.',sen:'Grilled sausage. Artistic sauce drizzle. Soft bun.'},
  batatafrita:{pt:'batata frita',en:'french fries',fpt:'dourado intenso e crocante, sal visível na superfície, vapor implícito de temperatura',fen:'intense golden crispy, visible salt on surface, implied temperature steam',neg_pt:'Sem aparência murcha.',neg_en:'No soggy appearance.',spt:'Dourado intenso. Sal visível. Temperatura implícita.',sen:'Intense golden. Visible salt. Implied temperature.'},
  onionrings:{pt:'onion rings',en:'onion rings',fpt:'empanado dourado e crocante com textura irregular, interior de cebola macio e translúcido',fen:'golden crispy breading with irregular texture, soft translucent onion interior',neg_pt:'Sem aparência encharcada.',neg_en:'No soggy appearance.',spt:'Empanado dourado e irregular. Interior translúcido.',sen:'Golden irregular breading. Translucent interior.'},
  tortafrango:{pt:'torta de frango',en:'chicken pie',fpt:'massa amanteigada dourada com recheio cremoso de frango visível no corte',fen:'golden buttery crust with creamy chicken filling visible in cut',neg_pt:'Sem massa crua.',neg_en:'No raw pastry.',spt:'Massa dourada. Recheio cremoso de frango no corte.',sen:'Golden crust. Creamy chicken filling in cut.'},
  dessert:{pt:'sobremesa',en:'dessert',fpt:'apresentação elegante, texturas contrastantes, calda ou creme como elemento decorativo',fen:'elegant presentation, contrasting textures, sauce or cream as decorative element',neg_pt:'Sem aparência industrializada.',neg_en:'No industrial appearance.',spt:'Apresentação elegante. Texturas contrastantes. Calda decorativa.',sen:'Elegant presentation. Contrasting textures. Decorative sauce.'},
  paonachapa:{pt:'pão na chapa',en:'toasted bread on grill',fpt:'marcas de chapa irregulares, manteiga derretendo e penetrando, contraste entre casca tostada e interior macio',fen:'irregular grill marks, butter melting and penetrating, toasted crust and soft interior contrast',neg_pt:'Sem tostagem uniforme. Sem aparência fria.',neg_en:'No uniform toasting. No cold appearance.',spt:'Marcas de chapa irregulares. Manteiga penetrando. Contraste de texturas.',sen:'Irregular grill marks. Butter penetrating. Texture contrast.'},
  savory:{pt:'salgado',en:'savory snack',fpt:'massa dourada e crocante, recheio generoso visível, textura apetitosa',fen:'golden crispy pastry, generous visible filling, appetizing texture',neg_pt:'Sem massa pálida. Sem recheio seco.',neg_en:'No pale pastry. No dry filling.',spt:'Massa dourada e crocante. Recheio generoso.',sen:'Golden crispy pastry. Generous filling.'},
  suconatural:{pt:'suco natural',en:'fresh juice',fpt:'cor vibrante e natural, polpa e pedaços visíveis, copo com condensação',fen:'vibrant natural color, visible pulp and pieces, glass with condensation',neg_pt:'Sem aparência industrializada.',neg_en:'No industrial appearance.',spt:'Cor vibrante. Polpa natural visível. Condensação no copo.',sen:'Vibrant color. Visible natural pulp. Glass condensation.'}
};
var PH={
  luxury85:{pt:'INTENÇÃO FOTOGRÁFICA: EDITORIAL DE LUXO\n85mm full-frame · f/1.4–f/1.8 · compressão máxima.\nBokeh oval anamórfico — suave, cremoso, premium.',en:'PHOTOGRAPHIC INTENT: LUXURY EDITORIAL\n85mm full-frame · f/1.4–f/1.8 · maximum compression.\nOval anamorphic bokeh — soft, creamy, premium.'},
  handheld35:{pt:'INTENÇÃO FOTOGRÁFICA: DOCUMENTAL CULINÁRIO\n35mm · câmera livre · f/2.8–f/4. Presença humana implícita.',en:'PHOTOGRAPHIC INTENT: DOCUMENTARY CULINARY\n35mm · handheld · f/2.8–f/4. Implied human presence.'},
  macro100:{pt:'INTENÇÃO FOTOGRÁFICA: REALISMO TÁTIL\nMacro 100mm · f/2.8–f/4 · DOF extremo.\nCada poro e imperfeição preenche o quadro.',en:'PHOTOGRAPHIC INTENT: TACTILE REALISM\n100mm macro · f/2.8–f/4 · extreme DOF.\nEvery pore and imperfection fills the frame.'},
  editorial50:{pt:'INTENÇÃO FOTOGRÁFICA: ESTILO ARTESANAL\n50mm · perspectiva natural · f/4–f/5.6.\nEquilíbrio perfeito sujeito e contexto.',en:'PHOTOGRAPHIC INTENT: ARTISAN LIFESTYLE\n50mm · natural perspective · f/4–f/5.6.\nPerfect balance between subject and context.'},
  michelin:{pt:'INTENÇÃO FOTOGRÁFICA: CAMPANHA GASTRONÔMICA\n70mm · f/2.8–f/4 · precisão total.\nLuz controlada como cirurgia.',en:'PHOTOGRAPHIC INTENT: MICHELIN CAMPAIGN\n70mm · f/2.8–f/4 · total precision.\nLight controlled like surgery.'},
  street28:{pt:'INTENÇÃO FOTOGRÁFICA: REALISMO DE RUA\n28mm grand angular · f/5.6–f/8 · profundidade total.\nO ambiente urbano existe. Fumaça, vapor e imperfeição são reais.\nFlare urbano autêntico. O alimento pertence ao mundo, não a um estúdio.',en:'PHOTOGRAPHIC INTENT: STREET REALISM\n28mm wide · f/5.6–f/8 · full depth.\nUrban environment exists. Smoke, steam, imperfection are real.\nAuthentic urban flare. The food belongs to the world, not a studio.'},
  morning:{pt:'INTENÇÃO FOTOGRÁFICA: MANHÃ ÍNTIMA\n50mm · luz natural lateral de manhã · f/2.8–f/4.\nA hora silenciosa antes do dia começar. Luz suave que envolve sem revelar tudo.\nPartículas de poeira na luz. Temperatura 4500K–5500K, suave e honesta.',en:'PHOTOGRAPHIC INTENT: MORNING INTIMATE LIGHT\n50mm · lateral natural morning light · f/2.8–f/4.\nThe silent hour before the day begins. Soft light that envelops without revealing everything.\nDust particles in light. Temperature 4500K–5500K, soft and honest.'},
  cinenoir:{pt:'INTENÇÃO FOTOGRÁFICA: CINEMA NOIR\n85mm anamórfico · f/1.4–f/2 · chiaroscuro extremo.\nBokeh oval. Lens flare horizontal. Drama visual absoluto.',en:'PHOTOGRAPHIC INTENT: CINEMATIC NOIR\n85mm anamorphic · f/1.4–f/2 · extreme chiaroscuro.\nOval bokeh. Horizontal lens flare. Absolute visual drama.'}
};
var ENV={
  morning_bakery:{pt:'AMBIENTE: PADARIA ARTESANAL DA MANHÃ\nLuz lateral suave de janela — diagonal, âmbar.\nLinho cru. Farinha no ar. Silêncio das 6h.',en:'ENVIRONMENT: MORNING ARTISAN BAKERY\nSoft lateral window light — diagonal, amber.\nRaw linen. Flour in air. 6am silence.'},
  patisserie:{pt:'AMBIENTE: CONFEITARIA CLÁSSICA\nMármore rosê. Fita de cetim. Luz suave. Delicadeza francesa.',en:'ENVIRONMENT: CLASSIC PATISSERIE\nRosé marble. Satin ribbon. Soft light. French delicacy.'},
  european_cafe:{pt:'AMBIENTE: CAFÉ EUROPEU EDITORIAL\nLuz natural de janela. Tons creme envelhecidos. Atmosfera de Paris.',en:'ENVIRONMENT: EUROPEAN CAFÉ EDITORIAL\nNatural window light. Aged cream tones. Paris atmosphere.'},
  fine_dining:{pt:'AMBIENTE: ALTA GASTRONOMIA\nLinho branco imaculado. Porcelana fina. Luz de vela controlada.',en:'ENVIRONMENT: FINE DINING TABLE\nImmaculate white linen. Fine porcelain. Controlled candlelight.'},
  specialty_coffee:{pt:'AMBIENTE: CAFÉ ESPECIAL MINIMALISTA\nConcreto claro. Madeira clara. Luz difusa contemporânea.',en:'ENVIRONMENT: SPECIALTY COFFEE MINIMALIST\nLight concrete. Light wood. Contemporary diffused light.'},
  dark_bar:{pt:'AMBIENTE: BAR ESCURO & LOUNGE\nMármore negro. Cobre e latão. Luz pontual. Atmosfera noturna.',en:'ENVIRONMENT: DARK BAR & LOUNGE\nBlack marble. Copper and brass. Spot light. Nocturnal atmosphere.'},
  home_kitchen:{pt:'AMBIENTE: COZINHA CASEIRA\nMadeira rústica com marcas de vida. Cerâmica imperfeita. Luz natural.',en:'ENVIRONMENT: HOME KITCHEN\nRustic wood with life marks. Imperfect ceramics. Natural light.'},
  street_food:{pt:'AMBIENTE: BARRACA DE RUA\nLuz mista — néon, vapor, sol. Fumaça real. Textura urbana.',en:'ENVIRONMENT: STREET FOOD\nMixed light — neon, steam, sun. Real smoke. Urban texture.'},
  dark_studio:{pt:'AMBIENTE: ESTÚDIO ESCURO PREMIUM\nFundo preto absoluto. Superfície reflexiva. Luz única e precisa.',en:'ENVIRONMENT: DARK STUDIO PREMIUM\nAbsolute black background. Reflective surface. Single precise light.'},
  scandinavian:{pt:'AMBIENTE: ESCANDINAVO MODERNO\nConcreto claro ou madeira. Luz difusa. Zero ornamento.',en:'ENVIRONMENT: MODERN SCANDINAVIAN\nLight concrete or wood. Diffused light. Zero ornament.'},
  french_bakery:{pt:'AMBIENTE: PADARIA FRANCESA\nMármore branco como superfície. Cestos de vime ao fundo.\nLuz de vitrine lateral — branca e suave. Tons creme e dourado.',en:'ENVIRONMENT: FRENCH BAKERY\nWhite marble as surface. Wicker baskets in background.\nLateral showcase light — white and soft. Cream and golden tones.'},
  modern_pastry:{pt:'AMBIENTE: CONFEITARIA MODERNA\nConcreto claro como superfície. Acrílico e metal como props.\nLuz LED difusa e contemporânea. Apresentação minimal e precisa.',en:'ENVIRONMENT: MODERN PASTRY\nLight concrete as surface. Acrylic and metal as props.\nDiffused contemporary LED light. Minimal precise presentation.'},
  chocolate_atelier:{pt:'AMBIENTE: DOCERIA DE CHOCOLATE\nMadeira escura com textura rica. Papel kraft e props artesanais.\nLuz âmbar baixa e direcional. Cacau e ganache no ambiente.',en:'ENVIRONMENT: CHOCOLATE ATELIER\nDark wood with rich texture. Kraft paper and artisan props.\nLow directional amber light. Cocoa and ganache in the environment.'},
  candy_shop:{pt:'AMBIENTE: DOCERIA COLORIDA\nFundo pastel vibrante. Props coloridos e lúdicos.\nLuz alta e uniforme. Alegria, energia visual e diversão.',en:'ENVIRONMENT: COLORFUL CANDY SHOP\nVibrant pastel background. Colorful playful props.\nHigh uniform light. Joy, visual energy and fun.'},
  cozy_cafe:{pt:'AMBIENTE: CAFÉ ACONCHEGANTE\nLuz de vela como fonte principal. Livros e objetos pessoais ao fundo.\nCalor de tarde de domingo. Intimidade e pertencimento.',en:'ENVIRONMENT: COZY CAFÉ\nCandlelight as main source. Books and personal objects in background.\nSunday afternoon warmth. Intimacy and belonging.'},
  luxury_steakhouse:{pt:'AMBIENTE: CHURRASCARIA DE LUXO\nMadeira nogueira escura com veios visíveis. Couro escuro no segundo plano.\nLuz âmbar baixa e pontual. Reflexos controlados em superfícies polidas.',en:'ENVIRONMENT: LUXURY STEAKHOUSE\nDark walnut wood with visible grain. Dark leather in background.\nLow precise amber light. Controlled reflections on polished surfaces.'},
  tratoria:{pt:'AMBIENTE: TRATTORIA ITALIANA\nPedra rústica como superfície. Toalha xadrez e vela.\nCalor de osteria italiana. Autenticidade mediterrânea.',en:'ENVIRONMENT: ITALIAN TRATTORIA\nRustic stone as surface. Checkered cloth and candle.\nItalian osteria warmth. Mediterranean authenticity.'},
  japanese_counter:{pt:'AMBIENTE: BALCÃO JAPONÊS\nPedra fria e escura como superfície. Madeira clara ao fundo.\nEspaço vazio intencional. Silêncio visual e precisão.',en:'ENVIRONMENT: JAPANESE COUNTER\nCold dark stone as surface. Light wood in background.\nIntentional empty space. Visual silence and precision.'},
  rooftop_bar:{pt:'AMBIENTE: ROOFTOP NOTURNO\nLuzes da cidade ao fundo suavemente desfocadas. Concreto e vidro.\nAtmosfera urbana premium. Modernidade e exclusividade noturna.',en:'ENVIRONMENT: NOCTURNAL ROOFTOP\nCity lights softly blurred in background. Concrete and glass.\nPremium urban atmosphere. Modernity and nocturnal exclusivity.'},
  wine_bar:{pt:'AMBIENTE: ADEGA & WINE BAR\nGarrafas ao fundo criando profundidade. Madeira escura e cobre.\nLuz âmbar pontual e baixa. Elegância noturna e sofisticação.',en:'ENVIRONMENT: WINE BAR & CELLAR\nBottles in background creating depth. Dark wood and copper.\nLow amber spot light. Nocturnal elegance and sophistication.'},
  culinary_workshop:{pt:'AMBIENTE: ATELIÊ CULINÁRIO\nAço escovado com marcas de uso real. Farinha espalhada organicamente.\nCalor humano implícito. Textura industrial artesanal.',en:'ENVIRONMENT: CULINARY WORKSHOP\nBrushed steel with real use marks. Organically scattered flour.\nImplied human warmth. Artisanal industrial texture.'},
  open_kitchen:{pt:'AMBIENTE: COZINHA ABERTA\nFogo visível e real. Aço e calor intenso.\nMovimento implícito. Energia de restaurante ao vivo.',en:'ENVIRONMENT: OPEN KITCHEN\nReal visible fire. Steel and intense heat.\nImplied movement. Live restaurant energy.'},
  food_truck:{pt:'AMBIENTE: FOOD TRUCK\nMetal colorido como contexto. Luz natural do dia.\nAmbiente de feira e energia vibrante. Autenticidade urbana.',en:'ENVIRONMENT: FOOD TRUCK\nColorful metal as context. Natural daylight.\nFair atmosphere and vibrant energy. Urban authenticity.'},
  garden_table:{pt:'AMBIENTE: MESA NO JARDIM\nLuz natural difusa e suave. Vegetação viva ao fundo.\nLeveza e frescor. Natureza como moldura elegante.',en:'ENVIRONMENT: GARDEN TABLE\nSoft diffused natural light. Live vegetation in background.\nLightness and freshness. Nature as elegant frame.'},
  market:{pt:'AMBIENTE: FEIRA & MERCADO\nLuz mista e dinâmica. Cores vibrantes e movimento ao redor.\nAutenticidade brasileira. O alimento no seu contexto popular real.',en:'ENVIRONMENT: FAIR & MARKET\nMixed dynamic light. Vibrant colors and movement around.\nBrazilian authenticity. Food in its real popular context.'},
  white_studio:{pt:'AMBIENTE: ESTÚDIO BRANCO CLEAN\nFundo branco contínuo sem horizonte. Luz uniforme e difusa.\nProduto em destaque absoluto. Estética de catálogo premium.',en:'ENVIRONMENT: WHITE CLEAN STUDIO\nContinuous white background without horizon. Uniform diffused light.\nProduct in absolute highlight. Premium catalog aesthetic.'},
  brazilian_bakery:{pt:'AMBIENTE: PADARIA BRASILEIRA\nBalcão de vidro com iluminação quente e interna. Movimento matinal implícito.\nLuz amarelada de fluorescente quente. Cheiro de pão fresco no ambiente.\nAutenticidade popular brasileira.',en:'ENVIRONMENT: BRAZILIAN BAKERY\nGlass counter with warm internal lighting. Implied morning movement.\nWarm fluorescent yellow light. Fresh bread smell in the environment.\nBrazilian popular authenticity.'},
  luxury_pastry:{pt:'AMBIENTE: CONFEITARIA PREMIUM\nVeludo e dourado como materiais dominantes. Luz pontual e precisa.\nCada produto como peça de joalheria. Exclusividade e raridade visual.',en:'ENVIRONMENT: PREMIUM PASTRY\nVelvet and gold as dominant materials. Precise spot light.\nEach product as a jewelry piece. Exclusivity and visual rarity.'},
  artisan_sweet:{pt:'AMBIENTE: DOCERIA ARTESANAL\nMadeira clara e potes de vidro com doces visíveis. Luz natural suave.\nEtiquetas escritas à mão. Calor doméstico e doçura caseira.',en:'ENVIRONMENT: ARTISAN SWEET SHOP\nLight wood and glass jars with visible sweets. Soft natural light.\nHandwritten labels. Domestic warmth and homemade sweetness.'},
  vintage_table:{pt:'AMBIENTE: MESA VINTAGE\nProps antigos com história visível. Madeira gasta e patinada.\nNostalgia e memória afetiva. Tempo como elemento visual.',en:'ENVIRONMENT: VINTAGE TABLE\nOld props with visible history. Worn and patinated wood.\nNostalgia and affective memory. Time as visual element.'}
};
var ST={
  dark:{label:'🌑 Estúdio Escuro',pt:'ESTILO: Estúdio Escuro\nFundo de escuridão absoluta. Sombras profundas.\nTemperatura 2800K–3500K.',en:'STYLE: Dark Studio\nAbsolute darkness as stage. Deep shadows.\nTemperature 2800K–3500K.',cam:{pt:'CÂMERA: 85mm · f/1.8–f/2.4 · ISO 400–800 · DOF raso.',en:'CAMERA: 85mm · f/1.8–f/2.4 · ISO 400–800 · Shallow DOF.'}},
  clean:{label:'⬜ Fundo Limpo',pt:'ESTILO: Fundo Limpo\nAlimento como protagonista absoluto. Luz suave e difusa.',en:'STYLE: Clean Background\nFood as absolute protagonist. Soft diffused light.',cam:{pt:'CÂMERA: 50–85mm · f/4.0–f/5.6 · ISO 100.',en:'CAMERA: 50–85mm · f/4.0–f/5.6 · ISO 100.'}},
  rustic:{label:'🪵 Rústico',pt:'ESTILO: Rústico\nMadeira com textura e história. Calor artesanal.\nTemperatura 3200K–4000K.',en:'STYLE: Rustic\nWood with texture and history. Artisanal warmth.\nTemperature 3200K–4000K.',cam:{pt:'CÂMERA: 50mm · f/2.8–f/4.0 · ISO 200–400.',en:'CAMERA: 50mm · f/2.8–f/4.0 · ISO 200–400.'}},
  cinematic:{label:'🎬 Cinematográfico',pt:'ESTILO: Cinematográfico\nChiaroscuro extremo. Alto contraste.\nTemperatura 2800K–3200K.',en:'STYLE: Cinematic\nExtreme chiaroscuro. High contrast.\nTemperature 2800K–3200K.',cam:{pt:'CÂMERA: 85mm · f/1.4–f/2.0 · ISO 800–1600.',en:'CAMERA: 85mm · f/1.4–f/2.0 · ISO 800–1600.'}},
  flatlay:{label:'📐 Vista de Cima',pt:'ESTILO: Vista de Cima\nCâmera de cima. Composição geométrica. Luz uniforme.',en:'STYLE: Flat Lay\nCamera from above. Geometric composition. Uniform light.',cam:{pt:'CÂMERA: 85mm · f/4.0–f/5.6 · ISO 100 · Overhead.',en:'CAMERA: 85mm · f/4.0–f/5.6 · ISO 100 · Overhead.'}},
  hand:{label:'🤲 Com Mão',pt:'ESTILO: Com Mão\nMão humana no quadro. Conexão real. Autenticidade máxima.',en:'STYLE: With Hand\nHuman hand in frame. Real connection. Maximum authenticity.',cam:{pt:'CÂMERA: 50mm · f/2.0–f/2.8 · ISO 400–800.',en:'CAMERA: 50mm · f/2.0–f/2.8 · ISO 400–800.'}},
  candle:{label:'🕯️ Luz de Vela',pt:'ESTILO: Luz de Vela\nIluminação exclusiva de vela — quente, oscilante e intimista.\nTemperatura 2200K–2600K. Sombras orgânicas e profundas.',en:'STYLE: Candlelight\nExclusive candlelight — warm, flickering and intimate.\nTemperature 2200K–2600K. Organic deep shadows.',cam:{pt:'CÂMERA: 85mm · f/1.4–f/1.8 · ISO 1600–3200.',en:'CAMERA: 85mm · f/1.4–f/1.8 · ISO 1600–3200.'}},
  natural:{label:'🌅 Luz Natural',pt:'ESTILO: Luz Natural\nLuz de janela — lateral, suave e honesta.\nTemperatura 4500K–5500K. Sombras delicadas e direcionais.',en:'STYLE: Natural Light\nWindow light — lateral, soft and honest.\nTemperature 4500K–5500K. Delicate directional shadows.',cam:{pt:'CÂMERA: 50mm · f/2.8–f/4.0 · ISO 200–400.',en:'CAMERA: 50mm · f/2.8–f/4.0 · ISO 200–400.'}},
  extreme_crop:{label:'✂️ Corte Extremo',pt:'ESTILO: Corte Extremo\nCrop agressivo — apenas um fragmento do alimento no frame.\nO detalhe é o protagonista absoluto. Textura e forma como linguagem visual pura.',en:'STYLE: Extreme Crop\nAggressive crop — only a fragment of food in frame.\nThe detail is absolute protagonist. Texture and form as pure visual language.',cam:{pt:'CÂMERA: 100mm macro · f/2.8 · ISO 400.',en:'CAMERA: 100mm macro · f/2.8 · ISO 400.'}},
  table_scene:{label:'👥 Cena de Mesa',pt:'ESTILO: Cena de Mesa\nRefeição compartilhada — o alimento existe num contexto humano vivo.\nMãos, utensílios e elementos ao redor compõem a narrativa.',en:'STYLE: Table Scene\nShared meal — food exists in a living human context.\nHands, utensils and elements around compose the narrative.',cam:{pt:'CÂMERA: 35mm · f/2.8–f/4.0 · ISO 400–800.',en:'CAMERA: 35mm · f/2.8–f/4.0 · ISO 400–800.'}}
};
var ANG={
  eyelevel:{pt:'ÂNGULO: Nível dos Olhos\nCâmera na altura do alimento. Perspectiva natural.',en:'ANGLE: Eye Level\nCamera at food height. Natural perspective.'},
  lowangle:{pt:'ÂNGULO: Ângulo Baixo\nCâmera abaixo olhando para cima. Presença heroica.',en:'ANGLE: Low Angle\nCamera below looking up. Heroic presence.'},
  q45:{pt:'ÂNGULO: Diagonal 45°\nO ângulo mais narrativo. Revela profundidade e camadas.',en:'ANGLE: 45° Diagonal\nMost narrative angle. Reveals depth and layers.'},
  overhead:{pt:'ÂNGULO: Vista Aérea\nCâmera diretamente de cima. Composição gráfica.',en:'ANGLE: Overhead\nCamera directly above. Graphic composition.'},
  macro:{pt:'ÂNGULO: Macro Close-up\nCâmera muito próxima. Textura preenche o quadro.',en:'ANGLE: Macro Close-up\nCamera very close. Texture fills the frame.'}
};
var FMT={
  feed:{res:'1080×1350px',pt:'FORMATO: 1080×1350px (4:5) — feed e cardápio digital.',en:'FORMAT: 1080×1350px (4:5) — feed and digital menu.'},
  story:{res:'1080×1920px',pt:'FORMATO: 1080×1920px (9:16) — Stories e Reels.',en:'FORMAT: 1080×1920px (9:16) — Stories and Reels.'},
  banner:{res:'1920×1080px',pt:'FORMATO: 1920×1080px (16:9) — banners e painéis digitais.',en:'FORMAT: 1920×1080px (16:9) — banners and digital panels.'},
  square:{res:'1080×1080px',pt:'FORMATO: 1080×1080px (1:1) — feed quadrado e WhatsApp.',en:'FORMAT: 1080×1080px (1:1) — square feed and WhatsApp.'},
  pinterest:{res:'1000×1500px',pt:'FORMATO: 1000×1500px (2:3) — Pinterest e blog gastronômico.',en:'FORMAT: 1000×1500px (2:3) — Pinterest and food blog.'},
  widescreen:{res:'2560×1080px',pt:'FORMATO: 2560×1080px (21:9) — hero de website e capa de plataforma.',en:'FORMAT: 2560×1080px (21:9) — website hero and platform cover.'},
  thumbnail:{res:'1280×720px',pt:'FORMATO: 1280×720px (16:9) — thumbnail YouTube e vídeo gastronômico.',en:'FORMAT: 1280×720px (16:9) — YouTube thumbnail and food video.'},
  email:{res:'600px',pt:'FORMATO: 600px de largura — newsletter e email marketing gastronômico.',en:'FORMAT: 600px width — newsletter and food email marketing.'},
  menu_a4:{res:'2480×3508px',pt:'FORMATO: 2480×3508px (A4) — cardápio físico e material impresso. Alta resolução obrigatória.',en:'FORMAT: 2480×3508px (A4) — physical menu and printed material. High resolution mandatory.'},
  outdoor:{res:'Alta resolução',pt:'FORMATO: Grande formato — outdoor, banner de rua e fachada. Resolução máxima disponível.',en:'FORMAT: Large format — outdoor, street banner and facade. Maximum available resolution.'}
};
var CTX={
  normal:{pt:'',en:''},
  combo:{pt:'COMPOSIÇÃO: COMBO\nProduto principal com bebida e acompanhamento. Composição em grupo orgânico.',en:'COMPOSITION: COMBO\nMain product with drink and side item. Organic group composition.'},
  process:{pt:'CONTEXTO: BASTIDORES\nMomento do preparo — mãos, utensílios, ingredientes em ação.',en:'CONTEXT: BEHIND THE SCENES\nPreparation moment — hands, utensils, ingredients in action.'},
  seasonal:{pt:'',en:''},
  human:{pt:'CONTEXTO: MOMENTO HUMANO\nPresença humana integrada à cena — alguém segurando, servindo ou provando o alimento.\nConexão emocional imediata. Autenticidade de um momento real.',en:'CONTEXT: HUMAN MOMENT\nHuman presence integrated — someone holding, serving or tasting the food.\nImmediate emotional connection. Authenticity of a real moment.'},
  human:{pt:'CONTEXTO: MOMENTO HUMANO\nPresença humana integrada à cena — alguém segurando, servindo ou provando o alimento.\nConexão emocional imediata. Autenticidade de um momento real e vivido.',en:'CONTEXT: HUMAN MOMENT\nHuman presence integrated into the scene — someone holding, serving or tasting the food.\nImmediate emotional connection. Authenticity of a real and lived moment.'}
};
var SEA={
  christmas:{pt:'OCASIÃO: NATAL\nDecoração natalina — vermelho, verde, dourado. Atmosfera mágica.',en:'OCCASION: CHRISTMAS\nChristmas decoration — red, green, gold. Magical atmosphere.'},
  valentine:{pt:'OCASIÃO: DIA DOS NAMORADOS\nRosas, vela. Tons de vermelho e rosa. Atmosfera romântica.',en:'OCCASION: VALENTINES DAY\nRoses, candle. Red and pink tones. Romantic atmosphere.'},
  easter:{pt:'OCASIÃO: PÁSCOA\nOvos decorados, flores. Tons pastel.',en:'OCCASION: EASTER\nDecorated eggs, flowers. Pastel tones.'},
  junina:{pt:'OCASIÃO: FESTA JUNINA\nBandeirinhas coloridas, chapéu de palha.',en:'OCCASION: JUNE FESTIVAL\nColorful flags, straw hat.'},
  mothers:{pt:'OCASIÃO: DIA DAS MÃES\nFlores, tons suaves de rosa e branco.',en:'OCCASION: MOTHERS DAY\nFlowers, soft pink and white tones.'},
  newyear:{pt:'OCASIÃO: ANO NOVO\nChampagne, confetes. Dourado, preto e prata.',en:'OCCASION: NEW YEAR\nChampagne, confetti. Gold, black and silver.'},
  halloween:{pt:'OCASIÃO: HALLOWEEN\nAbóboras esculpidas, teia de aranha, velas negras.\nPaleta laranja intenso, preto profundo e roxo escuro. Atmosfera sombria e teatral.',en:'OCCASION: HALLOWEEN\nCarved pumpkins, cobwebs, black candles.\nIntense orange, deep black and dark purple palette. Dark theatrical atmosphere.'},
  fathers:{pt:'OCASIÃO: DIA DOS PAIS\nTons robustos e masculinos — marrom escuro, cobre e âmbar profundo.\nProps de couro, madeira e metal. Presença visual forte e estruturada.',en:'OCCASION: FATHERS DAY\nRobust masculine tones — dark brown, copper and deep amber.\nLeather, wood and metal props. Strong structured visual presence.'},
  wedding:{pt:'OCASIÃO: CASAMENTO\nBranco imaculado, dourado suave e flores delicadas. Elegância máxima.\nLinho fino, porcelana, pétalas. Atmosfera de celebração refinada e atemporal.',en:'OCCASION: WEDDING\nImmaculate white, soft gold and delicate flowers. Maximum elegance.\nFine linen, porcelain, petals. Refined timeless celebration atmosphere.'},
  birthday:{pt:'OCASIÃO: ANIVERSÁRIO\nVelas acesas, confetes coloridos e brilho festivo. Energia de celebração.\nCores vibrantes — rosa, amarelo, azul. Movimento e alegria implícitos.',en:'OCCASION: BIRTHDAY\nLit candles, colorful confetti and festive glow. Celebration energy.\nVibrant colors — pink, yellow, blue. Implied movement and joy.'},
  blackfriday:{pt:'OCASIÃO: BLACK FRIDAY\nFundo escuro absoluto com destaques vermelhos intensos. Urgência visual máxima.\nContraste extremo entre produto e fundo. Energia de escassez e oportunidade.',en:'OCCASION: BLACK FRIDAY\nAbsolute dark background with intense red highlights. Maximum visual urgency.\nExtreme contrast between product and background. Scarcity and opportunity energy.'}
};
var INT={
  subtle:{pt:'INTENSIDADE: SUTIL\nContraste suave. Sombras longas e delicadas.',en:'INTENSITY: SUBTLE\nSoft contrast. Long delicate shadows.'},
  balanced:{pt:'INTENSIDADE: EQUILIBRADA\nContraste balanceado. Máximo apelo comercial.',en:'INTENSITY: BALANCED\nBalanced contrast. Maximum commercial appeal.'},
  dramatic:{pt:'INTENSIDADE: DRAMÁTICA\nAlto contraste. Sombras profundas. Presença forte.',en:'INTENSITY: DRAMATIC\nHigh contrast. Deep shadows. Strong presence.'},
  ultra:{pt:'INTENSIDADE: ULTRA CINEMATOGRÁFICA\nChiaroscuro extremo. Tensão visual máxima.',en:'INTENSITY: ULTRA CINEMATIC\nExtreme chiaroscuro. Maximum visual tension.'}
};
var REAL_PT='PROTEÇÃO DE REALISMO\nImperfeição mandatória. Assimetria orgânica.\nSuperfícies físicas reais. Zero CGI. Zero suavização.';
var REAL_EN='REALISM PROTECTION\nImperfection mandatory. Organic asymmetry.\nReal physical surfaces. Zero CGI. Zero smoothing.';
var STR_PT='MOTOR DE FORÇA\nPRIORIDADE REALISMO: EXTREMA. Fotografia comercial premium.\nREJEIÇÃO DE CGI: TOTAL.';
var STR_EN='PROMPT STRENGTH ENGINE\nREALISM PRIORITY: EXTREME. Premium commercial photography.\nCGI REJECTION: TOTAL.';

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

async function startWizard(){
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) { openAuthModal('login'); return; }

  // Verificar assinatura ativa
  const { data: assinatura } = await supabase
    .from('assinaturas')
    .select('ativo, plano')
    .eq('email', session.user.email)
    .single();

  if (!assinatura || !assinatura.ativo) {
    document.getElementById('screen-welcome').style.display = 'none';
    document.getElementById('screen-pro').style.display = 'flex';
    return;
  }

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
function showWelcomeFromPro() {
  document.getElementById('screen-pro').style.display = 'none';
  document.getElementById('screen-welcome').style.display = 'block';
}

function openResetPasswordModal() {
  if (document.getElementById('reset-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'reset-modal';
  modal.innerHTML = `
    <div class="auth-backdrop" id="reset-backdrop"></div>
    <div class="auth-box" style="max-width:380px;width:100%;position:relative;z-index:1;">
      <div class="auth-logo"><span class="auth-logo-star">✦</span><span style="font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:var(--cream);letter-spacing:.05em;">FOOD ART DIRECTOR</span></div>
      <div id="reset-form">
        <div class="auth-title">Nova senha</div>
        <div class="auth-sub">Digite sua nova senha para recuperar o acesso.</div>
        <div class="auth-field">
          <label class="auth-label">Nova senha</label>
          <input class="auth-input" id="reset-password" type="password" placeholder="mínimo 6 caracteres" autocomplete="new-password">
        </div>
        <div class="auth-field">
          <label class="auth-label">Confirmar senha</label>
          <input class="auth-input" id="reset-password-confirm" type="password" placeholder="repita a senha" autocomplete="new-password">
        </div>
        <div class="auth-error" id="reset-error"></div>
        <button class="auth-btn" id="reset-btn" onclick="doResetPassword()">
          <span id="reset-btn-txt">Salvar nova senha</span>
        </button>
      </div>
      <div id="reset-success" style="display:none;text-align:center;">
        <div class="auth-success-ico">✦</div>
        <div class="auth-title">Senha atualizada!</div>
        <div class="auth-sub">Sua senha foi redefinida com sucesso.</div>
        <button class="auth-btn" onclick="closeResetModal()">Entrar no app</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  injectAuthStyles();
  document.getElementById('reset-password').addEventListener('keydown', e => { if(e.key==='Enter') doResetPassword(); });
  document.getElementById('reset-password-confirm').addEventListener('keydown', e => { if(e.key==='Enter') doResetPassword(); });
}

async function doResetPassword() {
  const password = document.getElementById('reset-password').value;
  const confirm = document.getElementById('reset-password-confirm').value;
  const errEl = document.getElementById('reset-error');
  const btn = document.getElementById('reset-btn');
  const btnTxt = document.getElementById('reset-btn-txt');

  errEl.textContent = '';
  if (password.length < 6) { errEl.textContent = 'A senha deve ter ao menos 6 caracteres.'; return; }
  if (password !== confirm) { errEl.textContent = 'As senhas não coincidem.'; return; }

  btn.disabled = true;
  btnTxt.textContent = 'Salvando...';

  try {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      errEl.textContent = 'Erro ao atualizar senha. Tente novamente.';
      btn.disabled = false;
      btnTxt.textContent = 'Salvar nova senha';
      return;
    }
    document.getElementById('reset-form').style.display = 'none';
    document.getElementById('reset-success').style.display = 'block';
  } catch(e) {
    errEl.textContent = 'Erro ao conectar. Tente novamente.';
    btn.disabled = false;
    btnTxt.textContent = 'Salvar nova senha';
  }
}

function closeResetModal() {
  const m = document.getElementById('reset-modal');
  if (m) m.remove();
  updateAuthUI(true);
}

window.startWizard = startWizard;
window.showWelcomeFromPro = showWelcomeFromPro;
window.doResetPassword = doResetPassword;
window.closeResetModal = closeResetModal;
window.goNext = goNext;
window.goBack = goBack;
window.copyPrompt = copyPrompt;
window.restart = restart;
window.generateVariation = generateVariation;
window.setLang = setLang;
window.setModel = setModel;
window.toggleCat = toggleCat;

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

// ── Categorias de alimento ────────────────────────────────────────
var PAN_FOOD_CATS = [
  {label:'🥐 Padaria / Panificadora', items:['paofrances','paointeg','baguete','brioche','paodece','focaccia','paodequeijo','paodoce','paodelicia','paodebatata','paonachapa','mistoq','croissant','tapioca','crepioca','enroladinhosal','empada','esfiha','bolachas','crostini','grissini','petiscodequeijo','biscoitopolvilho','sopa','caldo']},
  {label:'🎂 Doceria / Confeitaria', items:['cake','bolofatia','bolosemgluten','cupcake','brownie','pudim','tortadoce','tortafatia','deliciafrutas','sonho','roscadovo','carolina','eclair','milfolhas','brigadeiro','brigadeirogourmet','balabaiana','dessert','cheesecake','cinnamonroll','cookienyc','tiramisu']},
  {label:'☕ Cafeteria', items:['espresso','coffee','cafecoad','cafeleite','cappuccino','latte','macchiato','mocha','coldbrew','chocolatequente','suconatural','sucopop','cha','limonada','matchalatte','icedlatte','affogato']},
  {label:'🍔 Hamburgueria', items:['burger','sandwich','savory']},
  {label:'🍟 Fast-food Premium', items:['hotdog','batatafrita','onionrings']},
  {label:'🍕 Pizzaria', items:['pizza']},
  {label:'🥟 Pastelaria / Salgados', items:['pastel','coxinha','tortafrango']},
  {label:'🍽️ Restaurante / Casual', items:['chicken','salad','drink','generic']},
  {label:'🇧🇷 Brasileiros Especiais', items:['acai','brigadeiro']}
];
function panBuildFoodCats() {
  var container = document.getElementById('pan-food-cats');
  if (!container) return;
  var l = S.lang === 'pt' ? 'pt' : 'en';
  container.innerHTML = PAN_FOOD_CATS.map(function(cat, ci) {
    var items = cat.items.filter(function(k){ return FD[k]; }).map(function(k) {
      return '<button class="opt-card" onclick="panSelectFood(\'' + k + '\')" style="font-size:11px;">' + FD[k][l] + '</button>';
    }).join('');
    return '<div style="margin-bottom:8px;">' +
      '<button onclick="var b=document.getElementById(\'pancat' + ci + '\');b.style.display=b.style.display===\'none\'?\'grid\':\'none\'" style="width:100%;text-align:left;padding:10px 14px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-sm);font-family:\'Syne\',sans-serif;font-size:12px;font-weight:600;color:var(--text2);cursor:pointer;">' + cat.label + '</button>' +
      '<div id="pancat' + ci + '" style="display:none;"><div class="opts-grid">' + items + '</div></div>' +
      '</div>';
  }).join('');
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
  // Fechar Panini e voltar ao início geral
  closePaniniFlow();
  restart();
}

// Inicializar flag ao carregar
document.addEventListener('DOMContentLoaded', function(){ initPaniniFlag(); });
// fallback se DOMContentLoaded já disparou
if (document.readyState !== 'loading') initPaniniFlag();

// ── Expor funções Panini globalmente (necessário com Vite modules) ──

window.filterFoods = filterFoods;
window.selectFoodFromSearch = selectFoodFromSearch;
window.openPaniniFlow = openPaniniFlow;
window.closePaniniFlow = closePaniniFlow;
window.panGoTo = panGoTo;
window.panFilterFoods = panFilterFoods;
window.panSelectFood = panSelectFood;
window.panBuildPrompt = panBuildPrompt;
window.panCopy = panCopy;
window.panReset = panReset;
// ── AUTH MODAL ────────────────────────────────────────────────────────────────
function createAuthModal() {
  if (document.getElementById('auth-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'auth-modal';
  modal.innerHTML = `
    <div class="auth-backdrop" id="auth-backdrop"></div>
    <div class="auth-box" id="auth-box">
      <button class="auth-close" id="auth-close">✕</button>

      <!-- LOGO -->
      <div class="auth-logo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
          <circle cx="12" cy="13" r="4"/>
        </svg>
        <span class="auth-logo-star">✦</span>
      </div>

      <!-- TABS -->
      <div class="auth-tabs">
        <button class="auth-tab active" id="tab-login" onclick="authSwitchTab('login')">Entrar</button>
        <button class="auth-tab" id="tab-signup" onclick="authSwitchTab('signup')">Criar conta</button>
      </div>

      <!-- FORM LOGIN -->
      <div id="auth-form-login">
        <div class="auth-title">Bem-vindo de volta</div>
        <div class="auth-sub">Acesse sua conta para continuar</div>
        <div class="auth-field">
          <label class="auth-label">Email</label>
          <input class="auth-input" id="login-email" type="email" placeholder="seu@email.com" autocomplete="email">
        </div>
        <div class="auth-field">
          <label class="auth-label">Senha</label>
          <input class="auth-input" id="login-password" type="password" placeholder="••••••••" autocomplete="current-password">
        </div>
        <div class="auth-error" id="login-error"></div>
        <button class="auth-btn" id="login-btn" onclick="authLogin()">
          <span id="login-btn-txt">Entrar</span>
        </button>
        <div class="auth-switch">Não tem conta? <span onclick="authSwitchTab('signup')">Criar conta</span></div>
        <div class="auth-switch" style="margin-top:8px;">Esqueceu a senha? <span onclick="authSwitchTab('forgot')">Recuperar acesso</span></div>
      </div>

      <!-- FORM FORGOT -->
      <div id="auth-form-forgot" style="display:none">
        <div class="auth-title">Recuperar senha</div>
        <div class="auth-sub">Informe seu email e enviaremos um link para redefinir sua senha.</div>
        <div class="auth-field">
          <label class="auth-label">Email</label>
          <input class="auth-input" id="forgot-email" type="email" placeholder="seu@email.com" autocomplete="email">
        </div>
        <div class="auth-error" id="forgot-error"></div>
        <button class="auth-btn" id="forgot-btn" onclick="authForgot()">
          <span id="forgot-btn-txt">Enviar link</span>
        </button>
        <div class="auth-switch">Lembrou a senha? <span onclick="authSwitchTab('login')">Voltar ao login</span></div>
      </div>

      <!-- FORGOT SUCCESS -->
      <div id="auth-forgot-success" style="display:none">
        <div class="auth-success-ico">✉️</div>
        <div class="auth-title">Email enviado!</div>
        <div class="auth-sub">Verifique sua caixa de entrada e clique no link para redefinir sua senha.</div>
        <button class="auth-btn" onclick="authSwitchTab('login')">Voltar ao login</button>
      </div>

      <!-- FORM SIGNUP -->
      <div id="auth-form-signup" style="display:none">
        <div class="auth-title">Criar sua conta</div>
        <div class="auth-sub">Comece a criar prompts cinematográficos</div>
        <div class="auth-field">
          <label class="auth-label">Email</label>
          <input class="auth-input" id="signup-email" type="email" placeholder="seu@email.com" autocomplete="email">
        </div>
        <div class="auth-field">
          <label class="auth-label">Senha</label>
          <input class="auth-input" id="signup-password" type="password" placeholder="mínimo 6 caracteres" autocomplete="new-password">
        </div>
        <div class="auth-error" id="signup-error"></div>
        <button class="auth-btn" id="signup-btn" onclick="authSignup()">
          <span id="signup-btn-txt">Criar conta</span>
        </button>
        <div class="auth-switch">Já tem conta? <span onclick="authSwitchTab('login')">Entrar</span></div>
      </div>

      <!-- SUCCESS -->
      <div id="auth-success" style="display:none">
        <div class="auth-success-ico">✦</div>
        <div class="auth-title">Conta criada!</div>
        <div class="auth-sub">Verifique seu email para confirmar o cadastro, depois faça login.</div>
        <button class="auth-btn" onclick="authSwitchTab('login')">Ir para login</button>
      </div>

    </div>
  `;
  document.body.appendChild(modal);

  // Fechar no backdrop
  document.getElementById('auth-backdrop').addEventListener('click', closeAuthModal);
  document.getElementById('auth-close').addEventListener('click', closeAuthModal);

  // Enter nos inputs
  ['login-email','login-password'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => { if(e.key==='Enter') authLogin(); });
  });
  ['signup-email','signup-password'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => { if(e.key==='Enter') authSignup(); });
  });
  document.getElementById('forgot-email').addEventListener('keydown', e => { if(e.key==='Enter') authForgot(); });

  injectAuthStyles();
}

function injectAuthStyles() {
  if (document.getElementById('auth-styles')) return;
  const s = document.createElement('style');
  s.id = 'auth-styles';
  s.textContent = `
    #auth-modal { position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px; }
    #reset-modal { position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px; }
    .auth-backdrop { position:absolute;inset:0;background:rgba(0,0,0,0.82);backdrop-filter:blur(8px); }
    .auth-box {
      position:relative;z-index:1;
      background:linear-gradient(160deg,rgba(22,18,10,0.99),rgba(14,12,7,1));
      border:1px solid rgba(200,134,10,0.15);
      border-radius:18px;
      padding:32px 28px 28px;
      width:100%;max-width:380px;
      box-shadow:0 32px 80px rgba(0,0,0,0.7),0 0 0 1px rgba(200,134,10,0.05) inset;
      animation:authIn .3s cubic-bezier(0.2,0,0.2,1);
    }
    @keyframes authIn { from{opacity:0;transform:translateY(20px) scale(0.97)} to{opacity:1;transform:none} }
    .auth-close {
      position:absolute;top:16px;right:16px;
      background:none;border:none;color:var(--text3);
      font-size:14px;cursor:pointer;padding:4px 8px;
      border-radius:6px;transition:color .2s;
    }
    .auth-close:hover { color:var(--cream); }
    .auth-logo { display:flex;align-items:center;gap:4px;justify-content:center;margin-bottom:20px; }
    .auth-logo-star { color:var(--amber);font-size:10px; }
    .auth-tabs { display:flex;gap:4px;background:rgba(255,255,255,0.04);border-radius:10px;padding:4px;margin-bottom:24px; }
    .auth-tab {
      flex:1;padding:9px;border:none;background:none;
      font-family:'Syne',sans-serif;font-size:13px;font-weight:700;
      color:var(--text3);border-radius:7px;cursor:pointer;transition:all .2s;
    }
    .auth-tab.active { background:rgba(200,134,10,0.15);color:var(--amber-b); }
    .auth-title { font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:var(--cream);margin-bottom:4px; }
    .auth-sub { font-family:'DM Mono',monospace;font-size:11px;color:var(--text3);margin-bottom:20px;line-height:1.5; }
    .auth-field { margin-bottom:14px; }
    .auth-label { display:block;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--text3);margin-bottom:6px; }
    .auth-input {
      width:100%;padding:12px 14px;
      background:rgba(255,255,255,0.04);
      border:1.5px solid rgba(255,255,255,0.08);
      border-radius:10px;color:var(--cream);
      font-family:'DM Mono',monospace;font-size:13px;
      outline:none;transition:border-color .2s;
      -webkit-appearance:none;
    }
    .auth-input:focus { border-color:rgba(200,134,10,0.5); }
    .auth-input::placeholder { color:var(--muted); }
    .auth-error { font-family:'DM Mono',monospace;font-size:11px;color:#e05555;min-height:16px;margin-bottom:10px;line-height:1.4; }
    .auth-btn {
      width:100%;padding:14px;margin-top:4px;
      background:linear-gradient(160deg,rgba(160,100,8,0.9),rgba(100,55,4,0.95));
      border:1px solid rgba(200,134,10,0.2);
      border-radius:10px;color:rgba(240,220,180,0.95);
      font-family:'Syne',sans-serif;font-size:13px;font-weight:700;
      letter-spacing:.1em;text-transform:uppercase;cursor:pointer;
      transition:all .2s;
    }
    .auth-btn:hover { background:linear-gradient(160deg,rgba(180,115,10,0.95),rgba(120,65,5,0.98));transform:translateY(-1px); }
    .auth-btn:disabled { opacity:.5;cursor:not-allowed;transform:none; }
    .auth-btn-spinner { width:13px;height:13px;border:2px solid rgba(200,134,10,0.25);border-top:2px solid rgba(240,220,180,0.8);border-radius:50%;animation:authSpin .7s linear infinite;display:inline-block;flex-shrink:0; }
    @keyframes authSpin { to { transform:rotate(360deg); } }
    .auth-btn-inner { display:flex;align-items:center;justify-content:center;gap:8px; }
    .auth-switch { font-family:'DM Mono',monospace;font-size:11px;color:var(--text3);text-align:center;margin-top:16px; }
    .auth-switch span { color:var(--amber);cursor:pointer;text-decoration:underline; }
    .auth-success-ico { font-size:32px;text-align:center;margin-bottom:12px;color:var(--amber); }
  `;
  document.head.appendChild(s);
}

function openAuthModal(tab) {
  createAuthModal();
  authSwitchTab(tab || 'login');
  document.getElementById('auth-modal').style.display = 'flex';
  setTimeout(() => {
    const input = tab === 'signup'
      ? document.getElementById('signup-email')
      : document.getElementById('login-email');
    if (input) input.focus();
  }, 100);
}

function closeAuthModal() {
  const m = document.getElementById('auth-modal');
  if (m) m.style.display = 'none';
  // Limpar campos e erros
  ['login-email','login-password','signup-email','signup-password'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  ['login-error','signup-error','forgot-error'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}

function authSwitchTab(tab) {
  document.getElementById('auth-form-login').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('auth-form-signup').style.display = tab === 'signup' ? 'block' : 'none';
  document.getElementById('auth-form-forgot').style.display = tab === 'forgot' ? 'block' : 'none';
  document.getElementById('auth-success').style.display = 'none';
  document.getElementById('auth-forgot-success').style.display = 'none';
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-signup').classList.toggle('active', tab === 'signup');
  if (tab === 'forgot') setTimeout(() => { const el = document.getElementById('forgot-email'); if(el) el.focus(); }, 50);
}

function setLoading(btnId, txtId, loading, loadingText, defaultText) {
  const btn = document.getElementById(btnId);
  const txt = document.getElementById(txtId);
  if (!btn || !txt) return;
  btn.disabled = loading;
  if (loading) {
    txt.innerHTML = `<span class="auth-btn-inner"><span class="auth-btn-spinner"></span>${loadingText}</span>`;
  } else {
    txt.textContent = defaultText;
  }
}

async function authForgot() {
  const email = document.getElementById('forgot-email').value.trim();
  const errEl = document.getElementById('forgot-error');
  const btn = document.getElementById('forgot-btn');
  const btnTxt = document.getElementById('forgot-btn-txt');

  errEl.textContent = '';
  if (!email) { errEl.textContent = 'Informe seu email.'; return; }

  setLoading('forgot-btn', 'forgot-btn-txt', true, 'Enviando...', 'Enviar link');

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    });
    if (error) {
      errEl.textContent = 'Erro ao enviar. Verifique o email e tente novamente.';
      setLoading('forgot-btn', 'forgot-btn-txt', false, '', 'Enviar link');
      return;
    }
    document.getElementById('auth-form-forgot').style.display = 'none';
    document.getElementById('auth-forgot-success').style.display = 'block';
  } catch(e) {
    errEl.textContent = 'Erro ao conectar. Tente novamente.';
    setLoading('forgot-btn', 'forgot-btn-txt', false, '', 'Enviar link');
  }
}

async function authLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  const btn = document.getElementById('login-btn');
  const btnTxt = document.getElementById('login-btn-txt');

  errEl.textContent = '';
  if (!email || !password) { errEl.textContent = 'Preencha email e senha.'; return; }

  setLoading('login-btn', 'login-btn-txt', true, 'Entrando...', 'Entrar');

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      errEl.textContent = error.message === 'Invalid login credentials'
        ? 'Email ou senha incorretos.'
        : error.message;
      setLoading('login-btn', 'login-btn-txt', false, '', 'Entrar');
      return;
    }
    if (data.session) {
      closeAuthModal();
      updateAuthUI(true);
      showToast('✦ Bem-vindo!', 'success');
    }
  } catch(e) {
    errEl.textContent = 'Erro ao conectar. Tente novamente.';
    setLoading('login-btn', 'login-btn-txt', false, '', 'Entrar');
  }
}

async function authSignup() {
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const errEl = document.getElementById('signup-error');
  const btn = document.getElementById('signup-btn');
  const btnTxt = document.getElementById('signup-btn-txt');

  errEl.textContent = '';
  if (!email) { errEl.textContent = 'Informe seu email.'; return; }
  if (password.length < 6) { errEl.textContent = 'Senha deve ter ao menos 6 caracteres.'; return; }

  setLoading('signup-btn', 'signup-btn-txt', true, 'Criando conta...', 'Criar conta');

  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      errEl.textContent = error.message === 'User already registered'
        ? 'Este email já está cadastrado.'
        : error.message;
      setLoading('signup-btn', 'signup-btn-txt', false, '', 'Criar conta');
      return;
    }
    if (data.session) {
      closeAuthModal();
      updateAuthUI(true);
      showToast('✦ Conta criada! Bem-vindo!', 'success');
    } else {
      document.getElementById('auth-form-signup').style.display = 'none';
      document.getElementById('auth-success').style.display = 'block';
    }
  } catch(e) {
    errEl.textContent = 'Erro ao criar conta. Tente novamente.';
    setLoading('signup-btn', 'signup-btn-txt', false, '', 'Criar conta');
  }
}

function updateAuthUI(loggedIn) {
  const authBtns = document.getElementById('auth-buttons');
  const memberBtns = document.getElementById('member-buttons');
  if (loggedIn) {
    authBtns.style.display = 'none';
    memberBtns.style.display = 'flex';
  } else {
    authBtns.style.display = 'flex';
    memberBtns.style.display = 'none';
  }
}

// Expor funções globais do modal
window.authSwitchTab = authSwitchTab;
window.authForgot = authForgot;
window.authLogin = authLogin;
window.authSignup = authSignup;
window.openAuthModal = openAuthModal;

// ── INIT AUTH ─────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {

  // Detectar recovery pelo hash da URL (antes de qualquer outra coisa)
  if (window.location.hash && window.location.hash.includes('type=recovery')) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      updateAuthUI(true);
      openResetPasswordModal();
      history.replaceState(null, '', window.location.pathname);
      return;
    }
  }

  // Checar sessão existente
  const { data: { session } } = await supabase.auth.getSession();
  updateAuthUI(!!session);

  // Escutar mudanças de auth
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      openResetPasswordModal();
      return;
    }
    updateAuthUI(!!session);
  });

  // Botão CRIAR CONTA
  document.getElementById('test-signup').addEventListener('click', () => {
    openAuthModal('signup');
  });

  // Botão ENTRAR
  document.getElementById('test-login').addEventListener('click', () => {
    openAuthModal('login');
  });

  // Botão LOGOUT
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await supabase.auth.signOut();
    updateAuthUI(false);
    showToast('Sessão encerrada', 'amber');
  });

})