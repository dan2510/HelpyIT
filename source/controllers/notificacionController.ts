import { Request, Response, NextFunction } from "express";
import { PrismaClient, TipoNotificacion, EstadoNotificacion } from "../../generated/prisma";
import { AppError } from "../errors/custom.error";

const prisma = new PrismaClient();

export class NotificacionController {
  // Obtener todas las notificaciones del usuario autenticado
  getAll = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const usuarioAutenticado = request.user as any;
      if (!usuarioAutenticado || !usuarioAutenticado.id) {
        return next(AppError.unauthorized("Usuario no autenticado"));
      }

      const notificaciones = await prisma.notificacion.findMany({
        where: {
          idusuariodestino: usuarioAutenticado.id
        },
        include: {
          usuarioDestino: {
            select: {
              id: true,
              nombrecompleto: true,
              correo: true
            }
          },
          usuarioOrigen: {
            select: {
              id: true,
              nombrecompleto: true,
              correo: true
            }
          },
          tiquete: {
            select: {
              id: true,
              titulo: true,
              estado: true
            }
          }
        },
        orderBy: {
          creadaen: 'desc'
        }
      });

      console.log(`✅ Se encontraron ${notificaciones.length} notificación(es) para usuario ID=${usuarioAutenticado.id}`);

      response.json({
        success: true,
        data: notificaciones
      });
    } catch (error: any) {
      console.error('Error al obtener notificaciones:', error);
      next(AppError.internalServer("Error al obtener las notificaciones"));
    }
  };

  // Marcar una notificación como leída
  marcarComoLeida = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const idNotificacion = parseInt(request.params.id);
      if (isNaN(idNotificacion)) {
        return next(AppError.badRequest("El ID de la notificación no es válido"));
      }

      const usuarioAutenticado = request.user as any;
      if (!usuarioAutenticado || !usuarioAutenticado.id) {
        return next(AppError.unauthorized("Usuario no autenticado"));
      }

      // Verificar que la notificación pertenece al usuario autenticado
      const notificacion = await prisma.notificacion.findFirst({
        where: {
          id: idNotificacion,
          idusuariodestino: usuarioAutenticado.id
        }
      });

      if (!notificacion) {
        return next(AppError.notFound("Notificación no encontrada o no tienes permiso para acceder a ella"));
      }

      // Validar que no esté ya leída
      if (notificacion.estado === EstadoNotificacion.LEIDA) {
        return next(AppError.badRequest("La notificación ya está marcada como leída"));
      }

      // Actualizar la notificación
      const notificacionActualizada = await prisma.notificacion.update({
        where: { id: idNotificacion },
        data: {
          estado: EstadoNotificacion.LEIDA,
          leidaen: new Date()
        },
        include: {
          usuarioDestino: {
            select: {
              id: true,
              nombrecompleto: true,
              correo: true
            }
          },
          usuarioOrigen: {
            select: {
              id: true,
              nombrecompleto: true,
              correo: true
            }
          },
          tiquete: {
            select: {
              id: true,
              titulo: true,
              estado: true
            }
          }
        }
      });

      response.json({
        success: true,
        message: 'Notificación marcada como leída',
        data: notificacionActualizada
      });
    } catch (error: any) {
      console.error('Error al marcar notificación como leída:', error);
      next(AppError.internalServer("Error al marcar la notificación como leída"));
    }
  };

  // Marcar todas las notificaciones como leídas
  marcarTodasComoLeidas = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const usuarioAutenticado = request.user as any;
      if (!usuarioAutenticado || !usuarioAutenticado.id) {
        return next(AppError.unauthorized("Usuario no autenticado"));
      }

      const ahora = new Date();

      // Actualizar todas las notificaciones no leídas del usuario
      const resultado = await prisma.notificacion.updateMany({
        where: {
          idusuariodestino: usuarioAutenticado.id,
          estado: EstadoNotificacion.NO_LEIDA
        },
        data: {
          estado: EstadoNotificacion.LEIDA,
          leidaen: ahora
        }
      });

      response.json({
        success: true,
        message: `${resultado.count} notificación(es) marcada(s) como leída(s)`,
        data: { count: resultado.count }
      });
    } catch (error: any) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
      next(AppError.internalServer("Error al marcar todas las notificaciones como leídas"));
    }
  };

  // Método estático para crear una notificación (usado por otros controladores)
  static async crearNotificacion(
    prisma: PrismaClient,
    data: {
      tipo: TipoNotificacion;
      idusuariodestino: number;
      idusuarioorigen?: number | null;
      idtiquete?: number | null;
      titulo: string;
      contenido: string;
    }
  ): Promise<void> {
    try {
      const notificacion = await prisma.notificacion.create({
        data: {
          tipo: data.tipo,
          idusuariodestino: data.idusuariodestino,
          idusuarioorigen: data.idusuarioorigen || null,
          idtiquete: data.idtiquete || null,
          titulo: data.titulo,
          contenido: data.contenido,
          estado: EstadoNotificacion.NO_LEIDA
        }
      });
      console.log(`✅ Notificación creada exitosamente: ID=${notificacion.id}, Tipo=${data.tipo}, Destino=${data.idusuariodestino}, Título="${data.titulo}"`);
    } catch (error: any) {
      console.error('❌ Error al crear notificación:', error);
      console.error('   Datos intentados:', JSON.stringify(data, null, 2));
      // No lanzar error para no interrumpir el flujo principal
    }
  }
}

export default new NotificacionController();

