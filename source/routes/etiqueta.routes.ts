import { Router } from "express";
import { EtiquetaController } from "../controllers/etiquetaController";

export class EtiquetaRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new EtiquetaController();

    // GET /api/etiquetas - Listado de etiquetas
    router.get("/", controller.get);
    
    // GET /api/etiquetas/search - Buscar etiquetas
    router.get("/search", controller.search);
    
    // GET /api/etiquetas/:id - Detalle de etiqueta específica
    router.get("/:id", controller.getById);

    return router;
  }
}