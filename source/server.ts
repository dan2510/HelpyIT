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
dotenv.config({ path: envPath });

// Importar passport después de cargar las variables de entorno
import "./config/passport"; 


const rootDir = __dirname;

const app: Express=express()

// Las variables de entorno ya fueron cargadas antes de importar passport
// Puerto que escucha por defecto 3000 o definido .env
const port = process.env.PORT || 3000;
// Middleware CORS para aceptar llamadas en el servidor
app.use(cors());
// Middleware para loggear las llamadas al servidor
app.use(morgan('dev'));

// Middleware para gestionar Requests y Response json
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

//---- Registro de rutas ----
app.use(AppRoutes.routes)

//Gestión de errores middleware
app.use(ErrorMiddleware.handleError)

//Acceso a las imágenes
app.use("/images",express.static(
 path.join(path.resolve(),"assets/uploads")))

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
  console.log('Presione CTRL-C para deternerlo\n');
 });
