export const reglasasignacion = [
 
 {
        nombre: 'Regla Balanceada',
        descripcion: 'Distribución equilibrada considerando experiencia, carga actual y prioridad del ticket',
        activa: true,
        pesoprioridad: 1000,        // Mayor peso a prioridad
        pesoslarestante: -1,        // Penaliza poco SLA restante
        pesocargaactual: -50,       // Penaliza carga actual moderadamente
        pesoexperiencia: 100,       // Valora experiencia
        prioridadejecucion: 1,      // Primera regla a evaluar
      },
      {
        nombre: 'Regla Urgente',
        descripcion: 'Prioriza tickets críticos y de alta prioridad sobre otros factores',
        activa: true,
        pesoprioridad: 2000,        // Peso máximo a prioridad
        pesoslarestante: -10,       // Penaliza más el SLA restante
        pesocargaactual: -20,       // Penaliza menos la carga (urgencia)
        pesoexperiencia: 50,        // Menos peso a experiencia
        prioridadejecucion: 2,      // Segunda regla a evaluar
      },
      {
        nombre: 'Regla Experiencia',
        descripcion: 'Prioriza la asignación basada en nivel de experiencia del técnico',
        activa: true,
        pesoprioridad: 500,         // Menos peso a prioridad
        pesoslarestante: -5,        // Penaliza poco el SLA
        pesocargaactual: -30,       // Penaliza moderadamente la carga
        pesoexperiencia: 300,       // Peso alto a experiencia
        prioridadejecucion: 3,      // Tercera regla a evaluar
      },
      {
        nombre: 'Regla Distribución',
        descripcion: 'Enfocada en distribuir equitativamente la carga de trabajo entre técnicos',
        activa: false,              // Inactiva por defecto
        pesoprioridad: 300,         // Peso bajo a prioridad
        pesoslarestante: -2,        // Penaliza poco el SLA
        pesocargaactual: -100,      // Penaliza mucho la carga actual
        pesoexperiencia: 30,        // Peso bajo a experiencia
        prioridadejecucion: 4,      // Cuarta regla a evaluar
      },
];