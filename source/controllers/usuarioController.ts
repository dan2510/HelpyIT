import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PrismaClient, RoleNombre } from "../../generated/prisma";

export class UsuarioController {
  prisma = new PrismaClient();

  // OBTENER INFORMACIÓN DEL USUARIO POR ID
  getById = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const idUsuario = parseInt(request.params.id);
      
      if (isNaN(idUsuario)) {
        return next(AppError.badRequest("El ID de usuario no es válido"));
      }

      const usuario = await this.prisma.usuario.findUnique({
        where: { id: idUsuario },
        select: {
          id: true,
          nombrecompleto: true,
          correo: true,
          telefono: true
        }
      });

      if (!usuario) {
        return next(AppError.notFound('Usuario no encontrado'));
      }

      response.json({
        success: true,
        data: { usuario }
      });
    } catch (error) {
      next(error);
    }
  };

  // OBTENER TODOS LOS CLIENTES
  getClientes = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const clientes = await this.prisma.usuario.findMany({
        where: {
          rol: {
            nombre: RoleNombre.CLIENTE
          },
          activo: true
        },
        select: {
          id: true,
          nombrecompleto: true,
          correo: true
        },
        orderBy: {
          nombrecompleto: 'asc'
        }
      });

      response.json({
        success: true,
        data: { clientes }
      });
    } catch (error) {
      next(error);
    }
  };
}

