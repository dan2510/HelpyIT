import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PrismaClient, RoleNombre, TipoNotificacion } from "../../generated/prisma";
import passport from "passport";
import bcrypt from "bcryptjs";
import { generateToken } from "../config/authUtils";
import { NotificacionController } from "./notificacionController";

export class UsuarioController {
  prisma = new PrismaClient();

  // OBTENER INFORMACIÓN DEL USUARIO POR ID
  getById = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const idUsuario = parseInt(request.params.id);
      
      if (isNaN(idUsuario)) {
        return next(AppError.badRequest("El ID de usuario no es válido"));
      }

      const usuario = await this.prisma.usuario.findUnique({
        where: { id: idUsuario },
        select: {
          id: true,
          nombrecompleto: true,
          correo: true,
          telefono: true
        }
      });

      if (!usuario) {
        return next(AppError.notFound('Usuario no encontrado'));
      }

      response.json({
        success: true,
        data: { usuario }
      });
    } catch (error) {
      next(error);
    }
  };

  // OBTENER TODOS LOS CLIENTES
  getClientes = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const clientes = await this.prisma.usuario.findMany({
        where: {
          rol: {
            nombre: RoleNombre.CLIENTE
          },
          activo: true
        },
        select: {
          id: true,
          nombrecompleto: true,
          correo: true
        },
        orderBy: {
          nombrecompleto: 'asc'
        }
      });

      response.json({
        success: true,
        data: { clientes }
      });
    } catch (error) {
      next(error);
    }
  };

  // REGISTRAR NUEVO USUARIO (SOLO CLIENTES)
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { nombrecompleto, correo, password, telefono } = req.body;

      // Validar que no exista el correo
      const usuarioExistente = await this.prisma.usuario.findUnique({
        where: { correo }
      });

      if (usuarioExistente) {
        return next(AppError.badRequest("El correo ya está registrado"));
      }

      // Obtener el ID del rol CLIENTE
      const rolCliente = await this.prisma.rol.findFirst({
        where: { nombre: RoleNombre.CLIENTE }
      });

      if (!rolCliente) {
        return next(AppError.internalServer("Rol CLIENTE no encontrado"));
      }

      // Hash de la contraseña
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      // Crear usuario
      const user = await this.prisma.usuario.create({
        data: {
          nombrecompleto,
          correo,
          contrasenahash: hash,
          telefono: telefono || null,
          idrol: rolCliente.id,
          activo: true,
        },
        include: {
          rol: true
        }
      });

      // Eliminar la contraseña del objeto de respuesta
      const { contrasenahash, ...userWithoutPassword } = user;

      res.status(201).json({
        success: true,
        message: "Usuario creado exitosamente",
        data: userWithoutPassword,
      });
    } catch (error) {
      next(error);
    }
  };

  // LOGIN DE USUARIO
  login = (req: Request, res: Response, next: NextFunction) => {
    console.log('🔐 [LOGIN] ========== INICIANDO LOGIN ==========');
    console.log('🔐 [LOGIN] Método:', req.method);
    console.log('🔐 [LOGIN] Path:', req.path);
    console.log('🔐 [LOGIN] Body completo:', JSON.stringify(req.body, null, 2));
    console.log('🔐 [LOGIN] Correo recibido:', req.body?.correo);
    console.log('🔐 [LOGIN] Password recibido:', req.body?.password ? '***' : 'no proporcionado');
    console.log('🔐 [LOGIN] Headers:', JSON.stringify(req.headers, null, 2));
    
    const controller = this; // Guardar referencia al contexto
    console.log('🔐 [LOGIN] Controller inicializado, llamando passport.authenticate...');
    passport.authenticate(
      "local",
      { session: false },
      (
        err: Error | null,
        user: Express.User | false | null,
        info: { message?: string }
      ) => {
        try {
          if (err) {
            console.error('❌ Error en passport authenticate:', err);
            return next(err);
          }
          if (!user) {
            console.log('❌ Usuario no autenticado:', info);
            return res
              .status(401)
              .json({ success: false, message: info.message || "Error de autenticación" });
          }
          
          const usuario = user as any;
          console.log('✅ Usuario autenticado:', { 
            id: usuario.id, 
            correo: usuario.correo, 
            idrol: usuario.idrol 
          });
          
          let token: string;
          try {
            token = generateToken({
              id: usuario.id,
              correo: usuario.correo,
              idrol: usuario.idrol,
              rol: usuario.rol
            });
            console.log('✅ Token generado exitosamente');
          } catch (tokenError: any) {
            console.error('❌ Error al generar token:', tokenError);
            return res.status(500).json({
              success: false,
              message: "Error al generar token de autenticación"
            });
          }

          // Actualizar último inicio de sesión
          controller.prisma.usuario.update({
            where: { id: usuario.id },
            data: { ultimoiniciosesion: new Date() }
          }).catch((error) => {
            console.error('Error al actualizar último inicio de sesión:', error);
          });

          // Generar notificación de inicio de sesión (asíncrono, no bloquea la respuesta)
          NotificacionController.crearNotificacion(
            controller.prisma,
            {
              tipo: TipoNotificacion.INICIO_SESION,
              idusuariodestino: usuario.id,
              idusuarioorigen: null,
              idorden: null,
              titulo: 'Inicio de sesión exitoso',
              contenido: `Has iniciado sesión correctamente en La ventanita de GORROLES el ${new Date().toLocaleString('es-ES')}.`
            }
          ).catch((error) => {
            console.error('Error al crear notificación de inicio de sesión:', error);
          });

          return res.json({
            success: true,
            message: "Inicio de sesión exitoso",
            token,
          });
        } catch (error: any) {
          console.error('❌ Error en callback de login:', error);
          console.error('Error stack:', error.stack);
          return next(error);
        }
      }
    )(req, res, next);
  };

  // OBTENER PERFIL DEL USUARIO AUTENTICADO
  userAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
      const usuario = req.user as any;
      
      // Obtener usuario completo con relaciones
      this.prisma.usuario.findUnique({
        where: { id: usuario.id },
        include: {
          rol: true
        }
      }).then(user => {
        if (!user) {
          return res.status(404).json({
            success: false,
            message: "Usuario no encontrado"
          });
        }
        res.json(user);
      }).catch(error => {
        next(error);
      });
    } catch (error) {
      next(error);
    }
  };

  // Token fijo para restablecimiento de contraseña (configurado por administrador)
  private readonly RESET_TOKEN = process.env.RESET_PASSWORD_TOKEN || '12345';

  // SOLICITAR RESTABLECIMIENTO DE CONTRASEÑA
  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { correo } = req.body;

      if (!correo) {
        return next(AppError.badRequest("El correo es requerido"));
      }

      // Buscar usuario por correo
      const usuario = await this.prisma.usuario.findUnique({
        where: { correo: correo.toLowerCase().trim() }
      });

      // Si el usuario no existe, devolver error
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: "El correo no existe en nuestro sistema"
        });
      }

      // Si el usuario existe, devolver éxito
      res.json({
        success: true,
        message: "Correo verificado. Ingresa el token de restablecimiento"
      });
    } catch (error) {
      console.error('Error en forgotPassword:', error);
      next(error);
    }
  };

  // RESTABLECER CONTRASEÑA
  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, correo, password } = req.body;

      if (!token || !correo || !password) {
        return next(AppError.badRequest("Token, correo y contraseña son requeridos"));
      }

      // Validar token fijo
      if (token !== this.RESET_TOKEN) {
        return next(AppError.badRequest("Token inválido. Contacta al administrador para obtener el token correcto"));
      }

      if (password.length < 6) {
        return next(AppError.badRequest("La contraseña debe tener al menos 6 caracteres"));
      }

      // Buscar usuario por correo
      const usuario = await this.prisma.usuario.findUnique({
        where: { correo: correo.toLowerCase().trim() }
      });

      if (!usuario) {
        return next(AppError.badRequest("Usuario no encontrado"));
      }

      // Hash de la nueva contraseña
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      // Actualizar contraseña
      await this.prisma.usuario.update({
        where: { id: usuario.id },
        data: {
          contrasenahash: hash
        }
      });

      res.json({
        success: true,
        message: "Contraseña restablecida exitosamente"
      });
    } catch (error) {
      console.error('Error en resetPassword:', error);
      next(error);
    }
  };

  // Buscar usuario por teléfono (para flujo de pedidos)
  buscarPorTelefono = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const telefono = request.params.telefono;

      if (!telefono) {
        return next(AppError.badRequest("El teléfono es requerido"));
      }

      const usuario = await this.prisma.usuario.findFirst({
        where: {
          telefono: telefono,
          activo: true
        },
        include: {
          rol: true
        }
      });

      if (!usuario) {
        return response.status(404).json({
          success: false,
          message: "Cliente no encontrado"
        });
      }

      response.json({
        success: true,
        data: { usuario }
      });
    } catch (error) {
      console.error('Error en buscarPorTelefono:', error);
      next(error);
    }
  };

  // Crear cliente temporal (sin contraseña, solo para pedidos)
  crearClienteTemporal = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { telefono, nombrecompleto, direccion, latitud, longitud } = request.body;

      if (!telefono || !nombrecompleto || !direccion) {
        return next(AppError.badRequest("Teléfono, nombre y dirección son requeridos"));
      }

      // Verificar si ya existe un usuario con ese teléfono
      const usuarioExistente = await this.prisma.usuario.findFirst({
        where: { telefono }
      });

      if (usuarioExistente) {
        return next(AppError.badRequest("Ya existe un usuario con ese teléfono"));
      }

      // Obtener el rol CLIENTE
      const rolCliente = await this.prisma.rol.findFirst({
        where: { nombre: RoleNombre.CLIENTE }
      });

      if (!rolCliente) {
        return next(AppError.internalServer("No se encontró el rol CLIENTE"));
      }

      // Crear usuario sin contraseña (cliente temporal)
      const nuevoUsuario = await this.prisma.usuario.create({
        data: {
          telefono,
          nombrecompleto,
          direccion,
          latitud: latitud ? parseFloat(latitud) : null,
          longitud: longitud ? parseFloat(longitud) : null,
          idrol: rolCliente.id,
          activo: true,
          correo: null,
          contrasenahash: null
        },
        include: {
          rol: true
        }
      });

      response.status(201).json({
        success: true,
        data: { usuario: nuevoUsuario },
        message: "Cliente registrado exitosamente"
      });
    } catch (error) {
      console.error('Error en crearClienteTemporal:', error);
      next(error);
    }
  };
}
