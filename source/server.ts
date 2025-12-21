import express, {Express} from 'express'
import morgan from 'morgan'
import * as dotenv from 'dotenv' 
import cors from 'cors';
import path from 'path'
import { ErrorMiddleware } from './middleware/error.middleware';
import { AppRoutes } from './routes/routes';

// Cargar variables de entorno ANTES de importar passport
// Especificar la ruta del .env en el directorio raíz del servidor
const envPath = path.resolve(__dirname, '../.env');
console.log('📁 [SERVER] Ruta del .env:', envPath);
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error('❌ [SERVER] Error cargando .env:', result.error);
} else {
  console.log('✅ [SERVER] Variables de entorno cargadas:', Object.keys(result.parsed || {}).length);
  console.log('✅ [SERVER] DATABASE_URL:', process.env.DATABASE_URL ? 'Definida' : 'NO DEFINIDA');
  console.log('✅ [SERVER] SECRET_KEY:', process.env.SECRET_KEY ? 'Definida' : 'NO DEFINIDA');
}

// Importar passport después de cargar las variables de entorno
import "./config/passport"; 


const rootDir = __dirname;

const app: Express=express()

// Middleware de logging ULTRA TEMPRANO - captura TODAS las peticiones
// Este debe ser el PRIMER middleware para capturar TODO
app.use((req, res, next) => {
  console.log('\n🚨🚨🚨 [EARLY] ========== PETICIÓN RECIBIDA ==========');
  console.log('🚨 [EARLY] Timestamp:', new Date().toISOString());
  console.log('🚨 [EARLY] Método:', req.method);
  console.log('🚨 [EARLY] URL:', req.url);
  console.log('🚨 [EARLY] Path:', req.path);
  console.log('🚨 [EARLY] Original URL:', req.originalUrl);
  console.log('🚨 [EARLY] IP:', req.ip || req.connection.remoteAddress);
  console.log('🚨 [EARLY] ========================================\n');
  next();
});

// Las variables de entorno ya fueron cargadas antes de importar passport
// Puerto que escucha por defecto 3000 o definido .env
const port = process.env.PORT || 3000;
console.log('🌐 [SERVER] Puerto configurado:', port);

// Middleware CORS para aceptar llamadas en el servidor
app.use(cors({
  origin: '*', // Permitir todos los orígenes temporalmente para debugging
  credentials: true
}));
console.log('✅ [SERVER] CORS configurado');
// Middleware para loggear las llamadas al servidor
app.use(morgan('dev'));

// Middleware para gestionar Requests y Response json
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Middleware de logging para todas las peticiones
app.use((req, res, next) => {
  console.log(`📥 [${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('📥 Body:', JSON.stringify(req.body, null, 2));
  next();
});

//---- Registro de rutas ----
console.log('✅ [SERVER] Registrando rutas...');
app.use(AppRoutes.routes)
console.log('✅ [SERVER] Rutas registradas');

// Middleware para rutas no encontradas (debe ir ANTES del middleware de errores)
app.use((req, res, next) => {
  console.log('⚠️ [SERVER] Ruta no encontrada:', req.method, req.path);
  res.status(404).json({ 
    success: false, 
    message: `Ruta ${req.method} ${req.path} no encontrada` 
  });
});

//Gestión de errores middleware
app.use(ErrorMiddleware.handleError)

//Acceso a las imágenes
app.use("/images",express.static(
 path.join(path.resolve(),"assets/uploads")))

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌❌❌ [SERVER] Uncaught Exception:', error);
  console.error('❌ [SERVER] Error stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌❌❌ [SERVER] Unhandled Rejection at:', promise);
  console.error('❌ [SERVER] Reason:', reason);
});

app.listen(port, () => {
  console.log(`✅ [SERVER] Servidor corriendo en http://localhost:${port}`);
  console.log('✅ [SERVER] Presione CTRL-C para deternerlo\n');
  console.log('✅ [SERVER] Esperando peticiones...\n');
  console.log('✅ [SERVER] Rutas disponibles:');
  console.log('   - POST /usuario/login');
  console.log('   - POST /usuario/register');
  console.log('   - GET /usuario/profile');
  console.log('   - GET /ordenes');
  console.log('   - POST /ordenes');
  console.log('   - GET /menu');
  console.log('   - GET /categorias-menu');
  console.log('');
 });
