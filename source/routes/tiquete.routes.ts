import { Router } from "express";
import { TiqueteController } from "../controllers/tiqueteController";

export class TiqueteRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new TiqueteController();

    // Rutas auxiliares (deben ir antes de las rutas con parámetros)
    router.get("/prioridades", controller.getPrioridades);
    router.get("/etiquetas", controller.getEtiquetasConCategorias);
    router.get("/usuario/:idUsuario/info", controller.getUsuarioInfo);
    
    router.get("/usuario/:idUsuario", controller.getTiquetesPorUsuario);

    // Ruta para listado general de tiquetes (admin)
    // GET /api/tiquetes/
    router.get("/", controller.get);
    
    // POST /api/tiquetes - Crear nuevo tiquete
    router.post("/", controller.create);

    // Ruta para detalle completo de un tiquete por ID
    // GET /api/tiquetes/:id
    router.get("/:id", controller.getById);
    
   //  router.post("/:id/assign", controller.assignTecnico);

    return router;
  }
}