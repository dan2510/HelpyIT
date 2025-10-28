/*
  Warnings:

  - You are about to alter the column `nombre` on the `rol` table. The data in that column could be lost. The data in that column will be cast from `VarChar(30)` to `Enum(EnumId(0))`.

*/
-- DropIndex
DROP INDEX `rol_nombre_key` ON `rol`;

-- AlterTable
ALTER TABLE `rol` MODIFY `nombre` ENUM('usuario', 'administrador') NOT NULL DEFAULT 'usuario';
