import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PrismaClient } from "../../generated/prisma";

export class CategoriaController {
  prisma = new PrismaClient();

  // Listado de categorías - máximo 3 campos según requerimiento
  // Retorna estructura: { success: boolean, data: { categorias: CategoriaListItem[] } }
  get = async (request: Request, response: Response, next: NextFunction) => {
    try {
      // Obtener todas las categorías con información básica
      const listadoCategorias = await this.prisma.categoria.findMany({
        select: {
          id: true,
          nombre: true,
          activo: true,
          politicaSla: {
            select: {
              nombre: true,
              maxminutosrespuesta: true
            }
          }
        },
        orderBy: {
          nombre: "asc"
        }
      });

      // Estructura esperada por el servicio frontend
      const responseData = {
        success: true,
        data: {
          categorias: listadoCategorias,
          total: listadoCategorias.length,
          page: 1,
          limit: listadoCategorias.length,
          totalPages: 1
        }
      };

      response.json(responseData);
    } catch (error) {
      next(error);
    }
  };

  // Detalle completo de la categoría por ID
  // Retorna estructura: { success: boolean, data: { categoria: CategoriaDetail } }
  getById = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const idCategoria = parseInt(request.params.id);
      
      if (isNaN(idCategoria)) {
        return next(AppError.badRequest("El ID no es válido"));
      }

      const categoria = await this.prisma.categoria.findFirst({
        where: {
          id: idCategoria
        },
        include: {
          // Información del SLA
          politicaSla: {
            select: {
              id: true,
              nombre: true,
              descripcion: true,
              maxminutosrespuesta: true,
              maxminutosresolucion: true,
              activo: true,
              vigentedesde: true,
              vigentehasta: true
            }
          },
          // Lista de etiquetas asociadas
          etiquetas: {
            include: {
              etiqueta: {
                select: {
                  id: true,
                  nombre: true,
                  descripcion: true
                }
              }
            }
          },
          // Lista de especialidades asociadas
          especialidades: {
            include: {
              especialidad: {
                select: {
                  id: true,
                  nombre: true,
                  descripcion: true,
                  activo: true
                }
              }
            }
          },
          // Estadísticas: contar tickets asociados
          tiquetes: {
            select: {
              id: true,
              estado: true,
              prioridad: true
            }
          }
        }
      });

      if (!categoria) {
        return next(AppError.notFound("No existe la categoría"));
      }

      // Calcular estadísticas básicas
      const ticketsTotal = categoria.tiquetes.length;
      const ticketsAbiertos = categoria.tiquetes.filter(t => 
        ['ABIERTO', 'ASIGNADO', 'EN_PROGRESO', 'PENDIENTE'].includes(t.estado)
      ).length;
      const ticketsResueltos = categoria.tiquetes.filter(t => 
        ['RESUELTO', 'CERRADO'].includes(t.estado)
      ).length;
      const ticketsCriticos = categoria.tiquetes.filter(t => 
        t.prioridad === 'CRITICA'
      ).length;

      // Formatear etiquetas según la estructura esperada
      const etiquetas = categoria.etiquetas.map(etiq => ({
        id: etiq.etiqueta.id,
        nombre: etiq.etiqueta.nombre,
        descripcion: etiq.etiqueta.descripcion
      }));

      // Formatear especialidades según la estructura esperada
      const especialidades = categoria.especialidades.map(esp => ({
        id: esp.especialidad.id,
        nombre: esp.especialidad.nombre,
        descripcion: esp.especialidad.descripcion,
        activo: esp.especialidad.activo
      }));

      // Estructura de datos según CategoriaDetail interface
      const categoriaDetail = {
        // Información básica de la categoría
        id: categoria.id,
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        idsla: categoria.idsla,
        activo: categoria.activo,
        
        // Información del SLA (requerimiento específico)
        sla: {
          id: categoria.politicaSla.id,
          nombre: categoria.politicaSla.nombre,
          descripcion: categoria.politicaSla.descripcion,
          maxminutosrespuesta: categoria.politicaSla.maxminutosrespuesta,
          maxminutosresolucion: categoria.politicaSla.maxminutosresolucion,
          tiempoRespuestaHoras: Math.round(categoria.politicaSla.maxminutosrespuesta / 60 * 10) / 10,
          tiempoResolucionHoras: Math.round(categoria.politicaSla.maxminutosresolucion / 60 * 10) / 10,
          activo: categoria.politicaSla.activo,
          vigentedesde: categoria.politicaSla.vigentedesde,
          vigentehasta: categoria.politicaSla.vigentehasta
        },
        
        // Lista de etiquetas formateada (requerimiento)
        etiquetas: etiquetas,
        
        // Lista de especialidades formateada (requerimiento)
        especialidades: especialidades,
        
        // Estadísticas calculadas
        estadisticas: {
          ticketsTotal: ticketsTotal,
          ticketsAbiertos: ticketsAbiertos,
          ticketsResueltos: ticketsResueltos,
          ticketsCriticos: ticketsCriticos,
          porcentajeResolucion: ticketsTotal > 0 ? Math.round((ticketsResueltos / ticketsTotal) * 100) : 0
        }
      };

      // Estructura esperada por el servicio frontend
      const responseData = {
        success: true,
        data: {
          categoria: categoriaDetail
        }
      };

      response.status(200).json(responseData);
    } catch (error: any) {
      next(error);
    }
  };

  // Búsqueda de categorías por nombre
  search = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { q } = request.query;

      if (typeof q !== "string" || q.trim() === "") {
        return next(AppError.badRequest("El término de búsqueda es requerido"));
      }

      const searchTerm: string = q as string;
      
      const categorias = await this.prisma.categoria.findMany({
        where: {
          AND: [
            {
              activo: true
            },
            {
              OR: [
                {
                  nombre: {
                    contains: searchTerm,
                    mode: "insensitive"
                  } as any
                },
                {
                  descripcion: {
                    contains: searchTerm,
                    mode: "insensitive"
                  } as any
                }
              ]
            }
          ]
        },
        select: {
          id: true,
          nombre: true,
          activo: true,
          politicaSla: {
            select: {
              nombre: true,
              maxminutosrespuesta: true
            }
          }
        },
        orderBy: {
          nombre: "asc"
        }
      });

      response.json(categorias);
    } catch (error) {
      next(error);
    }
  };

  // Obtener categorías activas (para selects/dropdowns)
  getActivas = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const categoriasActivas = await this.prisma.categoria.findMany({
        where: {
          activo: true
        },
        select: {
          id: true,
          nombre: true,
          descripcion: true,
          politicaSla: {
            select: {
              nombre: true,
              maxminutosrespuesta: true,
              maxminutosresolucion: true
            }
          }
        },
        orderBy: {
          nombre: "asc"
        }
      });

      response.json(categoriasActivas);
    } catch (error) {
      next(error);
    }
  };

  // Obtener estadísticas de una categoría
  getEstadisticas = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const idCategoria = parseInt(request.params.id);
      
      if (isNaN(idCategoria)) {
        return next(AppError.badRequest("El ID no es válido"));
      }

      // Verificar que la categoría existe
      const categoria = await this.prisma.categoria.findFirst({
        where: {
          id: idCategoria
        },
        include: {
          politicaSla: true
        }
      });

      if (!categoria) {
        return next(AppError.notFound("No existe la categoría"));
      }

      // Obtener estadísticas de tickets
      const [ticketsTotal, ticketsPorEstado, ticketsPorPrioridad, promedioValoracion] = await Promise.all([
        this.prisma.tiquete.count({
          where: {
            idcategoria: idCategoria
          }
        }),
        
        this.prisma.tiquete.groupBy({
          by: ['estado'],
          where: {
            idcategoria: idCategoria
          },
          _count: true
        }),
        
        this.prisma.tiquete.groupBy({
          by: ['prioridad'],
          where: {
            idcategoria: idCategoria
          },
          _count: true
        }),
        
        this.prisma.valoracionServicio.aggregate({
          where: {
            tiquete: {
              idcategoria: idCategoria
            }
          },
          _avg: {
            calificacion: true
          }
        })
      ]);

      const estadisticas = {
        categoria: {
          id: categoria.id,
          nombre: categoria.nombre
        },
        tickets: {
          total: ticketsTotal,
          porEstado: ticketsPorEstado.reduce((acc, item) => {
            acc[item.estado] = item._count;
            return acc;
          }, {} as any),
          porPrioridad: ticketsPorPrioridad.reduce((acc, item) => {
            acc[item.prioridad] = item._count;
            return acc;
          }, {} as any)
        },
        sla: {
          nombre: categoria.politicaSla.nombre,
          tiempoRespuesta: categoria.politicaSla.maxminutosrespuesta,
          tiempoResolucion: categoria.politicaSla.maxminutosresolucion
        },
        satisfaccion: {
          promedioValoracion: promedioValoracion._avg.calificacion || 0
        }
      };

      response.json(estadisticas);
    } catch (error) {
      next(error);
    }
  };
}