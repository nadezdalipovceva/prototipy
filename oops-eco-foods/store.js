(()=>{'use strict';
const P=window.PRODUCTS,$=s=>document.querySelector(s),money=n=>new Intl.NumberFormat('ru-RU').format(n)+' ₽',esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),cats=[...new Set(P.map(p=>p.category))];
let cart=[];try{const raw=JSON.parse(localStorage.getItem('oops-cart-v2')||'[]');if(Array.isArray(raw))cart=raw.filter(x=>P.some(p=>p.id===x.id)&&Number.isInteger(x.variant)&&x.variant>=0&&x.variant<P.find(p=>p.id===x.id).variants.length&&Number.isInteger(x.qty)&&x.qty>0&&x.qty<=99)}catch{}
const product=id=>P.find(p=>p.id===id),variant=x=>product(x.id).variants[x.variant],total=()=>cart.reduce((s,x)=>s+(variant(x).price||0)*x.qty,0),count=()=>cart.reduce((s,x)=>s+x.qty,0);
let toastTimer;function toast(t){$('#toast').textContent=t;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{$('#toast').textContent=''},3500)}
function save(){try{localStorage.setItem('oops-cart-v2',JSON.stringify(cart))}catch{}$('#cart-count').textContent=count()}
const symbols={'Пастила':'≈','Фрипсы':'◌','Овощные чипсы':'✳','Джерки':'≋','Десерты':'✧','Чай':'❦','Сублимация':'✿','Подарки':'✳'};
const art=p=>`<figure class="product-art photo-art"><img src="${esc(p.photo)}" alt="${esc(p.photoCaption)}" loading="lazy" width="600" height="750">${!p.photoExact?'<figcaption>Фото категории</figcaption>':''}</figure>`;
function card(p){const v=p.variants[0];return `<article class="product-card"><a href="item.html?id=${encodeURIComponent(p.id)}">${art(p)}${p.id==='pastila-mix'?'<span class="product-badge">Знакомство<br>со вкусами</span>':''}<h3>${esc(p.name)}</h3><p>${v.price===null?'Наполнение обсудим с вами':esc(v.label)}</p></a><div class="card-bottom"><span class="price">${v.price===null?'По запросу':money(v.price)}</span>${v.price===null?`<a class="card-detail" href="item.html?id=${encodeURIComponent(p.id)}">Подробнее</a>`:`<button class="quick-add" data-add="${esc(p.id)}" aria-label="В корзину: ${esc(p.name)}, ${esc(v.label)}">+</button>`}</div></article>`}
function add(id,vi){const found=cart.find(x=>x.id===id&&x.variant===vi);if(found?.qty===99){toast('В корзине уже 99 упаковок этой фасовки');return false}if(found){found.qty=Math.min(99,found.qty+1)}else cart.push({id,variant:vi,qty:1});save();toast('Добавлено в корзину');
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const badge = $('#cart-count');
    badge.getAnimations().forEach(animation => animation.cancel());
    badge.animate([{transform:'scale(1)'},{transform:'scale(1.25)',offset:.35},{transform:'scale(1)'}],{duration:280});
  }
  return true}
const page=document.body.dataset.page;
if(page==='home'){
 $('#featured').innerHTML=['pastila-mix','frips-mix','jerky-mexico','honey-apples'].map(id=>card(product(id))).join('');
}
if(page==='catalog'){
 let filter=new URLSearchParams(location.search).get('category')||'Все';if(!cats.includes(filter))filter='Все';
 function render(){const q=$('#search').value.trim().toLocaleLowerCase('ru');const list=P.filter(p=>(filter==='Все'||p.category===filter)&&(p.name+' '+p.ingredients+' '+p.description).toLocaleLowerCase('ru').includes(q));$('#products').innerHTML=list.map(card).join('')||'<p class="empty">В этой подборке ничего не найдено. Измените запрос или категорию.</p>';$('#result-count').textContent='Показано позиций: '+list.length;$('#filters').innerHTML=['Все',...cats].map(c=>`<button data-filter="${esc(c)}" class="${c===filter?'active':''}" aria-pressed="${c===filter}">${c==='Все'?'Все вкусы':c}</button>`).join('')}
 $('#search').value=new URLSearchParams(location.search).get('q')||'';
 $('#filters').onclick=e=>{const b=e.target.closest('[data-filter]');if(b){filter=b.dataset.filter;render()}};$('#search').oninput=render;render();
}
if(page==='item'){
 const p=product(new URLSearchParams(location.search).get('id'));if(!p){$('#item-root').innerHTML='<div class="empty"><h1>Продукт не найден</h1><a class="btn" href="catalog.html">Вернуться в каталог</a></div>';$('#related').innerHTML=''}else{
 document.title=p.name+' — УПС ЭКО ФУДС';$('#item-crumb').textContent=p.name;
 const gift=p.category==='Подарки';
 $('#item-root').innerHTML=`<div class="item-layout">${art(p)}<div><div class="eyebrow">${p.category}</div><h1>${esc(p.name)}</h1><p class="description">${esc(p.description)}</p><label class="variant-label" for="variant">${gift?'Формат':'Выберите фасовку'}</label><select class="variant-select" id="variant">${p.variants.map((v,i)=>`<option value="${i}">${esc(v.label)}${v.price===null?'':' — '+money(v.price)}</option>`).join('')}</select><div class="buy-row"><span class="item-price" id="item-price">${gift?'По запросу':money(p.variants[0].price)}</span><button class="btn" id="add-cart">${gift?'В список к обсуждению':'В корзину +'}</button></div><p class="source">${gift?'Пример из публикации '+p.priceDate+'. Возможность повторить и цену уточняет менеджер.':'Цена по прайсу от '+p.priceDate+'. Наличие и итоговую стоимость подтвердит менеджер.'}<br><a href="${p.source}" target="_blank" rel="noopener">Источник цены и фасовки</a>${p.secondary?` · <a href="${p.secondary}" target="_blank" rel="noopener">О продукте в соцсетях</a>`:''}</p><div class="item-specs"><b>Состав</b>${esc(p.ingredients)}<p><b>Перед заказом</b>Полный состав, аллергены, КБЖУ, срок и условия хранения сверяются с маркировкой конкретного продукта. </p><b>Доставка</b>По России и СНГ. Стоимость и срок рассчитывает менеджер.</div></div></div>`;
 $('#variant').onchange=()=>{const v=p.variants[Number($('#variant').value)];$('#item-price').textContent=v.price===null?'По запросу':money(v.price)};$('#add-cart').onclick=()=>add(p.id,Number($('#variant').value));
 $('#related').innerHTML=P.filter(x=>x.id!==p.id&&x.category===p.category).slice(0,3).map(card).join('');
 }
}
function summary(button){const requests=cart.some(x=>variant(x).price===null);return `<aside class="summary-box"><h2>Ваш заказ</h2><div class="summary-line"><span>Упаковок</span><b>${count()}</b></div><div class="summary-line"><span>Товары с указанной ценой</span><b>${money(total())}</b></div>${requests?'<p>В корзине есть подарки по запросу. Их стоимость не включена в сумму.</p>':''}<div class="summary-line"><span>Доставка</span><span>расчёт менеджером</span></div><div class="summary-line summary-total"><span>Подытог</span><span>${money(total())}</span></div><p>Подытог по прайсу, без доставки${requests?' и позиций по запросу':''}. Менеджер подтвердит наличие, итоговую сумму и способ оплаты.</p>${button}</aside>`}
function renderCart(){if(!cart.length){$('#cart-root').innerHTML='<div class="empty"><h2>Вкусный выбор впереди.</h2><p>Добавьте продукты из каталога.</p><a class="btn" href="catalog.html">К вкусам</a></div>';return}$('#cart-root').innerHTML=`<div class="cart-layout"><div>${cart.map((x,i)=>{const p=product(x.id),v=variant(x);return `<article class="cart-row"><a class="cart-mini" href="item.html?id=${p.id}" aria-label="Открыть ${esc(p.name)}"><img src="${esc(p.photo)}" alt="" width="70" height="85"></a><div><h3><a href="item.html?id=${p.id}">${esc(p.name)}</a></h3><p>${esc(v.label)}${v.price===null?'':' · '+money(v.price)+' за упаковку'}</p><div class="qty"><button data-qty="${i}" data-delta="-1" aria-label="Уменьшить количество: ${esc(p.name)}">−</button><span>${x.qty}</span><button data-qty="${i}" data-delta="1" aria-label="Увеличить количество: ${esc(p.name)}">+</button></div><button class="remove" data-remove="${i}">Убрать</button></div><span class="line-price">${v.price===null?'По запросу':money(v.price*x.qty)}</span></article>`}).join('')}<p><a class="back-link" href="catalog.html">Продолжить выбор</a></p><p class="notice">Корзина сохраняется в этом браузере. На следующем шаге можно скопировать список и отправить его менеджеру. Оплата — после согласования.</p></div>${summary('<a class="btn" href="thanks.html">Обсудить заказ</a>')}</div>`}
if(page==='cart'){$('#cart-root').onclick=e=>{const remove=e.target.closest('[data-remove]'),qty=e.target.closest('[data-qty]');if(remove){cart.splice(Number(remove.dataset.remove),1);save();renderCart()}if(qty){const i=Number(qty.dataset.qty);cart[i].qty=Math.max(1,Math.min(99,cart[i].qty+Number(qty.dataset.delta)));save();renderCart()}};renderCart()}
if(page==='checkout'){
 if(!cart.length){$('#checkout-root').innerHTML='<div class="empty"><p>Корзина пока пуста.</p><a class="btn" href="catalog.html">Перейти в каталог</a></div>'}else{
 $('#checkout-root').innerHTML=`<div class="cart-layout"><form id="checkout-form"><h2 class="checkout-title">Куда и как с вами связаться</h2><div class="form-grid"><label class="field">Имя для примера<input name="name" placeholder="Например, Анна" required maxlength="80" autocomplete="off"></label><label class="field">Город для примера<input name="city" placeholder="Например, Казань" required maxlength="100" autocomplete="off"></label><label class="field">Удобный способ связи<select name="channel"><option>Сообщения ВКонтакте</option><option>Telegram</option><option>Телефон</option></select></label><label class="field">Доставка<select name="delivery"><option>Подобрать с менеджером</option><option>СДЭК</option><option>Почта России</option></select></label><label class="field full">Пожелание к заказу<textarea name="note" rows="3" placeholder="Например, подарок для коллег" maxlength="500"></textarea><small>Контакт и точный адрес в этом прототипе не запрашиваем.</small></label></div><label class="form-check"><input type="checkbox" required><span>Понимаю, что прохожу демонстрацию: заказ не отправится, данные не сохранятся.</span></label><button class="btn" type="submit">Проверить оформление</button><p><a class="back-link" href="cart.html">Вернуться в корзину</a></p></form>${summary('')}</div>`;
 $('#checkout-form').onsubmit=e=>{e.preventDefault();try{sessionStorage.setItem('oops-demo-order-v2',JSON.stringify(cart))}catch{}location.href='thanks.html'};
 }
}
function orderText(){return 'Здравствуйте! Хочу обсудить заказ:\n'+cart.map(x=>{const p=product(x.id),v=variant(x);return '• '+p.name+' — '+v.label+' × '+x.qty+(v.price===null?' (цена по запросу)':' — '+money(v.price*x.qty))}).join('\n')+'\nПодытог по прайсу: '+money(total())+' (без доставки и позиций по запросу).\nПодтвердите, пожалуйста, наличие, составы, итоговую стоимость и условия доставки.'}
if(page==='thanks'){$('#order-text').value=cart.length?orderText():'Сначала соберите корзину в каталоге. Для реального заказа напишите в официальные сообщения бренда.';$('#copy-order').onclick=async()=>{try{await navigator.clipboard.writeText($('#order-text').value);toast('Состав заказа скопирован')}catch{$('#order-text').focus();$('#order-text').select();toast('Выделено: скопируйте текст вручную')}}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-add]');if(b && add(b.dataset.add,0)){clearTimeout(Number(b.dataset.resetTimer));b.textContent='✓';b.dataset.resetTimer=setTimeout(()=>{b.textContent='+'},1400)}});
const menu=document.querySelector('.menu-toggle');if(menu)menu.onclick=()=>{const expanded=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!expanded));document.querySelector('#mobile-menu').hidden=expanded;menu.setAttribute('aria-label',expanded?'Открыть меню':'Закрыть меню')};
function setupFlavourGallery() {
  const cover = document.querySelector('.flavour-cover');
  if (!cover) return;

  const frame = cover.querySelector('.flavour-frame');
  const link = cover.querySelector('.flavour-link');
  const controls = cover.querySelector('.flavour-controls');
  const firstImage = frame.querySelector('img');
  const slides = [{
    photo: firstImage.getAttribute('src'),
    photoCaption: firstImage.alt,
    name: link.textContent,
    category: 'Подарки'
  }, ...['pastila-mix', 'frips-mix', 'jerky-mexico'].map(product)];
  let selected = 0;
  let revision = 0;

  async function turn(step) {
    selected = (selected + step + slides.length) % slides.length;
    const current = ++revision;
    const slide = slides[selected];
    const next = new Image();
    next.className = 'flavour-image';
    next.alt = slide.photoCaption;
    next.src = slide.photo;
    try {
      await next.decode();
    } catch {
      if (current === revision) {
        selected = Number(frame.dataset.slide || 0);
        toast('Не удалось загрузить фотографию. Попробуйте ещё раз.');
      }
      return;
    }
    if (current !== revision) return;
    frame.getAnimations({subtree: true}).forEach(animation => animation.cancel());
    const previous = frame.lastElementChild;
    frame.replaceChildren(previous, next);
    frame.dataset.slide = String(selected);
    link.textContent = slide.name;
    link.href = 'catalog.html?category=' + encodeURIComponent(slide.category);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !next.animate) {
      previous.remove();
      return;
    }
    const reveal = next.animate([
      { clipPath: 'inset(0 ' + (step > 0 ? '100% 0 0' : '0 0 100%') + ' round 2px)', transform: 'scale(1.035)' },
      { clipPath: 'inset(0 0 0 0 round 2px)', transform: 'scale(1)' }
    ], { duration: 440, easing: 'cubic-bezier(.2,.8,.22,1)' });
    reveal.finished.then(() => previous.remove(), () => {});
  }
  controls.hidden = false;
  controls.addEventListener('click', event => {
    const button = event.target.closest('[data-step]');
    if (button) turn(Number(button.dataset.step));
  });
}
setupFlavourGallery();

save();
})();
