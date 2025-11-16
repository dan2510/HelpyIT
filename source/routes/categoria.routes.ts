import { Router } from "express";
import { CategoriaController } from "../controllers/categoriaController";

export class CategoriaRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new CategoriaController();

    // Rutas auxiliares (deben ir antes de las rutas con parámetros)
    router.get("/etiquetas", controller.getEtiquetas);
    router.get("/especialidades", controller.getEspecialidades);
    router.get("/slas", controller.getSLAs);
    
    // Ruta para búsqueda de categorías - debe ir antes que /:id
    // GET /api/categorias/search?q=software
    router.get("/search", controller.search);
    
    // Ruta para obtener categorías activas
    // GET /api/categorias/activas
    router.get("/activas", controller.getActivas);

    // Ruta para listado general de categorías (máximo 3 campos)
    // GET /api/categorias/
    router.get("/", controller.get);
    
    // POST /api/categorias - Crear nueva categoría
    router.post("/", controller.create);
    
    // Ruta para detalle completo de una categoría por ID
    // GET /api/categorias/:id
    router.get("/:id", controller.getById);
    
    // PUT /api/categorias/:id - Actualizar categoría
    router.put("/:id", controller.update);

    return router;
  }
}