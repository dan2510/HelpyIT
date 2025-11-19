import { Router } from "express";
import { UsuarioController } from "../controllers/usuarioController";

export class UsuarioRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new UsuarioController();

    // GET /api/usuario/clientes - Obtener todos los clientes (debe ir antes de /:id)
    router.get("/clientes", controller.getClientes);
    
    // GET /api/usuario/:id - Obtener información de usuario por ID
    router.get("/:id", controller.getById);

    return router;
  }
}
