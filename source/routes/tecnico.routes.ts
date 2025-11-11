import { Router } from "express";
import { TecnicoController } from "../controllers/tecnicoController";

export class TecnicoRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new TecnicoController();

    // Ruta para búsqueda de técnicos - debe ir antes que /:id
    // GET /api/tecnicos/search?termino=carlos
    router.get("/search", controller.search);
    
    // Ruta para obtener técnicos disponibles
    // GET /api/tecnicos/disponibles
    router.get("/disponibles", controller.getDisponibles);

    // Ruta para listado general de técnicos 
    // GET /api/tecnicos/
    router.get("/", controller.get);
    
    // Ruta para detalle completo de un técnico por ID
    // GET /api/tecnicos/:id
    router.get("/:id", controller.getById);
    
    // Ruta para estadísticas de un técnico específico
    // GET /api/tecnicos/:id/estadisticas
    router.get("/:id/estadisticas", controller.getEstadisticas);

    return router;
  }
}