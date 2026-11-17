// storesoft.org/usb — order Store Soft on a USB drive, cash on delivery.
// Arabic text lives in index.html (works without JavaScript); French is below.
// The order is saved in the CRM by submit-store-soft-lead (form usb_order_v1,
// source "usb"), then WhatsApp opens with the order code and address only:
// name and phone never go into a URL.
(function () {
  'use strict';
  var endpoint = 'https://blczhiusyvpkxrktgwng.supabase.co/functions/v1/submit-store-soft-lead';
  var whatsappNumber = '213654338649';
  var price = 9000;
  var startedAt = Date.now();
  var language = 'ar';
  var submitting = false;
  var saved = false;
  var formStarted = false;
  var orderCode = '';

  // Wilayas and communes come unchanged from data/*.json (see data/SOURCE.md).
  // Each wilaya is [number, Arabic, French]; the saved value is "16 - Alger".
  // Each commune is [Arabic, French]; the saved value is the French name.
  var wilayas = [];
  var communes = {};
  var dataReady = false;
  // data/wilayas.json has the wrong name for these numbers: its communes follow the
  // official numbers (49 Timimoun ... 58 El Meniaa). Fix the names on the page only.
  var nameFixes = {
    49: ['تيميمون', 'Timimoun'], 50: ['برج باجي مختار', 'Bordj Badji Mokhtar'],
    52: ['بني عباس', 'Béni Abbès'], 53: ['عين صالح', 'In Salah'], 54: ['عين قزام', 'In Guezzam'],
    57: ['المغير', "El M'Ghair"], 58: ['المنيعة', 'El Meniaa']
  };
  var activities = ['grocery', 'clothing', 'cosmetics', 'spare_parts', 'repair_shop', 'other'];

  // Texts used only by the script (both languages).
  var messages = {
    ar: {
      pageTitle: 'Store Soft على فلاشة USB — 9\u00a0000 دج مرة واحدة، الدفع عند الاستلام',
      submitting: 'جاري إرسال الطلبية…',
      required: 'هذا الحقل مطلوب.',
      invalidName: 'اكتب اسمًا من حرفين إلى 80 حرفًا.',
      invalidPhone: 'أدخل رقم هاتف من 10 أرقام يبدأ بـ 05 أو 06 أو 07.',
      baladiaChoose: 'اختر البلدية',
      dataLoading: 'جاري تحميل الولايات…',
      dataError: 'تعذّر تحميل قائمة الولايات. أعد تحميل الصفحة، أو راسلنا على واتساب.',
      generalError: 'تعذّر إرسال الطلبية. تحقق من الإنترنت وحاول مرة أخرى، أو راسلنا على واتساب.',
      waHello: 'السلام عليكم، طلبت Store Soft على فلاشة USB (9\u00a0000 دج، الدفع عند الاستلام).',
      waCode: 'رقم الطلبية', waWilaya: 'الولاية', waBaladia: 'البلدية',
      waQuestion: 'السلام عليكم، عندي سؤال عن Store Soft على فلاشة USB (9\u00a0000 دج).',
      invalidEmail: 'اكتب بريدًا إلكترونيًا صحيحًا، مثل nom@gmail.com',
      mailSubject: 'رابط تحميل Store Soft للحاسوب (تجربة 14 يومًا مجانًا)',
      mailBody: 'افتح هذا الرابط على حاسوب Windows لتحميل Store Soft وتجربته مجانًا لمدة 14 يومًا:',
      mailOrder: 'لطلب النسخة الكاملة على فلاشة USB (9\u00a0000 دج، الدفع عند الاستلام):',
      switchLabel: 'Afficher en français'
    },
    fr: {
      pageTitle: 'Store Soft sur clé USB — 9\u00a0000 DA une seule fois, paiement à la livraison',
      submitting: 'Envoi de la commande…',
      required: 'Ce champ est obligatoire.',
      invalidName: 'Saisissez un nom de 2 à 80 caractères.',
      invalidPhone: 'Saisissez 10 chiffres commençant par 05, 06 ou 07.',
      baladiaChoose: 'Choisissez la commune',
      dataLoading: 'Chargement des wilayas…',
      dataError: 'Impossible de charger la liste des wilayas. Rechargez la page, ou écrivez-nous sur WhatsApp.',
      generalError: 'Envoi impossible. Vérifiez votre connexion et réessayez, ou écrivez-nous sur WhatsApp.',
      waHello: 'Bonjour, j’ai commandé Store Soft sur clé USB (9\u00a0000 DA, paiement à la livraison).',
      waCode: 'N° de commande', waWilaya: 'Wilaya', waBaladia: 'Commune',
      waQuestion: 'Bonjour, j’ai une question sur Store Soft sur clé USB (9\u00a0000 DA).',
      invalidEmail: 'Saisissez un e-mail valide, par exemple nom@gmail.com',
      mailSubject: 'Lien de téléchargement Store Soft pour ordinateur (essai gratuit 14 jours)',
      mailBody: 'Ouvrez ce lien sur un ordinateur Windows pour télécharger Store Soft et l’essayer gratuitement 14 jours :',
      mailOrder: 'Pour commander la version complète sur clé USB (9\u00a0000 DA, paiement à la livraison) :',
      switchLabel: 'عرض الصفحة بالعربية'
    }
  };

  // French page text. Keys match data-i in index.html.
  var fr = {
    skip: 'Aller au formulaire de commande',
    strip: '<b>9\u00a0000 DA</b> une seule fois · Livraison gratuite · Paiement à la livraison',
    orderNow: 'Commander',
    heroBadge: 'Payez une seule fois — sans abonnement mensuel',
    heroTitle: 'Le logiciel de votre magasin sur clé USB, <span>livré jusqu’à votre porte</span>',
    heroText: 'Store Soft gère les ventes, le stock et les crédits clients sur votre ordinateur, sans Internet. Commandez aujourd’hui, payez à la réception de la clé.',
    priceName: 'Version complète pour ordinateur',
    currency: 'DA',
    priceNote: 'Une seule fois · un ordinateur · à vie',
    get1: 'Clé USB avec le logiciel et la clé d’activation',
    get2: 'Livraison gratuite jusqu’au magasin',
    get3: 'Paiement à la livraison, rien maintenant',
    get4: 'Aide à l’installation sur WhatsApp',
    get5: 'Fonctionne sans Internet',
    heroCta: 'Commander — paiement à la livraison',
    shotSell: 'L’écran de vente de Store Soft sur ordinateur',
    shotSellAlt: 'L’écran de vente de Store Soft sur ordinateur',
    orderTitle: 'Commandez votre copie',
    orderText: 'Remplissez vos informations. Nous vous appelons pour confirmer, puis nous envoyons la clé. Vous payez 9\u00a0000 DA à la réception.',
    nameLabel: 'Nom ou nom du magasin',
    namePlaceholder: 'Exemple : Mohamed — Alimentation',
    phoneLabel: 'Téléphone',
    wilayaLabel: 'Wilaya',
    wilayaPlaceholder: 'Choisissez la wilaya',
    baladiaLabel: 'Commune',
    baladiaPlaceholder: 'Choisissez d’abord la wilaya',
    shopLabel: 'Activité du magasin',
    shopPlaceholder: 'Choisissez votre activité',
    shopGrocery: 'Alimentation / supérette',
    shopClothing: 'Vêtements et chaussures',
    shopCosmetics: 'Cosmétiques',
    shopParts: 'Pièces détachées',
    shopRepair: 'Atelier de réparation',
    shopOther: 'Autre activité',
    totalLabel: 'Total à la livraison',
    totalNote: 'Livraison gratuite. Rien à payer maintenant.',
    submit: 'Confirmer la commande',
    successTitle: 'Commande reçue',
    successText: 'Nous vous appelons bientôt pour confirmer. Envoyez-la aussi sur WhatsApp pour aller plus vite.',
    orderCode: 'N° de commande :',
    successWhatsApp: 'Envoyer la commande sur WhatsApp',
    stepsTitle: '3 étapes seulement',
    step1Title: 'Commandez sur cette page',
    step1Text: 'Votre nom, votre numéro et votre wilaya. Rien à payer maintenant.',
    step2Title: 'Nous appelons et envoyons la clé',
    step2Text: 'Nous confirmons par téléphone, puis la clé arrive avec la société de livraison.',
    step3Title: 'Payez à la réception et vendez',
    step3Text: 'Installez le logiciel depuis la clé et activez-le. Nous vous aidons sur WhatsApp si besoin.',
    compareTitle: 'Pourquoi Store Soft ?',
    withoutTitle: 'Sans Store Soft',
    without1: 'Les crédits dans un cahier, certains oubliés',
    without2: 'Vous ne connaissez pas votre vrai bénéfice en fin de mois',
    without3: 'Des produits en rupture sans que vous le voyiez',
    without4: 'Des erreurs de calcul quand il y a du monde',
    without5: 'Si le cahier se perd, tout est perdu',
    withTitle: 'Avec Store Soft',
    with1: 'Chaque crédit noté au nom et au numéro du client',
    with2: 'Le bénéfice de chaque jour et de chaque produit',
    with3: 'Une alerte quand le stock baisse',
    with4: 'Cherchez par nom ou code-barres, le total se calcule seul',
    with5: 'Une sauvegarde sur clé USB',
    featuresTitle: 'Tout ce qu’il faut à votre magasin',
    f1Title: 'Vente',
    f1a: 'Cherchez un produit par nom ou code-barres',
    f1b: 'Plusieurs paniers en même temps pour plusieurs clients',
    f1c: 'Impression du ticket sur imprimante 58 ou 80 mm',
    f1d: 'Paiement en espèces ou à crédit sur le compte du client',
    f2Title: 'Produits et stock',
    f2a: 'Ajoutez vos produits, ou importez-les depuis Excel',
    f2b: 'La quantité restante en stock pour chaque produit',
    f2c: 'Vente à la pièce ou au poids',
    f2d: 'Des catégories pour ranger la marchandise',
    f3Title: 'Clients et crédits',
    f3a: 'Un compte par client, avec son téléphone',
    f3b: 'Notez un crédit ou un paiement en un clic',
    f3c: 'Sachez qui vous doit, et combien',
    f4Title: 'Fournisseurs',
    f4a: 'Un compte par fournisseur',
    f4b: 'Ce que vous devez à chacun, et vos paiements',
    f5Title: 'Caisse et dépenses',
    f5a: 'Ouvrez et fermez la caisse chaque jour',
    f5b: 'Le montant attendu en caisse se calcule seul',
    f5c: 'Notez les dépenses du magasin',
    f6Title: 'Rapports et bénéfice',
    f6a: 'Le bénéfice du jour, de la semaine et du mois',
    f6b: 'Les produits les plus rentables et les plus vendus',
    f6c: 'Crédits, stock et zakat',
    syncBadge: 'En option',
    syncTitle: 'Votre magasin aussi sur votre téléphone',
    syncText: 'Store Soft existe aussi sur téléphone Android. Avec la synchronisation Cloud (Cloud Sync), vous voyez les mêmes ventes et le même stock sur l’ordinateur et le téléphone.',
    sync1: '4\u00a0000 DA par an pour chaque appareil en plus',
    sync2: 'La vente marche sans Internet, la synchro se fait quand il revient',
    sync3: 'Inutile si vous n’avez qu’un seul ordinateur',
    boxTitle: 'Qu’y a-t-il sur la clé ?',
    box1Title: 'Le logiciel Store Soft pour ordinateur',
    box1Text: 'Windows 10 ou 11 (64 bits)',
    box2Title: 'La clé d’activation',
    box2Text: 'Dans un fichier texte sur la clé, pour un ordinateur',
    box3Title: 'Aide sur WhatsApp',
    box3Text: 'Nous vous aidons à installer et activer',
    faqTitle: 'Questions fréquentes',
    q1: 'Le logiciel a-t-il besoin d’Internet ?',
    a1: 'Non. Ventes, stock et crédits marchent sans Internet. Il faut Internet une seule fois pour activer la clé, et pour la synchronisation Cloud si vous la prenez.',
    q2: 'Est-ce que je paie chaque mois ?',
    a2: 'Non. Vous payez 9\u00a0000 DA une seule fois pour un ordinateur. Seule la synchronisation Cloud, en option, se paie chaque année (4\u00a0000 DA par appareil en plus).',
    q3: 'Quand est-ce que je paie ?',
    a3: 'À la réception de la clé, au livreur. Rien à payer à la commande, et la livraison est gratuite.',
    q4: 'Puis-je l’essayer avant de commander ?',
    a4: 'Oui. Téléchargez le logiciel et essayez-le 14 jours gratuitement depuis la <a href="/windows/">page de téléchargement</a>.',
    q5: 'Et si mon ordinateur tombe en panne ?',
    a5: 'Faites une sauvegarde du logiciel sur une clé USB, puis restaurez-la sur le nouvel ordinateur. La clé d’activation est pour un ordinateur : écrivez-nous si vous en changez.',
    q6: 'Imprime-t-il les tickets ?',
    a6: 'Oui, sur les imprimantes de tickets 58 mm et 80 mm.',
    q7: 'Puis-je entrer mes produits rapidement ?',
    a7: 'Oui. Ajoutez-les un par un, ou importez-les tous depuis un fichier Excel.',
    q8: 'Quelles sont les langues du logiciel ?',
    a8: 'Arabe, français et anglais.',
    q9: 'Marche-t-il sur plusieurs appareils ?',
    a9: 'Le prix est pour un ordinateur. Pour un autre appareil (ordinateur ou téléphone) avec les mêmes données, ajoutez la synchronisation Cloud : 4\u00a0000 DA par an et par appareil en plus.',
    trialOr: 'ou',
    trialTitle: 'Essayez-le gratuitement pendant 14 jours',
    trialText: 'Téléchargez le logiciel sur un ordinateur Windows maintenant, ou envoyez le lien à votre e-mail pour l’ouvrir sur l’ordinateur.',
    trialDownload: 'Télécharger maintenant',
    trialEmailLabel: 'Ou envoyez le lien à votre e-mail',
    trialSend: 'Envoyer',
    trialEmailNote: 'Votre application e-mail s’ouvre avec le message prêt. Appuyez sur « Envoyer ».',
    finalTitle: 'Prêt à mettre de l’ordre dans vos comptes ?',
    finalText: '9\u00a0000 DA une seule fois. Livraison gratuite et paiement à la livraison.',
    privacy: 'Confidentialité',
    terms: 'Conditions'
  };

  var form = document.getElementById('orderForm');
  var button = document.getElementById('submitButton');
  var submitLabel = document.getElementById('submitLabel');
  var submitError = document.getElementById('submitError');
  var switcher = document.getElementById('languageSwitch');
  var wilayaSelect = document.getElementById('wilaya');
  var baladiaSelect = document.getElementById('baladia');
  var successWhatsApp = document.getElementById('successWhatsApp');
  var waFloat = document.getElementById('waFloat');
  var trialDownload = document.getElementById('trialDownload');
  var trialForm = document.getElementById('trialForm');
  var trialEmail = document.getElementById('trialEmail');
  var trialEmailError = document.getElementById('trialEmailError');
  var fieldIds = ['name', 'phone', 'wilaya', 'baladia', 'shopType'];

  // Arabic copy is read once from the HTML so the page has one source for it.
  var ar = {};
  document.querySelectorAll('[data-i]').forEach(function (el) { if (!(el.dataset.i in ar)) ar[el.dataset.i] = el.innerHTML; });
  document.querySelectorAll('[data-i-placeholder]').forEach(function (el) { ar[el.dataset.iPlaceholder] = el.placeholder; });
  document.querySelectorAll('[data-i-alt]').forEach(function (el) { if (!(el.dataset.iAlt in ar)) ar[el.dataset.iAlt] = el.alt; });

  function text(key) { return (language === 'fr' ? fr : ar)[key]; }
  function msg(key) { return messages[language][key]; }
  function wilayaValue(w) { return w[0] + ' - ' + w[2]; }
  function plain(html) { var d = document.createElement('div'); d.innerHTML = html; return d.textContent; }

  function findWilaya(value) { return wilayas.find(function (w) { return wilayaValue(w) === value; }); }
  function communeLabel(c) { return language === 'fr' ? c[1] : (c[0] || c[1]); }
  function addOption(select, value, label) {
    var option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    select.appendChild(option);
  }

  function fillWilayas() {
    var chosen = wilayaSelect.value;
    while (wilayaSelect.options.length > 1) wilayaSelect.remove(1);
    wilayas.forEach(function (w) {
      addOption(wilayaSelect, wilayaValue(w), (w[0] < 10 ? '0' : '') + w[0] + ' - ' + (language === 'fr' ? w[2] : w[1]));
    });
    wilayaSelect.value = chosen;
    fillCommunes();
  }

  // The commune list follows the chosen wilaya. The first option is the hint text.
  function fillCommunes() {
    var chosen = baladiaSelect.value;
    var w = findWilaya(wilayaSelect.value);
    var list = w ? (communes[w[0]] || []) : [];
    while (baladiaSelect.options.length) baladiaSelect.remove(0);
    addOption(baladiaSelect, '', w ? msg('baladiaChoose') : text('baladiaPlaceholder'));
    list.forEach(function (c) { addOption(baladiaSelect, c[1], communeLabel(c)); });
    baladiaSelect.disabled = !w;
    baladiaSelect.value = list.some(function (c) { return c[1] === chosen; }) ? chosen : '';
  }

  // Reads the two files as they are; JSON parsing ignores the BOM of communes.json.
  async function loadData() {
    wilayaSelect.options[0].textContent = msg('dataLoading');
    try {
      var answers = await Promise.all([fetch('data/wilayas.json'), fetch('data/communes.json')]);
      if (!answers[0].ok || !answers[1].ok) throw new Error('data_failed');
      var rawWilayas = await answers[0].json();
      var rawCommunes = await answers[1].json();
      wilayas = rawWilayas.map(function (w) {
        var number = Number(w.code);
        var fix = nameFixes[number];
        return [number, fix ? fix[0] : w.ar_name, fix ? fix[1] : w.name];
      }).filter(function (w) { return w[0] > 0 && w[2]; }).sort(function (a, b) { return a[0] - b[0]; });
      communes = {};
      var seen = {};
      rawCommunes.forEach(function (c) {
        var number = Number(c.wilaya_id);
        var key = number + '|' + c.name;
        if (!c.name || seen[key]) return; // 99 rows are listed twice in the file.
        seen[key] = true;
        (communes[number] = communes[number] || []).push([String(c.ar_name || '').trim(), String(c.name).trim()]);
      });
      Object.keys(communes).forEach(function (n) {
        communes[n].sort(function (a, b) { return a[1].localeCompare(b[1], 'fr'); });
      });
      dataReady = true;
    } catch (_) {
      submitError.textContent = msg('dataError');
    }
    wilayaSelect.options[0].textContent = text('wilayaPlaceholder');
    fillWilayas();
  }

  function waLink(message) { return 'https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent(message); }
  function orderMessage(values) {
    var lines = [msg('waHello')];
    if (orderCode) lines.push(msg('waCode') + ': ' + orderCode);
    var w = findWilaya(values.wilaya);
    if (w) lines.push(msg('waWilaya') + ': ' + (language === 'fr' ? w[2] : w[1]));
    var c = w && (communes[w[0]] || []).find(function (item) { return item[1] === values.baladia; });
    if (values.baladia) lines.push(msg('waBaladia') + ': ' + (c ? communeLabel(c) : values.baladia));
    return lines.join('\n');
  }

  function campaignData() {
    var params = new URLSearchParams(window.location.search);
    return { medium: params.get('utm_medium') || '', campaign: params.get('utm_campaign') || '',
      content: params.get('utm_content') || '', term: params.get('utm_term') || '',
      referrer: document.referrer || '', landing_page: window.location.href, utm_source: params.get('utm_source') || '' };
  }
  // Analytics failures must never stop an order.
  function track(name, properties, standard) {
    try {
      var c = campaignData();
      var detail = Object.assign({ language: language, content_name: 'Store Soft USB', content_category: 'usb',
        utm_source: c.utm_source, utm_medium: c.medium, utm_campaign: c.campaign }, properties || {});
      if (typeof window.fbq === 'function') window.fbq(standard ? 'track' : 'trackCustom', name, detail);
    } catch (_) { /* Best effort. */ }
  }
  // Meta advanced matching with the phone as 213XXXXXXXXX; the Pixel hashes it before sending.
  function setMetaUser(phone) {
    try {
      if (/^0[567][0-9]{8}$/.test(phone) && typeof window.fbq === 'function') {
        window.fbq('init', '2176257146284643', { ph: '213' + phone.slice(1), country: 'dz' });
      }
    } catch (_) { /* Best effort. */ }
  }

  function clearErrors() {
    fieldIds.forEach(function (id) {
      document.getElementById(id).removeAttribute('aria-invalid');
      document.getElementById(id + 'Error').textContent = '';
    });
    submitError.textContent = '';
  }

  function setLanguage(next) {
    language = next;
    document.documentElement.lang = next;
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
    document.title = msg('pageTitle');
    switcher.textContent = next === 'ar' ? 'FR' : 'ع';
    switcher.setAttribute('aria-label', msg('switchLabel'));
    document.querySelectorAll('[data-i]').forEach(function (el) { var v = text(el.dataset.i); if (v != null) el.innerHTML = v; });
    document.querySelectorAll('[data-i-placeholder]').forEach(function (el) { el.placeholder = text(el.dataset.iPlaceholder); });
    document.querySelectorAll('[data-i-alt]').forEach(function (el) { el.alt = plain(text(el.dataset.iAlt)); });
    fillWilayas();
    if (submitting) submitLabel.textContent = msg('submitting');
    waFloat.href = waLink(msg('waQuestion'));
    trialDownload.href = windowsPage();
    trialEmail.removeAttribute('aria-invalid');
    trialEmailError.textContent = '';
    updateTrialLink();
    if (saved) successWhatsApp.href = waLink(orderMessage(lastValues));
    clearErrors();
    try {
      var url = new URL(window.location.href);
      if (next === 'fr') url.searchParams.set('lang', 'fr'); else url.searchParams.delete('lang');
      window.history.replaceState(null, '', url);
    } catch (_) { /* Older browsers keep the URL. */ }
  }

  function readValues() {
    var data = new FormData(form);
    var get = function (key) { return String(data.get(key) || '').trim(); };
    return { name: get('name'), phone: get('phone').replace(/[\s.-]/g, ''), wilaya: get('wilaya'),
      baladia: get('baladia'), shop_type: get('shop_type'), website: String(data.get('website') || '') };
  }

  function validate(values) {
    clearErrors();
    var errors = {};
    if (!values.name) errors.name = msg('required');
    else if (values.name.length < 2 || values.name.length > 80) errors.name = msg('invalidName');
    if (!values.phone) errors.phone = msg('required');
    else if (!/^0[567][0-9]{8}$/.test(values.phone)) errors.phone = msg('invalidPhone');
    var w = findWilaya(values.wilaya);
    if (!w) errors.wilaya = dataReady ? msg('required') : msg('dataError');
    else if (!(communes[w[0]] || []).some(function (c) { return c[1] === values.baladia; })) errors.baladia = msg('required');
    if (activities.indexOf(values.shop_type) < 0) errors.shopType = msg('required');
    Object.keys(errors).forEach(function (id) {
      document.getElementById(id).setAttribute('aria-invalid', 'true');
      document.getElementById(id + 'Error').textContent = errors[id];
    });
    var first = fieldIds.find(function (id) { return errors[id]; });
    if (first) document.getElementById(first).focus();
    return !first;
  }

  var lastValues = null;
  switcher.addEventListener('click', function () { setLanguage(language === 'ar' ? 'fr' : 'ar'); });
  wilayaSelect.addEventListener('change', fillCommunes);
  form.addEventListener('focusin', function () {
    if (!formStarted) { formStarted = true; track('FormStarted'); }
  });
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (submitting || saved) return;
    var values = readValues();
    if (!validate(values)) return;
    var c = campaignData();
    var body = Object.assign({}, values, {
      form_started_at: startedAt, language: language, form_version: 'usb_order_v1', requested_platform: 'computer',
      // This page is always "usb" in the CRM; landing_page keeps the original UTM values.
      source: 'usb', medium: c.medium, campaign: c.campaign, content: c.content, term: c.term,
      referrer: c.referrer, landing_page: c.landing_page
    });
    submitting = true;
    button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    submitLabel.textContent = msg('submitting');
    track('FormSubmitAttempt');
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 20000);
    try {
      var response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body), signal: controller.signal });
      var result = await response.json();
      if (!response.ok || !result.ok) throw new Error('submit_failed');
      saved = true;
      lastValues = values;
      orderCode = /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/.test(result.tracking_code || '') ? result.tracking_code : '';
      if (orderCode) {
        document.getElementById('orderCode').textContent = orderCode;
        document.getElementById('orderCodeLine').hidden = false;
      }
      var target = waLink(orderMessage(values));
      successWhatsApp.href = target;
      document.getElementById('formView').hidden = true;
      document.getElementById('successView').hidden = false;
      document.getElementById('successView').focus();
      // The honeypot gets ok without a saved lead; do not count it.
      var savedLead = typeof result.lead_id === 'string' && result.lead_id;
      if (savedLead) {
        setMetaUser(values.phone);
        track('Lead', { value: price, currency: 'DZD' }, true);
      }
    } catch (_) {
      if (!saved) submitError.textContent = msg('generalError');
    } finally {
      clearTimeout(timeout);
      submitting = false;
      button.disabled = saved;
      form.removeAttribute('aria-busy');
      submitLabel.textContent = text('submit');
    }
  });
  successWhatsApp.addEventListener('click', function () { track('WhatsAppOrderClick'); });

  // Free 14-day trial: the Windows download page, or the link sent by the visitor's
  // own email app (mailto). Store Soft has no email service; the address never
  // leaves this phone except through the visitor's email app.
  function windowsPage(absolute) {
    return (absolute ? 'https://storesoft.org' : '') + '/windows/' + (language === 'fr' ? '?lang=fr' : '');
  }
  trialDownload.addEventListener('click', function () { track('DownloadClicked', { platform: 'windows', place: 'usb_trial' }); });
  var trialSend = document.getElementById('trialSend');
  function trialEmailValue() {
    var email = trialEmail.value.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254 ? email : '';
  }
  // The Send button is a plain mailto link, kept up to date while the visitor types.
  function updateTrialLink() {
    var email = trialEmailValue();
    var body = msg('mailBody') + '\n' + windowsPage(true) + '\n\n' + msg('mailOrder') + '\n' +
      'https://storesoft.org/usb/' + (language === 'fr' ? '?lang=fr' : '');
    trialSend.href = email ? 'mailto:' + encodeURIComponent(email).replace(/%40/g, '@') +
      '?subject=' + encodeURIComponent(msg('mailSubject')) + '&body=' + encodeURIComponent(body) : '#trialEmail';
  }
  trialEmail.addEventListener('input', function () {
    updateTrialLink();
    if (trialEmailValue()) { trialEmail.removeAttribute('aria-invalid'); trialEmailError.textContent = ''; }
  });
  trialSend.addEventListener('click', function (event) {
    updateTrialLink();
    if (!trialEmailValue()) {
      event.preventDefault();
      trialEmail.setAttribute('aria-invalid', 'true');
      trialEmailError.textContent = msg('invalidEmail');
      trialEmail.focus();
      return;
    }
    track('TrialLinkEmailOpened', { platform: 'windows' });
  });
  // Enter in the email field works like the Send button.
  trialForm.addEventListener('submit', function (event) { event.preventDefault(); trialSend.click(); });
  waFloat.addEventListener('click', function () { track('WhatsAppCTAClick'); });

  // Phone: hide the fixed "Order" bar while the form is on screen.
  var sticky = document.getElementById('stickyCta');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { sticky.classList.toggle('is-hidden', entry.isIntersecting); });
    }, { threshold: 0.15 }).observe(document.getElementById('order'));
  }

  document.getElementById('year').textContent = new Date().getFullYear();
  var asked = new URLSearchParams(window.location.search).get('lang');
  setLanguage(asked === 'fr' ? 'fr' : 'ar');
  loadData();
  track('LandingPageView');
}());
