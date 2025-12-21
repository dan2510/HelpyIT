/*
  Warnings:

  - You are about to drop the column `idtiquete` on the `notificacion` table. All the data in the column will be lost.
  - The values [ASIGNACION,VALORACION] on the enum `Notificacion_tipo` will be removed. If these variants are still used in the database, this will fail.
  - The values [TECNICO] on the enum `Rol_nombre` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `cargaactual` on the `usuario` table. All the data in the column will be lost.
  - You are about to drop the column `maxticketsimultaneos` on the `usuario` table. All the data in the column will be lost.
  - You are about to drop the `asignaciontiquete` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `categoria` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `categoriaespecialidad` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `categoriaetiqueta` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `especialidad` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `etiqueta` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `historialtiquete` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `imagentiquete` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `politicasla` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reglaasignacion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tiquete` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usuarioespecialidad` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `valoracionservicio` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `asignaciontiquete` DROP FOREIGN KEY `AsignacionTiquete_idregla_fkey`;

-- DropForeignKey
ALTER TABLE `asignaciontiquete` DROP FOREIGN KEY `AsignacionTiquete_idtecnico_fkey`;

-- DropForeignKey
ALTER TABLE `asignaciontiquete` DROP FOREIGN KEY `AsignacionTiquete_idtiquete_fkey`;

-- DropForeignKey
ALTER TABLE `categoria` DROP FOREIGN KEY `Categoria_idsla_fkey`;

-- DropForeignKey
ALTER TABLE `categoriaespecialidad` DROP FOREIGN KEY `CategoriaEspecialidad_idcategoria_fkey`;

-- DropForeignKey
ALTER TABLE `categoriaespecialidad` DROP FOREIGN KEY `CategoriaEspecialidad_idespecialidad_fkey`;

-- DropForeignKey
ALTER TABLE `categoriaetiqueta` DROP FOREIGN KEY `CategoriaEtiqueta_idcategoria_fkey`;

-- DropForeignKey
ALTER TABLE `categoriaetiqueta` DROP FOREIGN KEY `CategoriaEtiqueta_idetiqueta_fkey`;

-- DropForeignKey
ALTER TABLE `historialtiquete` DROP FOREIGN KEY `HistorialTiquete_cambiadopor_fkey`;

-- DropForeignKey
ALTER TABLE `historialtiquete` DROP FOREIGN KEY `HistorialTiquete_idtiquete_fkey`;

-- DropForeignKey
ALTER TABLE `imagentiquete` DROP FOREIGN KEY `ImagenTiquete_idhistorial_fkey`;

-- DropForeignKey
ALTER TABLE `imagentiquete` DROP FOREIGN KEY `ImagenTiquete_subidopor_fkey`;

-- DropForeignKey
ALTER TABLE `notificacion` DROP FOREIGN KEY `Notificacion_idtiquete_fkey`;

-- DropForeignKey
ALTER TABLE `tiquete` DROP FOREIGN KEY `Tiquete_idcategoria_fkey`;

-- DropForeignKey
ALTER TABLE `tiquete` DROP FOREIGN KEY `Tiquete_idcliente_fkey`;

-- DropForeignKey
ALTER TABLE `tiquete` DROP FOREIGN KEY `Tiquete_idtecnicoactual_fkey`;

-- DropForeignKey
ALTER TABLE `usuarioespecialidad` DROP FOREIGN KEY `UsuarioEspecialidad_idespecialidad_fkey`;

-- DropForeignKey
ALTER TABLE `usuarioespecialidad` DROP FOREIGN KEY `UsuarioEspecialidad_idusuario_fkey`;

-- DropForeignKey
ALTER TABLE `valoracionservicio` DROP FOREIGN KEY `ValoracionServicio_idcliente_fkey`;

-- DropForeignKey
ALTER TABLE `valoracionservicio` DROP FOREIGN KEY `ValoracionServicio_idtiquete_fkey`;

-- DropIndex
DROP INDEX `Notificacion_idtiquete_fkey` ON `notificacion`;

-- AlterTable
ALTER TABLE `notificacion` DROP COLUMN `idtiquete`,
    ADD COLUMN `idorden` INTEGER NULL,
    MODIFY `tipo` ENUM('NUEVA_ORDEN', 'ORDEN_LISTA', 'CAMBIO_ESTADO', 'MENSAJE', 'RECORDATORIO', 'INICIO_SESION') NOT NULL;

-- AlterTable
ALTER TABLE `rol` MODIFY `nombre` ENUM('ADMIN', 'MESERO', 'CLIENTE') NOT NULL;

-- AlterTable
ALTER TABLE `usuario` DROP COLUMN `cargaactual`,
    DROP COLUMN `maxticketsimultaneos`;

-- DropTable
DROP TABLE `asignaciontiquete`;

-- DropTable
DROP TABLE `categoria`;

-- DropTable
DROP TABLE `categoriaespecialidad`;

-- DropTable
DROP TABLE `categoriaetiqueta`;

-- DropTable
DROP TABLE `especialidad`;

-- DropTable
DROP TABLE `etiqueta`;

-- DropTable
DROP TABLE `historialtiquete`;

-- DropTable
DROP TABLE `imagentiquete`;

-- DropTable
DROP TABLE `politicasla`;

-- DropTable
DROP TABLE `reglaasignacion`;

-- DropTable
DROP TABLE `tiquete`;

-- DropTable
DROP TABLE `usuarioespecialidad`;

-- DropTable
DROP TABLE `valoracionservicio`;

-- CreateTable
CREATE TABLE `CategoriaMenu` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(80) NOT NULL,
    `descripcion` VARCHAR(255) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `creadoen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MenuItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(120) NOT NULL,
    `descripcion` TEXT NULL,
    `precio` DECIMAL(10, 2) NOT NULL,
    `idcategoria` INTEGER NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `disponible` BOOLEAN NOT NULL DEFAULT true,
    `imagen` VARCHAR(500) NULL,
    `tiempoPreparacion` INTEGER NULL,
    `creadoen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Orden` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numeropedido` VARCHAR(20) NOT NULL,
    `idcliente` INTEGER NOT NULL,
    `idmesero` INTEGER NULL,
    `estado` ENUM('PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO', 'CANCELADO') NOT NULL DEFAULT 'PENDIENTE',
    `tipopedido` ENUM('COMER_AQUI', 'PARA_LLEVAR', 'DELIVERY') NOT NULL DEFAULT 'COMER_AQUI',
    `total` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `notas` TEXT NULL,
    `creadoen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `preparadoen` DATETIME(3) NULL,
    `entregadoen` DATETIME(3) NULL,

    UNIQUE INDEX `Orden_numeropedido_key`(`numeropedido`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ItemOrden` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `idorden` INTEGER NOT NULL,
    `idmenuitem` INTEGER NOT NULL,
    `cantidad` INTEGER NOT NULL DEFAULT 1,
    `precio` DECIMAL(10, 2) NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `notas` VARCHAR(500) NULL,
    `creadoen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HistorialOrden` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `idorden` INTEGER NOT NULL,
    `estadoanterior` ENUM('PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO', 'CANCELADO') NULL,
    `estadonuevo` ENUM('PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO', 'CANCELADO') NULL,
    `observacion` TEXT NULL,
    `tipo` ENUM('CAMBIO_ESTADO', 'COMENTARIO_CLIENTE', 'COMENTARIO_MESERO') NOT NULL DEFAULT 'CAMBIO_ESTADO',
    `cambiadopor` INTEGER NOT NULL,
    `cambiadoen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ImagenOrden` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `idhistorial` INTEGER NOT NULL,
    `rutaarchivo` VARCHAR(500) NOT NULL,
    `subidopor` INTEGER NOT NULL,
    `subidoen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ValoracionOrden` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `idorden` INTEGER NOT NULL,
    `idcliente` INTEGER NOT NULL,
    `calificacion` INTEGER NOT NULL,
    `comentario` VARCHAR(500) NULL,
    `creadaen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MenuItem` ADD CONSTRAINT `MenuItem_idcategoria_fkey` FOREIGN KEY (`idcategoria`) REFERENCES `CategoriaMenu`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Orden` ADD CONSTRAINT `Orden_idcliente_fkey` FOREIGN KEY (`idcliente`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Orden` ADD CONSTRAINT `Orden_idmesero_fkey` FOREIGN KEY (`idmesero`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemOrden` ADD CONSTRAINT `ItemOrden_idorden_fkey` FOREIGN KEY (`idorden`) REFERENCES `Orden`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemOrden` ADD CONSTRAINT `ItemOrden_idmenuitem_fkey` FOREIGN KEY (`idmenuitem`) REFERENCES `MenuItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistorialOrden` ADD CONSTRAINT `HistorialOrden_idorden_fkey` FOREIGN KEY (`idorden`) REFERENCES `Orden`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistorialOrden` ADD CONSTRAINT `HistorialOrden_cambiadopor_fkey` FOREIGN KEY (`cambiadopor`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImagenOrden` ADD CONSTRAINT `ImagenOrden_idhistorial_fkey` FOREIGN KEY (`idhistorial`) REFERENCES `HistorialOrden`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImagenOrden` ADD CONSTRAINT `ImagenOrden_subidopor_fkey` FOREIGN KEY (`subidopor`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notificacion` ADD CONSTRAINT `Notificacion_idorden_fkey` FOREIGN KEY (`idorden`) REFERENCES `Orden`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ValoracionOrden` ADD CONSTRAINT `ValoracionOrden_idorden_fkey` FOREIGN KEY (`idorden`) REFERENCES `Orden`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ValoracionOrden` ADD CONSTRAINT `ValoracionOrden_idcliente_fkey` FOREIGN KEY (`idcliente`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
