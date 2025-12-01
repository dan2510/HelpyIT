import { Router } from "express";
import { UsuarioController } from "../controllers/usuarioController";
import { authenticateJWT } from "../middleware/authMiddleware";

export class UsuarioRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new UsuarioController();

    // POST /api/usuario/login - Login de usuario
    router.post("/login", controller.login);
    
    // POST /api/usuario/register - Registro de nuevo usuario (solo clientes)
    router.post("/register", controller.register);
    
    // GET /api/usuario/profile - Obtener perfil del usuario autenticado
    router.get("/profile", authenticateJWT, controller.userAuth);

    // GET /api/usuario/clientes - Obtener todos los clientes (debe ir antes de /:id)
    router.get("/clientes", controller.getClientes);
    
    // GET /api/usuario/:id - Obtener información de usuario por ID
    router.get("/:id", controller.getById);

    return router;
  }
}
