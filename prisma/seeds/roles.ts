
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
    descripcion: "Supervisor de equipo técnico con permisos de gestión",
  },
  // 3
  {
    nombre: RoleNombre.TECNICO,
    descripcion: "Técnico de soporte para resolución de tickets",
  },
  // 4
  {
    nombre: RoleNombre.CLIENTE,
    descripcion: "Cliente del sistema que puede crear tickets",
  },
];