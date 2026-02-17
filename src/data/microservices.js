// ===============================
// MICROSERVICIOS A LA CARTA
// ===============================

// Los íconos se referencian por su nombre en string; el mapeo se hace en un archivo de utilidad separado (IconMap.js).
export const microservices = [
  { 
    title: "Publicación Urgente", 
    target: "Empresas", 
    price: "$7,000 COP", 
    basePrice: 7000,
    priceUnit: "(Pago Único)",
    icon: "Zap", 
    description: "Haz que tu vacante aparezca en el top de los resultados inmediatamente." 
  },
  { 
    title: "Perfil Destacado", 
    target: "Trabajadores", 
    price: "$9,900 COP / mes", 
    basePrice: 9900,
    priceUnit: "/ mes",
    icon: "Star", 
    description: "Destaca tu perfil profesional para ser visto primero por las mejores empresas." 
  },
  { 
    title: "Verificación Premium", 
    target: "Empresas", 
    price: "$20,000 COP (Único)", 
    basePrice: 20000,
    priceUnit: "(Pago Único)",
    icon: "Check", 
    description: "Verificación de antecedentes para contratar con la máxima seguridad y confianza." 
  },
  { 
    title: "Pago Inmediato", 
    target: "Trabajadores", 
    price: "$3,500 COP / turno", 
    basePrice: 3500,
    priceUnit: "/ turno",
    icon: "DollarSign", 
    description: "Garantiza el pago de tu turno al instante, sin esperar procesos bancarios." 
  }
];