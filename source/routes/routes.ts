import { Router } from "express";
import { CategoriaMenuRoutes } from "./categoriaMenu.routes";
import { OrdenRoutes } from "./orden.routes";
import { MenuRoutes } from "./menu.routes";
import { ImageRoutes } from "./image.routes";
import { UsuarioRoutes } from "./usuario.routes";
import NotificacionRoutes from "./notificacion.routes";
import { ConfiguracionRoutes } from "./configuracion.routes";

export class AppRoutes {
  static get routes(): Router {
    const router = Router();
    // ----Agregar las rutas----
    router.use("/categorias-menu", CategoriaMenuRoutes.routes);
    router.use("/ordenes", OrdenRoutes.routes);
    router.use("/menu", MenuRoutes.routes);
    router.use("/file/", ImageRoutes.routes);
    router.use("/usuario", UsuarioRoutes.routes);
    router.use("/notificaciones", NotificacionRoutes);
    router.use("/configuracion", ConfiguracionRoutes.routes);

    return router;
  }
}
