import { Router } from "express";
import { CategoriaMenuController } from "../controllers/categoriaMenuController";
import { authenticateJWT } from "../middleware/authMiddleware";

export class CategoriaMenuRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new CategoriaMenuController();

    // GET /api/categorias-menu - Obtener todas las categorías (público)
    router.get("/", controller.get);

    // GET /api/categorias-menu/:id - Obtener categoría por ID (público)
    router.get("/:id", controller.getById);

    // POST /api/categorias-menu - Crear nueva categoría (solo admin)
    router.post("/", authenticateJWT, controller.create);

    // PUT /api/categorias-menu/:id - Actualizar categoría (solo admin)
    router.put("/:id", authenticateJWT, controller.update);

    // DELETE /api/categorias-menu/:id - Eliminar categoría (solo admin)
    router.delete("/:id", authenticateJWT, controller.delete);

    return router;
  }
}

