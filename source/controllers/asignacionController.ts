import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PrismaClient, RoleNombre } from "../../generated/prisma";

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
}