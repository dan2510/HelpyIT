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

    // ========== ASIGNACIÓN AUTOMÁTICA ==========
    // POST /asignaciones/automatica - Ejecutar asignación automática de tickets pendientes
    router.post("/automatica", authenticateJWT, controller.asignacionAutomatica);

    // ========== ASIGNACIÓN MANUAL ==========
    // GET /asignaciones/manual/pendientes - Obtener tickets pendientes para asignación manual
    router.get("/manual/pendientes", authenticateJWT, controller.getTicketsPendientes);
    
    // GET /asignaciones/manual/tecnicos?idCategoria=1 - Obtener técnicos disponibles
    router.get("/manual/tecnicos", authenticateJWT, controller.getTecnicosDisponibles);
    
    // POST /asignaciones/manual - Realizar asignación manual
    router.post("/manual", authenticateJWT, controller.asignacionManual);

    return router;
  }
}