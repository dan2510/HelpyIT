-- CreateTable
CREATE TABLE `Configuracion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clave` VARCHAR(100) NOT NULL,
    `valor` TEXT NOT NULL,
    `descripcion` TEXT NULL,
    `tipo` VARCHAR(50) NOT NULL DEFAULT 'string',
    `creadoen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Configuracion_clave_key`(`clave`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
