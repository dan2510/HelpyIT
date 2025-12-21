/*
  Warnings:

  - The values [COMENTARIO_MESERO] on the enum `HistorialOrden_tipo` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `idmesero` on the `orden` table. All the data in the column will be lost.
  - The values [MESERO] on the enum `Rol_nombre` will be removed. If these variants are still used in the database, this will fail.

*/
-- DropForeignKey
ALTER TABLE `orden` DROP FOREIGN KEY `Orden_idmesero_fkey`;

-- DropIndex
DROP INDEX `Orden_idmesero_fkey` ON `orden`;

-- AlterTable
ALTER TABLE `historialorden` MODIFY `tipo` ENUM('CAMBIO_ESTADO', 'COMENTARIO_CLIENTE') NOT NULL DEFAULT 'CAMBIO_ESTADO';

-- AlterTable
ALTER TABLE `orden` DROP COLUMN `idmesero`;

-- AlterTable
ALTER TABLE `rol` MODIFY `nombre` ENUM('ADMIN', 'CLIENTE') NOT NULL;
