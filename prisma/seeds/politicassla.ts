export const politicassla = [
  {
    nombre: "SLA Crítico",
    descripcion: "Para tickets de alta prioridad y críticos",
    maxminutosrespuesta: 30,
    maxminutosresolucion: 240,
    activo: true,
    vigentedesde: new Date('2025-01-01'),
  },
  {
    nombre: "SLA Alto",
    descripcion: "Para tickets de prioridad alta",
    maxminutosrespuesta: 120,
    maxminutosresolucion: 480,
    activo: true,
    vigentedesde: new Date('2025-01-01'),
  },
  {
    nombre: "SLA Estándar",
    descripcion: "Para tickets de prioridad media y baja",
    maxminutosrespuesta: 240,
    maxminutosresolucion: 1440,
    activo: true,
    vigentedesde: new Date('2025-01-01'),
  },
];