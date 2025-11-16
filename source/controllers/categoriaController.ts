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

    // CREAR NUEVA CATEGORÍA
  create = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const {
        nombre,
        descripcion,
        etiquetas, // Array de IDs: [1, 2, 6]
        idsla,
        maxminutosrespuesta, // Si se establece manualmente
        maxminutosresolucion, // Si se establece manualmente
        especialidades // Array de IDs: [1, 3]
      } = request.body;

      // Validaciones
      const validationErrors: any[] = [];

      if (!nombre || !nombre.trim()) {
        validationErrors.push({
          fields: ['nombre'],
          constraint: 'El nombre de la categoría es requerido'
        });
      }

      if (!etiquetas || !Array.isArray(etiquetas) || etiquetas.length === 0) {
        validationErrors.push({
          fields: ['etiquetas'],
          constraint: 'Debe seleccionar al menos una etiqueta'
        });
      }

      if (!especialidades || !Array.isArray(especialidades) || especialidades.length === 0) {
        validationErrors.push({
          fields: ['especialidades'],
          constraint: 'Debe seleccionar al menos una especialidad'
        });
      }

      // Validar SLA: o se selecciona uno existente o se establecen ambos tiempos
      if (!idsla && (!maxminutosrespuesta || !maxminutosresolucion)) {
        validationErrors.push({
          fields: ['sla'],
          constraint: 'Debe seleccionar un SLA o establecer tiempos manualmente'
        });
      }

      // Validar tiempos si se proporcionan manualmente
      if (maxminutosrespuesta !== undefined) {
        if (maxminutosrespuesta <= 0) {
          validationErrors.push({
            fields: ['maxminutosrespuesta'],
            constraint: 'El tiempo de respuesta debe ser mayor a cero'
          });
        }
      }

      if (maxminutosresolucion !== undefined && maxminutosrespuesta !== undefined) {
        if (maxminutosresolucion <= maxminutosrespuesta) {
          validationErrors.push({
            fields: ['maxminutosresolucion'],
            constraint: 'El tiempo de resolución debe ser mayor que el tiempo de respuesta'
          });
        }
      }

      if (validationErrors.length > 0) {
        return next(AppError.badRequest('Errores de validación', validationErrors));
      }

      // Si no se proporciona idsla, crear una política SLA personalizada
      let slaId = idsla;
      
      if (!idsla && maxminutosrespuesta && maxminutosresolucion) {
        const nuevaSLA = await this.prisma.politicaSla.create({
          data: {
            nombre: `SLA Personalizado - ${nombre}`,
            descripcion: `SLA personalizado para ${nombre}`,
            maxminutosrespuesta: parseInt(maxminutosrespuesta),
            maxminutosresolucion: parseInt(maxminutosresolucion),
            activo: true,
            vigentedesde: new Date(),
            vigentehasta: new Date('2025-12-31')
          }
        });
        slaId = nuevaSLA.id;
      }

      // Crear la categoría con relaciones
      const nuevaCategoria = await this.prisma.categoria.create({
        data: {
          nombre: nombre.trim(),
          descripcion: descripcion?.trim() || '',
          idsla: slaId,
          activo: true,
          // Crear relaciones con etiquetas
          etiquetas: {
            create: etiquetas.map((idetiqueta: number) => ({
              etiqueta: { connect: { id: idetiqueta } }
            }))
          },
          // Crear relaciones con especialidades
          especialidades: {
            create: especialidades.map((idespecialidad: number) => ({
              especialidad: { connect: { id: idespecialidad } }
            }))
          }
        },
        include: {
          politicaSla: true,
          etiquetas: {
            include: { etiqueta: true }
          },
          especialidades: {
            include: { especialidad: true }
          }
        }
      });

      response.status(201).json({
        success: true,
        message: 'Categoría creada exitosamente',
        data: {
          categoria: nuevaCategoria
        }
      });
    } catch (error: any) {
      console.error('Error al crear categoría:', error);
      next(error);
    }
  };

  // ACTUALIZAR CATEGORÍA EXISTENTE
  update = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const idCategoria = parseInt(request.params.id);
      
      if (isNaN(idCategoria)) {
        return next(AppError.badRequest("El ID no es válido"));
      }

      const {
        nombre,
        descripcion,
        etiquetas,
        idsla,
        maxminutosrespuesta,
        maxminutosresolucion,
        especialidades
      } = request.body;

      // Validaciones
      const validationErrors: any[] = [];

      if (!nombre || !nombre.trim()) {
        validationErrors.push({
          fields: ['nombre'],
          constraint: 'El nombre de la categoría es requerido'
        });
      }

      if (!etiquetas || !Array.isArray(etiquetas) || etiquetas.length === 0) {
        validationErrors.push({
          fields: ['etiquetas'],
          constraint: 'Debe seleccionar al menos una etiqueta'
        });
      }

      if (!especialidades || !Array.isArray(especialidades) || especialidades.length === 0) {
        validationErrors.push({
          fields: ['especialidades'],
          constraint: 'Debe seleccionar al menos una especialidad'
        });
      }

      // Validar SLA: o se selecciona uno existente o se establecen ambos tiempos
      if (!idsla && (!maxminutosrespuesta || !maxminutosresolucion)) {
        validationErrors.push({
          fields: ['sla'],
          constraint: 'Debe seleccionar un SLA o establecer tiempos manualmente'
        });
      }

      if (maxminutosrespuesta !== undefined && maxminutosrespuesta <= 0) {
        validationErrors.push({
          fields: ['maxminutosrespuesta'],
          constraint: 'El tiempo de respuesta debe ser mayor a cero'
        });
      }

      if (maxminutosresolucion !== undefined && maxminutosrespuesta !== undefined) {
        if (maxminutosresolucion <= maxminutosrespuesta) {
          validationErrors.push({
            fields: ['maxminutosresolucion'],
            constraint: 'El tiempo de resolución debe ser mayor que el tiempo de respuesta'
          });
        }
      }

      if (validationErrors.length > 0) {
        return next(AppError.badRequest('Errores de validación', validationErrors));
      }

      // Verificar que la categoría existe
      const categoriaExistente = await this.prisma.categoria.findUnique({
        where: { id: idCategoria }
      });

      if (!categoriaExistente) {
        return next(AppError.notFound('Categoría no encontrada'));
      }

      // Eliminar relaciones anteriores
      await this.prisma.categoriaEtiqueta.deleteMany({
        where: { idcategoria: idCategoria }
      });

      await this.prisma.categoriaEspecialidad.deleteMany({
        where: { idcategoria: idCategoria }
      });

      // Actualizar SLA si se proporcionaron tiempos manuales
      let slaIdFinal = idsla || categoriaExistente.idsla;
      
      if (!idsla && maxminutosrespuesta && maxminutosresolucion) {
        // Actualizar el SLA existente o crear uno nuevo
        const slaActualizado = await this.prisma.politicaSla.upsert({
          where: { id: categoriaExistente.idsla },
          update: {
            maxminutosrespuesta: parseInt(maxminutosrespuesta),
            maxminutosresolucion: parseInt(maxminutosresolucion),
            actualizadoen: new Date()
          },
          create: {
            nombre: `SLA Personalizado - ${nombre}`,
            descripcion: `SLA personalizado para ${nombre}`,
            maxminutosrespuesta: parseInt(maxminutosrespuesta),
            maxminutosresolucion: parseInt(maxminutosresolucion),
            activo: true,
            vigentedesde: new Date(),
            vigentehasta: new Date('2025-12-31')
          }
        });
        slaIdFinal = slaActualizado.id;
      }

      // Actualizar la categoría
      const categoriaActualizada = await this.prisma.categoria.update({
        where: { id: idCategoria },
        data: {
          nombre: nombre.trim(),
          descripcion: descripcion?.trim() || '',
          idsla: slaIdFinal,
          // Recrear relaciones con etiquetas
          etiquetas: {
            create: etiquetas.map((idetiqueta: number) => ({
              etiqueta: { connect: { id: idetiqueta } }
            }))
          },
          // Recrear relaciones con especialidades
          especialidades: {
            create: especialidades.map((idespecialidad: number) => ({
              especialidad: { connect: { id: idespecialidad } }
            }))
          }
        },
        include: {
          politicaSla: true,
          etiquetas: {
            include: { etiqueta: true }
          },
          especialidades: {
            include: { especialidad: true }
          }
        }
      });

      response.status(200).json({
        success: true,
        message: 'Categoría actualizada exitosamente',
        data: {
          categoria: categoriaActualizada
        }
      });
    } catch (error: any) {
      console.error('Error al actualizar categoría:', error);
      next(error);
    }
  };

  // OBTENER ETIQUETAS DISPONIBLES
  getEtiquetas = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const etiquetas = await this.prisma.etiqueta.findMany({
        select: {
          id: true,
          nombre: true,
          descripcion: true
        },
        orderBy: { nombre: 'asc' }
      });

      response.json({
        success: true,
        data: { etiquetas }
      });
    } catch (error) {
      next(error);
    }
  };

  // OBTENER ESPECIALIDADES DISPONIBLES
  getEspecialidades = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const especialidades = await this.prisma.especialidad.findMany({
        where: { activo: true },
        select: {
          id: true,
          nombre: true,
          descripcion: true
        },
        orderBy: { nombre: 'asc' }
      });

      response.json({
        success: true,
        data: { especialidades }
      });
    } catch (error) {
      next(error);
    }
  };

  // OBTENER SLAs DISPONIBLES
  getSLAs = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const slas = await this.prisma.politicaSla.findMany({
        where: { activo: true },
        select: {
          id: true,
          nombre: true,
          descripcion: true,
          maxminutosrespuesta: true,
          maxminutosresolucion: true
        },
        orderBy: { nombre: 'asc' }
      });

      response.json({
        success: true,
        data: { slas }
      });
    } catch (error) {
      next(error);
    }
  };
}

