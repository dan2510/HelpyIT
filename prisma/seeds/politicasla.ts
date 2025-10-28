export const politicasla = [
  // 1 - SLA Crítico
  {
    nombre: "SLA Crítico",
    descripcion: "Para incidentes críticos que afectan la operación",
    maxminutosrespuesta: 15, // 15 minutos
    maxminutosresolucion: 240, // 4 horas
    activo: true,
    vigentedesde: new Date("2024-01-01"),
    vigentehasta: new Date("2025-12-31"),
  },
  // 2 - SLA Alto
  {
    nombre: "SLA Alto",
    descripcion: "Para incidentes de alta prioridad",
    maxminutosrespuesta: 60, // 1 hora
    maxminutosresolucion: 480, // 8 horas
    activo: true,
    vigentedesde: new Date("2024-01-01"),
    vigentehasta: new Date("2025-12-31"),
  },
  // 3 - SLA Medio
  {
    nombre: "SLA Medio",
    descripcion: "Para incidentes de prioridad media",
    maxminutosrespuesta: 240, // 4 horas
    maxminutosresolucion: 1440, // 24 horas
    activo: true,
    vigentedesde: new Date("2024-01-01"),
    vigentehasta: new Date("2025-12-31"),
  },
  // 4 - SLA Bajo
  {
    nombre: "SLA Bajo",
    descripcion: "Para incidentes de baja prioridad y solicitudes",
    maxminutosrespuesta: 480, // 8 horas
    maxminutosresolucion: 4320, // 72 horas
    activo: true,
    vigentedesde: new Date("2024-01-01"),
    vigentehasta: new Date("2025-12-31"),
  },
  // 5 - SLA Express
  {
    nombre: "SLA Express",
    descripcion: "Para solicitudes simples que requieren atención rápida",
    maxminutosrespuesta: 30, // 30 minutos
    maxminutosresolucion: 120, // 2 horas
    activo: true,
    vigentedesde: new Date("2024-01-01"),
    vigentehasta: new Date("2025-12-31"),
  },
];