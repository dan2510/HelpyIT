import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PrismaClient, RoleNombre } from "../../generated/prisma";
import passport from "passport";
import bcrypt from "bcryptjs";
import { generateToken } from "../config/authUtils";

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
    passport.authenticate(
      "local",
      { session: false },
      (
        err: Error | null,
        user: Express.User | false | null,
        info: { message?: string }
      ) => {
        if (err) return next(err);
        if (!user) {
          return res
            .status(401)
            .json({ success: false, message: info.message || "Error de autenticación" });
        }
        
        const usuario = user as any;
        const token = generateToken({
          id: usuario.id,
          correo: usuario.correo,
          idrol: usuario.idrol,
          rol: usuario.rol
        });

        // Actualizar último inicio de sesión
        this.prisma.usuario.update({
          where: { id: usuario.id },
          data: { ultimoiniciosesion: new Date() }
        }).catch(console.error);

        return res.json({
          success: true,
          message: "Inicio de sesión exitoso",
          token,
        });
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
}
