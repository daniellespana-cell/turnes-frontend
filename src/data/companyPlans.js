export const companyPlans = [
  {
    id: "basic",
    name: "Básico",
    price: "$0",
    priceValue: 0,
    frequency: "COP / mes",
    isPopular: false,
    description: "Ideal para empezar a probar la plataforma y publicaciones ilimitadas de turnos.",
    features: [
      "Comisión por turno: 6%",
      "Chat interno y reputación",
      "Publicaciones ilimitadas por turnos",
      "Soporte estándar por correo",
      "Contratación Fija: $19,900 COP"
    ],
    commissionRate: 0.06,
    fixedPostingPrice: 19900,
    cta: {
      public: "Empezar Gratis",
      private: "Tu Plan Actual",
      linkPublic: "/register",
      linkPrivate: "#"
    },
    buttonClass: "bg-zinc-700 text-white hover:bg-zinc-600 border border-zinc-600",
  },
  {
    id: "micro",
    name: "Micro",
    price: "$29,900",
    priceValue: 29900,
    frequency: "COP / mes",
    isPopular: true,
    description: "Ahorro inteligente para negocios con rotación moderada y beneficios visibles.",
    features: [
      "Comisión por turno: 4% (Ahorro)",
      "Hasta 7 fijas al mes (Sin costo extra)",
      "3 publicaciones destacadas al mes",
      "Filtros avanzados de candidatos",
      "Badge 'Empresa Confiable'"
    ],
    commissionRate: 0.04,
    monthlyFixedLimit: 7,
    cta: {
      public: "Pruebalo Ya",
      private: "Mejorar a Micro",
      linkPublic: "/register",
      linkPrivate: "/dashboard/checkout/micro"
    },
    buttonClass: "bg-emerald-400 text-black hover:bg-emerald-500 border-2 border-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.4)]",
  },
  {
    id: "pro",
    name: "Pro Business",
    price: "$79,900",
    priceValue: 79900,
    frequency: "COP / mes",
    isPopular: false,
    description: "Solución completa para alta rotación. Contrataciones y turnos ilimitados.",
    features: [
      "Comisión por turno: 0% (Ilimitadas)",
      "30 fijas al mes (Sin costo extra)",
      "Acceso al Top Worker (Mejores candidatos)",
      "Analíticas de contratación",
      "Soporte premium personalizado"
    ],
    commissionRate: 0.00,
    monthlyFixedLimit: 30,
    cta: {
      public: "Actualizar a Pro",
      private: "Mejorar a Pro",
      linkPublic: "/register",
      linkPrivate: "/dashboard/checkout/pro"
    },
    buttonClass: "bg-indigo-600 text-white hover:bg-indigo-500 border border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]",
  }
];