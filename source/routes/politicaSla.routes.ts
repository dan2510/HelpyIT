import { Router } from "express";
import { PoliticaSlaController } from "../controllers/politicaSlaController";

export class PoliticaSlaRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new PoliticaSlaController();

    // GET /api/politica-sla - Listado de políticas SLA
    router.get("/", controller.get);
    
    // GET /api/politica-sla/:id - Detalle de política SLA específica
    router.get("/:id", controller.getById);

    return router;
  }
}

