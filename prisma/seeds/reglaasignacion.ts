export const reglasasignacion = [
  // 1
  {
    nombre: "Asignación por Carga Balanceada",
    descripcion: "Asigna tickets basándose en la carga actual de los técnicos",
    activa: true,
    pesoprioridad: 30,
    pesoslarestante: 25,
    pesocargaactual: 35,
    pesoexperiencia: 10,
    prioridadejecucion: 1,
  },
  // 2
  {
    nombre: "Asignación por Experiencia",
    descripcion: "Prioriza la experiencia del técnico en el área específica",
    activa: true,
    pesoprioridad: 20,
    pesoslarestante: 20,
    pesocargaactual: 20,
    pesoexperiencia: 40,
    prioridadejecucion: 2,
  },
  // 3
  {
    nombre: "Asignación Crítica",
    descripcion: "Para tickets críticos, prioriza disponibilidad y SLA",
    activa: true,
    pesoprioridad: 40,
    pesoslarestante: 40,
    pesocargaactual: 15,
    pesoexperiencia: 5,
    prioridadejecucion: 3,
  },
  // 4
  {
    nombre: "Asignación Round Robin",
    descripcion: "Distribuye tickets equitativamente entre todos los técnicos disponibles",
    activa: true,
    pesoprioridad: 15,
    pesoslarestante: 15,
    pesocargaactual: 60,
    pesoexperiencia: 10,
    prioridadejecucion: 4,
  },
  // 5
  {
    nombre: "Asignación por Especialización",
    descripcion: "Asigna exclusivamente basándose en la especialidad del técnico",
    activa: true,
    pesoprioridad: 10,
    pesoslarestante: 10,
    pesocargaactual: 10,
    pesoexperiencia: 70,
    prioridadejecucion: 5,
  },
  // 6
  {
    nombre: "Asignación de Emergencia",
    descripcion: "Para situaciones críticas, ignora carga y se enfoca en disponibilidad inmediata",
    activa: false, // Inactiva por defecto, se activa en emergencias
    pesoprioridad: 50,
    pesoslarestante: 45,
    pesocargaactual: 0,
    pesoexperiencia: 5,
    prioridadejecucion: 0, // Máxima prioridad
  },
];