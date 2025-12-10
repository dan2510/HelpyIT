import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PrismaClient, RoleNombre, EstadoTiquete, Prioridad, MetodoAsignacion, TipoNotificacion, TipoHistorial, Disponibilidad } from "../../generated/prisma";
import { NotificacionController } from "./notificacionController";

export class AsignacionController {
  prisma = new PrismaClient();

  // Obtener asignaciones por semana para el técnico autenticado o todas las asignaciones si es admin
  getAsignacionesPorSemana = async (request: Request, response: Response, next: NextFunction) => {
    try {
      // Obtener el usuario autenticado desde req.user
      const usuarioAutenticado = request.user as any;
      
      if (!usuarioAutenticado || !usuarioAutenticado.id) {
        return next(AppError.unauthorized("Usuario no autenticado"));
      }

      const { fechaInicio, fechaFin, idTecnico } = request.query;

      // Verificar el usuario autenticado
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: usuarioAutenticado.id },
        include: {
          rol: true
        }
      });

      if (!usuario) {
        return next(AppError.notFound("Usuario no encontrado"));
      }

      // Determinar qué técnico ver
      let idTecnicoFiltro: number | null = null;
      let tecnico: any = null;

      if (usuario.rol.nombre === RoleNombre.ADMIN) {
        // Si es admin y se especifica un técnico, ver ese técnico
        // Si no se especifica, ver todas las asignaciones
        if (idTecnico) {
          idTecnicoFiltro = parseInt(idTecnico as string);
          tecnico = await this.prisma.usuario.findUnique({
            where: { id: idTecnicoFiltro },
            select: { 
              id: true, 
              nombrecompleto: true
            }
          });
          if (!tecnico) {
            return next(AppError.notFound("Técnico no encontrado"));
          }
        } else {
          // Admin sin técnico específico - ver todas las asignaciones
          tecnico = { id: null, nombrecompleto: 'Todos los Técnicos' };
        }
      } else if (usuario.rol.nombre === RoleNombre.TECNICO) {
        // Si es técnico, solo puede ver sus propias asignaciones
        idTecnicoFiltro = usuario.id;
        tecnico = {
          id: usuario.id,
          nombrecompleto: usuario.nombrecompleto
        };
      } else {
        return next(AppError.forbidden("Solo los técnicos y administradores pueden ver asignaciones"));
      }

      // Definir rango de fechas (si no se proporciona, usar la semana actual)
      let startDate: Date;
      let endDate: Date;

      if (fechaInicio && fechaFin) {
        startDate = new Date(fechaInicio as string);
        endDate = new Date(fechaFin as string);
      } else {
        // Semana actual (Lunes a Domingo)
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Ajustar al lunes
        
        startDate = new Date(now);
        startDate.setDate(now.getDate() + diff);
        startDate.setHours(0, 0, 0, 0);
        
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
      }

      // Construir el filtro where según el rol
      const whereClause: any = {
        creadoen: {
          gte: startDate,
          lte: endDate
        }
      };

      // Si se especifica un técnico, filtrar por ese técnico
      if (idTecnicoFiltro !== null) {
        whereClause.idtecnicoactual = idTecnicoFiltro;
      } else {
        // Admin viendo todas las asignaciones - solo tiquetes que tienen técnico asignado
        whereClause.idtecnicoactual = { not: null };
      }

      // Obtener tickets asignados en el rango de fechas
      const asignaciones = await this.prisma.tiquete.findMany({
        where: whereClause,
        select: {
          id: true,
          titulo: true,
          descripcion: true,
          estado: true,
          prioridad: true,
          creadoen: true,
          vencerespuesta: true,
          venceresolucion: true,
          categoria: {
            select: {
              id: true,
              nombre: true,
              politicaSla: {
                select: {
                  nombre: true,
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
              correo: true
            }
          },
          tecnicoActual: {
            select: {
              id: true,
              nombrecompleto: true,
              correo: true
            }
          }
        },
        orderBy: {
          creadoen: 'asc'
        }
      });

      // Calcular tiempo restante de SLA para cada ticket
      const asignacionesConSLA = asignaciones.map(ticket => {
        const now = new Date();
        const venceResolucion = new Date(ticket.venceresolucion);
        const diffMs = venceResolucion.getTime() - now.getTime();
        const horasRestantes = Math.max(0, Math.round(diffMs / (1000 * 60 * 60)));
        
        // Calcular porcentaje de urgencia (0-100)
        const tiempoTotalSLA = ticket.categoria.politicaSla.maxminutosresolucion;
        const tiempoTranscurrido = (now.getTime() - new Date(ticket.creadoen).getTime()) / (1000 * 60);
        const porcentajeUrgencia = Math.min(100, Math.round((tiempoTranscurrido / tiempoTotalSLA) * 100));

        return {
          id: ticket.id,
          titulo: ticket.titulo,
          descripcion: ticket.descripcion,
          estado: ticket.estado,
          prioridad: ticket.prioridad,
          creadoen: ticket.creadoen,
          categoria: ticket.categoria,
          cliente: ticket.cliente,
          tecnicoActual: ticket.tecnicoActual,
          sla: {
            nombre: ticket.categoria.politicaSla.nombre,
            venceresolucion: ticket.venceresolucion,
            horasRestantes: horasRestantes,
            porcentajeUrgencia: porcentajeUrgencia,
            estadoSLA: horasRestantes > 24 ? 'OK' : horasRestantes > 4 ? 'ADVERTENCIA' : 'CRITICO'
          }
        };
      });

      const responseData = {
        success: true,
        data: {
          tecnico: tecnico,
          semana: {
            inicio: startDate,
            fin: endDate
          },
          asignaciones: asignacionesConSLA,
          total: asignacionesConSLA.length
        }
      };

      response.json(responseData);
    } catch (error) {
      next(error);
    }
  };

  // ========== ASIGNACIÓN AUTOMÁTICA (AUTOTRIAGE) ==========
  
  /**
   * Calcula el puntaje de prioridad para un ticket
   * Fórmula: puntaje = (prioridad * 1000) - tiempoRestanteSLA
   */
  private calcularPuntajePrioridad(prioridad: Prioridad, tiempoRestanteSLAHoras: number): number {
    // Mapear prioridad a valor numérico
    const valoresPrioridad: { [key in Prioridad]: number } = {
      [Prioridad.BAJA]: 1,
      [Prioridad.MEDIA]: 2,
      [Prioridad.ALTA]: 3,
      [Prioridad.CRITICA]: 4
    };
    
    const valorPrioridad = valoresPrioridad[prioridad] || 2;
    const puntaje = (valorPrioridad * 1000) - tiempoRestanteSLAHoras;
    
    return puntaje;
  }

  /**
   * Obtiene el tiempo restante del SLA en horas
   */
  private calcularTiempoRestanteSLA(venceresolucion: Date): number {
    const now = new Date();
    const diffMs = venceresolucion.getTime() - now.getTime();
    const horasRestantes = Math.max(0, Math.round(diffMs / (1000 * 60 * 60)));
    return horasRestantes;
  }

  /**
   * Encuentra el técnico más adecuado para un ticket
   */
  private async encontrarTecnicoAdecuado(
    ticket: any,
    tiempoRestanteSLA: number
  ): Promise<{ tecnico: any; puntaje: number; justificacion: string } | null> {
    // Primero, obtener las especialidades requeridas para la categoría del ticket
    const especialidadesRequeridas = await this.prisma.categoriaEspecialidad.findMany({
      where: {
        idcategoria: ticket.idcategoria
      },
      include: {
        especialidad: true
      }
    });

    if (especialidadesRequeridas.length === 0) {
      // Si la categoría no tiene especialidades requeridas, buscar cualquier técnico disponible
      console.log(`⚠️ Categoría ${ticket.idcategoria} no tiene especialidades requeridas`);
    }

    const idsEspecialidadesRequeridas = especialidadesRequeridas.map(ce => ce.idespecialidad);

    // Obtener todos los técnicos activos y disponibles
    const tecnicos = await this.prisma.usuario.findMany({
      where: {
        rol: { nombre: RoleNombre.TECNICO },
        activo: true,
        disponibilidad: { in: [Disponibilidad.DISPONIBLE, Disponibilidad.OCUPADO] }
      },
      include: {
        especialidades: {
          include: {
            especialidad: true
          }
        }
      }
    });

    if (tecnicos.length === 0) {
      console.log('⚠️ No hay técnicos disponibles');
      return null;
    }

    // Calcular puntaje para cada técnico
    const tecnicosConPuntaje = await Promise.all(
      tecnicos.map(async (tecnico) => {
        // Verificar si tiene alguna de las especialidades requeridas
        const idsEspecialidadesTecnico = tecnico.especialidades.map(ue => ue.idespecialidad);
        const tieneEspecialidad = idsEspecialidadesRequeridas.length === 0 
          ? true // Si no hay especialidades requeridas, cualquier técnico puede
          : idsEspecialidadesTecnico.some(id => idsEspecialidadesRequeridas.includes(id));

        if (!tieneEspecialidad) {
          return null; // No considerar técnicos sin la especialidad requerida
        }

        // Calcular carga actual (porcentaje)
        const cargaPorcentaje = tecnico.maxticketsimultaneos > 0
          ? (tecnico.cargaactual / tecnico.maxticketsimultaneos) * 100
          : 100;

        // Calcular puntaje base del ticket
        const puntajeTicket = this.calcularPuntajePrioridad(ticket.prioridad, tiempoRestanteSLA);

        // Ajustar puntaje según carga del técnico (menor carga = mejor)
        const factorCarga = 100 - cargaPorcentaje; // Invertir: menor carga = mayor factor
        const puntajeFinal = puntajeTicket + (factorCarga * 10); // Añadir bonus por disponibilidad

        // Verificar disponibilidad
        const disponible = tecnico.disponibilidad === Disponibilidad.DISPONIBLE;
        if (!disponible && cargaPorcentaje >= 100) {
          return null; // No considerar técnicos ocupados al máximo
        }

        // Obtener nombre de la especialidad coincidente
        const especialidadCoincidente = tecnico.especialidades.find(ue => 
          idsEspecialidadesRequeridas.includes(ue.idespecialidad)
        );

        // Crear justificación
        const justificacion = `Técnico ${tecnico.nombrecompleto} seleccionado. ` +
          `Puntaje del ticket: ${puntajeTicket}, ` +
          `Carga actual: ${cargaPorcentaje.toFixed(1)}%, ` +
          `Disponibilidad: ${tecnico.disponibilidad}, ` +
          `Especialidad: ${especialidadCoincidente?.especialidad.nombre || 'N/A'}`;

        return {
          tecnico,
          puntaje: puntajeFinal,
          justificacion
        };
      })
    );

    // Filtrar nulos y ordenar por puntaje descendente
    const tecnicosValidos = tecnicosConPuntaje
      .filter((t): t is { tecnico: any; puntaje: number; justificacion: string } => t !== null)
      .sort((a, b) => b.puntaje - a.puntaje);

    if (tecnicosValidos.length === 0) {
      console.log('⚠️ No se encontraron técnicos válidos para asignar');
      return null;
    }

    return tecnicosValidos[0];
  }

  /**
   * Asignar automáticamente un ticket específico
   * Esta función puede ser llamada desde otros controladores
   */
  async asignarTicketAutomatico(ticketId: number, usuarioAsignadorId: number): Promise<{ asignado: boolean; tecnico?: any; justificacion?: string; error?: string }> {
    try {
      // Obtener el ticket
      const ticket = await this.prisma.tiquete.findUnique({
        where: { id: ticketId },
        include: {
          categoria: {
            include: {
              politicaSla: true,
              especialidades: {
                include: {
                  especialidad: true
                }
              }
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

      if (!ticket) {
        return { asignado: false, error: 'Ticket no encontrado' };
      }

      // Verificar que el ticket esté en estado PENDIENTE y sin técnico asignado
      if (ticket.estado !== EstadoTiquete.PENDIENTE || ticket.idtecnicoactual !== null) {
        return { asignado: false, error: 'El ticket no está disponible para asignación automática' };
      }

      // Calcular tiempo restante SLA
      const tiempoRestanteSLA = this.calcularTiempoRestanteSLA(ticket.venceresolucion);
      
      // Encontrar técnico adecuado
      const resultado = await this.encontrarTecnicoAdecuado(ticket, tiempoRestanteSLA);

      if (!resultado) {
        return { asignado: false, error: 'No se encontró técnico adecuado con la especialidad requerida' };
      }

      // Asignar el ticket
      const puntajeTicket = this.calcularPuntajePrioridad(ticket.prioridad, tiempoRestanteSLA);

      // Actualizar ticket
      await this.prisma.tiquete.update({
        where: { id: ticketId },
        data: {
          idtecnicoactual: resultado.tecnico.id,
          estado: EstadoTiquete.ASIGNADO
        }
      });

      // Crear registro de asignación
      await this.prisma.asignacionTiquete.create({
        data: {
          idtiquete: ticketId,
          idtecnico: resultado.tecnico.id,
          metodo: MetodoAsignacion.AUTOMATICO,
          justificacion: resultado.justificacion,
          puntajeasignacion: puntajeTicket,
          asignadopor: usuarioAsignadorId
        }
      });

      // Crear historial
      await this.prisma.historialTiquete.create({
        data: {
          idtiquete: ticketId,
          tipo: TipoHistorial.CAMBIO_ESTADO,
          estadoanterior: EstadoTiquete.PENDIENTE,
          estadonuevo: EstadoTiquete.ASIGNADO,
          observacion: `Asignación automática: ${resultado.justificacion}`,
          cambiadopor: usuarioAsignadorId
        }
      });

      // Actualizar carga del técnico
      const cargaActual = await this.prisma.tiquete.count({
        where: {
          idtecnicoactual: resultado.tecnico.id,
          estado: { notIn: [EstadoTiquete.RESUELTO, EstadoTiquete.CERRADO] }
        }
      });

      await this.prisma.usuario.update({
        where: { id: resultado.tecnico.id },
        data: { cargaactual: cargaActual }
      });

      // Generar notificaciones
      try {
        // Notificar al técnico
        await NotificacionController.crearNotificacion(
          this.prisma,
          {
            tipo: TipoNotificacion.ASIGNACION,
            idusuariodestino: resultado.tecnico.id,
            idusuarioorigen: usuarioAsignadorId,
            idtiquete: ticketId,
            titulo: 'Ticket asignado automáticamente',
            contenido: `Se te ha asignado automáticamente el ticket "${ticket.titulo}". ${resultado.justificacion}`
          }
        );

        // Notificar al cliente
        await NotificacionController.crearNotificacion(
          this.prisma,
          {
            tipo: TipoNotificacion.ASIGNACION,
            idusuariodestino: ticket.idcliente,
            idusuarioorigen: usuarioAsignadorId,
            idtiquete: ticketId,
            titulo: 'Técnico asignado a tu ticket',
            contenido: `Se ha asignado un técnico al ticket "${ticket.titulo}". ${resultado.justificacion}`
          }
        );
      } catch (error) {
        console.error('Error al crear notificaciones:', error);
        // No fallar la asignación si falla la notificación
      }

      return {
        asignado: true,
        tecnico: {
          id: resultado.tecnico.id,
          nombrecompleto: resultado.tecnico.nombrecompleto
        },
        justificacion: resultado.justificacion
      };
    } catch (error: any) {
      console.error('Error en asignación automática de ticket:', error);
      return { asignado: false, error: error.message || 'Error al asignar ticket automáticamente' };
    }
  }

  /**
   * Asignación automática de tickets pendientes
   * POST /asignaciones/automatica
   */
  asignacionAutomatica = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const usuarioAutenticado = request.user as any;
      
      if (!usuarioAutenticado || !usuarioAutenticado.id) {
        return next(AppError.unauthorized("Usuario no autenticado"));
      }

      // Verificar que el usuario es ADMIN
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: usuarioAutenticado.id },
        include: { rol: true }
      });

      if (!usuario || usuario.rol.nombre !== RoleNombre.ADMIN) {
        return next(AppError.forbidden("Solo los administradores pueden ejecutar asignación automática"));
      }

      // Obtener todos los tickets en estado PENDIENTE sin técnico asignado
      const ticketsPendientes = await this.prisma.tiquete.findMany({
        where: {
          estado: EstadoTiquete.PENDIENTE,
          idtecnicoactual: null
        },
        include: {
          categoria: {
            include: {
              politicaSla: true,
              especialidades: {
                include: {
                  especialidad: true
                }
              }
            }
          },
          cliente: {
            select: {
              id: true,
              nombrecompleto: true,
              correo: true
            }
          }
        },
        orderBy: {
          creadoen: 'asc'
        }
      });

      if (ticketsPendientes.length === 0) {
        return response.json({
          success: true,
          message: "No hay tickets pendientes para asignar",
          data: {
            asignados: 0,
            noAsignados: 0,
            detalles: []
          }
        });
      }

      const resultados: any[] = [];
      let asignados = 0;
      let noAsignados = 0;

      // Procesar cada ticket
      for (const ticket of ticketsPendientes) {
        const tiempoRestanteSLA = this.calcularTiempoRestanteSLA(ticket.venceresolucion);
        const resultado = await this.encontrarTecnicoAdecuado(ticket, tiempoRestanteSLA);

        if (resultado) {
          // Asignar el ticket
          const puntajeTicket = this.calcularPuntajePrioridad(ticket.prioridad, tiempoRestanteSLA);

          // Actualizar ticket
          await this.prisma.tiquete.update({
            where: { id: ticket.id },
            data: {
              idtecnicoactual: resultado.tecnico.id,
              estado: EstadoTiquete.ASIGNADO
            }
          });

          // Crear registro de asignación
          await this.prisma.asignacionTiquete.create({
            data: {
              idtiquete: ticket.id,
              idtecnico: resultado.tecnico.id,
              metodo: MetodoAsignacion.AUTOMATICO,
              justificacion: resultado.justificacion,
              puntajeasignacion: puntajeTicket,
              asignadopor: usuarioAutenticado.id
            }
          });

          // Crear historial
          await this.prisma.historialTiquete.create({
            data: {
              idtiquete: ticket.id,
              tipo: TipoHistorial.CAMBIO_ESTADO,
              estadoanterior: EstadoTiquete.PENDIENTE,
              estadonuevo: EstadoTiquete.ASIGNADO,
              observacion: `Asignación automática: ${resultado.justificacion}`,
              cambiadopor: usuarioAutenticado.id
            }
          });

          // Actualizar carga del técnico
          const cargaActual = await this.prisma.tiquete.count({
            where: {
              idtecnicoactual: resultado.tecnico.id,
              estado: { notIn: [EstadoTiquete.RESUELTO, EstadoTiquete.CERRADO] }
            }
          });

          await this.prisma.usuario.update({
            where: { id: resultado.tecnico.id },
            data: { cargaactual: cargaActual }
          });

          // Generar notificaciones
          try {
            // Notificar al técnico
            await NotificacionController.crearNotificacion(
              this.prisma,
              {
                tipo: TipoNotificacion.ASIGNACION,
                idusuariodestino: resultado.tecnico.id,
                idusuarioorigen: usuarioAutenticado.id,
                idtiquete: ticket.id,
                titulo: 'Ticket asignado automáticamente',
                contenido: `Se te ha asignado automáticamente el ticket "${ticket.titulo}". ${resultado.justificacion}`
              }
            );

            // Notificar al cliente
            await NotificacionController.crearNotificacion(
              this.prisma,
              {
                tipo: TipoNotificacion.ASIGNACION,
                idusuariodestino: ticket.idcliente,
                idusuarioorigen: usuarioAutenticado.id,
                idtiquete: ticket.id,
                titulo: 'Técnico asignado a tu ticket',
                contenido: `Se ha asignado un técnico al ticket "${ticket.titulo}". ${resultado.justificacion}`
              }
            );
          } catch (error) {
            console.error('Error al crear notificaciones:', error);
          }

          resultados.push({
            ticketId: ticket.id,
            ticketTitulo: ticket.titulo,
            tecnicoId: resultado.tecnico.id,
            tecnicoNombre: resultado.tecnico.nombrecompleto,
            puntaje: puntajeTicket,
            tiempoRestanteSLA,
            justificacion: resultado.justificacion,
            asignado: true
          });

          asignados++;
        } else {
          resultados.push({
            ticketId: ticket.id,
            ticketTitulo: ticket.titulo,
            tecnicoId: null,
            tecnicoNombre: null,
            puntaje: this.calcularPuntajePrioridad(ticket.prioridad, tiempoRestanteSLA),
            tiempoRestanteSLA,
            justificacion: "No se encontró técnico adecuado con la especialidad requerida",
            asignado: false
          });

          noAsignados++;
        }
      }

      response.json({
        success: true,
        message: `Asignación automática completada: ${asignados} asignados, ${noAsignados} no asignados`,
        data: {
          asignados,
          noAsignados,
          detalles: resultados
        }
      });
    } catch (error: any) {
      console.error('Error en asignación automática:', error);
      next(AppError.internalServer("Error al ejecutar asignación automática"));
    }
  };

  // ========== ASIGNACIÓN MANUAL ==========

  /**
   * Obtener tickets pendientes para asignación manual
   * GET /asignaciones/manual/pendientes
   */
  getTicketsPendientes = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const usuarioAutenticado = request.user as any;
      
      if (!usuarioAutenticado || !usuarioAutenticado.id) {
        return next(AppError.unauthorized("Usuario no autenticado"));
      }

      // Verificar que el usuario es ADMIN
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: usuarioAutenticado.id },
        include: { rol: true }
      });

      if (!usuario || usuario.rol.nombre !== RoleNombre.ADMIN) {
        return next(AppError.forbidden("Solo los administradores pueden ver tickets pendientes"));
      }

      // Obtener tickets pendientes
      const tickets = await this.prisma.tiquete.findMany({
        where: {
          estado: EstadoTiquete.PENDIENTE,
          idtecnicoactual: null
        },
        include: {
          categoria: {
            include: {
              politicaSla: true,
              especialidades: {
                include: {
                  especialidad: true
                }
              }
            }
          },
          cliente: {
            select: {
              id: true,
              nombrecompleto: true,
              correo: true
            }
          }
        },
        orderBy: {
          creadoen: 'asc'
        }
      });

      // Calcular información adicional para cada ticket
      const ticketsConInfo = tickets.map(ticket => {
        const tiempoRestanteSLA = this.calcularTiempoRestanteSLA(ticket.venceresolucion);
        const puntaje = this.calcularPuntajePrioridad(ticket.prioridad, tiempoRestanteSLA);
        
        return {
          id: ticket.id,
          titulo: ticket.titulo,
          descripcion: ticket.descripcion,
          prioridad: ticket.prioridad,
          categoria: ticket.categoria,
          cliente: ticket.cliente,
          creadoen: ticket.creadoen,
          vencerespuesta: ticket.vencerespuesta,
          venceresolucion: ticket.venceresolucion,
          tiempoRestanteSLA,
          puntaje,
          especialidadesRequeridas: ticket.categoria.especialidades.map(ce => ce.especialidad)
        };
      });

      response.json({
        success: true,
        data: {
          tickets: ticketsConInfo,
          total: ticketsConInfo.length
        }
      });
    } catch (error: any) {
      console.error('Error al obtener tickets pendientes:', error);
      next(AppError.internalServer("Error al obtener tickets pendientes"));
    }
  };

  /**
   * Obtener técnicos disponibles para asignación manual
   * GET /asignaciones/manual/tecnicos
   */
  getTecnicosDisponibles = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const usuarioAutenticado = request.user as any;
      
      if (!usuarioAutenticado || !usuarioAutenticado.id) {
        return next(AppError.unauthorized("Usuario no autenticado"));
      }

      // Verificar que el usuario es ADMIN
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: usuarioAutenticado.id },
        include: { rol: true }
      });

      if (!usuario || usuario.rol.nombre !== RoleNombre.ADMIN) {
        return next(AppError.forbidden("Solo los administradores pueden ver técnicos disponibles"));
      }

      const { idCategoria } = request.query;

      // Construir filtro de especialidad si se proporciona categoría
      const whereClause: any = {
        rol: { nombre: RoleNombre.TECNICO },
        activo: true
      };

      if (idCategoria) {
        const categoriaId = parseInt(idCategoria as string);
        whereClause.especialidades = {
          some: {
            especialidad: {
              categorias: {
                some: {
                  idcategoria: categoriaId
                }
              }
            }
          }
        };
      }

      // Obtener técnicos
      const tecnicos = await this.prisma.usuario.findMany({
        where: whereClause,
        include: {
          especialidades: {
            include: {
              especialidad: {
                include: {
                  categorias: {
                    include: {
                      categoria: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          nombrecompleto: 'asc'
        }
      });

      // Calcular información adicional
      const tecnicosConInfo = await Promise.all(
        tecnicos.map(async (tecnico) => {
          const ticketsActivos = await this.prisma.tiquete.count({
            where: {
              idtecnicoactual: tecnico.id,
              estado: { notIn: [EstadoTiquete.RESUELTO, EstadoTiquete.CERRADO] }
            }
          });

          const cargaPorcentaje = tecnico.maxticketsimultaneos > 0
            ? (ticketsActivos / tecnico.maxticketsimultaneos) * 100
            : 100;

          return {
            id: tecnico.id,
            nombrecompleto: tecnico.nombrecompleto,
            correo: tecnico.correo,
            telefono: tecnico.telefono,
            disponibilidad: tecnico.disponibilidad,
            cargaactual: ticketsActivos,
            maxticketsimultaneos: tecnico.maxticketsimultaneos,
            cargaPorcentaje: Math.round(cargaPorcentaje),
            especialidades: tecnico.especialidades.map(ue => ({
              id: ue.especialidad.id,
              nombre: ue.especialidad.nombre,
              nivelExperiencia: ue.nivelexperiencia
            }))
          };
        })
      );

      response.json({
        success: true,
        data: {
          tecnicos: tecnicosConInfo,
          total: tecnicosConInfo.length
        }
      });
    } catch (error: any) {
      console.error('Error al obtener técnicos disponibles:', error);
      next(AppError.internalServer("Error al obtener técnicos disponibles"));
    }
  };

  /**
   * Asignación manual de ticket
   * POST /asignaciones/manual
   */
  asignacionManual = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const usuarioAutenticado = request.user as any;
      
      if (!usuarioAutenticado || !usuarioAutenticado.id) {
        return next(AppError.unauthorized("Usuario no autenticado"));
      }

      // Verificar que el usuario es ADMIN
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: usuarioAutenticado.id },
        include: { rol: true }
      });

      if (!usuario || usuario.rol.nombre !== RoleNombre.ADMIN) {
        return next(AppError.forbidden("Solo los administradores pueden realizar asignaciones manuales"));
      }

      const { idTicket, idTecnico, justificacion } = request.body;

      // Validaciones
      if (!idTicket || !idTecnico) {
        return next(AppError.badRequest("Se requiere idTicket e idTecnico"));
      }

      const ticketId = parseInt(idTicket);
      const tecnicoId = parseInt(idTecnico);

      if (isNaN(ticketId) || isNaN(tecnicoId)) {
        return next(AppError.badRequest("IDs inválidos"));
      }

      // Verificar que el ticket existe y está en estado PENDIENTE
      const ticket = await this.prisma.tiquete.findUnique({
        where: { id: ticketId },
        include: {
          categoria: {
            include: {
              especialidades: {
                include: {
                  especialidad: true
                }
              }
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

      if (!ticket) {
        return next(AppError.notFound("Ticket no encontrado"));
      }

      if (ticket.estado !== EstadoTiquete.PENDIENTE) {
        return next(AppError.badRequest("Solo se pueden asignar tickets en estado PENDIENTE"));
      }

      if (ticket.idtecnicoactual !== null) {
        return next(AppError.badRequest("El ticket ya tiene un técnico asignado"));
      }

      // Verificar que el técnico existe y es técnico
      const tecnico = await this.prisma.usuario.findFirst({
        where: {
          id: tecnicoId,
          rol: { nombre: RoleNombre.TECNICO },
          activo: true
        },
        include: {
          especialidades: {
            include: {
              especialidad: {
                include: {
                  categorias: {
                    where: {
                      idcategoria: ticket.idcategoria
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!tecnico) {
        return next(AppError.notFound("Técnico no encontrado o inactivo"));
      }

      // Verificar que el técnico tiene la especialidad requerida
      const tieneEspecialidad = tecnico.especialidades.some(
        (ue) => ue.especialidad.categorias.length > 0
      );

      if (!tieneEspecialidad) {
        return next(AppError.badRequest("El técnico no tiene la especialidad requerida para esta categoría"));
      }

      // Calcular puntaje y tiempo restante SLA
      const tiempoRestanteSLA = this.calcularTiempoRestanteSLA(ticket.venceresolucion);
      const puntaje = this.calcularPuntajePrioridad(ticket.prioridad, tiempoRestanteSLA);

      // Actualizar ticket
      await this.prisma.tiquete.update({
        where: { id: ticketId },
        data: {
          idtecnicoactual: tecnicoId,
          estado: EstadoTiquete.ASIGNADO
        }
      });

      // Crear registro de asignación
      await this.prisma.asignacionTiquete.create({
        data: {
          idtiquete: ticketId,
          idtecnico: tecnicoId,
          metodo: MetodoAsignacion.MANUAL,
          justificacion: justificacion || `Asignación manual realizada por ${usuario.nombrecompleto}`,
          puntajeasignacion: puntaje,
          asignadopor: usuarioAutenticado.id
        }
      });

      // Crear historial
      await this.prisma.historialTiquete.create({
        data: {
          idtiquete: ticketId,
          tipo: TipoHistorial.CAMBIO_ESTADO,
          estadoanterior: EstadoTiquete.PENDIENTE,
          estadonuevo: EstadoTiquete.ASIGNADO,
          observacion: `Asignación manual: ${justificacion || 'Asignado por administrador'}`,
          cambiadopor: usuarioAutenticado.id
        }
      });

      // Actualizar carga del técnico
      const cargaActual = await this.prisma.tiquete.count({
        where: {
          idtecnicoactual: tecnicoId,
          estado: { notIn: [EstadoTiquete.RESUELTO, EstadoTiquete.CERRADO] }
        }
      });

      await this.prisma.usuario.update({
        where: { id: tecnicoId },
        data: { cargaactual: cargaActual }
      });

      // Generar notificaciones
      try {
        // Notificar al técnico
        await NotificacionController.crearNotificacion(
          this.prisma,
          {
            tipo: TipoNotificacion.ASIGNACION,
            idusuariodestino: tecnicoId,
            idusuarioorigen: usuarioAutenticado.id,
            idtiquete: ticketId,
            titulo: 'Ticket asignado manualmente',
            contenido: `Se te ha asignado el ticket "${ticket.titulo}". ${justificacion || 'Asignado por administrador'}.`
          }
        );

        // Notificar al cliente
        await NotificacionController.crearNotificacion(
          this.prisma,
          {
            tipo: TipoNotificacion.ASIGNACION,
            idusuariodestino: ticket.idcliente,
            idusuarioorigen: usuarioAutenticado.id,
            idtiquete: ticketId,
            titulo: 'Técnico asignado a tu ticket',
            contenido: `Se ha asignado un técnico al ticket "${ticket.titulo}". ${justificacion || 'Asignado por administrador'}.`
          }
        );
      } catch (error) {
        console.error('Error al crear notificaciones:', error);
      }

      // Obtener ticket actualizado
      const ticketActualizado = await this.prisma.tiquete.findUnique({
        where: { id: ticketId },
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
          },
          tecnicoActual: {
            select: {
              id: true,
              nombrecompleto: true,
              correo: true
            }
          }
        }
      });

      response.json({
        success: true,
        message: "Ticket asignado exitosamente",
        data: {
          ticket: ticketActualizado,
          asignacion: {
            tecnico: {
              id: tecnico.id,
              nombrecompleto: tecnico.nombrecompleto
            },
            puntaje,
            tiempoRestanteSLA,
            justificacion: justificacion || `Asignación manual realizada por ${usuario.nombrecompleto}`
          }
        }
      });
    } catch (error: any) {
      console.error('Error en asignación manual:', error);
      next(AppError.internalServer("Error al realizar asignación manual"));
    }
  };
}