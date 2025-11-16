import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PrismaClient } from "../../generated/prisma";

export class EtiquetaController {
  prisma = new PrismaClient();

  // Obtener todas las etiquetas con su categoría asociada
  get = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const etiquetas = await this.prisma.etiqueta.findMany({
        include: {
          categorias: {
            include: {
              categoria: {
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
                }
              }
            }
          }
        },
        orderBy: {
          nombre: "asc"
        }
      });

      const responseData = {
        success: true,
        data: {
          etiquetas: etiquetas,
          total: etiquetas.length
        }
      };

      response.json(responseData);
    } catch (error) {
      console.error("Error al obtener etiquetas:", error);
      next(AppError.internalServer("Error al obtener las etiquetas"));
    }
  };

  // Obtener etiqueta por ID
  getById = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const idEtiqueta = parseInt(request.params.id);
      
      if (isNaN(idEtiqueta)) {
        return next(AppError.badRequest("El ID no es válido"));
      }

      const etiqueta = await this.prisma.etiqueta.findUnique({
        where: {
          id: idEtiqueta
        },
        include: {
          categorias: {
            include: {
              categoria: {
                include: {
                  politicaSla: true
                }
              }
            }
          }
        }
      });

      if (!etiqueta) {
        return next(AppError.notFound("Etiqueta no encontrada"));
      }

      const responseData = {
        success: true,
        data: {
          etiqueta: etiqueta
        }
      };

      response.json(responseData);
    } catch (error) {
      console.error("Error al obtener etiqueta:", error);
      next(AppError.internalServer("Error al obtener la etiqueta"));
    }
  };

  // Buscar etiquetas por texto (para el filtro del formulario)
  search = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { query } = request.query;
      
      const whereCondition = query 
        ? {
            OR: [
              {
                nombre: {
                  contains: String(query),
                  mode: 'insensitive' as const
                }
              },
              {
                descripcion: {
                  contains: String(query),
                  mode: 'insensitive' as const
                }
              }
            ]
          }
        : {};

      const etiquetas = await this.prisma.etiqueta.findMany({
        where: whereCondition,
        include: {
          categorias: {
            include: {
              categoria: {
                select: {
                  id: true,
                  nombre: true,
                  descripcion: true
                }
              }
            }
          }
        },
        orderBy: {
          nombre: "asc"
        },
        take: 20 // Limitar a 20 resultados para el autocompletado
      });

      const responseData = {
        success: true,
        data: {
          etiquetas: etiquetas,
          total: etiquetas.length
        }
      };

      response.json(responseData);
    } catch (error) {
      console.error("Error al buscar etiquetas:", error);
      next(AppError.internalServer("Error al buscar etiquetas"));
    }
  };
}