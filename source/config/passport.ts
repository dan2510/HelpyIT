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
        console.log('🔑 [PASSPORT] Iniciando autenticación...');
        console.log('🔑 [PASSPORT] Correo:', correo);
        console.log('🔑 [PASSPORT] Buscando usuario en BD...');
        
        const user = await prisma.usuario.findUnique({ 
          where: { correo },
          include: { rol: true }
        });
        
        console.log('🔑 [PASSPORT] Usuario encontrado:', user ? 'Sí' : 'No');
        
        if (!user) {
          console.log('🔑 [PASSPORT] Usuario no registrado');
          return done(null, false, { message: "Usuario no registrado" });
        }

        console.log('🔑 [PASSPORT] Usuario activo:', user.activo);
        if (!user.activo) {
          console.log('🔑 [PASSPORT] Usuario inactivo');
          return done(null, false, { message: "Usuario inactivo" });
        }

        // Verificar que el usuario tenga contraseña (clientes temporales no tienen)
        if (!user.contrasenahash) {
          console.log('🔑 [PASSPORT] Usuario sin contraseña (cliente temporal)');
          return done(null, false, { message: "Este usuario no puede iniciar sesión con contraseña. Use el flujo de pedidos." });
        }

        console.log('🔑 [PASSPORT] Verificando contraseña...');
        const isMatch = await bcrypt.compare(password, user.contrasenahash);
        console.log('🔑 [PASSPORT] Contraseña válida:', isMatch);
        
        if (!isMatch) {
          console.log('🔑 [PASSPORT] Contraseña incorrecta');
          return done(null, false, { message: "Contraseña incorrecta" });
        }

        console.log('🔑 [PASSPORT] ✅ Autenticación exitosa');
        return done(null, user);
      } catch (error: any) {
        console.error('🔑 [PASSPORT] ❌ Error en autenticación:', error);
        console.error('🔑 [PASSPORT] Error message:', error?.message);
        console.error('🔑 [PASSPORT] Error stack:', error?.stack);
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

