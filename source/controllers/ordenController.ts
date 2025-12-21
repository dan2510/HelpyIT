import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PrismaClient, RoleNombre, EstadoOrden, TipoHistorial, TipoNotificacion, TipoPedido, MetodoPago } from "../../generated/prisma";
import { NotificacionController } from "./notificacionController";

export class OrdenController {
  prisma = new PrismaClient();
  notificacionController = new NotificacionController();

  // Función para generar número de pedido único
  private generarNumeroPedido = (): string => {
    const fecha = new Date();
    const año = fecha.getFullYear().toString();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    const segundos = fecha.getSeconds().toString().padStart(2, '0');
    const milisegundos = fecha.getMilliseconds().toString().padStart(3, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${año}${mes}${dia}-${segundos}${milisegundos}-${random}`;
  };

  // Listado de órdenes según el rol del usuario autenticado
  getOrdenesPorUsuario = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const usuarioAutenticado = request.user as any;
      
      if (!usuarioAutenticado || !usuarioAutenticado.id) {
        return next(AppError.unauthorized("Usuario no autenticado"));
      }

      const idUsuario = usuarioAutenticado.id;

      const usuario = await this.prisma.usuario.findUnique({
        where: { id: idUsuario },
        include: { rol: true }
      });

      if (!usuario) {
        return next(AppError.notFound("Usuario no encontrado"));
      }

      let ordenes;
      
      switch (usuario.rol.nombre) {
        case RoleNombre.ADMIN:
          ordenes = await this.prisma.orden.findMany({
            select: {
              id: true,
              numeropedido: true,
              estado: true,
              tipopedido: true,
              total: true,
              creadoen: true,
              cliente: {
                select: {
                  nombrecompleto: true,
                  correo: true
                }
              },
            },
            orderBy: {
              creadoen: 'desc'
            }
          });
          break;

        case RoleNombre.CLIENTE:
          ordenes = await this.prisma.orden.findMany({
            where: {
              idcliente: idUsuario
            },
            select: {
              id: true,
              numeropedido: true,
              estado: true,
              tipopedido: true,
              total: true,
              creadoen: true,
            },
            orderBy: {
              creadoen: 'desc'
            }
          });
          break;

        default:
          // Para CLIENTE u otros roles, mostrar solo sus órdenes
          ordenes = await this.prisma.orden.findMany({
            where: {
              idcliente: idUsuario
            },
            select: {
              id: true,
              numeropedido: true,
              estado: true,
              tipopedido: true,
              total: true,
              creadoen: true,
              cliente: {
                select: {
                  nombrecompleto: true,
                  correo: true
                }
              }
            },
            orderBy: {
              creadoen: 'desc'
            }
          });
          break;
      }

      const responseData = {
        success: true,
        data: {
          ordenes: ordenes,
          total: ordenes.length,
          page: 1,
          limit: ordenes.length,
          totalPages: 1,
          rol: usuario.rol.nombre
        }
      };

      response.json(responseData);
    } catch (error) {
      next(error);
    }
  };

  // Detalle completo de la orden por ID
  getById = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const idOrden = parseInt(request.params.id);
      
      if (isNaN(idOrden)) {
        return next(AppError.badRequest("El ID no es válido"));
      }

      const orden = await this.prisma.orden.findFirst({
        where: { id: idOrden },
        include: {
          cliente: {
            select: {
              id: true,
              nombrecompleto: true,
              correo: true,
              telefono: true
            }
          },
          items: {
            include: {
              menuItem: {
                include: {
                  categoria: {
                    select: {
                      nombre: true
                    }
                  }
                }
              }
            }
          },
          historiales: {
            include: {
              usuarioCambio: {
                select: {
                  nombrecompleto: true
                }
              },
              imagenes: true
            },
            orderBy: {
              cambiadoen: 'desc'
            }
          }
        }
      });

      if (!orden) {
        return next(AppError.notFound("Orden no encontrada"));
      }

      const responseData = {
        success: true,
        data: { orden }
      };

      response.json(responseData);
    } catch (error) {
      next(error);
    }
  };

  // Crear nueva orden (soporta cliente autenticado o temporal)
  create = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const usuarioAutenticado = request.user as any;
      const { 
        items, 
        tipopedido, 
        notas, 
        idcliente, // Para clientes temporales
        metodopago,
        subtotal,
        servicioexpress,
        montopagado,
        cambio,
        numeroautorizacion,
        ultimos4digitos
      } = request.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return next(AppError.badRequest("La orden debe tener al menos un item"));
      }

      // Determinar ID del cliente
      let idClienteFinal: number;
      let idUsuarioCambio: number;

      if (usuarioAutenticado && usuarioAutenticado.id) {
        // Usuario autenticado
        idClienteFinal = usuarioAutenticado.id;
        idUsuarioCambio = usuarioAutenticado.id;
      } else if (idcliente) {
        // Cliente temporal (sin autenticación)
        idClienteFinal = idcliente;
        // Usar el mismo cliente para el historial o un admin por defecto
        const admin = await this.prisma.usuario.findFirst({
          where: { rol: { nombre: RoleNombre.ADMIN }, activo: true }
        });
        idUsuarioCambio = admin?.id || idClienteFinal;
      } else {
        return next(AppError.unauthorized("Se requiere autenticación o ID de cliente"));
      }

      // Verificar que el cliente existe
      const cliente = await this.prisma.usuario.findUnique({
        where: { id: idClienteFinal }
      });

      if (!cliente) {
        return next(AppError.notFound("Cliente no encontrado"));
      }

      // Calcular total si no se proporciona
      let totalCalculado = 0;
      const itemsConPrecio = [];

      for (const item of items) {
        const menuItem = await this.prisma.menuItem.findUnique({
          where: { id: item.idmenuitem }
        });

        if (!menuItem) {
          return next(AppError.notFound(`Item de menú con ID ${item.idmenuitem} no encontrado`));
        }

        if (!menuItem.disponible || !menuItem.activo) {
          return next(AppError.badRequest(`El item ${menuItem.nombre} no está disponible`));
        }

        const itemSubtotal = Number(menuItem.precio) * item.cantidad;
        totalCalculado += itemSubtotal;

        itemsConPrecio.push({
          idmenuitem: item.idmenuitem,
          cantidad: item.cantidad,
          precio: menuItem.precio,
          subtotal: itemSubtotal,
          notas: item.notas || null
        });
      }

      // Usar total proporcionado o calcular
      const totalFinal = subtotal && servicioexpress 
        ? Number(subtotal) + Number(servicioexpress)
        : totalCalculado + (servicioexpress ? Number(servicioexpress) : 0);

      // Calcular tiempo estimado (30-45 minutos por defecto)
      const tiempoEstimado = 35; // minutos

      // Crear la orden
      const orden = await this.prisma.orden.create({
        data: {
          numeropedido: this.generarNumeroPedido(),
          idcliente: idClienteFinal,
          estado: EstadoOrden.RECIBIDO, // Cambiar a RECIBIDO según requerimientos
          tipopedido: tipopedido || TipoPedido.DELIVERY,
          total: totalFinal,
          subtotal: subtotal || totalCalculado,
          servicioexpress: servicioexpress || 0,
          metodopago: metodopago || null,
          montopagado: montopagado || null,
          cambio: cambio || null,
          numeroautorizacion: numeroautorizacion || null,
          ultimos4digitos: ultimos4digitos || null,
          tiempoestimado: tiempoEstimado,
          notas: notas || null,
          items: {
            create: itemsConPrecio
          },
          historiales: {
            create: {
              estadoanterior: null,
              estadonuevo: EstadoOrden.RECIBIDO,
              observacion: "Orden creada",
              tipo: TipoHistorial.CAMBIO_ESTADO,
              cambiadopor: idUsuarioCambio
            }
          }
        },
        include: {
          cliente: true,
          items: {
            include: {
              menuItem: true
            }
          }
        }
      });

      // Notificar a administradores sobre nueva orden
      const administradores = await this.prisma.usuario.findMany({
        where: {
          rol: { nombre: RoleNombre.ADMIN },
          activo: true
        }
      });

      for (const admin of administradores) {
        await this.notificacionController.create({
          tipo: TipoNotificacion.NUEVA_ORDEN,
          idusuariodestino: admin.id,
          idusuarioorigen: idClienteFinal,
          idorden: orden.id,
          titulo: "Nueva orden recibida",
          contenido: `Nueva orden ${orden.numeropedido} creada - Total: ₡${totalFinal.toFixed(2)}`
        });
      }

      const responseData = {
        success: true,
        data: { orden }
      };

      response.status(201).json(responseData);
    } catch (error) {
      console.error('Error en create orden:', error);
      next(error);
    }
  };

  // Buscar orden por número de pedido (público, para seguimiento)
  buscarPorNumero = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const numeroPedido = request.params.numeroPedido;

      if (!numeroPedido) {
        return next(AppError.badRequest("El número de pedido es requerido"));
      }

      const orden = await this.prisma.orden.findUnique({
        where: { numeropedido: numeroPedido },
        include: {
          cliente: {
            select: {
              id: true,
              nombrecompleto: true,
              telefono: true,
              direccion: true
            }
          },
          items: {
            include: {
              menuItem: {
                select: {
                  id: true,
                  nombre: true,
                  precio: true
                }
              }
            }
          },
          historiales: {
            orderBy: {
              cambiadoen: 'desc'
            },
            take: 5
          }
        }
      });

      if (!orden) {
        return next(AppError.notFound("Orden no encontrada"));
      }

      response.json({
        success: true,
        data: { orden }
      });
    } catch (error) {
      console.error('Error en buscarPorNumero:', error);
      next(error);
    }
  };

  // Actualizar estado de la orden
  updateEstado = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const usuarioAutenticado = request.user as any;
      
      if (!usuarioAutenticado || !usuarioAutenticado.id) {
        return next(AppError.unauthorized("Usuario no autenticado"));
      }

      const idOrden = parseInt(request.params.id);
      const { estado, observacion } = request.body;

      if (isNaN(idOrden)) {
        return next(AppError.badRequest("El ID no es válido"));
      }

      if (!estado || !Object.values(EstadoOrden).includes(estado)) {
        return next(AppError.badRequest("Estado inválido"));
      }

      const orden = await this.prisma.orden.findUnique({
        where: { id: idOrden },
        include: { cliente: true }
      });

      if (!orden) {
        return next(AppError.notFound("Orden no encontrada"));
      }

      const estadoAnterior = orden.estado;
      const idCliente = orden.cliente.id;

      // Actualizar orden
      const ordenActualizada = await this.prisma.orden.update({
        where: { id: idOrden },
        data: {
          estado: estado,
          preparadoen: estado === EstadoOrden.LISTO ? new Date() : orden.preparadoen,
          entregadoen: estado === EstadoOrden.ENTREGADO ? new Date() : orden.entregadoen,
          historiales: {
            create: {
              estadoanterior: estadoAnterior,
              estadonuevo: estado,
              observacion: observacion || null,
              tipo: TipoHistorial.CAMBIO_ESTADO,
              cambiadopor: usuarioAutenticado.id
            }
          }
        },
        include: {
          cliente: true,
          items: {
            include: {
              menuItem: true
            }
          }
        }
      });

      // Notificar al cliente cuando la orden está lista
      if (estado === EstadoOrden.LISTO) {
        await this.notificacionController.create({
          tipo: TipoNotificacion.ORDEN_LISTA,
          idusuariodestino: idCliente,
          idusuarioorigen: usuarioAutenticado.id,
          idorden: orden.id,
          titulo: "Tu orden está lista",
          contenido: `Tu orden ${orden.numeropedido} está lista para recoger`
        });
      }

      const responseData = {
        success: true,
        data: { orden: ordenActualizada }
      };

      response.json(responseData);
    } catch (error) {
      next(error);
    }
  };

}

