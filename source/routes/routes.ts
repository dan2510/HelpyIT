import { Router } from "express";
import { TecnicoRoutes } from "./tecnico.routes"
export class AppRoutes {
  static get routes(): Router {
    const router = Router();
    // ----Agregar las rutas----
    router.use("/tecnicos", TecnicoRoutes.routes);

    return router;
  }
}
