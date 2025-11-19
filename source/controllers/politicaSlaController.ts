import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PrismaClient } from "../../generated/prisma";

export class PoliticaSlaController {
  prisma = new PrismaClient();

  // Listado de políticas SLA
  get = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const politicasSla = await this.prisma.politicaSla.findMany({
        where: { activo: true },
        select: {
          id: true,
          nombre: true,
          descripcion: true,
          maxminutosrespuesta: true,
          maxminutosresolucion: true,
          activo: true,
          vigentedesde: true,
          vigentehasta: true
        },
        orderBy: {
          nombre: 'asc'
        }
      });

      const responseData = {
        success: true,
        data: {
          slas: politicasSla,
          total: politicasSla.length
        }
      };

      response.json(responseData);
    } catch (error) {
      next(error);
    }
  };

  // Detalle de política SLA por ID
  getById = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const idSla = parseInt(request.params.id);
      
      if (isNaN(idSla)) {
        return next(AppError.badRequest("El ID no es válido"));
      }

      const politicaSla = await this.prisma.politicaSla.findFirst({
        where: {
          id: idSla,
          activo: true
        },
        select: {
          id: true,
          nombre: true,
          descripcion: true,
          maxminutosrespuesta: true,
          maxminutosresolucion: true,
          activo: true,
          vigentedesde: true,
          vigentehasta: true,
          creadoen: true,
          actualizadoen: true
        }
      });

      if (!politicaSla) {
        return next(AppError.notFound("No existe la política SLA"));
      }

      const responseData = {
        success: true,
        data: {
          sla: politicaSla
        }
      };

      response.json(responseData);
    } catch (error) {
      next(error);
    }
  };
}

