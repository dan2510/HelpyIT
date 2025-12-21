-- AlterTable
ALTER TABLE `menuitem` ADD COLUMN `precioVariable` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `tieneVariantes` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `GrupoVariante` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `idmenuitem` INTEGER NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(255) NULL,
    `obligatorio` BOOLEAN NOT NULL DEFAULT true,
    `tipoSeleccion` VARCHAR(20) NOT NULL DEFAULT 'unica',
    `orden` INTEGER NOT NULL DEFAULT 0,
    `definePrecioBase` BOOLEAN NOT NULL DEFAULT false,
    `visibleSi` VARCHAR(100) NULL,
    `creadoen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OpcionVariante` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `idgrupo` INTEGER NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(255) NULL,
    `precioBase` DECIMAL(10, 2) NULL,
    `incrementoPrecio` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `requiereSubSeleccion` BOOLEAN NOT NULL DEFAULT false,
    `subOpciones` TEXT NULL,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creadoen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GrupoVariante` ADD CONSTRAINT `GrupoVariante_idmenuitem_fkey` FOREIGN KEY (`idmenuitem`) REFERENCES `MenuItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpcionVariante` ADD CONSTRAINT `OpcionVariante_idgrupo_fkey` FOREIGN KEY (`idgrupo`) REFERENCES `GrupoVariante`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
