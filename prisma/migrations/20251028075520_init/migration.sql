/*
  Warnings:

  - You are about to alter the column `nombre` on the `rol` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `rol` MODIFY `nombre` ENUM('administrador', 'cliente', 'tecnico') NOT NULL DEFAULT 'cliente';
