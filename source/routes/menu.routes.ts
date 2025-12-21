import { Router } from "express";
import { MenuController } from "../controllers/menuController";
import { authenticateJWT } from "../middleware/authMiddleware";

export class MenuRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new MenuController();

    // GET /api/menu - Obtener todos los items del menú (público)
    router.get("/", controller.get);

    // GET /api/menu/:id - Obtener item del menú por ID (público)
    router.get("/:id", controller.getById);

    // POST /api/menu - Crear nuevo item (solo admin)
    router.post("/", authenticateJWT, controller.create);

    // PUT /api/menu/:id - Actualizar item (solo admin)
    router.put("/:id", authenticateJWT, controller.update);

    // DELETE /api/menu/:id - Eliminar item (solo admin)
    router.delete("/:id", authenticateJWT, controller.delete);

    return router;
  }
}

