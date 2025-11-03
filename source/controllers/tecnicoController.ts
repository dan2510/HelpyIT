import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PrismaClient, RoleNombre } from "../../generated/prisma";

export class TecnicoController {
  prisma = new PrismaClient();

  // Listado de técnicos - máximo 3 campos según requerimiento
  get = async (request: Request, response: Response, next: NextFunction) => {
    try {
      // Obtener todos los usuarios con rol TECNICO
      const listadoTecnicos = await this.prisma.usuario.findMany({
        where: {
          rol: {
            nombre: RoleNombre.TECNICO
          },
          activo: true
        },
        select: {
          id: true,
          nombrecompleto: true,
          disponibilidad: true,
          cargaactual: true
        },
        orderBy: {
          nombrecompleto: "asc"
        }
      });

      response.json(listadoTecnicos);
    } catch (error) {
      next(error);
    }
  };

  // Detalle completo del técnico por ID
  getById = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const idTecnico = parseInt(request.params.id);
      
      if (isNaN(idTecnico)) {
        return next(AppError.badRequest("El ID no es válido"));
      }

      const tecnico = await this.prisma.usuario.findFirst({
        where: {
          id: idTecnico,
          rol: {
            nombre: RoleNombre.TECNICO
          },
          activo: true
        },
        include: {
          rol: {
            select: {
              nombre: true,
              descripcion: true
            }
          },
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
          tiquetesComoTecnico: {
            where: {
              estado: {
                in: ["ABIERTO", "EN_PROGRESO", "ASIGNADO", "PENDIENTE"]
              }
            },
            select: {
              id: true,
              titulo: true,
              estado: true,
              prioridad: true
            }
          }
        }
      });

      if (!tecnico) {
        return next(AppError.notFound("No existe el técnico"));
      }

      // Formatear la respuesta según los requerimientos
      const response_data = {
        // Información personal del técnico
        id: tecnico.id,
        nombrecompleto: tecnico.nombrecompleto,
        correo: tecnico.correo,
        telefono: tecnico.telefono,
        activo: tecnico.activo,
        
        // Carga de trabajo y disponibilidad
        disponibilidad: tecnico.disponibilidad,
        cargaactual: tecnico.cargaactual,
        maxticketsimultaneos: tecnico.maxticketsimultaneos,
        
        // Información del rol
        rol: tecnico.rol,
        
        // Lista de especialidades
        especialidades: tecnico.especialidades.map(esp => ({
          id: esp.especialidad.id,
          nombre: esp.especialidad.nombre,
          descripcion: esp.especialidad.descripcion,
          nivelexperiencia: esp.nivelexperiencia,
          asignadoen: esp.asignadoen
        })),
        
        // Tickets activos asignados
        ticketsActivos: tecnico.tiquetesComoTecnico,
        
        // Fechas de gestión
        creadoen: tecnico.creadoen,
        actualizadoen: tecnico.actualizadoen,
        ultimoiniciosesion: tecnico.ultimoiniciosesion
      };

      response.status(200).json(response_data);
    } catch (error: any) {
      next(error);
    }
  };

  // Búsqueda de técnicos por nombre o especialidad
  search = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { termino } = request.query;

      if (typeof termino !== "string" || termino.trim() === "") {
        return next(AppError.badRequest("El término de búsqueda es requerido"));
      }

      const searchTerm: string = termino as string;
      
      const tecnicos = await this.prisma.usuario.findMany({
        where: {
          AND: [
            {
              rol: {
                nombre: RoleNombre.TECNICO
              }
            },
            {
              activo: true
            },
            {
              OR: [
                {
                  nombrecompleto: {
                    contains: searchTerm,
                    mode: "insensitive"
                  } as any
                },
                {
                  especialidades: {
                    some: {
                      especialidad: {
                        nombre: {
                          contains: searchTerm
                        }
                      }
                    }
                  }
                }
              ]
            }
          ]
        },
        select: {
          id: true,
          nombrecompleto: true,
          disponibilidad: true,
          cargaactual: true,
          especialidades: {
            select: {
              especialidad: {
                select: {
                  nombre: true
                }
              }
            }
          }
        },
        orderBy: {
          nombrecompleto: "asc"
        }
      });

      response.json(tecnicos);
    } catch (error) {
      next(error);
    }
  };

  // Obtener técnicos disponibles (para asignaciones)
  getDisponibles = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const tecnicosDisponibles = await this.prisma.usuario.findMany({
        where: {
          rol: {
            nombre: RoleNombre.TECNICO
          },
          activo: true,
          disponibilidad: "DISPONIBLE"
        },
        select: {
          id: true,
          nombrecompleto: true,
          cargaactual: true,
          maxticketsimultaneos: true,
          especialidades: {
            select: {
              especialidad: {
                select: {
                  nombre: true
                }
              },
              nivelexperiencia: true
            }
          }
        },
        orderBy: [
          { cargaactual: "asc" },
          { nombrecompleto: "asc" }
        ]
      });

      response.json(tecnicosDisponibles);
    } catch (error) {
      next(error);
    }
  };

  // Obtener estadísticas de un técnico
  getEstadisticas = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const idTecnico = parseInt(request.params.id);
      
      if (isNaN(idTecnico)) {
        return next(AppError.badRequest("El ID no es válido"));
      }

      // Verificar que el técnico existe
      const tecnico = await this.prisma.usuario.findFirst({
        where: {
          id: idTecnico,
          rol: {
            nombre: RoleNombre.TECNICO
          }
        }
      });

      if (!tecnico) {
        return next(AppError.notFound("No existe el técnico"));
      }

      // Obtener estadísticas
      const [ticketsTotal, ticketsResueltos, ticketsEnProceso, promedioValoracion] = await Promise.all([
        // Total de tickets asignados
        this.prisma.tiquete.count({
          where: {
            idtecnicoactual: idTecnico
          }
        }),
        
        // Tickets resueltos
        this.prisma.tiquete.count({
          where: {
            idtecnicoactual: idTecnico,
            estado: "RESUELTO"
          }
        }),
        
        // Tickets en proceso
        this.prisma.tiquete.count({
          where: {
            idtecnicoactual: idTecnico,
            estado: {
              in: ["EN_PROGRESO", "ASIGNADO", "PENDIENTE"]
            }
          }
        }),
        
        // Promedio de valoración
        this.prisma.valoracionServicio.aggregate({
          where: {
            tiquete: {
              idtecnicoactual: idTecnico
            }
          },
          _avg: {
            calificacion: true
          }
        })
      ]);

      const estadisticas = {
        tecnico: {
          id: tecnico.id,
          nombre: tecnico.nombrecompleto
        },
        tickets: {
          total: ticketsTotal,
          resueltos: ticketsResueltos,
          enProceso: ticketsEnProceso,
          cerrados: ticketsTotal - ticketsResueltos - ticketsEnProceso
        },
        rendimiento: {
          promedioValoracion: promedioValoracion._avg.calificacion || 0,
          porcentajeResolucion: ticketsTotal > 0 ? ((ticketsResueltos / ticketsTotal) * 100) : 0
        }
      };

      response.json(estadisticas);
    } catch (error) {
      next(error);
    }
  };
}