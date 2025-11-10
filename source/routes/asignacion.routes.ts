import { Router } from "express";
import { AsignacionController } from "../controllers/asignacionController";

export class AsignacionRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new AsignacionController();

    // Obtener asignaciones por semana para un técnico
    // GET /asignaciones/tecnico/:idTecnico/semana?fechaInicio=2024-11-04&fechaFin=2024-11-10
    router.get("/tecnico/:idTecnico/semana", controller.getAsignacionesPorSemana);

    return router;
  }
}