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
          }
        }
      });

      if (!categoria) {
        return next(AppError.notFound("No existe la categoría"));
      }

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
        especialidades: especialidades
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

}