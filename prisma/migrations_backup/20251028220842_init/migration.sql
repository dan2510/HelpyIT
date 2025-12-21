-- CreateTable
CREATE TABLE `Rol` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` ENUM('ADMIN', 'TECNICO', 'CLIENTE') NOT NULL,
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
    `disponibilidad` ENUM('DISPONIBLE', 'OCUPADO', 'AUSENTE') NOT NULL DEFAULT 'DISPONIBLE',
    `cargaactual` INTEGER NOT NULL DEFAULT 0,
    `maxticketsimultaneos` INTEGER NOT NULL DEFAULT 5,

    UNIQUE INDEX `Usuario_correo_key`(`correo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Categoria` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(80) NOT NULL,
    `descripcion` VARCHAR(255) NOT NULL,
    `idsla` INTEGER NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Especialidad` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(80) NOT NULL,
    `descripcion` VARCHAR(255) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Etiqueta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(60) NOT NULL,
    `descripcion` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PoliticaSla` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(255) NOT NULL,
    `maxminutosrespuesta` INTEGER NOT NULL,
    `maxminutosresolucion` INTEGER NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `vigentedesde` DATE NOT NULL,
    `vigentehasta` DATE NOT NULL,
    `creadoen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReglaAsignacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(255) NOT NULL,
    `activa` BOOLEAN NOT NULL DEFAULT true,
    `pesoprioridad` INTEGER NOT NULL,
    `pesoslarestante` INTEGER NOT NULL,
    `pesocargaactual` INTEGER NOT NULL,
    `pesoexperiencia` INTEGER NOT NULL,
    `prioridadejecucion` INTEGER NOT NULL,
    `creadoen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `eliminadoen` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tiquete` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(140) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `prioridad` ENUM('BAJA', 'MEDIA', 'ALTA', 'CRITICA') NOT NULL DEFAULT 'MEDIA',
    `estado` ENUM('ABIERTO', 'EN_PROGRESO', 'PENDIENTE', 'RESUELTO', 'CERRADO', 'CANCELADO', 'ASIGNADO') NOT NULL DEFAULT 'ABIERTO',
    `idcategoria` INTEGER NOT NULL,
    `idcliente` INTEGER NOT NULL,
    `idtecnicoactual` INTEGER NULL,
    `creadoen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `primerarespuestaen` DATETIME(3) NULL,
    `resueltoen` DATETIME(3) NULL,
    `cerradoen` DATETIME(3) NULL,
    `vencerespuesta` DATETIME(3) NOT NULL,
    `venceresolucion` DATETIME(3) NOT NULL,
    `cumplioslarespuesta` BOOLEAN NULL,
    `cumplioslaresolucion` BOOLEAN NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AsignacionTiquete` (
    `idasignacion` INTEGER NOT NULL AUTO_INCREMENT,
    `idtiquete` INTEGER NOT NULL,
    `idtecnico` INTEGER NOT NULL,
    `idregla` INTEGER NULL,
    `metodo` ENUM('MANUAL', 'AUTOMATICO', 'REGLA') NOT NULL DEFAULT 'MANUAL',
    `justificacion` TEXT NULL,
    `puntajeasignacion` INTEGER NULL,
    `asignadopor` INTEGER NOT NULL,
    `asignadoen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`idasignacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HistorialTiquete` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `idtiquete` INTEGER NOT NULL,
    `estadoanterior` ENUM('ABIERTO', 'EN_PROGRESO', 'PENDIENTE', 'RESUELTO', 'CERRADO', 'CANCELADO', 'ASIGNADO') NOT NULL,
    `estadonuevo` ENUM('ABIERTO', 'EN_PROGRESO', 'PENDIENTE', 'RESUELTO', 'CERRADO', 'CANCELADO', 'ASIGNADO') NOT NULL,
    `observacion` TEXT NULL,
    `cambiadopor` INTEGER NOT NULL,
    `cambiadoen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ImagenTiquete` (
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
    `tipo` ENUM('ASIGNACION', 'CAMBIO_ESTADO', 'MENSAJE', 'RECORDATORIO') NOT NULL,
    `idusuariodestino` INTEGER NOT NULL,
    `idusuarioorigen` INTEGER NULL,
    `idtiquete` INTEGER NULL,
    `titulo` VARCHAR(200) NOT NULL,
    `contenido` TEXT NOT NULL,
    `estado` ENUM('NO_LEIDA', 'LEIDA') NOT NULL DEFAULT 'NO_LEIDA',
    `creadaen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `leidaen` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ValoracionServicio` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `idtiquete` INTEGER NOT NULL,
    `idcliente` INTEGER NOT NULL,
    `calificacion` INTEGER NOT NULL,
    `comentario` VARCHAR(500) NULL,
    `creadaen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CategoriaEspecialidad` (
    `idcategoria` INTEGER NOT NULL,
    `idespecialidad` INTEGER NOT NULL,

    PRIMARY KEY (`idcategoria`, `idespecialidad`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CategoriaEtiqueta` (
    `idcategoria` INTEGER NOT NULL,
    `idetiqueta` INTEGER NOT NULL,

    PRIMARY KEY (`idcategoria`, `idetiqueta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UsuarioEspecialidad` (
    `idusuario` INTEGER NOT NULL,
    `idespecialidad` INTEGER NOT NULL,
    `nivelexperiencia` ENUM('JUNIOR', 'INTERMEDIO', 'SENIOR', 'EXPERTO') NOT NULL,
    `asignadoen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`idusuario`, `idespecialidad`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_idrol_fkey` FOREIGN KEY (`idrol`) REFERENCES `Rol`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Categoria` ADD CONSTRAINT `Categoria_idsla_fkey` FOREIGN KEY (`idsla`) REFERENCES `PoliticaSla`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tiquete` ADD CONSTRAINT `Tiquete_idcategoria_fkey` FOREIGN KEY (`idcategoria`) REFERENCES `Categoria`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tiquete` ADD CONSTRAINT `Tiquete_idcliente_fkey` FOREIGN KEY (`idcliente`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tiquete` ADD CONSTRAINT `Tiquete_idtecnicoactual_fkey` FOREIGN KEY (`idtecnicoactual`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AsignacionTiquete` ADD CONSTRAINT `AsignacionTiquete_idtiquete_fkey` FOREIGN KEY (`idtiquete`) REFERENCES `Tiquete`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AsignacionTiquete` ADD CONSTRAINT `AsignacionTiquete_idtecnico_fkey` FOREIGN KEY (`idtecnico`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AsignacionTiquete` ADD CONSTRAINT `AsignacionTiquete_idregla_fkey` FOREIGN KEY (`idregla`) REFERENCES `ReglaAsignacion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistorialTiquete` ADD CONSTRAINT `HistorialTiquete_idtiquete_fkey` FOREIGN KEY (`idtiquete`) REFERENCES `Tiquete`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistorialTiquete` ADD CONSTRAINT `HistorialTiquete_cambiadopor_fkey` FOREIGN KEY (`cambiadopor`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImagenTiquete` ADD CONSTRAINT `ImagenTiquete_idhistorial_fkey` FOREIGN KEY (`idhistorial`) REFERENCES `HistorialTiquete`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImagenTiquete` ADD CONSTRAINT `ImagenTiquete_subidopor_fkey` FOREIGN KEY (`subidopor`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notificacion` ADD CONSTRAINT `Notificacion_idusuariodestino_fkey` FOREIGN KEY (`idusuariodestino`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notificacion` ADD CONSTRAINT `Notificacion_idusuarioorigen_fkey` FOREIGN KEY (`idusuarioorigen`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notificacion` ADD CONSTRAINT `Notificacion_idtiquete_fkey` FOREIGN KEY (`idtiquete`) REFERENCES `Tiquete`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ValoracionServicio` ADD CONSTRAINT `ValoracionServicio_idtiquete_fkey` FOREIGN KEY (`idtiquete`) REFERENCES `Tiquete`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ValoracionServicio` ADD CONSTRAINT `ValoracionServicio_idcliente_fkey` FOREIGN KEY (`idcliente`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategoriaEspecialidad` ADD CONSTRAINT `CategoriaEspecialidad_idcategoria_fkey` FOREIGN KEY (`idcategoria`) REFERENCES `Categoria`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategoriaEspecialidad` ADD CONSTRAINT `CategoriaEspecialidad_idespecialidad_fkey` FOREIGN KEY (`idespecialidad`) REFERENCES `Especialidad`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategoriaEtiqueta` ADD CONSTRAINT `CategoriaEtiqueta_idcategoria_fkey` FOREIGN KEY (`idcategoria`) REFERENCES `Categoria`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategoriaEtiqueta` ADD CONSTRAINT `CategoriaEtiqueta_idetiqueta_fkey` FOREIGN KEY (`idetiqueta`) REFERENCES `Etiqueta`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UsuarioEspecialidad` ADD CONSTRAINT `UsuarioEspecialidad_idusuario_fkey` FOREIGN KEY (`idusuario`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UsuarioEspecialidad` ADD CONSTRAINT `UsuarioEspecialidad_idespecialidad_fkey` FOREIGN KEY (`idespecialidad`) REFERENCES `Especialidad`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
