import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PrismaClient, RoleNombre, EstadoTiquete } from "../../generated/prisma";

export class TiqueteController {
  prisma = new PrismaClient();

  // Listado de tiquetes según el rol del usuario
  // Retorna estructura: { success: boolean, data: { tiquetes: TiqueteListItem[] } }
  getTiquetesPorUsuario = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const idUsuario = parseInt(request.params.idUsuario);
      
      if (isNaN(idUsuario)) {
        return next(AppError.badRequest("El ID de usuario no es válido"));
      }

      // Obtener el usuario y su rol
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: idUsuario },
        include: {
          rol: true
        }
      });

      if (!usuario) {
        return next(AppError.notFound("Usuario no encontrado"));
      }

      let tiquetes;
      
      // Filtrar según el rol del usuario
      switch (usuario.rol.nombre) {
        case RoleNombre.ADMIN:
          // Administrador ve todos los tiquetes
          tiquetes = await this.prisma.tiquete.findMany({
            select: {
              id: true,
              titulo: true,
              estado: true,
              prioridad: true,
              creadoen: true,
              categoria: {
                select: {
                  nombre: true,
                  descripcion: true
                }
              },
              cliente: {
                select: {
                  nombrecompleto: true,
                  correo: true
                }
              },
              tecnicoActual: {
                select: {
                  nombrecompleto: true,
                  correo: true
                }
              }
            },
            orderBy: {
              id: 'asc'
            }
          });
          break;

        case RoleNombre.CLIENTE:
          // Cliente ve solo sus propios tiquetes
          tiquetes = await this.prisma.tiquete.findMany({
            where: {
              idcliente: idUsuario
            },
            select: {
              id: true,
              titulo: true,
              estado: true,
              prioridad: true,
              creadoen: true,
              categoria: {
                select: {
                  nombre: true,
                  descripcion: true
                }
              },
              tecnicoActual: {
                select: {
                  nombrecompleto: true,
                  correo: true
                }
              }
            },
            orderBy: {
              id: 'asc'
            }
          });
          break;

        case RoleNombre.TECNICO:
          // Técnico ve solo los tiquetes asignados a él
          tiquetes = await this.prisma.tiquete.findMany({
            where: {
              idtecnicoactual: idUsuario
            },
            select: {
              id: true,
              titulo: true,
              estado: true,
              prioridad: true,
              creadoen: true,
              categoria: {
                select: {
                  nombre: true,
                  descripcion: true
                }
              },
              cliente: {
                select: {
                  nombrecompleto: true,
                  correo: true
                }
              }
            },
            orderBy: {
              id: 'asc'
            }
          });
          break;

        default:
          return next(AppError.forbidden("Rol no autorizado"));
      }

      const responseData = {
        success: true,
        data: {
          tiquetes: tiquetes,
          total: tiquetes.length,
          page: 1,
          limit: tiquetes.length,
          totalPages: 1,
          rol: usuario.rol.nombre
        }
      };

      response.json(responseData);
    } catch (error) {
      next(error);
    }
  };

  // Detalle completo del tiquete por ID
  getById = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const idTiquete = parseInt(request.params.id);
      
      if (isNaN(idTiquete)) {
        return next(AppError.badRequest("El ID no es válido"));
      }

      const tiquete = await this.prisma.tiquete.findFirst({
        where: {
          id: idTiquete
        },
        include: {
          // Categoría con SLA
          categoria: {
            include: {
              politicaSla: {
                select: {
                  nombre: true,
                  descripcion: true,
                  maxminutosrespuesta: true,
                  maxminutosresolucion: true
                }
              }
            }
          },
          // Cliente que creó el ticket
          cliente: {
            select: {
              id: true,
              nombrecompleto: true,
              correo: true,
              telefono: true
            }
          },
          // Técnico asignado
          tecnicoActual: {
            select: {
              id: true,
              nombrecompleto: true,
              correo: true,
              telefono: true
            }
          },
          // Historial de estados con imágenes
          historiales: {
            include: {
              usuarioCambio: {
                select: {
                  id: true,
                  nombrecompleto: true,
                  correo: true,
                  telefono: true
                }
              },
              imagenes: {
                include: {
                  usuario: {
                    select: {
                      id: true,
                      nombrecompleto: true,
                      correo: true
                    }
                  }
                }
              }
            },
            orderBy: {
              cambiadoen: 'desc'
            }
          },
          // Valoraciones
          valoraciones: {
            include: {
              cliente: {
                select: {
                  id: true,
                  nombrecompleto: true,
                  correo: true
                }
              }
            }
          }
        }
      });

      if (!tiquete) {
        return next(AppError.notFound("No existe el tiquete"));
      }

      // Calcular días de resolución
      let diasResolucion = null;
      if (tiquete.resueltoen) {
        const diffTime = Math.abs(new Date(tiquete.resueltoen).getTime() - new Date(tiquete.creadoen).getTime());
        diasResolucion = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      // Calcular horas de respuesta
      let horasRespuesta = null;
      if (tiquete.primerarespuestaen) {
        const diffTime = Math.abs(new Date(tiquete.primerarespuestaen).getTime() - new Date(tiquete.creadoen).getTime());
        horasRespuesta = Math.round(diffTime / (1000 * 60 * 60) * 10) / 10;
      }

      // Calcular horas de resolución
      let horasResolucion = null;
      if (tiquete.resueltoen) {
        const diffTime = Math.abs(new Date(tiquete.resueltoen).getTime() - new Date(tiquete.creadoen).getTime());
        horasResolucion = Math.round(diffTime / (1000 * 60 * 60) * 10) / 10;
      }

      // Formatear historial
      const historiales = tiquete.historiales.map(hist => ({
        id: hist.id,
        estadoanterior: hist.estadoanterior,
        estadonuevo: hist.estadonuevo,
        observacion: hist.observacion,
        cambiadoen: hist.cambiadoen,
        cambiadopor: hist.usuarioCambio,
        imagenes: hist.imagenes.map(img => ({
          id: img.id,
          rutaarchivo: img.rutaarchivo,
          subidoen: img.subidoen,
          subidopor: img.usuario
        }))
      }));

      // Formatear valoraciones
      const valoraciones = tiquete.valoraciones.map(val => ({
        id: val.id,
        calificacion: val.calificacion,
        comentario: val.comentario,
        creadaen: val.creadaen,
        cliente: val.cliente
      }));

      // Estructura de datos según TiqueteDetalle interface
      const tiqueteDetail = {
        // Información básica
        id: tiquete.id,
        titulo: tiquete.titulo,
        descripcion: tiquete.descripcion,
        prioridad: tiquete.prioridad,
        estado: tiquete.estado,
        
        // Fechas
        creadoen: tiquete.creadoen,
        primerarespuestaen: tiquete.primerarespuestaen,
        resueltoen: tiquete.resueltoen,
        cerradoen: tiquete.cerradoen,
        vencerespuesta: tiquete.vencerespuesta,
        venceresolucion: tiquete.venceresolucion,
        
        // Relaciones
        categoria: {
          id: tiquete.categoria.id,
          nombre: tiquete.categoria.nombre,
          descripcion: tiquete.categoria.descripcion
        },
        cliente: tiquete.cliente,
        tecnicoActual: tiquete.tecnicoActual || null,
        
        // SLA
        sla: {
          nombre: tiquete.categoria.politicaSla.nombre,
          descripcion: tiquete.categoria.politicaSla.descripcion,
          maxminutosrespuesta: tiquete.categoria.politicaSla.maxminutosrespuesta,
          maxminutosresolucion: tiquete.categoria.politicaSla.maxminutosresolucion,
          tiempoRespuestaHoras: Math.round(tiquete.categoria.politicaSla.maxminutosrespuesta / 60 * 10) / 10,
          tiempoResolucionHoras: Math.round(tiquete.categoria.politicaSla.maxminutosresolucion / 60 * 10) / 10
        },
        
        // Cumplimiento SLA calculado
        cumplimiento: {
          cumplioslarespuesta: tiquete.cumplioslarespuesta,
          cumplioslaresolucion: tiquete.cumplioslaresolucion,
          diasResolucion: diasResolucion,
          horasRespuesta: horasRespuesta,
          horasResolucion: horasResolucion
        },
        
        // Historial y valoraciones
        historiales: historiales,
        valoraciones: valoraciones
      };

      const responseData = {
        success: true,
        data: {
          tiquete: tiqueteDetail
        }
      };

      response.status(200).json(responseData);
    } catch (error: any) {
      next(error);
    }
  };

  // Listado general de todos los tiquetes (solo para admin)
  get = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const listadoTiquetes = await this.prisma.tiquete.findMany({
        select: {
          id: true,
          titulo: true,
          estado: true,
          prioridad: true,
          creadoen: true,
          categoria: {
            select: {
              nombre: true,
              descripcion: true
            }
          },
          cliente: {
            select: {
              nombrecompleto: true,
              correo: true
            }
          },
          tecnicoActual: {
            select: {
              nombrecompleto: true,
              correo: true
            }
          }
        },
        orderBy: {
          id: 'asc'
        }
      });

      const responseData = {
        success: true,
        data: {
          tiquetes: listadoTiquetes,
          total: listadoTiquetes.length,
          page: 1,
          limit: listadoTiquetes.length,
          totalPages: 1
        }
      };

      response.json(responseData);
    } catch (error) {
      next(error);
    }
  };

  // CREAR NUEVO TICKET
  create = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { 
        titulo,
        descripcion,
        prioridad,
        idetiqueta, // ID de la etiqueta seleccionada
        idcliente, // ID del usuario solicitante (desde variable en lógica del frontend)
        imagenes // Array de nombres de archivos subidos
      } = request.body;

      // Validaciones
      const validationErrors: any[] = [];

      if (!titulo || !titulo.trim()) {
        validationErrors.push({
          fields: ['titulo'],
          constraint: 'El título es requerido'
        });
      }

      if (!descripcion || !descripcion.trim()) {
        validationErrors.push({
          fields: ['descripcion'],
          constraint: 'La descripción es requerida'
        });
      }

      if (!prioridad) {
        validationErrors.push({
          fields: ['prioridad'],
          constraint: 'La prioridad es requerida'
        });
      }

      if (!idetiqueta) {
        validationErrors.push({
          fields: ['idetiqueta'],
          constraint: 'Debe seleccionar una etiqueta'
        });
      }

      if (!idcliente) {
        validationErrors.push({
          fields: ['idcliente'],
          constraint: 'El usuario solicitante es requerido'
        });
      }

      if (validationErrors.length > 0) {
        return next(AppError.badRequest('Errores de validación', validationErrors));
      }

      // Obtener la categoría asociada a la etiqueta
      const categoriaEtiqueta = await this.prisma.categoriaEtiqueta.findFirst({
        where: { idetiqueta: parseInt(idetiqueta) },
        include: {
          categoria: {
            include: {
              politicaSla: true
            }
          }
        }
      });

      if (!categoriaEtiqueta) {
        return next(AppError.badRequest('No se encontró una categoría para la etiqueta seleccionada'));
      }

      const categoria = categoriaEtiqueta.categoria;
      const sla = categoria.politicaSla;

      // Calcular fechas de vencimiento SLA
      const fechaCreacion = new Date();
      const venceRespuesta = new Date(fechaCreacion.getTime() + sla.maxminutosrespuesta * 60 * 1000);
      const venceResolucion = new Date(fechaCreacion.getTime() + sla.maxminutosresolucion * 60 * 1000);

      // Crear el ticket
      const nuevoTicket = await this.prisma.tiquete.create({
        data: {
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          prioridad: prioridad,
          estado: EstadoTiquete.PENDIENTE,
          categoria: { connect: { id: categoria.id } },
          cliente: { connect: { id: parseInt(idcliente) } },
          creadoen: fechaCreacion,
          vencerespuesta: venceRespuesta,
          venceresolucion: venceResolucion
        },
        include: {
          categoria: {
            include: {
              politicaSla: true
            }
          },
          cliente: {
            select: {
              id: true,
              nombrecompleto: true,
              correo: true
            }
          }
        }
      });

      // Crear historial inicial del ticket
      // Estado anterior es null (no hay estado previo al crear), estado nuevo es PENDIENTE
      const historialInicial = await this.prisma.historialTiquete.create({
        data: {
          idtiquete: nuevoTicket.id,
          estadoanterior: EstadoTiquete.ABIERTO, // Estado inicial al crear
          estadonuevo: EstadoTiquete.PENDIENTE,
          observacion: 'Ticket creado',
          cambiadopor: parseInt(idcliente),
          cambiadoen: fechaCreacion,
          // Crear las imágenes asociadas al historial si hay
          imagenes: imagenes && Array.isArray(imagenes) && imagenes.length > 0
            ? {
                create: imagenes.map((nombreArchivo: string) => ({
                  rutaarchivo: nombreArchivo,
                  subidopor: parseInt(idcliente),
                  subidoen: fechaCreacion
                }))
              }
            : undefined
        },
        include: {
          imagenes: {
            include: {
              usuario: {
                select: {
                  id: true,
                  nombrecompleto: true,
                  correo: true
                }
              }
            }
          }
        }
      });

      response.status(201).json({
        success: true,
        message: 'Ticket creado exitosamente',
        data: {
          tiquete: nuevoTicket
        }
      });
    } catch (error: any) {
      console.error('Error al crear ticket:', error);
      next(error);
    }
  };

  // OBTENER PRIORIDADES DISPONIBLES
  getPrioridades = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const prioridades = [
        { id: 'BAJA', nombre: 'Baja' },
        { id: 'MEDIA', nombre: 'Media' },
        { id: 'ALTA', nombre: 'Alta' },
        { id: 'CRITICA', nombre: 'Crítica' }
      ];

      response.json({
        success: true,
        data: { prioridades }
      });
    } catch (error) {
      next(error);
    }
  };


  // ACTUALIZAR TICKET
  update = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const idTiquete = parseInt(request.params.id);
      
      if (isNaN(idTiquete)) {
        return next(AppError.badRequest("El ID no es válido"));
      }

      const { idtecnicoactual, idUsuarioCambio } = request.body;

      // Verificar que el ticket existe
      const tiqueteExistente = await this.prisma.tiquete.findUnique({
        where: { id: idTiquete }
      });

      if (!tiqueteExistente) {
        return next(AppError.notFound("Ticket no encontrado"));
      }

      // Si se proporciona un técnico, verificar que existe y es técnico
      let tecnicoAsignado = null;
      if (idtecnicoactual !== undefined && idtecnicoactual !== null) {
        tecnicoAsignado = await this.prisma.usuario.findFirst({
          where: {
            id: parseInt(idtecnicoactual),
            rol: {
              nombre: RoleNombre.TECNICO
            }
          }
        });

        if (!tecnicoAsignado) {
          return next(AppError.badRequest("El técnico especificado no existe o no es válido"));
        }
      }

      // Determinar el nuevo estado
      // Si se asigna un técnico y el estado es PENDIENTE, cambiar a ASIGNADO
      let nuevoEstado = tiqueteExistente.estado;
      const estadoAnterior = tiqueteExistente.estado;
      
      if (idtecnicoactual !== undefined && idtecnicoactual !== null && 
          tiqueteExistente.idtecnicoactual === null &&
          tiqueteExistente.estado === EstadoTiquete.PENDIENTE) {
        nuevoEstado = EstadoTiquete.ASIGNADO;
      } else if (idtecnicoactual === null && tiqueteExistente.idtecnicoactual !== null) {
        // Si se desasigna el técnico y estaba asignado, volver a PENDIENTE
        nuevoEstado = EstadoTiquete.PENDIENTE;
      }

      // Actualizar el ticket
      const tiqueteActualizado = await this.prisma.tiquete.update({
        where: { id: idTiquete },
        data: {
          idtecnicoactual: idtecnicoactual !== undefined && idtecnicoactual !== null 
            ? parseInt(idtecnicoactual) 
            : null,
          estado: nuevoEstado
        },
        include: {
          categoria: {
            include: {
              politicaSla: {
                select: {
                  nombre: true,
                  descripcion: true,
                  maxminutosrespuesta: true,
                  maxminutosresolucion: true
                }
              }
            }
          },
          cliente: {
            select: {
              id: true,
              nombrecompleto: true,
              correo: true,
              telefono: true
            }
          },
          tecnicoActual: {
            select: {
              id: true,
              nombrecompleto: true,
              correo: true,
              telefono: true
            }
          },
          historiales: {
            include: {
              usuarioCambio: {
                select: {
                  id: true,
                  nombrecompleto: true,
                  correo: true,
                  telefono: true
                }
              },
              imagenes: {
                include: {
                  usuario: {
                    select: {
                      id: true,
                      nombrecompleto: true,
                      correo: true
                    }
                  }
                }
              }
            },
            orderBy: {
              cambiadoen: 'desc'
            }
          },
          valoraciones: {
            include: {
              cliente: {
                select: {
                  id: true,
                  nombrecompleto: true,
                  correo: true
                }
              }
            }
          }
        }
      });

      // Actualizar cargaactual de los técnicos afectados
      const tecnicoAnteriorId = tiqueteExistente.idtecnicoactual;
      const tecnicoNuevoId = idtecnicoactual !== undefined && idtecnicoactual !== null 
        ? parseInt(idtecnicoactual) 
        : null;

      // Función para recalcular cargaactual de un técnico
      const recalcularCargaActual = async (idTecnico: number | null) => {
        if (!idTecnico) return;
        
        const ticketsActivos = await this.prisma.tiquete.count({
          where: {
            idtecnicoactual: idTecnico,
            estado: {
              notIn: [EstadoTiquete.RESUELTO, EstadoTiquete.CERRADO]
            }
          }
        });

        await this.prisma.usuario.update({
          where: { id: idTecnico },
          data: { cargaactual: ticketsActivos }
        });
      };

      // Recalcular cargaactual del técnico anterior (si había uno y cambió)
      if (tecnicoAnteriorId && tecnicoAnteriorId !== tecnicoNuevoId) {
        await recalcularCargaActual(tecnicoAnteriorId);
      }

      // Recalcular cargaactual del técnico nuevo (si hay uno y es diferente al anterior)
      if (tecnicoNuevoId && tecnicoNuevoId !== tecnicoAnteriorId) {
        await recalcularCargaActual(tecnicoNuevoId);
      }

      // Crear registro en el historial si hubo cambio de estado o asignación de técnico
      let historialCreado = false;
      if (estadoAnterior !== nuevoEstado || 
          (idtecnicoactual !== undefined && tiqueteExistente.idtecnicoactual !== parseInt(idtecnicoactual))) {
        
        const usuarioCambioId = idUsuarioCambio || tiqueteExistente.idcliente; // Usar el usuario que hace el cambio o el cliente por defecto
        
        let observacion = '';
        if (estadoAnterior !== nuevoEstado) {
          observacion = `Estado cambiado de ${estadoAnterior} a ${nuevoEstado}`;
        }
        
        if (idtecnicoactual !== undefined && tiqueteExistente.idtecnicoactual !== parseInt(idtecnicoactual)) {
          if (idtecnicoactual !== null) {
            observacion += observacion ? `. Técnico asignado: ${tecnicoAsignado?.nombrecompleto}` 
                                      : `Técnico asignado: ${tecnicoAsignado?.nombrecompleto}`;
          } else {
            observacion += observacion ? '. Técnico desasignado' : 'Técnico desasignado';
          }
        }

        await this.prisma.historialTiquete.create({
          data: {
            idtiquete: idTiquete,
            estadoanterior: estadoAnterior,
            estadonuevo: nuevoEstado,
            observacion: observacion || 'Técnico asignado',
            cambiadopor: parseInt(usuarioCambioId.toString())
          }
        });
        historialCreado = true;
      }

      // Si se creó un historial, recargar el ticket con el historial actualizado
      if (historialCreado) {
        const tiqueteConHistorial = await this.prisma.tiquete.findFirst({
          where: { id: idTiquete },
          include: {
            categoria: {
              include: {
                politicaSla: {
                  select: {
                    nombre: true,
                    descripcion: true,
                    maxminutosrespuesta: true,
                    maxminutosresolucion: true
                  }
                }
              }
            },
            cliente: {
              select: {
                id: true,
                nombrecompleto: true,
                correo: true,
                telefono: true
              }
            },
            tecnicoActual: {
              select: {
                id: true,
                nombrecompleto: true,
                correo: true,
                telefono: true
              }
            },
            historiales: {
              include: {
                usuarioCambio: {
                  select: {
                    id: true,
                    nombrecompleto: true,
                    correo: true,
                    telefono: true
                  }
                },
                imagenes: {
                  include: {
                    usuario: {
                      select: {
                        id: true,
                        nombrecompleto: true,
                        correo: true
                      }
                    }
                  }
                }
              },
              orderBy: {
                cambiadoen: 'desc'
              }
            },
            valoraciones: {
              include: {
                cliente: {
                  select: {
                    id: true,
                    nombrecompleto: true,
                    correo: true
                  }
                }
              }
            }
          }
        });
        
        if (tiqueteConHistorial) {
          tiqueteActualizado.historiales = tiqueteConHistorial.historiales;
        }
      }

      // Recalcular cumplimiento de SLA (similar a getById)
      let diasResolucion = null;
      if (tiqueteActualizado.resueltoen) {
        const diffTime = Math.abs(new Date(tiqueteActualizado.resueltoen).getTime() - new Date(tiqueteActualizado.creadoen).getTime());
        diasResolucion = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      let horasRespuesta = null;
      if (tiqueteActualizado.primerarespuestaen) {
        const diffTime = Math.abs(new Date(tiqueteActualizado.primerarespuestaen).getTime() - new Date(tiqueteActualizado.creadoen).getTime());
        horasRespuesta = Math.round(diffTime / (1000 * 60 * 60) * 10) / 10;
      }

      let horasResolucion = null;
      if (tiqueteActualizado.resueltoen) {
        const diffTime = Math.abs(new Date(tiqueteActualizado.resueltoen).getTime() - new Date(tiqueteActualizado.creadoen).getTime());
        horasResolucion = Math.round(diffTime / (1000 * 60 * 60) * 10) / 10;
      }

      // Formatear historial (similar a getById)
      const historiales = tiqueteActualizado.historiales.map(hist => ({
        id: hist.id,
        estadoanterior: hist.estadoanterior,
        estadonuevo: hist.estadonuevo,
        observacion: hist.observacion,
        cambiadoen: hist.cambiadoen,
        cambiadopor: hist.usuarioCambio,
        imagenes: hist.imagenes.map(img => ({
          id: img.id,
          rutaarchivo: img.rutaarchivo,
          subidoen: img.subidoen,
          subidopor: img.usuario
        }))
      }));

      // Formatear valoraciones (similar a getById)
      const valoraciones = tiqueteActualizado.valoraciones.map(val => ({
        id: val.id,
        calificacion: val.calificacion,
        comentario: val.comentario,
        creadaen: val.creadaen,
        cliente: val.cliente
      }));

      // Formatear respuesta igual que getById
      const tiqueteDetail = {
        // Información básica
        id: tiqueteActualizado.id,
        titulo: tiqueteActualizado.titulo,
        descripcion: tiqueteActualizado.descripcion,
        prioridad: tiqueteActualizado.prioridad,
        estado: tiqueteActualizado.estado,
        
        // Fechas
        creadoen: tiqueteActualizado.creadoen,
        primerarespuestaen: tiqueteActualizado.primerarespuestaen,
        resueltoen: tiqueteActualizado.resueltoen,
        cerradoen: tiqueteActualizado.cerradoen,
        vencerespuesta: tiqueteActualizado.vencerespuesta,
        venceresolucion: tiqueteActualizado.venceresolucion,
        
        // Relaciones
        categoria: {
          id: tiqueteActualizado.categoria.id,
          nombre: tiqueteActualizado.categoria.nombre,
          descripcion: tiqueteActualizado.categoria.descripcion
        },
        cliente: tiqueteActualizado.cliente,
        tecnicoActual: tiqueteActualizado.tecnicoActual || null,
        
        // SLA
        sla: {
          nombre: tiqueteActualizado.categoria.politicaSla.nombre,
          descripcion: tiqueteActualizado.categoria.politicaSla.descripcion,
          maxminutosrespuesta: tiqueteActualizado.categoria.politicaSla.maxminutosrespuesta,
          maxminutosresolucion: tiqueteActualizado.categoria.politicaSla.maxminutosresolucion,
          tiempoRespuestaHoras: Math.round(tiqueteActualizado.categoria.politicaSla.maxminutosrespuesta / 60 * 10) / 10,
          tiempoResolucionHoras: Math.round(tiqueteActualizado.categoria.politicaSla.maxminutosresolucion / 60 * 10) / 10
        },
        
        // Cumplimiento SLA calculado
        cumplimiento: {
          cumplioslarespuesta: tiqueteActualizado.cumplioslarespuesta,
          cumplioslaresolucion: tiqueteActualizado.cumplioslaresolucion,
          diasResolucion: diasResolucion,
          horasRespuesta: horasRespuesta,
          horasResolucion: horasResolucion
        },
        
        // Historial y valoraciones
        historiales: historiales,
        valoraciones: valoraciones
      };

      response.json({
        success: true,
        message: 'Ticket actualizado exitosamente',
        data: {
          tiquete: tiqueteDetail
        }
      });
    } catch (error) {
      next(error);
    }
  };
}