import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PrismaClient } from "../../generated/prisma";

export class AsignacionController {
  prisma = new PrismaClient();

  // Obtener asignaciones por semana para un técnico
  getAsignacionesPorSemana = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const idTecnico = parseInt(request.params.idTecnico);
      const { fechaInicio, fechaFin } = request.query;

      if (isNaN(idTecnico)) {
        return next(AppError.badRequest("El ID de técnico no es válido"));
      }

      // Verificar que el técnico existe
      const tecnico = await this.prisma.usuario.findUnique({
        where: { id: idTecnico },
        select: { id: true, nombrecompleto: true }
      });

      if (!tecnico) {
        return next(AppError.notFound("Técnico no encontrado"));
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

      // Obtener tickets asignados al técnico en el rango de fechas
      const asignaciones = await this.prisma.tiquete.findMany({
        where: {
          idtecnicoactual: idTecnico,
          creadoen: {
            gte: startDate,
            lte: endDate
          }
        },
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