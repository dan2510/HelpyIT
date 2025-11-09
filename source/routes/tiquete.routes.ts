import { Router } from "express";
import { TiqueteController } from "../controllers/tiqueteController";

export class TiqueteRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new TiqueteController();

    // Ruta para listado general de tiquetes (admin)
    // GET /api/tiquetes/
    router.get("/", controller.get);
    
    // Ruta para detalle completo de un tiquete por ID
    // GET /api/tiquetes/:id
    router.get("/:id", controller.getById);

    return router;
  }
}