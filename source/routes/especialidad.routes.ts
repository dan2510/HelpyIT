import { Router } from "express";
import { EspecialidadController } from "../controllers/especialidadContoller";

export class EspecialidadRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new EspecialidadController();

    // GET /api/especialidades - Listado de especialidades
    router.get("/", controller.get);
    
    // GET /api/especialidades/:id - Detalle de especialidad específica
    router.get("/:id", controller.getById);

    return router;
  }
}