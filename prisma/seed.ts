import { roles } from "./seeds/roles";
import { especialidades } from "./seeds/especialidades";
import { etiquetas } from "./seeds/etiquetas";
import { politicasla } from "./seeds/politicasla";
import { categorias } from "./seeds/categorias";
import { reglasasignacion } from "./seeds/reglaasignacion";
import { PrismaClient, Prioridad, EstadoTiquete, NivelExperiencia, MetodoAsignacion, TipoNotificacion, EstadoNotificacion, Disponibilidad } from "../generated/prisma";

const prisma = new PrismaClient();

const main = async () => {
  try {
    // Entidades base - no tienen relaciones
    await prisma.rol.createMany({
      data: roles,
    });

    await prisma.especialidad.createMany({
      data: especialidades,
    });

    await prisma.etiqueta.createMany({
      data: etiquetas,
    });

    await prisma.politicaSla.createMany({
      data: politicasla,
    });

    await prisma.reglaAsignacion.createMany({
      data: reglasasignacion,
    });

    await prisma.categoria.createMany({
      data: categorias,
    });

    // Usuarios con especialidades usando connect - siguiendo patrón videojuegos
    // Usuario 1 - Admin (sin especialidades)
    await prisma.usuario.create({
      data: {
        correo: "admin@helpyit.com",
        contrasenahash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
        nombrecompleto: "Administrador Sistema",
        telefono: "123-456-7890",
        rol: { connect: { id: 1 } },
        activo: true,
        disponibilidad:  Disponibilidad.DISPONIBLE,
        cargaactual: 0,
        maxticketsimultaneos: 10,
      },
    });

    // Usuario 2 - Supervisor (sin especialidades)
    await prisma.usuario.create({
      data: {
        correo: "cliente@ibm.com",
        contrasenahash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
        nombrecompleto: "María González",
        telefono: "123-456-7891",
        rol: { connect: { id: 2 } },
        activo: true,
        disponibilidad: Disponibilidad.DISPONIBLE,
        cargaactual: 0,
        maxticketsimultaneos: 8,
      },
    });

    // Usuario 3 - Carlos Rodríguez (Técnico Senior con especialidades)
    await prisma.usuario.create({
      data: {
        correo: "tecnico1@helpyit.com",
        contrasenahash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
        nombrecompleto: "Carlos Rodríguez",
        telefono: "123-456-7892",
        rol: { connect: { id: 3 } },
        activo: true,
        disponibilidad: Disponibilidad.DISPONIBLE,
        cargaactual: 3,
        maxticketsimultaneos: 6,
        especialidades: {
          create: [
            { 
              especialidad: { connect: { id: 1 } }, // Redes
              nivelexperiencia: NivelExperiencia.SENIOR 
            },
            { 
              especialidad: { connect: { id: 3 } }, // Software
              nivelexperiencia: NivelExperiencia.SENIOR 
            },
            { 
              especialidad: { connect: { id: 6 } }, // Servidores
              nivelexperiencia: NivelExperiencia.INTERMEDIO 
            },
          ],
        },
      },
    });

    // Usuario 4 - Ana López (Técnico Junior con especialidades)
    await prisma.usuario.create({
      data: {
        correo: "tecnico2@helpyit",
        contrasenahash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
        nombrecompleto: "Ana López",
        telefono: "123-456-7893",
        rol: { connect: { id: 3 } },
        activo: true,
        disponibilidad: Disponibilidad.DISPONIBLE,
        cargaactual: 2,
        maxticketsimultaneos: 4,
        especialidades: {
          create: [
            { 
              especialidad: { connect: { id: 2 } }, // Hardware
              nivelexperiencia: NivelExperiencia.JUNIOR 
            },
            { 
              especialidad: { connect: { id: 3 } }, // Software
              nivelexperiencia: NivelExperiencia.INTERMEDIO 
            },
          ],
        },
      },
    });

    // Usuarios 5-6 - Clientes (sin especialidades)
    await prisma.usuario.createMany({
      data: [
        {
          correo: "cliente1@empresa.com",
          contrasenahash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
          nombrecompleto: "Juan Pérez",
          telefono: "987-654-3210",
          idrol: 4,
          activo: true,
          disponibilidad: Disponibilidad.DISPONIBLE,
          cargaactual: 0,
          maxticketsimultaneos: 3,
        },
        {
          correo: "cliente2@microsoft.com",
          contrasenahash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
          nombrecompleto: "Laura Martínez",
          telefono: "987-654-3211",
          idrol: 4,
          activo: true,
          disponibilidad: Disponibilidad.DISPONIBLE,
          cargaactual: 0,
          maxticketsimultaneos: 3,
        },
      ],
    });

    // Usuario 7 - Roberto Silva (Técnico Intermedio con especialidades)
    await prisma.usuario.create({
      data: {
        correo: "tecnico3@helpyit.com",
        contrasenahash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
        nombrecompleto: "Roberto Silva",
        telefono: "123-456-7894",
        rol: { connect: { id: 3 } },
        activo: true,
        disponibilidad: Disponibilidad.DISPONIBLE,
        cargaactual: 1,
        maxticketsimultaneos: 5,
        especialidades: {
          create: [
            { 
              especialidad: { connect: { id: 4 } }, // Seguridad
              nivelexperiencia: NivelExperiencia.INTERMEDIO 
            },
            { 
              especialidad: { connect: { id: 5 } }, // Base de Datos
              nivelexperiencia: NivelExperiencia.INTERMEDIO 
            },
          ],
        },
      },
    });

    // Usuario 8 - Patricia Morales (Técnico Senior con especialidades)
    await prisma.usuario.create({
      data: {
        correo: "tecnico4@helpyit.com",
        contrasenahash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
        nombrecompleto: "Patricia Morales",
        telefono: "123-456-7895",
        rol: { connect: { id: 3 } },
        activo: true,
        disponibilidad: Disponibilidad.OCUPADO,
        cargaactual: 4,
        maxticketsimultaneos: 7,
        especialidades: {
          create: [
            { 
              especialidad: { connect: { id: 1 } }, // Redes
              nivelexperiencia: NivelExperiencia.EXPERTO 
            },
            { 
              especialidad: { connect: { id: 4 } }, // Seguridad
              nivelexperiencia: NivelExperiencia.SENIOR 
            },
            { 
              especialidad: { connect: { id: 6 } }, // Servidores
              nivelexperiencia: NivelExperiencia.SENIOR 
            },
          ],
        },
      },
    });

    // Usuario 9 - Cliente adicional
    await prisma.usuario.create({
      data: {
        correo: "cliente3@ibm.com",
        contrasenahash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
        nombrecompleto: "Diego Ramírez",
        telefono: "987-654-3212",
        rol: { connect: { id: 4 } },
        activo: true,
        disponibilidad: Disponibilidad.DISPONIBLE,
        cargaactual: 0,
        maxticketsimultaneos: 3,
      },
    });

    // Relaciones many-to-many: Categoria-Especialidad usando connect
    await prisma.categoriaEspecialidad.createMany({
      data: [
        // Incidente Crítico - requiere múltiples especialidades
        { idcategoria: 1, idespecialidad: 1 }, // Redes
        { idcategoria: 1, idespecialidad: 6 }, // Servidores
        
        // Falla de Sistema - software y servidores
        { idcategoria: 2, idespecialidad: 3 }, // Software
        { idcategoria: 2, idespecialidad: 6 }, // Servidores
        
        // Problema de Red - redes y seguridad
        { idcategoria: 3, idespecialidad: 1 }, // Redes
        { idcategoria: 3, idespecialidad: 4 }, // Seguridad
        
        // Error de Software
        { idcategoria: 4, idespecialidad: 3 }, // Software
        
        // Solicitud de Acceso - seguridad
        { idcategoria: 5, idespecialidad: 4 }, // Seguridad
        
        // Capacitación - todas las especialidades
        { idcategoria: 6, idespecialidad: 1 },
        { idcategoria: 6, idespecialidad: 2 },
        { idcategoria: 6, idespecialidad: 3 },
        
        // Consulta General - software principalmente
        { idcategoria: 7, idespecialidad: 3 },
      ],
    });

    // Relaciones many-to-many: Categoria-Etiqueta
    await prisma.categoriaEtiqueta.createMany({
      data: [
        // Incidente Crítico - urgente
        { idcategoria: 1, idetiqueta: 1 }, // Urgente
        
        // Falla de Sistema - bug y urgente
        { idcategoria: 2, idetiqueta: 1 }, // Urgente
        { idcategoria: 2, idetiqueta: 2 }, // Bug
        
        // Problema de Red - rendimiento y configuración
        { idcategoria: 3, idetiqueta: 6 }, // Configuración
        { idcategoria: 3, idetiqueta: 8 }, // Rendimiento
        
        // Error de Software - bug
        { idcategoria: 4, idetiqueta: 2 }, // Bug
        
        // Solicitud de Acceso
        { idcategoria: 5, idetiqueta: 7 }, // Acceso
        
        // Capacitación
        { idcategoria: 6, idetiqueta: 3 }, // Capacitación
        
        // Consulta General - configuración
        { idcategoria: 7, idetiqueta: 6 }, // Configuración
      ],
    });

    // Tiquetes con relaciones usando connect - siguiendo patrón videojuegos
    // Ticket 1 - Crítico
    await prisma.tiquete.create({
      data: {
        titulo: "Sistema de facturación no responde",
        descripcion: "El sistema de facturación está completamente inaccesible desde las 9:00 AM. Los usuarios no pueden generar facturas.",
        prioridad: Prioridad.CRITICA,
        estado: EstadoTiquete.ABIERTO,
        categoria: { connect: { id: 1 } }, // Incidente Crítico
        cliente: { connect: { id: 5 } }, // Juan Pérez
        tecnicoActual: { connect: { id: 3 } }, // Carlos Rodríguez
        vencerespuesta: new Date(Date.now() + 15 * 60 * 1000), // 15 minutos
        venceresolucion: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 horas
        asignaciones: {
          create: [
            {
              tecnico: { connect: { id: 3 } }, // Carlos Rodríguez
              regla: { connect: { id: 3 } }, // Asignación Crítica
              metodo: MetodoAsignacion.AUTOMATICO,
              justificacion: "Asignado automáticamente por prioridad crítica y experiencia en servidores",
              puntajeasignacion: 95,
              asignadopor: 1, // Admin
            }
          ]
        },
        historiales: {
          create: [
            {
              estadoanterior: EstadoTiquete.ABIERTO,
              estadonuevo: EstadoTiquete.ABIERTO,
              observacion: "Ticket creado y asignado automáticamente",
              usuarioCambio: { connect: { id: 1 } }, // Admin
            
              imagenes: {
                create: [
                  {
                    rutaarchivo: "evidencias/error_facturacion_pantalla1.png",
                    usuario: { connect: { id: 5 } }, // Juan Pérez (cliente que reportó)
                    subidoen: new Date(Date.now() - 30 * 60 * 1000), // Hace 30 minutos
                  },
                  {
                    rutaarchivo: "evidencias/error_facturacion_log.txt",
                    usuario: { connect: { id: 3 } }, // Carlos Rodríguez (técnico)
                    subidoen: new Date(Date.now() - 15 * 60 * 1000), // Hace 15 minutos
                  }
                ]
              }
            }
          ]
        },
        notificaciones: {
          create: [
            {
              tipo: TipoNotificacion.ASIGNACION,
              usuarioDestino: { connect: { id: 3 } }, // Carlos Rodríguez
              usuarioOrigen: { connect: { id: 1 } }, // Admin
              titulo: "Nuevo ticket crítico asignado",
              contenido: "Se te ha asignado un ticket crítico: Sistema de facturación no responde",
              estado: EstadoNotificacion.NO_LEIDA,
            }
          ]
        }
      },
    });

    // Ticket 2 - Error de Software
    await prisma.tiquete.create({
      data: {
        titulo: "Error en módulo de reportes",
        descripcion: "Al generar reportes mensuales, la aplicación muestra error 500.",
        prioridad: Prioridad.ALTA,
        estado: EstadoTiquete.EN_PROGRESO,
        categoria: { connect: { id: 4 } }, // Error de Software
        cliente: { connect: { id: 6 } }, // Laura Martínez
        tecnicoActual: { connect: { id: 4 } }, // Ana López
        vencerespuesta: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 horas
        venceresolucion: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
        asignaciones: {
          create: [
            {
              tecnico: { connect: { id: 4 } }, // Ana López
              regla: { connect: { id: 2 } }, // Asignación por Experiencia
              metodo: MetodoAsignacion.AUTOMATICO,
              justificacion: "Asignado por especialidad en software",
              puntajeasignacion: 85,
              asignadopor: 1, // Admin
            }
          ]
        },
        historiales: {
          create: [
            {
              estadoanterior: EstadoTiquete.ABIERTO,
              estadonuevo: EstadoTiquete.EN_PROGRESO,
              observacion: "Iniciando diagnóstico del error en reportes",
              usuarioCambio: { connect: { id: 4 } }, // Ana López
             
              imagenes: {
                create: [
                  {
                    rutaarchivo: "evidencias/error_500_screenshot.png",
                    usuario: { connect: { id: 6 } }, // Laura Martínez (cliente)
                    subidoen: new Date(Date.now() - 2 * 60 * 60 * 1000), // Hace 2 horas
                  },
                  {
                    rutaarchivo: "evidencias/server_logs_reportes.log",
                    usuario: { connect: { id: 4 } }, // Ana López (técnico)
                    subidoen: new Date(Date.now() - 1 * 60 * 60 * 1000), // Hace 1 hora
                  }
                ]
              }
            }
          ]
        },
        notificaciones: {
          create: [
            {
              tipo: TipoNotificacion.CAMBIO_ESTADO,
              usuarioDestino: { connect: { id: 6 } }, // Laura Martínez (cliente)
              usuarioOrigen: { connect: { id: 4 } }, // Ana López
              titulo: "Su ticket está en progreso",
              contenido: "Su ticket 'Error en módulo de reportes' ahora está siendo atendido",
              estado: EstadoNotificacion.NO_LEIDA,
            }
          ]
        }
      },
    });

    // Ticket 3 - Solicitud de Acceso
    await prisma.tiquete.create({
      data: {
        titulo: "Solicitud de acceso a carpeta compartida",
        descripcion: "Necesito acceso de lectura/escritura a la carpeta compartida del proyecto ABC.",
        prioridad: Prioridad.MEDIA,
        estado: EstadoTiquete.EN_PROGRESO,
        categoria: { connect: { id: 5 } }, // Solicitud de Acceso
        cliente: { connect: { id: 5 } }, // Juan Pérez
        tecnicoActual: { connect: { id: 7 } }, // Roberto Silva
        vencerespuesta: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 horas
        venceresolucion: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
        asignaciones: {
          create: [
            {
              tecnico: { connect: { id: 7 } }, // Roberto Silva
              regla: { connect: { id: 4 } }, // Asignación Round Robin
              metodo: MetodoAsignacion.MANUAL,
              justificacion: "Asignación manual por solicitud específica de acceso",
              puntajeasignacion: 75,
              asignadopor: 2, // Supervisor
            }
          ]
        },
        historiales: {
          create: [
            {
              estadoanterior: EstadoTiquete.ABIERTO,
              estadonuevo: EstadoTiquete.EN_PROGRESO,
              observacion: "Asignado a técnico, procesando solicitud de acceso",
              usuarioCambio: { connect: { id: 7 } }, // Roberto Silva
           
              imagenes: {
                create: [
                  {
                    rutaarchivo: "evidencias/formulario_acceso_firmado.pdf",
                    usuario: { connect: { id: 5 } }, // Juan Pérez (cliente)
                    subidoen: new Date(Date.now() - 3 * 60 * 60 * 1000), // Hace 3 horas
                  }
                ]
              }
            }
          ]
        },
        notificaciones: {
          create: [
            {
              tipo: TipoNotificacion.ASIGNACION,
              usuarioDestino: { connect: { id: 7 } }, // Roberto Silva
              usuarioOrigen: { connect: { id: 2 } }, // Supervisor
              titulo: "Nueva solicitud de acceso asignada",
              contenido: "Se te ha asignado una solicitud de acceso a carpeta compartida",
              estado: EstadoNotificacion.LEIDA,
              leidaen: new Date(Date.now() - 2 * 60 * 60 * 1000), // Leída hace 2 horas
            }
          ]
        }
      },
    });

    // Ticket 4 - Problema de Seguridad
    await prisma.tiquete.create({
      data: {
        titulo: "Detección de actividad sospechosa en servidor",
        descripcion: "El sistema de monitoreo detectó múltiples intentos de acceso no autorizado al servidor de base de datos desde IPs externas.",
        prioridad: Prioridad.ALTA,
        estado: EstadoTiquete.ASIGNADO,
        categoria: { connect: { id: 2 } }, // Falla de Sistema
        cliente: { connect: { id: 9 } }, // Diego Ramírez
        tecnicoActual: { connect: { id: 8 } }, // Patricia Morales
        vencerespuesta: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
        venceresolucion: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 horas
        asignaciones: {
          create: [
            {
              tecnico: { connect: { id: 8 } }, // Patricia Morales
              regla: { connect: { id: 3 } }, // Asignación Crítica
              metodo: MetodoAsignacion.AUTOMATICO,
              justificacion: "Asignado por especialidad en seguridad informática y experiencia senior",
              puntajeasignacion: 98,
              asignadopor: 1, // Admin
            }
          ]
        },
        historiales: {
          create: [
            {
              estadoanterior: EstadoTiquete.ABIERTO,
              estadonuevo: EstadoTiquete.ASIGNADO,
              observacion: "Ticket de seguridad asignado por alta prioridad",
              usuarioCambio: { connect: { id: 1 } }, // Admin
         
              imagenes: {
                create: [
                  {
                    rutaarchivo: "evidencias/ips_sospechosas_reporte.pdf",
                    usuario: { connect: { id: 8 } }, // Patricia Morales (técnico)
                    subidoen: new Date(Date.now() - 45 * 60 * 1000), // Hace 45 minutos
                  },
                  {
                    rutaarchivo: "evidencias/firewall_logs_intrusos.txt",
                    usuario: { connect: { id: 8 } }, // Patricia Morales
                    subidoen: new Date(Date.now() - 20 * 60 * 1000), // Hace 20 minutos
                  },
                  {
                    rutaarchivo: "evidencias/analisis_trafico_red.pcap",
                    usuario: { connect: { id: 8 } }, // Patricia Morales
                    subidoen: new Date(Date.now() - 10 * 60 * 1000), // Hace 10 minutos
                  }
                ]
              }
            }
          ]
        },
        notificaciones: {
          create: [
            {
              tipo: TipoNotificacion.ASIGNACION,
              usuarioDestino: { connect: { id: 8 } }, // Patricia Morales
              usuarioOrigen: { connect: { id: 1 } }, // Admin
              titulo: "Ticket de seguridad crítico asignado",
              contenido: "Se detectó actividad sospechosa - requiere atención inmediata",
              estado: EstadoNotificacion.LEIDA,
              leidaen: new Date(Date.now() - 30 * 60 * 1000), // Leída hace 30 minutos
            }
          ]
        }
      },
    });

    // Ticket 5 - Capacitación
    await prisma.tiquete.create({
      data: {
        titulo: "Capacitación sobre nuevas herramientas de desarrollo",
        descripcion: "Solicito información sobre los próximos cursos de capacitación en las nuevas tecnologías que implementará la empresa.",
        prioridad: Prioridad.BAJA,
        estado: EstadoTiquete.RESUELTO,
        categoria: { connect: { id: 6 } }, // Capacitación
        cliente: { connect: { id: 6 } }, // Laura Martínez
        tecnicoActual: { connect: { id: 7 } }, // Roberto Silva
        creadoen: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 días atrás
        resueltoen: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 día atrás
        vencerespuesta: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 horas
        venceresolucion: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 horas
        cumplioslarespuesta: true,
        cumplioslaresolucion: true,
        asignaciones: {
          create: [
            {
              tecnico: { connect: { id: 7 } }, // Roberto Silva
              regla: { connect: { id: 1 } }, // Asignación por Carga Balanceada
              metodo: MetodoAsignacion.AUTOMATICO,
              justificacion: "Asignado por menor carga de trabajo y disponibilidad",
              puntajeasignacion: 80,
              asignadopor: 2, // Supervisor
            }
          ]
        },
        historiales: {
          create: [
            {
              estadoanterior: EstadoTiquete.ABIERTO,
              estadonuevo: EstadoTiquete.EN_PROGRESO,
              observacion: "Iniciando búsqueda de cursos disponibles",
              usuarioCambio: { connect: { id: 7 } }, // Roberto Silva
              cambiadoen: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 días atrás
            },
            {
              estadoanterior: EstadoTiquete.EN_PROGRESO,
              estadonuevo: EstadoTiquete.RESUELTO,
              observacion: "Información de capacitación enviada al cliente",
              usuarioCambio: { connect: { id: 7 } }, // Roberto Silva
              cambiadoen: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 día atrás
              
              imagenes: {
                create: [
                  {
                    rutaarchivo: "evidencias/catalogo_cursos_2024.pdf",
                    usuario: { connect: { id: 7 } }, // Roberto Silva (técnico)
                    subidoen: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Hace 1 día
                  },
                  {
                    rutaarchivo: "evidencias/cronograma_capacitaciones.xlsx",
                    usuario: { connect: { id: 7 } }, // Roberto Silva
                    subidoen: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Hace 1 día
                  }
                ]
              }
            }
          ]
        },
        notificaciones: {
          create: [
            {
              tipo: TipoNotificacion.CAMBIO_ESTADO,
              usuarioDestino: { connect: { id: 6 } }, // Laura Martínez
              usuarioOrigen: { connect: { id: 7 } }, // Roberto Silva
              titulo: "Su solicitud ha sido resuelta",
              contenido: "Su consulta sobre capacitación ha sido resuelta. Revise la información enviada.",
              estado: EstadoNotificacion.LEIDA,
              leidaen: new Date(Date.now() - 12 * 60 * 60 * 1000), // Leída hace 12 horas
            }
          ]
        },
        valoraciones: {
          create: [
            {
              cliente: { connect: { id: 6 } }, // Laura Martínez
              calificacion: 5,
              comentario: "Excelente servicio, información muy completa y rápida respuesta",
              creadaen: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 horas atrás
            }
          ]
        }
      },
    });

    // Agregar al final de tu seed.ts, DESPUÉS de los 5 tickets existentes:

// ========== TICKETS PARA VISTA DE ASIGNACIONES (SEMANA ACTUAL) ==========

// Función helper para obtener fechas de la semana actual
const obtenerSemanaActual = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const lunes = new Date(now);
  lunes.setDate(now.getDate() + diff);
  lunes.setHours(10, 0, 0, 0);
  
  return {
    lunes: new Date(lunes),
    martes: new Date(lunes.setDate(lunes.getDate() + 1)),
    miercoles: new Date(lunes.setDate(lunes.getDate() + 1)),
    jueves: new Date(lunes.setDate(lunes.getDate() + 1)),
    viernes: new Date(lunes.setDate(lunes.getDate() + 1))
  };
};

const semana = obtenerSemanaActual();

// Ticket 6 - PENDIENTE (Lunes)
await prisma.tiquete.create({
  data: {
    titulo: "Actualización de software pendiente",
    descripcion: "Requiere actualización del sistema operativo en servidor de producción",
    prioridad: Prioridad.MEDIA,
    estado: EstadoTiquete.PENDIENTE,
    categoria: { connect: { id: 8 } },
    cliente: { connect: { id: 5 } },
    tecnicoActual: { connect: { id: 3 } },
    creadoen: semana.lunes,
    vencerespuesta: new Date(semana.lunes.getTime() + 4 * 60 * 60 * 1000),
    venceresolucion: new Date(semana.lunes.getTime() + 24 * 60 * 60 * 1000),
  },
});

// Ticket 7 - ASIGNADO (Martes)
await prisma.tiquete.create({
  data: {
    titulo: "Configuración de firewall para nuevo servidor",
    descripcion: "Se requiere configurar firewall para servidor recién instalado",
    prioridad: Prioridad.ALTA,
    estado: EstadoTiquete.ASIGNADO,
    categoria: { connect: { id: 2 } },
    cliente: { connect: { id: 6 } },
    tecnicoActual: { connect: { id: 3 } },
    creadoen: semana.martes,
    vencerespuesta: new Date(semana.martes.getTime() + 1 * 60 * 60 * 1000),
    venceresolucion: new Date(semana.martes.getTime() + 8 * 60 * 60 * 1000),
  },
});

// Ticket 8 - EN_PROGRESO (Miércoles - primera asignación)
await prisma.tiquete.create({
  data: {
    titulo: "Migración de base de datos",
    descripcion: "Migración de BD de desarrollo a producción",
    prioridad: Prioridad.ALTA,
    estado: EstadoTiquete.EN_PROGRESO,
    categoria: { connect: { id: 2 } },
    cliente: { connect: { id: 9 } },
    tecnicoActual: { connect: { id: 3 } },
    creadoen: new Date(semana.miercoles.setHours(9, 0, 0, 0)),
    vencerespuesta: new Date(semana.miercoles.getTime() + 1 * 60 * 60 * 1000),
    venceresolucion: new Date(semana.miercoles.getTime() + 8 * 60 * 60 * 1000),
  },
});

// Ticket 9 - ABIERTO (Miércoles - segunda asignación del mismo día)
await prisma.tiquete.create({
  data: {
    titulo: "Soporte para instalación de aplicación",
    descripcion: "Usuario requiere asistencia para instalar nueva herramienta",
    prioridad: Prioridad.BAJA,
    estado: EstadoTiquete.ABIERTO,
    categoria: { connect: { id: 9 } },
    cliente: { connect: { id: 5 } },
    tecnicoActual: { connect: { id: 3 } },
    creadoen: new Date(semana.miercoles.setHours(14, 30, 0, 0)),
    vencerespuesta: new Date(semana.miercoles.getTime() + 30 * 60 * 1000),
    venceresolucion: new Date(semana.miercoles.getTime() + 2 * 60 * 60 * 1000),
  },
});

// Ticket 10 - RESUELTO (Jueves)
await prisma.tiquete.create({
  data: {
    titulo: "Consulta sobre backup automático",
    descripcion: "Cliente solicita información sobre política de backups",
    prioridad: Prioridad.BAJA,
    estado: EstadoTiquete.RESUELTO,
    categoria: { connect: { id: 7 } },
    cliente: { connect: { id: 6 } },
    tecnicoActual: { connect: { id: 3 } },
    creadoen: semana.jueves,
    resueltoen: new Date(semana.jueves.getTime() + 2 * 60 * 60 * 1000),
    vencerespuesta: new Date(semana.jueves.getTime() + 8 * 60 * 60 * 1000),
    venceresolucion: new Date(semana.jueves.getTime() + 72 * 60 * 60 * 1000),
    cumplioslarespuesta: true,
    cumplioslaresolucion: true,
  },
});

// Ticket 11 - CERRADO (Viernes)
await prisma.tiquete.create({
  data: {
    titulo: "Problema de conectividad resuelto",
    descripcion: "Usuario reportó problemas de conexión a red, ya solucionado",
    prioridad: Prioridad.MEDIA,
    estado: EstadoTiquete.CERRADO,
    categoria: { connect: { id: 3 } },
    cliente: { connect: { id: 9 } },
    tecnicoActual: { connect: { id: 3 } },
    creadoen: semana.viernes,
    resueltoen: new Date(semana.viernes.getTime() + 3 * 60 * 60 * 1000),
    cerradoen: new Date(semana.viernes.getTime() + 4 * 60 * 60 * 1000),
    vencerespuesta: new Date(semana.viernes.getTime() + 4 * 60 * 60 * 1000),
    venceresolucion: new Date(semana.viernes.getTime() + 24 * 60 * 60 * 1000),
    cumplioslarespuesta: true,
    cumplioslaresolucion: true,
  },
});



  } catch (error) {
    console.error("Error al insertar los datos en la DB:", error);
    throw error;
  }
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  });