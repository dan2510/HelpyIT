import { Router } from "express";
import { AsignacionController } from "../controllers/asignacionController";
import { authenticateJWT } from "../middleware/authMiddleware";

export class AsignacionRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new AsignacionController();

    // Obtener asignaciones por semana para el técnico autenticado
    // GET /asignaciones/mis-asignaciones/semana?fechaInicio=2024-11-04&fechaFin=2024-11-10
    router.get("/mis-asignaciones/semana", authenticateJWT, controller.getAsignacionesPorSemana);

    return router;
  }
}