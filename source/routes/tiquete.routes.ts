import { Router } from "express";
import { TiqueteController } from "../controllers/tiqueteController";
import { authenticateJWT } from "../middleware/authMiddleware";

export class TiqueteRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new TiqueteController();

    // Rutas auxiliares (deben ir antes de las rutas con parámetros)
    router.get("/prioridades", controller.getPrioridades);
    // Ruta para obtener tiquetes del usuario autenticado (requiere autenticación)
    router.get("/mis-tiquetes", authenticateJWT, controller.getTiquetesPorUsuario);

    // Ruta para listado general de tiquetes (admin) - requiere autenticación
    // GET /api/tiquetes/
    router.get("/", authenticateJWT, controller.get);
    
    // POST /api/tiquetes - Crear nuevo tiquete - requiere autenticación
    router.post("/", authenticateJWT, controller.create);

    // Ruta para detalle completo de un tiquete por ID
    // GET /api/tiquetes/:id
    router.get("/:id", controller.getById);
    
    // PUT /api/tiquetes/:id - Actualizar ticket
    router.put("/:id", controller.update);

    // PATCH /api/tiquetes/:id/estado - Actualizar estado con validaciones estrictas
    router.patch("/:id/estado", authenticateJWT, controller.updateEstado);

    // POST /api/tiquetes/:id/comentarios - Agregar comentario (external o internal)
    router.post("/:id/comentarios", authenticateJWT, controller.agregarComentario);

    return router;
  }
}