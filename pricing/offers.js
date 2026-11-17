// Website-owned commercial content. Amounts are integer centimes; edit and publish this file.
// Same offer as the app's Algeria page (lib/features/subscribe/algeria_offer.dart and the
// dz* ARB texts): Pro paid once for one device forever, plus optional Cloud Sync per extra
// device per year, 0 to max_extra_devices extra devices (more: WhatsApp).
// available_until (last day, Algeria time) hides an offer automatically after that day.
window.storeSoftOffers = [
  {
    "code": "pro",
    "billing": "once",
    "title": {
      "ar": "ادفع مرة واحدة، والبرنامج لك للأبد",
      "en": "Pay once, the app is yours forever",
      "fr": "Payez une fois, l'application est à vous pour toujours"
    },
    "once_centimes": 900000,
    "features": {
      "ar": [
        "استمر في البيع بعد انتهاء التجربة",
        "منتجات، مبيعات، زبائن وتقارير بلا حدود",
        "يعمل بالكامل بدون إنترنت",
        "نسخ احتياطي على Google Drive",
        "تصدير المنتجات إلى Excel"
      ],
      "en": [
        "Keep selling after the trial",
        "Unlimited products, sales, customers and reports",
        "Works fully without internet",
        "Backup to Google Drive",
        "Export products to Excel"
      ],
      "fr": [
        "Continuez à vendre après l'essai",
        "Produits, ventes, clients et rapports illimités",
        "Marche entièrement sans internet",
        "Sauvegarde sur Google Drive",
        "Export des produits vers Excel"
      ]
    },
    "sync": {
      "additional_device_year_centimes": 400000,
      "max_extra_devices": 3,
      "features": {
        "ar": [
          "نفس المنتجات والمبيعات على كل أجهزتك",
          "البيع بدون إنترنت",
          "تتزامن تلقائيًا عند توفّر الإنترنت",
          "تابع محلك من هاتفك وأنت بعيد",
          "أداء الموظفين وصلاحياتهم"
        ],
        "en": [
          "Same products and sales on all your devices",
          "Selling without internet",
          "Syncs by itself when internet is available",
          "Follow your shop from your phone when away",
          "Staff performance and permissions"
        ],
        "fr": [
          "Mêmes produits et ventes sur tous vos appareils",
          "Vente sans internet",
          "Synchro automatique dès qu'internet est là",
          "Suivez votre magasin depuis votre téléphone",
          "Performance et droits des employés"
        ]
      }
    },
    "billing_note": {
      "ar": "الزبائن الذين دفعوا من قبل يحتفظون بتفعيلهم الحالي.",
      "en": "Customers who already paid keep their current activation.",
      "fr": "Les clients ayant déjà payé gardent leur activation actuelle."
    }
  }
];
