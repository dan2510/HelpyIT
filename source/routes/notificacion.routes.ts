import { Router } from "express";
import controller from "../controllers/notificacionController";
import { authenticateJWT } from "../middleware/authMiddleware";

const router = Router();

// Todas las rutas requieren autenticación
router.get("/", authenticateJWT, controller.getAll);
router.patch("/:id/leer", authenticateJWT, controller.marcarComoLeida);
router.patch("/marcar-todas-leidas", authenticateJWT, controller.marcarTodasComoLeidas);

export default router;

