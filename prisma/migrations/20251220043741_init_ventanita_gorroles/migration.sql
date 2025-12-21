-- CreateTable
CREATE TABLE `Rol` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` ENUM('ADMIN', 'MESERO', 'CLIENTE') NOT NULL,
    `descripcion` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `correo` VARCHAR(190) NOT NULL,
    `contrasenahash` VARCHAR(255) NOT NULL,
    `nombrecompleto` VARCHAR(120) NOT NULL,
    `telefono` VARCHAR(20) NULL,
    `idrol` INTEGER NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `ultimoiniciosesion` DATETIME(3) NULL,
    `creadoen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `eliminadoen` DATETIME(3) NULL,
    `disponibilidad` ENUM('DISPONIBLE', 'OCUPADO', 'AUSENTE', 'INACTIVO') NOT NULL DEFAULT 'DISPONIBLE',
    `resettoken` VARCHAR(255) NULL,
    `resettokenexpires` DATETIME(3) NULL,

    UNIQUE INDEX `Usuario_correo_key`(`correo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
CREATE TABLE `Notificacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` ENUM('NUEVA_ORDEN', 'ORDEN_LISTA', 'CAMBIO_ESTADO', 'MENSAJE', 'RECORDATORIO', 'INICIO_SESION') NOT NULL,
    `idusuariodestino` INTEGER NOT NULL,
    `idusuarioorigen` INTEGER NULL,
    `idorden` INTEGER NULL,
    `titulo` VARCHAR(200) NOT NULL,
    `contenido` TEXT NOT NULL,
    `estado` ENUM('NO_LEIDA', 'LEIDA') NOT NULL DEFAULT 'NO_LEIDA',
    `creadaen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `leidaen` DATETIME(3) NULL,

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
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_idrol_fkey` FOREIGN KEY (`idrol`) REFERENCES `Rol`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE `Notificacion` ADD CONSTRAINT `Notificacion_idusuariodestino_fkey` FOREIGN KEY (`idusuariodestino`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notificacion` ADD CONSTRAINT `Notificacion_idusuarioorigen_fkey` FOREIGN KEY (`idusuarioorigen`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notificacion` ADD CONSTRAINT `Notificacion_idorden_fkey` FOREIGN KEY (`idorden`) REFERENCES `Orden`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ValoracionOrden` ADD CONSTRAINT `ValoracionOrden_idorden_fkey` FOREIGN KEY (`idorden`) REFERENCES `Orden`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ValoracionOrden` ADD CONSTRAINT `ValoracionOrden_idcliente_fkey` FOREIGN KEY (`idcliente`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
