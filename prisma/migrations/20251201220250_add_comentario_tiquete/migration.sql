-- CreateTable
CREATE TABLE `ComentarioTiquete` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `idtiquete` INTEGER NOT NULL,
    `tipo` ENUM('EXTERNAL', 'INTERNAL') NOT NULL,
    `contenido` TEXT NOT NULL,
    `creadopor` INTEGER NOT NULL,
    `creadoen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ComentarioTiquete` ADD CONSTRAINT `ComentarioTiquete_idtiquete_fkey` FOREIGN KEY (`idtiquete`) REFERENCES `Tiquete`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ComentarioTiquete` ADD CONSTRAINT `ComentarioTiquete_creadopor_fkey` FOREIGN KEY (`creadopor`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
