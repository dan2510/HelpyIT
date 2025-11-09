import { Router } from "express";
import { TecnicoRoutes } from "./tecnico.routes"
import { CategoriaRoutes } from "./categoria.routes";
import { TiqueteRoutes } from "./tiquete.routes";

export class AppRoutes {
  static get routes(): Router {
    const router = Router();
    // ----Agregar las rutas----
    router.use("/tecnicos", TecnicoRoutes.routes);
    router.use("/categorias", CategoriaRoutes.routes);
    router.use("/tiquetes", TiqueteRoutes.routes);

    return router;
  }
}