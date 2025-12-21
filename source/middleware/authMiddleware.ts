import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { RoleNombre } from "../../generated/prisma";

/* Middleware para proteger ruta y validar token JWT
  Si el token es válido, Passport agrega el objeto user a req, con los datos del usuario.
  Si el token no es válido o no está presente, se rechaza
*/
export const authenticateJWT = passport.authenticate("jwt", { session: false });

// Middleware para permitir solo ciertos roles
export const authorizeRoles = (...roles: RoleNombre[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    //Extrae al usuario de req.user, que fue previamente agregado por el middleware authenticateJWT
    const user = req.user as any;
    const userRole = user?.rol?.nombre;

    if (!user || !userRole || !roles.includes(userRole)) {
      res.status(403).json({
        success: false,
        message: "Acceso denegado: rol no autorizado",
      });
      return;
    }

    next(); 
  };
};
