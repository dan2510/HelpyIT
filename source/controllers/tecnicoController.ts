import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PrismaClient, RoleNombre, Disponibilidad, NivelExperiencia, EstadoTiquete } from "../../generated/prisma";
import bcrypt from "bcrypt";

export class TecnicoController {
  prisma = new PrismaClient();

  // Listado de técnicos -
  // Retorna estructura: { success: boolean, data: { tecnicos: TecnicoListItem[] } }
  get = async (request: Request, response: Response, next: NextFunction) => {
    try {
      // Obtener todos los usuarios con rol TECNICO
      const listadoTecnicos = await this.prisma.usuario.findMany({
        where: {
          rol: {
            nombre: RoleNombre.TECNICO
          },
          activo: true
        },
        select: {
          id: true,
          nombrecompleto: true,
          disponibilidad: true,
          cargaactual: true,
        
          tiquetesComoTecnico: {
            where: {
              estado: {
                in: [EstadoTiquete.ABIERTO, EstadoTiquete.EN_PROGRESO, EstadoTiquete.ASIGNADO, EstadoTiquete.PENDIENTE]
              }
            },
            select: {
              id: true
            }
          }
        },
        orderBy: {
          nombrecompleto: "asc"
        }
      });

    
      const tecnicosConCargaReal = listadoTecnicos.map(tecnico => ({
        id: tecnico.id,
        nombrecompleto: tecnico.nombrecompleto,
        disponibilidad: tecnico.disponibilidad,
        cargaactual: tecnico.tiquetesComoTecnico.length 
      }));

      // Estructura esperada por el servicio frontend
      const responseData = {
        success: true,
        data: {
          tecnicos: tecnicosConCargaReal,
          total: tecnicosConCargaReal.length,
          page: 1,
          limit: tecnicosConCargaReal.length,
          totalPages: 1
        }
      };

      response.json(responseData);
    } catch (error) {
      next(error);
    }
  };

  // Detalle completo del técnico por ID
  // Retorna estructura: { success: boolean, data: { tecnico: TecnicoDetail } }
  getById = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const idTecnico = parseInt(request.params.id);
      
      if (isNaN(idTecnico)) {
        return next(AppError.badRequest("El ID no es válido"));
      }

      const tecnico = await this.prisma.usuario.findFirst({
        where: {
          id: idTecnico,
          rol: {
            nombre: RoleNombre.TECNICO
          },
          activo: true
        },
        include: {
          rol: {
            select: {
              nombre: true,
              descripcion: true
            }
          },
          especialidades: {
            include: {
              especialidad: {
                select: {
                  id: true,
                  nombre: true,
                  descripcion: true
                }
              }
            }
          },
          tiquetesComoTecnico: {
            where: {
              estado: {
                in: [EstadoTiquete.ABIERTO, EstadoTiquete.EN_PROGRESO, EstadoTiquete.ASIGNADO, EstadoTiquete.PENDIENTE]
              }
            },
            select: {
              id: true,
              titulo: true,
              estado: true,
              prioridad: true
            }
          }
        }
      });

      if (!tecnico) {
        return next(AppError.notFound("No existe el técnico"));
      }

  
      const cargaActualReal = tecnico.tiquetesComoTecnico.length;

      // Formatear especialidades según la estructura esperada
      const especialidades = tecnico.especialidades.map(esp => ({
        id: esp.especialidad.id,
        nombre: esp.especialidad.nombre,
        descripcion: esp.especialidad.descripcion,
        nivelexperiencia: esp.nivelexperiencia,
        asignadoen: esp.asignadoen
      }));

      // Formatear tickets activos
      const ticketsActivos = tecnico.tiquetesComoTecnico.map(ticket => ({
        id: ticket.id,
        titulo: ticket.titulo,
        estado: ticket.estado,
        prioridad: ticket.prioridad
      }));

      // Estructura de datos según TecnicoDetail interface
      const tecnicoDetail = {
        // Información personal del técnico
        id: tecnico.id,
        correo: tecnico.correo,
        nombrecompleto: tecnico.nombrecompleto,
        telefono: tecnico.telefono,
        idrol: tecnico.idrol,
        activo: tecnico.activo,
        ultimoiniciosesion: tecnico.ultimoiniciosesion,
        creadoen: tecnico.creadoen,
        actualizadoen: tecnico.actualizadoen,
        disponibilidad: tecnico.disponibilidad,
        cargaactual: cargaActualReal,  
        maxticketsimultaneos: tecnico.maxticketsimultaneos,
        
        // Información del rol
        rol: tecnico.rol,
        
        // Lista de especialidades formateada
        especialidades: especialidades,
        
        // Tickets activos asignados
        ticketsActivos: ticketsActivos
      };

      // Estructura esperada por el servicio frontend
      const responseData = {
        success: true,
        data: {
          tecnico: tecnicoDetail
        }
      };

      response.status(200).json(responseData);
    } catch (error: any) {
      next(error);
    }
  };

  // Búsqueda de técnicos por nombre o especialidad
  search = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { q } = request.query;

      if (typeof q !== "string" || q.trim() === "") {
        return next(AppError.badRequest("El término de búsqueda es requerido"));
      }

      const searchTerm: string = q as string;
      
      const tecnicos = await this.prisma.usuario.findMany({
        where: {
          AND: [
            {
              rol: {
                nombre: RoleNombre.TECNICO
              }
            },
            {
              activo: true
            },
            {
              OR: [
                {
                  nombrecompleto: {
                    contains: searchTerm,
                    mode: "insensitive"
                  } as any
                },
                {
                  especialidades: {
                    some: {
                      especialidad: {
                        nombre: {
                          contains: searchTerm
                        }
                      }
                    }
                  }
                }
              ]
            }
          ]
        },
        select: {
          id: true,
          nombrecompleto: true,
          disponibilidad: true,
          cargaactual: true
        },
        orderBy: {
          nombrecompleto: "asc"
        }
      });

      response.json(tecnicos);
    } catch (error) {
      next(error);
    }
  };

  // Obtener técnicos disponibles (para asignaciones)
  getDisponibles = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const tecnicosDisponibles = await this.prisma.usuario.findMany({
        where: {
          rol: {
            nombre: RoleNombre.TECNICO
          },
          activo: true,
          disponibilidad: Disponibilidad.DISPONIBLE
        },
        select: {
          id: true,
          nombrecompleto: true,
          cargaactual: true,
          maxticketsimultaneos: true,
          especialidades: {
            select: {
              especialidad: {
                select: {
                  nombre: true
                }
              },
              nivelexperiencia: true
            }
          }
        },
        orderBy: [
          { cargaactual: "asc" },
          { nombrecompleto: "asc" }
        ]
      });

      response.json(tecnicosDisponibles);
    } catch (error) {
      next(error);
    }
  };


   create = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const {
        correo,
        nombrecompleto,
        telefono,
        contraseña,
        especialidades, // Array de IDs: [1, 3, 6]
        estado // 'DISPONIBLE' | 'OCUPADO' | 'AUSENTE'
      } = request.body;

      // Validaciones
      const validationErrors: any[] = [];

      if (!correo || !correo.trim()) {
        validationErrors.push({
          fields: ['correo'],
          constraint: 'El correo electrónico es requerido'
        });
      }

      // Validar formato de correo
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (correo && !emailRegex.test(correo)) {
        validationErrors.push({
          fields: ['correo'],
          constraint: 'El formato del correo electrónico no es válido'
        });
      }

      if (!nombrecompleto || !nombrecompleto.trim()) {
        validationErrors.push({
          fields: ['nombrecompleto'],
          constraint: 'El nombre completo es requerido'
        });
      }

      if (!especialidades || !Array.isArray(especialidades) || especialidades.length === 0) {
        validationErrors.push({
          fields: ['especialidades'],
          constraint: 'Debe seleccionar al menos una especialidad'
        });
      }

      if (!estado) {
        validationErrors.push({
          fields: ['estado'],
          constraint: 'El estado es requerido'
        });
      }

      if (validationErrors.length > 0) {
        return next(AppError.badRequest('Errores de validación', validationErrors));
      }

      // Verificar si el correo ya existe
      const existingUser = await this.prisma.usuario.findUnique({
        where: { correo: correo.trim() }
      });

      if (existingUser) {
        return next(AppError.badRequest('El correo electrónico ya está registrado', [
          { fields: ['correo'], constraint: 'Este correo ya está en uso' }
        ]));
      }

      // Obtener el ID del rol TECNICO
      const rolTecnico = await this.prisma.rol.findFirst({
        where: { nombre: RoleNombre.TECNICO }
      });

      if (!rolTecnico) {
        return next(AppError.internalServer('No se encontró el rol de técnico'));
      }

      // Hash de la contraseña (usar la misma que en seed.ts)
      const contraseñaHash = contraseña 
        ? await bcrypt.hash(contraseña, 10)
        : "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO";

      // Crear el técnico con especialidades
      const nuevoTecnico = await this.prisma.usuario.create({
        data: {
          correo: correo.trim(),
          contrasenahash: contraseñaHash,
          nombrecompleto: nombrecompleto.trim(),
          telefono: telefono?.trim() || null,
          rol: { connect: { id: rolTecnico.id } },
          activo: true,
          disponibilidad: estado as Disponibilidad,
          cargaactual: 0,
          maxticketsimultaneos: 5,
          // Crear especialidades asociadas
          especialidades: {
            create: especialidades.map((idEspecialidad: number) => ({
              especialidad: { connect: { id: idEspecialidad } },
              nivelexperiencia: NivelExperiencia.JUNIOR // Por defecto, podría ser un campo del formulario
            }))
          }
        },
        include: {
          rol: true,
          especialidades: {
            include: {
              especialidad: true
            }
          }
        }
      });

      response.status(201).json({
        success: true,
        message: 'Técnico creado exitosamente',
        data: {
          tecnico: nuevoTecnico
        }
      });
    } catch (error: any) {
      console.error('Error al crear técnico:', error);
      next(error);
    }
  };

  // ACTUALIZAR TÉCNICO EXISTENTE
  update = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const idTecnico = parseInt(request.params.id);
      
      if (isNaN(idTecnico)) {
        return next(AppError.badRequest("El ID no es válido"));
      }

      const {
        correo,
        nombrecompleto,
        telefono,
        especialidades, // Array de IDs: [1, 3, 6]
        estado
      } = request.body;

      // Validaciones
      const validationErrors: any[] = [];

      if (!correo || !correo.trim()) {
        validationErrors.push({
          fields: ['correo'],
          constraint: 'El correo electrónico es requerido'
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (correo && !emailRegex.test(correo)) {
        validationErrors.push({
          fields: ['correo'],
          constraint: 'El formato del correo electrónico no es válido'
        });
      }

      if (!nombrecompleto || !nombrecompleto.trim()) {
        validationErrors.push({
          fields: ['nombrecompleto'],
          constraint: 'El nombre completo es requerido'
        });
      }

      if (!especialidades || !Array.isArray(especialidades) || especialidades.length === 0) {
        validationErrors.push({
          fields: ['especialidades'],
          constraint: 'Debe seleccionar al menos una especialidad'
        });
      }

      if (validationErrors.length > 0) {
        return next(AppError.badRequest('Errores de validación', validationErrors));
      }

      // Verificar que el técnico existe
      const tecnicoExistente = await this.prisma.usuario.findFirst({
        where: {
          id: idTecnico,
          rol: { nombre: RoleNombre.TECNICO }
        }
      });

      if (!tecnicoExistente) {
        return next(AppError.notFound('Técnico no encontrado'));
      }

      // Verificar si el correo ya está en uso por otro usuario
      if (correo !== tecnicoExistente.correo) {
        const correoEnUso = await this.prisma.usuario.findFirst({
          where: {
            correo: correo.trim(),
            id: { not: idTecnico }
          }
        });

        if (correoEnUso) {
          return next(AppError.badRequest('El correo electrónico ya está en uso', [
            { fields: ['correo'], constraint: 'Este correo ya está registrado' }
          ]));
        }
      }

      // Eliminar especialidades anteriores
      await this.prisma.usuarioEspecialidad.deleteMany({
        where: { idusuario: idTecnico }
      });

      // Actualizar técnico con nuevas especialidades
      const tecnicoActualizado = await this.prisma.usuario.update({
        where: { id: idTecnico },
        data: {
          correo: correo.trim(),
          nombrecompleto: nombrecompleto.trim(),
          telefono: telefono?.trim() || null,
          disponibilidad: estado as Disponibilidad,
          actualizadoen: new Date(),
          // Crear nuevas especialidades
          especialidades: {
            create: especialidades.map((idEspecialidad: number) => ({
              especialidad: { connect: { id: idEspecialidad } },
              nivelexperiencia: NivelExperiencia.JUNIOR
            }))
          }
        },
        include: {
          rol: true,
          especialidades: {
            include: {
              especialidad: true
            }
          }
        }
      });

      response.status(200).json({
        success: true,
        message: 'Técnico actualizado exitosamente',
        data: {
          tecnico: tecnicoActualizado
        }
      });
    } catch (error: any) {
      console.error('Error al actualizar técnico:', error);
      next(error);
    }
  };

  // OBTENER ESPECIALIDADES DISPONIBLES (para el select del formulario)
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
}


