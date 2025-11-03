import { Router } from "express";
import { VideojuegoController } from "../controllers/videojuegoController";
export class VideojuegoRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new VideojuegoController();
    //localhost:3000/videojuego/
    router.get("/", controller.get);
    //localhost:3000/videojuego/search?clave=valor
    router.get("/search", controller.search);
    //-------- Route con autorización --------
    /* router.get(
      "/:id",
      authenticateJWT, // 1. verificar token JWT
      authorizeRoles(Role.ADMIN), // 2. verificar que el rol sea ADMIN
      controller.getById
    ); */
    //localhost:3000/videojuego/2
    router.get(
      "/:id",
      controller.getById
    );
    //Crear videojuego
    router.post("/", controller.create);
    //Actualizar videojuego
    router.put("/:id", controller.update);
    return router;
  }
}
