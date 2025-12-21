import { Router } from "express";
import { ConfiguracionController } from "../controllers/configuracionController";
import { authenticateJWT, authorizeRoles } from "../middleware/authMiddleware";

export class ConfiguracionRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new ConfiguracionController();

    // Todas las rutas requieren autenticación y rol de administrador
    router.use(authenticateJWT);
    router.use(authorizeRoles('ADMIN'));

    // Obtener todas las configuraciones
    router.get("/", controller.get);

    // Obtener configuración por clave
    router.get("/:clave", controller.getByClave);

    // Crear o actualizar configuración
    router.post("/", controller.upsert);

    // Actualizar configuración
    router.put("/:clave", controller.update);

    return router;
  }
}

