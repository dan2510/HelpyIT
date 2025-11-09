import { Router } from "express";
import { TiqueteController } from "../controllers/tiqueteController";

export class TiqueteRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new TiqueteController();

    // Ruta para obtener tiquetes por usuario (filtra según rol)
    // GET /api/tiquetes/usuario/:idUsuario
    router.get("/usuario/:idUsuario", controller.getTiquetesPorUsuario);

    // Ruta para listado general de tiquetes (admin)
    // GET /api/tiquetes/
    router.get("/", controller.get);
    
    // Ruta para detalle completo de un tiquete por ID
    // GET /api/tiquetes/:id
    router.get("/:id", controller.getById);

    return router;
  }
}