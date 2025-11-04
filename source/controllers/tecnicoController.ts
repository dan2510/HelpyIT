import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PrismaClient, RoleNombre } from "../../generated/prisma";

export class TecnicoController {
  prisma = new PrismaClient();

  // Listado de técnicos -
  // Retorna estructura: { success: boolean, data: { tecnicos: TecnicoListItem[] } }
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

      // Estructura esperada por el servicio frontend
      const responseData = {
        success: true,
        data: {
          tecnicos: listadoTecnicos,
          total: listadoTecnicos.length,
          page: 1,
          limit: listadoTecnicos.length,
          totalPages: 1
        }
      };

      response.json(responseData);
    } catch (error) {
      next(error);
    }
  };

  // Detalle completo del técnico por ID
  // Retorna estructura: { success: boolean, data: { tecnico: TecnicoDetail } }
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

      // Calcular estadísticas básicas
      const [ticketsTotal, ticketsResueltos, ticketsEnProgreso] = await Promise.all([
        this.prisma.tiquete.count({
          where: { idtecnicoactual: idTecnico }
        }),
        this.prisma.tiquete.count({
          where: { idtecnicoactual: idTecnico, estado: "RESUELTO" }
        }),
        this.prisma.tiquete.count({
          where: { 
            idtecnicoactual: idTecnico,
            estado: { in: ["EN_PROGRESO", "ASIGNADO", "PENDIENTE"] }
          }
        })
      ]);

      // Formatear especialidades según la estructura esperada
      const especialidades = tecnico.especialidades.map(esp => ({
        id: esp.especialidad.id,
        nombre: esp.especialidad.nombre,
        descripcion: esp.especialidad.descripcion,
        nivelexperiencia: esp.nivelexperiencia,
        asignadoen: esp.asignadoen
      }));

      // Formatear tickets activos
      const ticketsActivos = tecnico.tiquetesComoTecnico.map(ticket => ({
        id: ticket.id,
        titulo: ticket.titulo,
        estado: ticket.estado,
        prioridad: ticket.prioridad
      }));

      // Estructura de datos según TecnicoDetail interface
      const tecnicoDetail = {
        // Información personal del técnico
        id: tecnico.id,
        correo: tecnico.correo,
        nombrecompleto: tecnico.nombrecompleto,
        telefono: tecnico.telefono,
        idrol: tecnico.idrol,
        activo: tecnico.activo,
        ultimoiniciosesion: tecnico.ultimoiniciosesion,
        creadoen: tecnico.creadoen,
        actualizadoen: tecnico.actualizadoen,
        disponibilidad: tecnico.disponibilidad,
        cargaactual: tecnico.cargaactual,
        maxticketsimultaneos: tecnico.maxticketsimultaneos,
        
        // Información del rol
        rol: tecnico.rol,
        
        // Lista de especialidades formateada
        especialidades: especialidades,
        
        // Tickets activos asignados
        ticketsActivos: ticketsActivos,
        
        // Estadísticas calculadas
        estadisticas: {
          ticketsTotal: ticketsTotal,
          ticketsResueltos: ticketsResueltos,
          ticketsEnProgreso: ticketsEnProgreso,
          porcentajeEfectividad: ticketsTotal > 0 ? Math.round((ticketsResueltos / ticketsTotal) * 100) : 0
        }
      };

      // Estructura esperada por el servicio frontend
      const responseData = {
        success: true,
        data: {
          tecnico: tecnicoDetail
        }
      };

      response.status(200).json(responseData);
    } catch (error: any) {
      next(error);
    }
  };

  // Búsqueda de técnicos por nombre o especialidad
  search = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { q } = request.query;

      if (typeof q !== "string" || q.trim() === "") {
        return next(AppError.badRequest("El término de búsqueda es requerido"));
      }

      const searchTerm: string = q as string;
      
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
          cargaactual: true
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
        this.prisma.tiquete.count({
          where: {
            idtecnicoactual: idTecnico
          }
        }),
        
        this.prisma.tiquete.count({
          where: {
            idtecnicoactual: idTecnico,
            estado: "RESUELTO"
          }
        }),
        
        this.prisma.tiquete.count({
          where: {
            idtecnicoactual: idTecnico,
            estado: {
              in: ["EN_PROGRESO", "ASIGNADO", "PENDIENTE"]
            }
          }
        }),
        
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