/* Static website pricing. No database, account, or entitlement API.
   Same offer and words as the app's Algeria page: Pro once + optional Cloud Sync per extra device. */
(function () {
  'use strict';
  var NBSP = '\u00a0';
  var copies = {
    ar: { title: 'Store Soft — الأسعار والعروض', intro: 'أسعار واضحة بالدينار الجزائري. فريقنا يساعدك قبل التفعيل.', loading: 'جارٍ تحميل العروض…', error: 'تعذّر عرض الأسعار. تواصل معنا عبر واتساب للمساعدة.', empty: 'لا توجد عروض منشورة الآن. تواصل معنا للمساعدة.', contact: 'تواصل عبر واتساب', supportTitle: 'نساعدك في الاختيار.', supportBody: 'تواصل معنا لتأكيد السعر والتفعيل قبل الدفع.', home: 'الرئيسية', privacy: 'الخصوصية',
      sign: 'دج', once: 'مرة واحدة · لجهاز واحد، للأبد', proName: 'Pro', included: 'مشمول',
      syncAdd: 'أضف المزامنة السحابية', syncBody: 'هواتف أو حواسيب إضافية', howMany: 'كم جهاز إضافي عندك؟', less: 'جهاز أقل', more: 'جهاز إضافي',
      extraCount: function (n) { return n === 0 ? 'بدون جهاز إضافي' : n === 1 ? 'جهاز إضافي واحد' : n === 2 ? 'جهازان إضافيان' : n + ' أجهزة إضافية'; },
      extra: ['كل جهاز إضافي: ', ' في السنة'], perYear: ' / سنة', moreDevices: 'أكثر من 3 أجهزة إضافية؟ تحدث معنا', moreOrder: 'مرحبًا، أحتاج إلى أكثر من 3 أجهزة إضافية في Store Soft.',
      total: 'المجموع', subscribe: 'اطلب عبر واتساب', payment: 'الدفع عبر CCP أو BaridiMob', colon: ': ',
      order: 'مرحبًا، أريد هذا العرض من Store Soft:', planNoSync: 'Pro، جهاز واحد', planSync: function (devices) { return 'Pro + المزامنة السحابية (' + devices + ')'; },
      message: 'مرحبًا، أريد معلومات عن عروض Store Soft.' },
    fr: { title: 'Store Soft — Tarifs et offres', intro: 'Des prix clairs en dinars algériens. Notre équipe vous accompagne avant l’activation.', loading: 'Chargement des offres…', error: 'Impossible d’afficher les tarifs. Contactez-nous sur WhatsApp.', empty: 'Aucune offre publiée pour le moment. Contactez-nous.', contact: 'Nous contacter sur WhatsApp', supportTitle: 'Nous vous aidons à choisir.', supportBody: 'Contactez-nous pour confirmer le prix et l’activation avant paiement.', home: 'Accueil', privacy: 'Confidentialité',
      sign: 'DA', once: 'une seule fois · un appareil, pour toujours', proName: 'Pro', included: 'Inclus',
      syncAdd: 'Ajouter la synchro cloud', syncBody: 'Téléphones ou ordinateurs en plus', howMany: 'Combien d’appareils en plus ?', less: 'Un appareil de moins', more: 'Un appareil de plus',
      extraCount: function (n) { return n === 0 ? 'Aucun appareil en plus' : n === 1 ? '1 appareil en plus' : n + ' appareils en plus'; },
      extra: ['Chaque appareil en plus : ', ' par an'], perYear: ' / an', moreDevices: 'Plus de 3 appareils en plus ? Parlez-nous', moreOrder: 'Bonjour, il me faut plus de 3 appareils en plus dans Store Soft.',
      total: 'Total', subscribe: 'Commander sur WhatsApp', payment: 'Paiement par CCP ou BaridiMob', colon: ' : ',
      order: 'Bonjour, je veux cette offre Store Soft :', planNoSync: 'Pro, un appareil', planSync: function (devices) { return 'Pro + synchro cloud (' + devices + ')'; },
      message: 'Bonjour, je souhaite des informations sur les offres Store Soft.' },
    en: { title: 'Store Soft — Pricing and offers', intro: 'Clear prices in Algerian dinars. Our team helps you before activation.', loading: 'Loading offers…', error: 'Could not display pricing. Contact us on WhatsApp.', empty: 'No published offers right now. Contact us for help.', contact: 'Contact us on WhatsApp', supportTitle: 'We help you choose.', supportBody: 'Contact us to confirm the price and activation before payment.', home: 'Home', privacy: 'Privacy',
      sign: 'DZD', once: 'once · one device, forever', proName: 'Pro', included: 'Included',
      syncAdd: 'Add Cloud Sync', syncBody: 'Extra phones or computers', howMany: 'How many extra devices?', less: 'One device less', more: 'One more device',
      extraCount: function (n) { return n === 0 ? 'No extra device' : n === 1 ? '1 extra device' : n + ' extra devices'; },
      extra: ['Each extra device: ', ' a year'], perYear: ' / year', moreDevices: 'More than 3 extra devices? Talk to us', moreOrder: 'Hello, I need more than 3 extra devices in Store Soft.',
      total: 'Total', subscribe: 'Order on WhatsApp', payment: 'Pay by CCP or BaridiMob', colon: ': ',
      order: 'Hello, I want this Store Soft offer:', planNoSync: 'Pro, one device', planSync: function (devices) { return 'Pro + Cloud Sync (' + devices + ')'; },
      message: 'Hello, I would like information about Store Soft offers.' }
  };
  var params = new URLSearchParams(location.search), language = params.get('lang');
  if (!copies[language]) language = 'ar';
  var copy = copies[language];
  // ?embed=1: only the prices, shown inside the download and Android pages (same site).
  var embed = params.get('embed') === '1' && window.parent !== window;
  if (embed) document.documentElement.className += ' embed';
  // Tells the page around the frame how tall the prices are, and opens links outside the frame.
  function fitParent() {
    if (!embed) return;
    Array.prototype.forEach.call(document.querySelectorAll('a[href^="https://"]'), function (link) { link.target = '_blank'; link.rel = 'noopener'; });
    window.parent.postMessage({ type: 'storesoft-pricing-height', height: Math.ceil(document.body.getBoundingClientRect().height) }, location.origin);
  }
  var offers = document.getElementById('offers'), status = document.getElementById('status');
  var help = document.getElementById('help');
  var extra = 0, cards = [];
  function node(tag, text, className) { var el = document.createElement(tag); if (text !== undefined) el.textContent = text; if (className) el.className = className; return el; }
  // "9 000 دج", "9 000 DA", "9 000 DZD". No-break spaces keep the number in one piece
  // in right-to-left text (a plain space can draw it as "000 9").
  function money(amount) {
    if (!Number.isSafeInteger(amount) || amount <= 0 || amount > 100000000000) throw new Error('Invalid price');
    var whole = String(Math.floor(amount / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
    return whole + (amount % 100 ? '.' + ('0' + amount % 100).slice(-2) : '') + NBSP + copy.sign;
  }
  // A price in its own isolated box, so the text around it never moves its parts.
  function moneyNode(amount, className) { var el = node('bdi', money(amount), className); return el; }
  function text(value) { if (typeof value !== 'string' || !value.trim()) throw new Error('Missing content'); return value; }
  function localized(value) { return text(value && value[language]); }
  function list(items) {
    if (!Array.isArray(items) || !items.length) throw new Error('Missing features');
    var ul = node('ul', undefined, 'features');
    items.forEach(function (item) { ul.appendChild(node('li', text(item))); });
    return ul;
  }
  function whatsApp(lines) { return 'https://wa.me/213654338649?text=' + encodeURIComponent(lines.join('\n')); }
  function totalText(card) {
    var sync = extra * card.offer.sync.additional_device_year_centimes;
    return money(card.offer.once_centimes) + (sync ? ' + ' + money(sync) + copy.perYear : '');
  }
  function update() {
    cards.forEach(function (card) {
      var sync = extra * card.offer.sync.additional_device_year_centimes;
      card.count.textContent = String(extra);
      card.countLabel.textContent = copy.extraCount(extra);
      card.less.disabled = extra <= 0; card.more.disabled = extra >= card.offer.sync.max_extra_devices;
      card.totalOnce.textContent = money(card.offer.once_centimes);
      card.totalSync.hidden = !sync;
      if (sync) card.totalSyncAmount.textContent = money(sync);
      card.link.href = whatsApp([copy.order, extra ? copy.planSync(copy.extraCount(extra)) : copy.planNoSync, copy.total + copy.colon + totalText(card)]);
    });
    fitParent();
  }
  function change(step, max) { var next = extra + step; if (next >= 0 && next <= max) { extra = next; update(); } }
  function onceCard(offer) {
    money(offer.once_centimes);
    if (!offer.sync) throw new Error('Missing sync');
    money(offer.sync.additional_device_year_centimes);
    var max = offer.sync.max_extra_devices;
    if (!Number.isInteger(max) || max < 1 || max > 10) throw new Error('Invalid device limit');
    var card = node('article', undefined, 'offer');
    card.setAttribute('data-code', offer.code);
    card.appendChild(node('h2', localized(offer.title)));
    var price = node('p', undefined, 'price');
    price.appendChild(moneyNode(offer.once_centimes, 'amount'));
    price.appendChild(node('span', copy.once, 'period'));
    card.appendChild(price);
    var pro = node('h3', copy.proName + ' ', 'gains'); pro.appendChild(node('span', copy.included, 'included'));
    card.appendChild(pro);
    card.appendChild(list(offer.features && offer.features[language]));
    // Cloud Sync: extra devices, from 0 (none) to the limit.
    var sync = node('section', undefined, 'sync');
    sync.appendChild(node('h3', copy.syncAdd));
    sync.appendChild(node('p', copy.syncBody, 'sync-body'));
    var devices = node('div', undefined, 'devices'), label = node('span', copy.howMany, 'devices-label');
    var stepper = node('div', undefined, 'stepper'), less = node('button', '−', 'less'), more = node('button', '+', 'more'), shown = node('output', '0', 'count');
    label.id = 'devices-' + offer.code;
    stepper.setAttribute('role', 'group'); stepper.setAttribute('aria-labelledby', label.id);
    less.type = 'button'; more.type = 'button';
    less.setAttribute('aria-label', copy.less); more.setAttribute('aria-label', copy.more); shown.setAttribute('aria-live', 'polite');
    less.onclick = function () { change(-1, max); }; more.onclick = function () { change(1, max); };
    stepper.appendChild(less); stepper.appendChild(shown); stepper.appendChild(more);
    devices.appendChild(label); devices.appendChild(stepper); sync.appendChild(devices);
    var countLabel = node('p', '', 'count-label'); sync.appendChild(countLabel);
    var each = node('p', copy.extra[0], 'extra');
    each.appendChild(moneyNode(offer.sync.additional_device_year_centimes)); each.appendChild(document.createTextNode(copy.extra[1]));
    sync.appendChild(each);
    sync.appendChild(list(offer.sync.features && offer.sync.features[language]));
    var moreDevices = node('a', copy.moreDevices, 'more-devices'); moreDevices.href = whatsApp([copy.moreOrder]); sync.appendChild(moreDevices);
    card.appendChild(sync);
    // Total: once, plus the yearly Sync part when there are extra devices.
    var total = node('div', undefined, 'total');
    total.appendChild(node('span', copy.total, 'total-label'));
    var value = node('span', undefined, 'total-value'), totalOnce = node('bdi'), totalSync = node('span'), totalSyncAmount = node('bdi');
    totalSync.appendChild(document.createTextNode(' + ')); totalSync.appendChild(totalSyncAmount); totalSync.appendChild(document.createTextNode(copy.perYear));
    value.appendChild(totalOnce); value.appendChild(totalSync); total.appendChild(value);
    card.appendChild(total);
    var link = node('a', copy.subscribe, 'button'); card.appendChild(link);
    card.appendChild(node('p', copy.payment, 'payment'));
    card.appendChild(node('p', localized(offer.billing_note), 'billing-note'));
    cards.push({ offer: offer, count: shown, countLabel: countLabel, less: less, more: more, totalOnce: totalOnce, totalSync: totalSync, totalSyncAmount: totalSyncAmount, link: link });
    return card;
  }
  function clear(message, error) {
    cards = []; offers.textContent = '';
    status.textContent = message; status.className = error ? 'error' : '';
    offers.setAttribute('aria-busy', 'false'); help.hidden = false;
    fitParent();
  }
  function render(list) {
    if (!Array.isArray(list)) throw new Error('Invalid pricing');
    var fragment = document.createDocumentFragment(), seen = {};
    list.forEach(function (offer) {
      var code = text(offer.code);
      if (seen[code] || offer.billing !== 'once') throw new Error('Invalid offer');
      seen[code] = true;
      fragment.appendChild(onceCard(offer));
    });
    if (!cards.length) { clear(copy.empty, false); return; }
    update();
    status.textContent = ''; status.className = '';
    offers.appendChild(fragment); offers.setAttribute('aria-busy', 'false');
    help.hidden = true;
    fitParent();
  }
  function start() {
    try {
      // Today in Algeria (UTC+1, no daylight saving), as YYYY-MM-DD.
      var today = new Date(Date.now() + 3600000).toISOString().slice(0, 10);
      if (!Array.isArray(window.storeSoftOffers)) throw new Error('Missing offers');
      render(window.storeSoftOffers.filter(function (offer) { return !offer.available_until || today <= offer.available_until; }));
    } catch (_) { clear(copy.error, true); }
  }
  document.documentElement.lang = language; document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'; document.title = copy.title;
  document.querySelector('meta[name="description"]').content = copy.intro;
  Array.prototype.forEach.call(document.querySelectorAll('[data-ui]'), function (el) { el.textContent = copy[el.getAttribute('data-ui')]; });
  Array.prototype.forEach.call(document.querySelectorAll('[data-lang]'), function (el) { if (el.getAttribute('data-lang') === language) el.setAttribute('aria-current', 'true'); });
  document.getElementById('support').href = whatsApp([copy.message]);
  start();
  if (embed) {
    window.addEventListener('resize', fitParent);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitParent);
  }
})();
