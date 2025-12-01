import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { PrismaClient } from "../../generated/prisma";
import bcrypt from "bcryptjs";
import * as dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde el directorio raíz del servidor
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const prisma = new PrismaClient();

// Validar que SECRET_KEY esté definido
const secretKey = process.env.SECRET_KEY;
if (!secretKey) {
  throw new Error("SECRET_KEY no está definido en las variables de entorno. Por favor, crea un archivo .env con SECRET_KEY=tu_clave_secreta");
}

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secretKey,
};

// LocalStrategy: para login con usuario y contraseña
passport.use(
  new LocalStrategy(
    {
      usernameField: "correo",
      passwordField: "password",
    },
    async (correo, password, done) => {
      try {
        const user = await prisma.usuario.findUnique({ 
          where: { correo },
          include: { rol: true }
        });
        if (!user)
          return done(null, false, { message: "Usuario no registrado" });

        if (!user.activo)
          return done(null, false, { message: "Usuario inactivo" });

        const isMatch = await bcrypt.compare(password, user.contrasenahash);
        if (!isMatch)
          return done(null, false, { message: "Contraseña incorrecta" });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// JwtStrategy: para proteger rutas con token JWT
passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await prisma.usuario.findUnique({
        where: { id: payload.id },
        include: { rol: true }
      });
      if (user && user.activo) return done(null, user);
      else return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passport;

