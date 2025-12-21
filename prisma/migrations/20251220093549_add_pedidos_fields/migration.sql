/*
  Warnings:

  - A unique constraint covering the columns `[telefono]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `historialorden` MODIFY `estadoanterior` ENUM('PENDIENTE', 'RECIBIDO', 'EN_PREPARACION', 'LISTO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO') NULL,
    MODIFY `estadonuevo` ENUM('PENDIENTE', 'RECIBIDO', 'EN_PREPARACION', 'LISTO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO') NULL;

-- AlterTable
ALTER TABLE `orden` ADD COLUMN `cambio` DECIMAL(10, 2) NULL,
    ADD COLUMN `metodopago` ENUM('EFECTIVO', 'TARJETA', 'SINPE_MOVIL') NULL,
    ADD COLUMN `montopagado` DECIMAL(10, 2) NULL,
    ADD COLUMN `numeroautorizacion` VARCHAR(50) NULL,
    ADD COLUMN `servicioexpress` DECIMAL(10, 2) NULL,
    ADD COLUMN `subtotal` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `tiempoestimado` INTEGER NULL,
    ADD COLUMN `ultimos4digitos` VARCHAR(4) NULL,
    MODIFY `numeropedido` VARCHAR(50) NOT NULL,
    MODIFY `estado` ENUM('PENDIENTE', 'RECIBIDO', 'EN_PREPARACION', 'LISTO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO') NOT NULL DEFAULT 'PENDIENTE';

-- AlterTable
ALTER TABLE `usuario` ADD COLUMN `direccion` TEXT NULL,
    ADD COLUMN `latitud` DECIMAL(10, 8) NULL,
    ADD COLUMN `longitud` DECIMAL(11, 8) NULL,
    ADD COLUMN `ultimopedido` DATETIME(3) NULL,
    MODIFY `correo` VARCHAR(190) NULL,
    MODIFY `contrasenahash` VARCHAR(255) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Usuario_telefono_key` ON `Usuario`(`telefono`);
