import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PrismaClient } from "../../generated/prisma";

export class EspecialidadController {
  prisma = new PrismaClient();

  // Obtener todas las especialidades
  get = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const especialidades = await this.prisma.especialidad.findMany({
        select: {
          id: true,
          nombre: true,
          descripcion: true
        },
        orderBy: {
          nombre: "asc"
        }
      });

      const responseData = {
        success: true,
        data: {
          especialidades: especialidades,
          total: especialidades.length
        }
      };

      response.json(responseData);
    } catch (error) {
      console.error("Error al obtener especialidades:", error);
      next(AppError.internalServer("Error al obtener las especialidades"));
    }
  };

  // Obtener especialidad por ID
  getById = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const idEspecialidad = parseInt(request.params.id);
      
      if (isNaN(idEspecialidad)) {
        return next(AppError.badRequest("El ID no es válido"));
      }

      const especialidad = await this.prisma.especialidad.findUnique({
        where: {
          id: idEspecialidad
        },
        include: {
          usuarios: {
            include: {
              usuario: {
                select: {
                  id: true,
                  nombrecompleto: true,
                  disponibilidad: true
                }
              }
            }
          }
        }
      });

      if (!especialidad) {
        return next(AppError.notFound("Especialidad no encontrada"));
      }

      const responseData = {
        success: true,
        data: {
          especialidad: especialidad
        }
      };

      response.json(responseData);
    } catch (error) {
      console.error("Error al obtener especialidad:", error);
      next(AppError.internalServer("Error al obtener la especialidad"));
    }
  };
}