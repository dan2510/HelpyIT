
import { RoleNombre } from "../../generated/prisma";

export const roles = [
  // 1
  {
    nombre: RoleNombre.ADMIN,
    descripcion: "Administrador del sistema con todos los permisos",
  },
  // 2
  {
    nombre: RoleNombre.CLIENTE,
    descripcion: "Cliente que puede realizar pedidos",
  },
];
