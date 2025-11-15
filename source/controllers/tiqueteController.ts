import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PrismaClient, RoleNombre } from "../../generated/prisma";

export class TiqueteController {
  prisma = new PrismaClient();

  // Listado de tiquetes según el rol del usuario
  // Retorna estructura: { success: boolean, data: { tiquetes: TiqueteListItem[] } }
  getTiquetesPorUsuario = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const idUsuario = parseInt(request.params.idUsuario);
      
      if (isNaN(idUsuario)) {
        return next(AppError.badRequest("El ID de usuario no es válido"));
      }

      // Obtener el usuario y su rol
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: idUsuario },
        include: {
          rol: true
        }
      });

      if (!usuario) {
        return next(AppError.notFound("Usuario no encontrado"));
      }

      let tiquetes;
      
      // Filtrar según el rol del usuario
      switch (usuario.rol.nombre) {
        case RoleNombre.ADMIN:
          // Administrador ve todos los tiquetes
          tiquetes = await this.prisma.tiquete.findMany({
            select: {
              id: true,
              titulo: true,
              estado: true,
              prioridad: true,
              creadoen: true,
              categoria: {
                select: {
                  nombre: true,
                  descripcion: true
                }
              },
              cliente: {
                select: {
                  nombrecompleto: true,
                  correo: true
                }
              },
              tecnicoActual: {
                select: {
                  nombrecompleto: true,
                  correo: true
                }
              }
            },
            orderBy: {
              id: 'asc'
            }
          });
          break;

        case RoleNombre.CLIENTE:
          // Cliente ve solo sus propios tiquetes
          tiquetes = await this.prisma.tiquete.findMany({
            where: {
              idcliente: idUsuario
            },
            select: {
              id: true,
              titulo: true,
              estado: true,
              prioridad: true,
              creadoen: true,
              categoria: {
                select: {
                  nombre: true,
                  descripcion: true
                }
              },
              tecnicoActual: {
                select: {
                  nombrecompleto: true,
                  correo: true
                }
              }
            },
            orderBy: {
              id: 'asc'
            }
          });
          break;

        case RoleNombre.TECNICO:
          // Técnico ve solo los tiquetes asignados a él
          tiquetes = await this.prisma.tiquete.findMany({
            where: {
              idtecnicoactual: idUsuario
            },
            select: {
              id: true,
              titulo: true,
              estado: true,
              prioridad: true,
              creadoen: true,
              categoria: {
                select: {
                  nombre: true,
                  descripcion: true
                }
              },
              cliente: {
                select: {
                  nombrecompleto: true,
                  correo: true
                }
              }
            },
            orderBy: {
              id: 'asc'
            }
          });
          break;

        default:
          return next(AppError.forbidden("Rol no autorizado"));
      }

      const responseData = {
        success: true,
        data: {
          tiquetes: tiquetes,
          total: tiquetes.length,
          page: 1,
          limit: tiquetes.length,
          totalPages: 1,
          rol: usuario.rol.nombre
        }
      };

      response.json(responseData);
    } catch (error) {
      next(error);
    }
  };

  // Detalle completo del tiquete por ID
  getById = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const idTiquete = parseInt(request.params.id);
      
      if (isNaN(idTiquete)) {
        return next(AppError.badRequest("El ID no es válido"));
      }

      const tiquete = await this.prisma.tiquete.findFirst({
        where: {
          id: idTiquete
        },
        include: {
          // Categoría con SLA
          categoria: {
            include: {
              politicaSla: {
                select: {
                  nombre: true,
                  descripcion: true,
                  maxminutosrespuesta: true,
                  maxminutosresolucion: true
                }
              }
            }
          },
          // Cliente que creó el ticket
          cliente: {
            select: {
              id: true,
              nombrecompleto: true,
              correo: true,
              telefono: true
            }
          },
          // Técnico asignado
          tecnicoActual: {
            select: {
              id: true,
              nombrecompleto: true,
              correo: true,
              telefono: true
            }
          },
          // Historial de estados con imágenes
          historiales: {
            include: {
              usuarioCambio: {
                select: {
                  id: true,
                  nombrecompleto: true,
                  correo: true,
                  telefono: true
                }
              },
              imagenes: {
                include: {
                  usuario: {
                    select: {
                      id: true,
                      nombrecompleto: true,
                      correo: true
                    }
                  }
                }
              }
            },
            orderBy: {
              cambiadoen: 'desc'
            }
          },
          // Valoraciones
          valoraciones: {
            include: {
              cliente: {
                select: {
                  id: true,
                  nombrecompleto: true,
                  correo: true
                }
              }
            }
          }
        }
      });

      if (!tiquete) {
        return next(AppError.notFound("No existe el tiquete"));
      }

      // Calcular días de resolución
      let diasResolucion = null;
      if (tiquete.resueltoen) {
        const diffTime = Math.abs(new Date(tiquete.resueltoen).getTime() - new Date(tiquete.creadoen).getTime());
        diasResolucion = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      // Calcular horas de respuesta
      let horasRespuesta = null;
      if (tiquete.primerarespuestaen) {
        const diffTime = Math.abs(new Date(tiquete.primerarespuestaen).getTime() - new Date(tiquete.creadoen).getTime());
        horasRespuesta = Math.round(diffTime / (1000 * 60 * 60) * 10) / 10;
      }

      // Calcular horas de resolución
      let horasResolucion = null;
      if (tiquete.resueltoen) {
        const diffTime = Math.abs(new Date(tiquete.resueltoen).getTime() - new Date(tiquete.creadoen).getTime());
        horasResolucion = Math.round(diffTime / (1000 * 60 * 60) * 10) / 10;
      }

      // Formatear historial
      const historiales = tiquete.historiales.map(hist => ({
        id: hist.id,
        estadoanterior: hist.estadoanterior,
        estadonuevo: hist.estadonuevo,
        observacion: hist.observacion,
        cambiadoen: hist.cambiadoen,
        cambiadopor: hist.usuarioCambio,
        imagenes: hist.imagenes.map(img => ({
          id: img.id,
          rutaarchivo: img.rutaarchivo,
          subidoen: img.subidoen,
          subidopor: img.usuario
        }))
      }));

      // Formatear valoraciones
      const valoraciones = tiquete.valoraciones.map(val => ({
        id: val.id,
        calificacion: val.calificacion,
        comentario: val.comentario,
        creadaen: val.creadaen,
        cliente: val.cliente
      }));

      // Estructura de datos según TiqueteDetalle interface
      const tiqueteDetail = {
        // Información básica
        id: tiquete.id,
        titulo: tiquete.titulo,
        descripcion: tiquete.descripcion,
        prioridad: tiquete.prioridad,
        estado: tiquete.estado,
        
        // Fechas
        creadoen: tiquete.creadoen,
        primerarespuestaen: tiquete.primerarespuestaen,
        resueltoen: tiquete.resueltoen,
        cerradoen: tiquete.cerradoen,
        vencerespuesta: tiquete.vencerespuesta,
        venceresolucion: tiquete.venceresolucion,
        
        // Relaciones
        categoria: {
          id: tiquete.categoria.id,
          nombre: tiquete.categoria.nombre,
          descripcion: tiquete.categoria.descripcion
        },
        cliente: tiquete.cliente,
        tecnicoActual: tiquete.tecnicoActual || null,
        
        // SLA
        sla: {
          nombre: tiquete.categoria.politicaSla.nombre,
          descripcion: tiquete.categoria.politicaSla.descripcion,
          maxminutosrespuesta: tiquete.categoria.politicaSla.maxminutosrespuesta,
          maxminutosresolucion: tiquete.categoria.politicaSla.maxminutosresolucion,
          tiempoRespuestaHoras: Math.round(tiquete.categoria.politicaSla.maxminutosrespuesta / 60 * 10) / 10,
          tiempoResolucionHoras: Math.round(tiquete.categoria.politicaSla.maxminutosresolucion / 60 * 10) / 10
        },
        
        // Cumplimiento SLA calculado
        cumplimiento: {
          cumplioslarespuesta: tiquete.cumplioslarespuesta,
          cumplioslaresolucion: tiquete.cumplioslaresolucion,
          diasResolucion: diasResolucion,
          horasRespuesta: horasRespuesta,
          horasResolucion: horasResolucion
        },
        
        // Historial y valoraciones
        historiales: historiales,
        valoraciones: valoraciones
      };

      const responseData = {
        success: true,
        data: {
          tiquete: tiqueteDetail
        }
      };

      response.status(200).json(responseData);
    } catch (error: any) {
      next(error);
    }
  };

  // Listado general de todos los tiquetes (solo para admin)
  get = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const listadoTiquetes = await this.prisma.tiquete.findMany({
        select: {
          id: true,
          titulo: true,
          estado: true,
          prioridad: true,
          creadoen: true,
          categoria: {
            select: {
              nombre: true,
              descripcion: true
            }
          },
          cliente: {
            select: {
              nombrecompleto: true,
              correo: true
            }
          },
          tecnicoActual: {
            select: {
              nombrecompleto: true,
              correo: true
            }
          }
        },
        orderBy: {
          id: 'asc'
        }
      });

      const responseData = {
        success: true,
        data: {
          tiquetes: listadoTiquetes,
          total: listadoTiquetes.length,
          page: 1,
          limit: listadoTiquetes.length,
          totalPages: 1
        }
      };

      response.json(responseData);
    } catch (error) {
      next(error);
    }
  };
}