import { Router } from "express";
import { TecnicoController } from "../controllers/tecnicoController";

export class TecnicoRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new TecnicoController();

   
    router.get("/", controller.get);
        // POST /api/tecnicos - Crear nuevo técnico
    router.post("/", controller.create);
    // Ruta para detalle completo de un técnico por ID
    // GET /api/tecnicos/:id
    router.get("/:id", controller.getById);
       // PUT /api/tecnicos/:id - Actualizar técnico existente
    router.put("/:id", controller.update);

    return router;
  }
}