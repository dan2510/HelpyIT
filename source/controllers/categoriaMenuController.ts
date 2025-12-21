import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PrismaClient } from "../../generated/prisma";

export class CategoriaMenuController {
  prisma = new PrismaClient();

  // Listado de categorías de menú
  get = async (request: Request, response: Response, next: NextFunction) => {
    try {
      console.log('📋 [CATEGORIAS] GET /categorias-menu - Petición recibida');
      
      const categorias = await this.prisma.categoriaMenu.findMany({
        where: {
          activo: true
        },
        include: {
          itemsMenu: {
            where: {
              activo: true,
              disponible: true // Solo mostrar productos disponibles para los clientes
            },
            orderBy: {
              nombre: 'asc'
            }
          }
        },
        orderBy: {
          orden: 'asc'
        }
      });

      console.log(`✅ [CATEGORIAS] Encontradas ${categorias.length} categorías activas`);

      const responseData = {
        success: true,
        data: {
          categorias: categorias,
          total: categorias.length
        }
      };

      response.json(responseData);
    } catch (error) {
      console.error('❌ [CATEGORIAS] Error al obtener categorías:', error);
      next(error);
    }
  };

  // Detalle de categoría por ID
  getById = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const idCategoria = parseInt(request.params.id);
      
      if (isNaN(idCategoria)) {
        return next(AppError.badRequest("El ID no es válido"));
      }

      const categoria = await this.prisma.categoriaMenu.findUnique({
        where: { id: idCategoria },
        include: {
          itemsMenu: {
            where: {
              activo: true,
              disponible: true // Solo mostrar productos disponibles para los clientes
            },
            orderBy: {
              nombre: 'asc'
            }
          }
        }
      });

      if (!categoria) {
        return next(AppError.notFound("Categoría no encontrada"));
      }

      const responseData = {
        success: true,
        data: { categoria }
      };

      response.json(responseData);
    } catch (error) {
      next(error);
    }
  };

  // Crear nueva categoría (solo admin)
  create = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { nombre, descripcion, orden } = request.body;

      if (!nombre) {
        return next(AppError.badRequest("El nombre es requerido"));
      }

      const categoria = await this.prisma.categoriaMenu.create({
        data: {
          nombre,
          descripcion: descripcion || null,
          orden: orden || 0
        }
      });

      const responseData = {
        success: true,
        data: { categoria }
      };

      response.status(201).json(responseData);
    } catch (error) {
      next(error);
    }
  };

  // Actualizar categoría (solo admin)
  update = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const idCategoria = parseInt(request.params.id);
      const { nombre, descripcion, activo, orden } = request.body;

      if (isNaN(idCategoria)) {
        return next(AppError.badRequest("El ID no es válido"));
      }

      const categoria = await this.prisma.categoriaMenu.findUnique({
        where: { id: idCategoria }
      });

      if (!categoria) {
        return next(AppError.notFound("Categoría no encontrada"));
      }

      const categoriaActualizada = await this.prisma.categoriaMenu.update({
        where: { id: idCategoria },
        data: {
          nombre: nombre !== undefined ? nombre : categoria.nombre,
          descripcion: descripcion !== undefined ? descripcion : categoria.descripcion,
          activo: activo !== undefined ? activo : categoria.activo,
          orden: orden !== undefined ? orden : categoria.orden
        }
      });

      const responseData = {
        success: true,
        data: { categoria: categoriaActualizada }
      };

      response.json(responseData);
    } catch (error) {
      next(error);
    }
  };

  // Eliminar categoría (solo admin - soft delete)
  delete = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const idCategoria = parseInt(request.params.id);

      if (isNaN(idCategoria)) {
        return next(AppError.badRequest("El ID no es válido"));
      }

      const categoria = await this.prisma.categoriaMenu.findUnique({
        where: { id: idCategoria }
      });

      if (!categoria) {
        return next(AppError.notFound("Categoría no encontrada"));
      }

      // Soft delete - solo desactivar
      const categoriaEliminada = await this.prisma.categoriaMenu.update({
        where: { id: idCategoria },
        data: {
          activo: false
        }
      });

      const responseData = {
        success: true,
        data: { categoria: categoriaEliminada },
        message: "Categoría desactivada exitosamente"
      };

      response.json(responseData);
    } catch (error) {
      next(error);
    }
  };
}

