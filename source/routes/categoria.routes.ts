import { Router } from "express";
import { CategoriaController } from "../controllers/categoriaController";

export class CategoriaRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new CategoriaController();

    // Ruta para búsqueda de categorías - debe ir antes que /:id
    // GET /api/categorias/search?q=software
    router.get("/search", controller.search);
    
    // Ruta para obtener categorías activas
    // GET /api/categorias/activas
    router.get("/activas", controller.getActivas);

    // Ruta para listado general de categorías (máximo 3 campos)
    // GET /api/categorias/
    router.get("/", controller.get);
    
    // Ruta para detalle completo de una categoría por ID
    // GET /api/categorias/:id
    router.get("/:id", controller.getById);
    
    // Ruta para estadísticas de una categoría específica
    // GET /api/categorias/:id/estadisticas
    router.get("/:id/estadisticas", controller.getEstadisticas);

    return router;
  }
}