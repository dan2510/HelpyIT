import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PrismaClient, RoleNombre, Disponibilidad, NivelExperiencia, EstadoTiquete } from "../../generated/prisma";
import bcrypt from "bcrypt";

export class TecnicoController {
  prisma = new PrismaClient();

  // Listado de técnicos - máximo 3 campos según requerimiento
  get = async (_request: Request, response: Response, next: NextFunction) => {
    try {
      // Obtener todos los técnicos
      const tecnicos = await this.prisma.usuario.findMany({
        where: {
          rol: {
            nombre: RoleNombre.TECNICO
          }
          // Se muestran todos los técnicos (activos e inactivos) para poder modificarlos
        },
        select: {
          id: true,
          nombrecompleto: true,
          disponibilidad: true,
          cargaactual: true,
          activo: true
        },
        orderBy: {
          nombrecompleto: "asc"
        }
      });

      // Recalcular cargaactual para cada técnico
      const tecnicosConCargaActualizada = await Promise.all(
        tecnicos.map(async (tecnico) => {
          const ticketsActivosCount = await this.prisma.tiquete.count({
            where: {
              idtecnicoactual: tecnico.id,
              estado: {
                notIn: [EstadoTiquete.RESUELTO, EstadoTiquete.CERRADO]
              }
            }
          });

          // Actualizar cargaactual en la base de datos si es diferente
          if (tecnico.cargaactual !== ticketsActivosCount) {
            await this.prisma.usuario.update({
              where: { id: tecnico.id },
              data: { cargaactual: ticketsActivosCount }
            });
          }

          return {
            ...tecnico,
            cargaactual: ticketsActivosCount
          };
        })
      );

      const responseData = {
        success: true,
        data: {
          tecnicos: tecnicosConCargaActualizada,
          total: tecnicosConCargaActualizada.length,
          page: 1,
          limit: tecnicosConCargaActualizada.length,
          totalPages: 1
        }
      };

      response.json(responseData);
    } catch (error) {
      next(error);
    }
  };

  // Detalle completo del técnico por ID
  getById = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const idTecnico = parseInt(request.params.id);
      
      if (isNaN(idTecnico)) {
        return next(AppError.badRequest("El ID no es válido"));
      }

      // Recalcular cargaactual antes de obtener el técnico
      const ticketsActivosCount = await this.prisma.tiquete.count({
        where: {
          idtecnicoactual: idTecnico,
          estado: {
            notIn: [EstadoTiquete.RESUELTO, EstadoTiquete.CERRADO]
          }
        }
      });

      // Actualizar cargaactual en la base de datos
      await this.prisma.usuario.update({
        where: { id: idTecnico },
        data: { cargaactual: ticketsActivosCount }
      });

      const tecnico = await this.prisma.usuario.findFirst({
        where: {
          id: idTecnico,
          rol: {
            nombre: RoleNombre.TECNICO
          }
          // Se permite obtener técnicos inactivos también
        },
        include: {
          rol: {
            select: {
              id: true,
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
                notIn: [EstadoTiquete.RESUELTO, EstadoTiquete.CERRADO]
              }
            },
            select: {
              id: true,
              titulo: true,
              estado: true,
              prioridad: true
            },
            orderBy: {
              id: 'asc'
            }
          }
        }
      });

      if (!tecnico) {
        return next(AppError.notFound("Técnico no encontrado"));
      }

      const tecnicoFormateado = {
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
        cargaactual: ticketsActivosCount, // Usar el valor recalculado
        maxticketsimultaneos: tecnico.maxticketsimultaneos,
        rol: tecnico.rol,
        especialidades: tecnico.especialidades.map(esp => ({
          id: esp.especialidad.id,
          nombre: esp.especialidad.nombre,
          descripcion: esp.especialidad.descripcion,
          nivelexperiencia: esp.nivelexperiencia,
          asignadoen: esp.asignadoen
        })),
        ticketsActivos: tecnico.tiquetesComoTecnico
      };

      const responseData = {
        success: true,
        data: {
          tecnico: tecnicoFormateado
        }
      };

      response.json(responseData);
    } catch (error) {
      next(error);
    }
  };

  // CREAR nuevo técnico
  create = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const {
        correo,
        contraseña,
        nombrecompleto,
        telefono,
        disponibilidad,
        maxticketsimultaneos,
        especialidades
      } = request.body;

      // Validaciones básicas
      if (!correo || !nombrecompleto) {
        return next(AppError.badRequest("Faltan campos obligatorios"));
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(correo.trim())) {
        return next(AppError.badRequest("El formato del correo electrónico no es válido"));
      }

      // Verificar si el email ya existe
      const usuarioExistente = await this.prisma.usuario.findUnique({
        where: { correo: correo.trim() }
      });

      if (usuarioExistente) {
        return next(AppError.badRequest("El correo ya está registrado"));
      }

      // Obtener el rol de técnico
      const rolTecnico = await this.prisma.rol.findFirst({
        where: { nombre: RoleNombre.TECNICO }
      });

      if (!rolTecnico) {
        return next(AppError.internalServer("Rol de técnico no encontrado"));
      }

      // Hash de la contraseña si se proporciona
      const contraseñaHash = contraseña 
        ? await bcrypt.hash(contraseña, 10)
        : "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO"; // Contraseña por defecto hasheada

      // Crear el técnico con sus especialidades
      const nuevoTecnico = await this.prisma.usuario.create({
        data: {
          correo: correo.trim(),
          contrasenahash: contraseñaHash,
          nombrecompleto: nombrecompleto.trim(),
          telefono: telefono?.trim() || null,
          idrol: rolTecnico.id,
          activo: true,
          disponibilidad: disponibilidad || Disponibilidad.DISPONIBLE,
          cargaactual: 0, // SIEMPRE empieza en 0
          maxticketsimultaneos: maxticketsimultaneos || 5,
          especialidades: {
            create: especialidades?.map((esp: any) => {
              const idEspecialidad = typeof esp === 'number' ? esp : (esp.id || esp.idespecialidad);
              const nivelExp = (typeof esp === 'object' && esp.nivelexperiencia) 
                ? esp.nivelexperiencia 
                : NivelExperiencia.JUNIOR;
              
              return {
                especialidad: { connect: { id: idEspecialidad } },
                nivelexperiencia: nivelExp,
                asignadoen: new Date()
              };
            }) || []
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
        message: "Técnico creado exitosamente",
        data: { tecnico: nuevoTecnico }
      });

    } catch (error) {
      console.error("Error al crear técnico:", error);
      next(AppError.internalServer("Error al crear el técnico"));
    }
  };

  // ACTUALIZAR técnico existente
  update = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const idTecnico = parseInt(request.params.id);
      const {
        nombrecompleto,
        telefono,
        disponibilidad,
        maxticketsimultaneos,
        especialidades,
        activo
      } = request.body;

      if (isNaN(idTecnico)) {
        return next(AppError.badRequest("ID de técnico inválido"));
      }

      // Verificar que el técnico existe
      const tecnicoExistente = await this.prisma.usuario.findFirst({
        where: {
          id: idTecnico,
          rol: {
            nombre: RoleNombre.TECNICO
          }
        }
      });

      if (!tecnicoExistente) {
        return next(AppError.notFound("Técnico no encontrado"));
      }

      // Si se marca como inactivo, asegurar que la disponibilidad sea INACTIVO
      let disponibilidadFinal = disponibilidad ? (disponibilidad as Disponibilidad) : tecnicoExistente.disponibilidad;
      const activoFinal = activo !== undefined ? activo : tecnicoExistente.activo;
      
      // Si se marca como inactivo, cambiar disponibilidad a INACTIVO automáticamente
      if (activoFinal === false) {
        disponibilidadFinal = Disponibilidad.INACTIVO;
      }

      // Actualizar el técnico
      const tecnicoActualizado = await this.prisma.usuario.update({
        where: { id: idTecnico },
        data: {
          nombrecompleto: nombrecompleto ? nombrecompleto.trim() : tecnicoExistente.nombrecompleto,
          telefono: telefono !== undefined ? (telefono?.trim() || null) : tecnicoExistente.telefono,
          disponibilidad: disponibilidadFinal,
          maxticketsimultaneos: maxticketsimultaneos || tecnicoExistente.maxticketsimultaneos,
          activo: activoFinal,
          actualizadoen: new Date(),
          // NO se actualiza cargaactual - se mantiene el valor actual
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

      // Actualizar especialidades si se proporcionaron
      if (especialidades && especialidades.length > 0) {
        // Eliminar especialidades anteriores
        await this.prisma.usuarioEspecialidad.deleteMany({
          where: { idusuario: idTecnico }
        });

        // Crear nuevas especialidades usando connect
        await Promise.all(
          especialidades.map((esp: any) => 
            this.prisma.usuarioEspecialidad.create({
              data: {
                usuario: { connect: { id: idTecnico } },
                especialidad: { connect: { id: typeof esp === 'number' ? esp : esp.idespecialidad || esp.id } },
                nivelexperiencia: (typeof esp === 'object' && esp.nivelexperiencia) ? esp.nivelexperiencia : NivelExperiencia.JUNIOR,
                asignadoen: new Date()
              }
            })
          )
        );

        // Recargar técnico con nuevas especialidades
        const tecnicoConEspecialidades = await this.prisma.usuario.findUnique({
          where: { id: idTecnico },
          include: {
            rol: true,
            especialidades: {
              include: {
                especialidad: true
              }
            }
          }
        });

        response.json({
          success: true,
          message: "Técnico actualizado exitosamente",
          data: { tecnico: tecnicoConEspecialidades }
        });
      } else {
        response.json({
          success: true,
          message: "Técnico actualizado exitosamente",
          data: { tecnico: tecnicoActualizado }
        });
      }

    } catch (error) {
      console.error("Error al actualizar técnico:", error);
      next(AppError.internalServer("Error al actualizar el técnico"));
    }
  };
}