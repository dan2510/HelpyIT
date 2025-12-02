import { Router } from "express";
import { TecnicoRoutes } from "./tecnico.routes"
import { CategoriaRoutes } from "./categoria.routes";
import { TiqueteRoutes } from "./tiquete.routes";
import { AsignacionRoutes } from "./asignacion.routes"; 
import { ImageRoutes } from "./image.routes";
import { EspecialidadRoutes } from "./especialidad.routes";
import { EtiquetaRoutes } from "./etiqueta.routes";
import { PoliticaSlaRoutes } from "./politicaSla.routes";
import { UsuarioRoutes } from "./usuario.routes";
import NotificacionRoutes from "./notificacion.routes";

export class AppRoutes {
  static get routes(): Router {
    const router = Router();
    // ----Agregar las rutas----
    router.use("/tecnicos", TecnicoRoutes.routes);
    router.use("/categorias", CategoriaRoutes.routes);
    router.use("/tiquetes", TiqueteRoutes.routes);
    router.use("/asignaciones", AsignacionRoutes.routes);
    router.use("/file/", ImageRoutes.routes);
    router.use("/especialidad", EspecialidadRoutes.routes);
    router.use("/etiqueta", EtiquetaRoutes.routes);
    router.use("/politica-sla", PoliticaSlaRoutes.routes);
    router.use("/usuario", UsuarioRoutes.routes);
    router.use("/notificaciones", NotificacionRoutes);

    return router;
  }
}