import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TecnicoController {

  static async getTecnicos(req, res) {
    try {
      const { page = 1, limit = 10, disponibilidad } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Filtros opcionales
      const where = {
        idrol: 3, // Solo técnicos
        activo: true,
        ...(disponibilidad && { disponibilidad })
      };

      const [tecnicos, total] = await Promise.all([
        // Solo 3 campos para el listado según avance 3
        prisma.usuario.findMany({
          where,
          select: {
            id: true,
            nombrecompleto: true,
            disponibilidad: true,
            cargaactual: true, // 3er campo: carga actual
          },
          orderBy: { nombrecompleto: 'asc' },
          skip: parseInt(skip),
          take: parseInt(limit),
        }),
        
        prisma.usuario.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          tecnicos,
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });

    } catch (error) {
      console.error('Error al obtener técnicos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }


  static async getTecnicoById(req, res) {
    try {
      const { id } = req.params;

      const tecnico = await prisma.usuario.findFirst({
        where: {
          id: parseInt(id),
          idrol: 3, // Solo técnicos
          activo: true
        },
        include: {
          // Información del rol
          rol: {
            select: {
              id: true,
              nombre: true,
              descripcion: true
            }
          },
          // Lista de especialidades (requerido por avance 3)
          especialidades: {
            include: {
              especialidad: {
                select: {
                  id: true,
                  nombre: true,
                  descripcion: true
                }
              }
            }
          },
          // Estadísticas adicionales
          tiquetesComoTecnico: {
            select: {
              id: true,
              estado: true,
              prioridad: true,
              creadoen: true,
              resueltoen: true
            }
          }
        }
      });

      if (!tecnico) {
        return res.status(404).json({
          success: false,
          message: 'Técnico no encontrado'
        });
      }

      // Calcular métricas de rendimiento
      const ticketsTotal = tecnico.tiquetesComoTecnico.length;
      const ticketsResueltos = tecnico.tiquetesComoTecnico.filter(t => t.estado === 'RESUELTO').length;
      const ticketsEnProgreso = tecnico.tiquetesComoTecnico.filter(t => t.estado === 'EN_PROGRESO').length;

      // Formatear respuesta con toda la información requerida por avance 3
      const response = {
        // Información personal del técnico
        id: tecnico.id,
        correo: tecnico.correo,
        nombrecompleto: tecnico.nombrecompleto,
        telefono: tecnico.telefono,
        creadoen: tecnico.creadoen,
        actualizadoen: tecnico.actualizadoen,
        ultimoiniciosesion: tecnico.ultimoiniciosesion,

        // Carga de trabajo y 
        disponibilidad: tecnico.disponibilidad,
        cargaactual: tecnico.cargaactual,
        maxticketsimultaneos: tecnico.maxticketsimultaneos,

        // Lista de especialidades (requerido por avance 3)
        especialidades: tecnico.especialidades.map(e => ({
          id: e.especialidad.id,
          nombre: e.especialidad.nombre,
          descripcion: e.especialidad.descripcion,
          nivelexperiencia: e.nivelexperiencia,
          asignadoen: e.asignadoen
        })),

        // Información del rol
        rol: tecnico.rol,

        // Métricas de rendimiento
        estadisticas: {
          ticketsTotal,
          ticketsResueltos,
          ticketsEnProgreso,
          ticketsPendientes: ticketsTotal - ticketsResueltos,
          porcentajeEfectividad: ticketsTotal > 0 ? Math.round((ticketsResueltos / ticketsTotal) * 100) : 0,
          capacidadDisponible: tecnico.maxticketsimultaneos - tecnico.cargaactual
        }
      };

      res.json({
        success: true,
        data: { tecnico: response }
      });

    } catch (error) {
      console.error('Error al obtener detalle del técnico:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // 🔍 BÚSQUEDA DE TÉCNICOS
  static async searchTecnicos(req, res) {
    try {
      const { q } = req.query;

      const tecnicos = await prisma.usuario.findMany({
        where: {
          idrol: 3,
          activo: true,
          AND: [
            {
              OR: [
                { nombrecompleto: { contains: q } },
                { correo: { contains: q } }
              ]
            }
          ]
        },
        select: {
          id: true,
          nombrecompleto: true,
          disponibilidad: true,
          cargaactual: true
        },
        orderBy: { nombrecompleto: 'asc' }
      });

      res.json({
        success: true,
        data: tecnicos
      });

    } catch (error) {
      console.error('Error en búsqueda de técnicos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // 📊 ESTADÍSTICAS DE UN TÉCNICO
  static async getTecnicoStats(req, res) {
    try {
      const { id } = req.params;

      const stats = await prisma.usuario.findFirst({
        where: {
          id: parseInt(id),
          idrol: 3
        },
        select: {
          cargaactual: true,
          maxticketsimultaneos: true,
          disponibilidad: true,
          _count: {
            select: {
              tiquetesComoTecnico: true
            }
          },
          tiquetesComoTecnico: {
            select: {
              estado: true,
              prioridad: true,
              creadoen: true,
              resueltoen: true
            }
          }
        }
      });

      if (!stats) {
        return res.status(404).json({
          success: false,
          message: 'Técnico no encontrado'
        });
      }

      // Calcular métricas
      const tickets = stats.tiquetesComoTecnico;
      const resueltos = tickets.filter(t => t.estado === 'RESUELTO');
      const enProgreso = tickets.filter(t => t.estado === 'EN_PROGRESO');
      const criticos = tickets.filter(t => t.prioridad === 'CRITICA');

      res.json({
        success: true,
        data: {
          cargaActual: stats.cargaactual,
          capacidadMaxima: stats.maxticketsimultaneos,
          disponibilidad: stats.disponibilidad,
          totalTickets: tickets.length,
          ticketsResueltos: resueltos.length,
          ticketsEnProgreso: enProgreso.length,
          ticketsCriticos: criticos.length,
          porcentajeCapacidad: Math.round((stats.cargaactual / stats.maxticketsimultaneos) * 100),
          eficiencia: tickets.length > 0 ? Math.round((resueltos.length / tickets.length) * 100) : 0
        }
      });

    } catch (error) {
      console.error('Error al obtener estadísticas del técnico:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // 🎯 ESPECIALIDADES DE UN TÉCNICO
  static async getTecnicoEspecialidades(req, res) {
    try {
      const { id } = req.params;

      const especialidades = await prisma.usuarioEspecialidad.findMany({
        where: {
          idusuario: parseInt(id)
        },
        include: {
          especialidad: {
            select: {
              id: true,
              nombre: true,
              descripcion: true
            }
          }
        }
      });

      res.json({
        success: true,
        data: especialidades.map(e => ({
          ...e.especialidad,
          nivelexperiencia: e.nivelexperiencia,
          asignadoen: e.asignadoen
        }))
      });

    } catch (error) {
      console.error('Error al obtener especialidades del técnico:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }


  static async updateDisponibilidad(req, res) {
    try {
      const { id } = req.params;
      const { disponibilidad } = req.body;

      const tecnico = await prisma.usuario.update({
        where: {
          id: parseInt(id)
        },
        data: {
          disponibilidad,
          actualizadoen: new Date()
        },
        select: {
          id: true,
          nombrecompleto: true,
          disponibilidad: true,
          cargaactual: true
        }
      });

      res.json({
        success: true,
        message: 'Disponibilidad actualizada correctamente',
        data: tecnico
      });

    } catch (error) {
      console.error('Error al actualizar disponibilidad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}