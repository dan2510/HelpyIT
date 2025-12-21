import { Router } from "express";
import { OrdenController } from "../controllers/ordenController";
import { authenticateJWT } from "../middleware/authMiddleware";

export class OrdenRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new OrdenController();

    // Ruta pública para buscar orden por número de pedido (para seguimiento)
    router.get("/buscar/:numeroPedido", controller.buscarPorNumero);

    // Ruta para obtener órdenes del usuario autenticado (requiere autenticación)
    router.get("/mis-ordenes", authenticateJWT, controller.getOrdenesPorUsuario);

    // Ruta para listado general de órdenes (admin) - requiere autenticación
    router.get("/", authenticateJWT, controller.getOrdenesPorUsuario);
    
    // POST /api/ordenes - Crear nueva orden (permite cliente temporal sin autenticación)
    router.post("/", controller.create);

    // Ruta para detalle completo de una orden por ID
    router.get("/:id", authenticateJWT, controller.getById);
    
    // PATCH /api/ordenes/:id/estado - Actualizar estado de orden
    router.patch("/:id/estado", authenticateJWT, controller.updateEstado);


    return router;
  }
}

