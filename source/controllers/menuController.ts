import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PrismaClient } from "../../generated/prisma";

export class MenuController {
  prisma = new PrismaClient();

  // Obtener todos los items del menú con sus categorías
  get = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const itemsMenu = await this.prisma.menuItem.findMany({
        where: {
          activo: true,
          disponible: true // Solo mostrar productos disponibles para los clientes
        },
        include: {
          categoria: {
            select: {
              id: true,
              nombre: true,
              descripcion: true,
              orden: true
            }
          },
          gruposVariantes: {
            include: {
              opciones: {
                orderBy: { orden: 'asc' }
              }
            },
            orderBy: { orden: 'asc' }
          }
        },
        orderBy: {
          categoria: {
            orden: 'asc'
          }
        }
      });

      // Agrupar por categoría
      const menuPorCategoria = itemsMenu.reduce((acc: any, item) => {
        const categoriaNombre = item.categoria.nombre;
        if (!acc[categoriaNombre]) {
          acc[categoriaNombre] = {
            categoria: item.categoria,
            items: []
          };
        }
        acc[categoriaNombre].items.push(item);
        return acc;
      }, {});

      const responseData = {
        success: true,
        data: {
          menu: menuPorCategoria,
          items: itemsMenu,
          total: itemsMenu.length
        }
      };

      response.json(responseData);
    } catch (error) {
      next(error);
    }
  };

  // Obtener item del menú por ID
  getById = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const idItem = parseInt(request.params.id);
      
      if (isNaN(idItem)) {
        return next(AppError.badRequest("El ID no es válido"));
      }

      const item = await this.prisma.menuItem.findUnique({
        where: { id: idItem },
        include: {
          categoria: true,
          gruposVariantes: {
            include: {
              opciones: {
                where: { activo: true },
                orderBy: { orden: 'asc' }
              }
            },
            orderBy: { orden: 'asc' }
          }
        }
      });

      if (!item) {
        return next(AppError.notFound("Item de menú no encontrado"));
      }

      const responseData = {
        success: true,
        data: { item }
      };

      response.json(responseData);
    } catch (error) {
      next(error);
    }
  };

  // Crear nuevo item del menú (solo admin)
  create = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { 
        nombre, 
        descripcion, 
        precio, 
        idcategoria, 
        disponible, 
        tiempoPreparacion, 
        imagen,
        tieneVariantes,
        precioVariable,
        gruposVariantes
      } = request.body;

      if (!nombre || !idcategoria) {
        return next(AppError.badRequest("Nombre y categoría son requeridos"));
      }

      if (!tieneVariantes && !precio) {
        return next(AppError.badRequest("El precio es requerido para productos sin variantes"));
      }

      const categoria = await this.prisma.categoriaMenu.findUnique({
        where: { id: idcategoria }
      });

      if (!categoria) {
        return next(AppError.notFound("Categoría no encontrada"));
      }

      // Crear el item con sus variantes si las hay
      const item = await this.prisma.menuItem.create({
        data: {
          nombre,
          descripcion: descripcion || null,
          precio: precio || 0,
          idcategoria,
          activo: true, // Por defecto activo cuando se crea
          disponible: disponible !== undefined ? disponible : true,
          tiempoPreparacion: tiempoPreparacion || null,
          imagen: imagen || null,
          tieneVariantes: tieneVariantes || false,
          precioVariable: precioVariable || false,
          gruposVariantes: gruposVariantes ? {
            create: gruposVariantes.map((grupo: any) => ({
              nombre: grupo.nombreGrupo,
              descripcion: grupo.descripcionGrupo,
              obligatorio: grupo.obligatorio !== undefined ? grupo.obligatorio : true,
              tipoSeleccion: grupo.tipoSeleccion || 'unica',
              orden: grupo.orden || 0,
              definePrecioBase: grupo.definePrecioBase || false,
              opciones: {
                create: grupo.opciones.map((opcion: any) => ({
                  nombre: opcion.nombre,
                  descripcion: opcion.descripcion,
                  precioBase: opcion.precioBase || null,
                  incrementoPrecio: opcion.incrementoPrecio || 0,
                  requiereSubSeleccion: opcion.requiereSubSeleccion || false,
                  subOpciones: opcion.subOpciones || null,
                  orden: opcion.orden || 0,
                  activo: true
                }))
              }
            }))
          } : undefined
        },
        include: {
          categoria: true,
          gruposVariantes: {
            include: {
              opciones: {
                orderBy: { orden: 'asc' }
              }
            },
            orderBy: { orden: 'asc' }
          }
        }
      });

      const responseData = {
        success: true,
        data: { item }
      };

      response.status(201).json(responseData);
    } catch (error) {
      console.error('Error al crear item:', error);
      next(error);
    }
  };

  // Actualizar item del menú (solo admin)
  update = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const idItem = parseInt(request.params.id);
      const { 
        nombre, 
        descripcion, 
        precio, 
        idcategoria, 
        activo, 
        disponible, 
        tiempoPreparacion, 
        imagen,
        tieneVariantes,
        precioVariable,
        gruposVariantes
      } = request.body;

      if (isNaN(idItem)) {
        return next(AppError.badRequest("El ID no es válido"));
      }

      const item = await this.prisma.menuItem.findUnique({
        where: { id: idItem }
      });

      if (!item) {
        return next(AppError.notFound("Item de menú no encontrado"));
      }

      if (idcategoria) {
        const categoria = await this.prisma.categoriaMenu.findUnique({
          where: { id: idcategoria }
        });

        if (!categoria) {
          return next(AppError.notFound("Categoría no encontrada"));
        }
      }

      // Si se envían gruposVariantes, eliminar los existentes y crear nuevos
      if (gruposVariantes !== undefined) {
        // Eliminar variantes existentes
        const gruposExistentes = await this.prisma.grupoVariante.findMany({
          where: { idmenuitem: idItem }
        });
        
        for (const grupoExistente of gruposExistentes) {
          await this.prisma.opcionVariante.deleteMany({
            where: { idgrupo: grupoExistente.id }
          });
        }
        await this.prisma.grupoVariante.deleteMany({
          where: { idmenuitem: idItem }
        });

        // Crear nuevas variantes
        if (gruposVariantes && gruposVariantes.length > 0) {
          await this.prisma.grupoVariante.createMany({
            data: gruposVariantes.map((grupo: any) => ({
              idmenuitem: idItem,
              nombre: grupo.nombreGrupo,
              descripcion: grupo.descripcionGrupo,
              obligatorio: grupo.obligatorio !== undefined ? grupo.obligatorio : true,
              tipoSeleccion: grupo.tipoSeleccion || 'unica',
              orden: grupo.orden || 0,
              definePrecioBase: grupo.definePrecioBase || false,
            }))
          });

          // Crear las opciones para cada grupo
          for (let i = 0; i < gruposVariantes.length; i++) {
            const grupo = gruposVariantes[i];
            const grupoCreado = await this.prisma.grupoVariante.findFirst({
              where: { 
                idmenuitem: idItem,
                nombre: grupo.nombreGrupo,
                orden: grupo.orden || i
              },
              orderBy: { id: 'desc' }
            });

            if (grupoCreado && grupo.opciones) {
              await this.prisma.opcionVariante.createMany({
                data: grupo.opciones.map((opcion: any) => ({
                  idgrupo: grupoCreado.id,
                  nombre: opcion.nombre,
                  descripcion: opcion.descripcion,
                  precioBase: opcion.precioBase || null,
                  incrementoPrecio: opcion.incrementoPrecio || 0,
                  requiereSubSeleccion: opcion.requiereSubSeleccion || false,
                  subOpciones: opcion.subOpciones || null,
                  orden: opcion.orden || 0,
                  activo: true
                }))
              });
            }
          }
        }
      }

      const itemActualizado = await this.prisma.menuItem.update({
        where: { id: idItem },
        data: {
          nombre: nombre !== undefined ? nombre : item.nombre,
          descripcion: descripcion !== undefined ? descripcion : item.descripcion,
          precio: precio !== undefined ? precio : item.precio,
          idcategoria: idcategoria !== undefined ? idcategoria : item.idcategoria,
          activo: activo !== undefined ? activo : item.activo,
          disponible: disponible !== undefined ? disponible : item.disponible,
          tiempoPreparacion: tiempoPreparacion !== undefined ? tiempoPreparacion : item.tiempoPreparacion,
          imagen: imagen !== undefined ? imagen : item.imagen,
          tieneVariantes: tieneVariantes !== undefined ? tieneVariantes : item.tieneVariantes,
          precioVariable: precioVariable !== undefined ? precioVariable : item.precioVariable
        },
        include: {
          categoria: true,
          gruposVariantes: {
            include: {
              opciones: {
                orderBy: { orden: 'asc' }
              }
            },
            orderBy: { orden: 'asc' }
          }
        }
      });

      const responseData = {
        success: true,
        data: { item: itemActualizado }
      };

      response.json(responseData);
    } catch (error) {
      console.error('Error al actualizar item:', error);
      next(error);
    }
  };

  // Eliminar item del menú (solo admin - soft delete)
  delete = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const idItem = parseInt(request.params.id);

      if (isNaN(idItem)) {
        return next(AppError.badRequest("El ID no es válido"));
      }

      const item = await this.prisma.menuItem.findUnique({
        where: { id: idItem }
      });

      if (!item) {
        return next(AppError.notFound("Item de menú no encontrado"));
      }

      // Soft delete - solo desactivar
      const itemEliminado = await this.prisma.menuItem.update({
        where: { id: idItem },
        data: {
          activo: false,
          disponible: false
        }
      });

      const responseData = {
        success: true,
        data: { item: itemEliminado },
        message: "Item de menú desactivado exitosamente"
      };

      response.json(responseData);
    } catch (error) {
      next(error);
    }
  };
}

