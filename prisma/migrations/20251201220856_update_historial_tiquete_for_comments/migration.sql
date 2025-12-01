/*
  Warnings:

  - You are about to drop the `comentariotiquete` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `comentariotiquete` DROP FOREIGN KEY `ComentarioTiquete_creadopor_fkey`;

-- DropForeignKey
ALTER TABLE `comentariotiquete` DROP FOREIGN KEY `ComentarioTiquete_idtiquete_fkey`;

-- AlterTable
ALTER TABLE `historialtiquete` ADD COLUMN `tipo` ENUM('CAMBIO_ESTADO', 'COMENTARIO_EXTERNAL', 'COMENTARIO_INTERNAL') NOT NULL DEFAULT 'CAMBIO_ESTADO',
    MODIFY `estadoanterior` ENUM('ABIERTO', 'EN_PROGRESO', 'PENDIENTE', 'RESUELTO', 'CERRADO', 'CANCELADO', 'ASIGNADO') NULL,
    MODIFY `estadonuevo` ENUM('ABIERTO', 'EN_PROGRESO', 'PENDIENTE', 'RESUELTO', 'CERRADO', 'CANCELADO', 'ASIGNADO') NULL;

-- DropTable
DROP TABLE `comentariotiquete`;
