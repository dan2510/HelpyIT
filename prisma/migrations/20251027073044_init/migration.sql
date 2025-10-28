-- CreateTable
CREATE TABLE `rol` (
    `idrol` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(30) NOT NULL,
    `descripcion` VARCHAR(255) NULL,

    UNIQUE INDEX `rol_nombre_key`(`nombre`),
    PRIMARY KEY (`idrol`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario` (
    `idusuario` INTEGER NOT NULL AUTO_INCREMENT,
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
    `disponibilidad` ENUM('disponible', 'ocupado', 'ausente') NULL,
    `cargaactual` INTEGER NULL DEFAULT 0,
    `maxticketsimultaneos` INTEGER NULL DEFAULT 10,

    UNIQUE INDEX `usuario_correo_key`(`correo`),
    PRIMARY KEY (`idusuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `especialidad` (
    `idespecialidad` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(80) NOT NULL,
    `descripcion` VARCHAR(255) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `especialidad_nombre_key`(`nombre`),
    PRIMARY KEY (`idespecialidad`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarioespecialidad` (
    `idusuario` INTEGER NOT NULL,
    `idespecialidad` INTEGER NOT NULL,
    `nivelexperiencia` ENUM('basico', 'intermedio', 'avanzado', 'experto') NOT NULL DEFAULT 'intermedio',
    `asignadoen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`idusuario`, `idespecialidad`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `politicasla` (
    `idsla` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(255) NULL,
    `maxminutosrespuesta` INTEGER NOT NULL,
    `maxminutosresolucion` INTEGER NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `vigentedesde` DATE NOT NULL,
    `vigentehasta` DATE NULL,
    `creadoen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`idsla`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categoria` (
    `idcategoria` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(80) NOT NULL,
    `descripcion` VARCHAR(255) NULL,
    `idsla` INTEGER NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `categoria_nombre_key`(`nombre`),
    PRIMARY KEY (`idcategoria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categoriaespecialidad` (
    `idcategoria` INTEGER NOT NULL,
    `idespecialidad` INTEGER NOT NULL,

    PRIMARY KEY (`idcategoria`, `idespecialidad`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `etiqueta` (
    `idetiqueta` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(60) NOT NULL,
    `descripcion` VARCHAR(255) NULL,

    UNIQUE INDEX `etiqueta_nombre_key`(`nombre`),
    PRIMARY KEY (`idetiqueta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categoriaetiqueta` (
    `idcategoria` INTEGER NOT NULL,
    `idetiqueta` INTEGER NOT NULL,

    PRIMARY KEY (`idcategoria`, `idetiqueta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tiquete` (
    `idtiquete` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(140) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `prioridad` ENUM('baja', 'media', 'alta', 'critica') NOT NULL DEFAULT 'media',
    `estado` ENUM('pendiente', 'asignado', 'enproceso', 'resuelto', 'cerrado', 'cancelado') NOT NULL DEFAULT 'pendiente',
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

    PRIMARY KEY (`idtiquete`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historialtiquete` (
    `idhistorial` INTEGER NOT NULL AUTO_INCREMENT,
    `idtiquete` INTEGER NOT NULL,
    `estadoanterior` ENUM('pendiente', 'asignado', 'enproceso', 'resuelto', 'cerrado', 'cancelado') NULL,
    `estadonuevo` ENUM('pendiente', 'asignado', 'enproceso', 'resuelto', 'cerrado', 'cancelado') NOT NULL,
    `observacion` TEXT NULL,
    `cambiadopor` INTEGER NOT NULL,
    `cambiadoen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`idhistorial`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `imagentiquete` (
    `idimagen` INTEGER NOT NULL AUTO_INCREMENT,
    `idhistorial` INTEGER NOT NULL,
    `rutaarchivo` VARCHAR(500) NOT NULL,
    `subidopor` INTEGER NOT NULL,
    `subidoen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`idimagen`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reglaasignacion` (
    `idregla` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(255) NULL,
    `activa` BOOLEAN NOT NULL DEFAULT true,
    `pesoprioridad` INTEGER NOT NULL DEFAULT 1000,
    `pesoslarestante` INTEGER NOT NULL DEFAULT -1,
    `pesocargaactual` INTEGER NOT NULL DEFAULT -50,
    `pesoexperiencia` INTEGER NOT NULL DEFAULT 100,
    `prioridadejecucion` INTEGER NOT NULL DEFAULT 1,
    `creadoen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `eliminadoen` DATETIME(3) NULL,

    PRIMARY KEY (`idregla`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `asignaciontiquete` (
    `idasignacion` INTEGER NOT NULL AUTO_INCREMENT,
    `idtiquete` INTEGER NOT NULL,
    `idtecnico` INTEGER NOT NULL,
    `idregla` INTEGER NULL,
    `metodo` ENUM('automatica', 'manual') NOT NULL,
    `justificacion` TEXT NULL,
    `puntajeasignacion` INTEGER NULL,
    `asignadopor` INTEGER NULL,
    `asignadoen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`idasignacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notificacion` (
    `idnotificacion` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` ENUM('iniciosesion', 'asignacion', 'cambioestado', 'comentario', 'vencimientoproximo', 'ticketcreado', 'ticketcerrado') NOT NULL,
    `idusuariodestino` INTEGER NOT NULL,
    `idusuarioorigen` INTEGER NULL,
    `idtiquete` INTEGER NULL,
    `titulo` VARCHAR(200) NOT NULL,
    `contenido` TEXT NULL,
    `estado` ENUM('pendiente', 'leida') NOT NULL DEFAULT 'pendiente',
    `creadaen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `leidaen` DATETIME(3) NULL,

    PRIMARY KEY (`idnotificacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `valoracionservicio` (
    `idvaloracion` INTEGER NOT NULL AUTO_INCREMENT,
    `idtiquete` INTEGER NOT NULL,
    `idcliente` INTEGER NOT NULL,
    `calificacion` INTEGER NOT NULL,
    `comentario` VARCHAR(500) NULL,
    `creadaen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `valoracionservicio_idtiquete_idcliente_key`(`idtiquete`, `idcliente`),
    PRIMARY KEY (`idvaloracion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuario` ADD CONSTRAINT `usuario_idrol_fkey` FOREIGN KEY (`idrol`) REFERENCES `rol`(`idrol`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuarioespecialidad` ADD CONSTRAINT `usuarioespecialidad_idusuario_fkey` FOREIGN KEY (`idusuario`) REFERENCES `usuario`(`idusuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuarioespecialidad` ADD CONSTRAINT `usuarioespecialidad_idespecialidad_fkey` FOREIGN KEY (`idespecialidad`) REFERENCES `especialidad`(`idespecialidad`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categoria` ADD CONSTRAINT `categoria_idsla_fkey` FOREIGN KEY (`idsla`) REFERENCES `politicasla`(`idsla`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categoriaespecialidad` ADD CONSTRAINT `categoriaespecialidad_idcategoria_fkey` FOREIGN KEY (`idcategoria`) REFERENCES `categoria`(`idcategoria`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categoriaespecialidad` ADD CONSTRAINT `categoriaespecialidad_idespecialidad_fkey` FOREIGN KEY (`idespecialidad`) REFERENCES `especialidad`(`idespecialidad`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categoriaetiqueta` ADD CONSTRAINT `categoriaetiqueta_idcategoria_fkey` FOREIGN KEY (`idcategoria`) REFERENCES `categoria`(`idcategoria`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categoriaetiqueta` ADD CONSTRAINT `categoriaetiqueta_idetiqueta_fkey` FOREIGN KEY (`idetiqueta`) REFERENCES `etiqueta`(`idetiqueta`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tiquete` ADD CONSTRAINT `tiquete_idcategoria_fkey` FOREIGN KEY (`idcategoria`) REFERENCES `categoria`(`idcategoria`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tiquete` ADD CONSTRAINT `tiquete_idcliente_fkey` FOREIGN KEY (`idcliente`) REFERENCES `usuario`(`idusuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tiquete` ADD CONSTRAINT `tiquete_idtecnicoactual_fkey` FOREIGN KEY (`idtecnicoactual`) REFERENCES `usuario`(`idusuario`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historialtiquete` ADD CONSTRAINT `historialtiquete_idtiquete_fkey` FOREIGN KEY (`idtiquete`) REFERENCES `tiquete`(`idtiquete`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historialtiquete` ADD CONSTRAINT `historialtiquete_cambiadopor_fkey` FOREIGN KEY (`cambiadopor`) REFERENCES `usuario`(`idusuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `imagentiquete` ADD CONSTRAINT `imagentiquete_idhistorial_fkey` FOREIGN KEY (`idhistorial`) REFERENCES `historialtiquete`(`idhistorial`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `imagentiquete` ADD CONSTRAINT `imagentiquete_subidopor_fkey` FOREIGN KEY (`subidopor`) REFERENCES `usuario`(`idusuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asignaciontiquete` ADD CONSTRAINT `asignaciontiquete_idtiquete_fkey` FOREIGN KEY (`idtiquete`) REFERENCES `tiquete`(`idtiquete`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asignaciontiquete` ADD CONSTRAINT `asignaciontiquete_idtecnico_fkey` FOREIGN KEY (`idtecnico`) REFERENCES `usuario`(`idusuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asignaciontiquete` ADD CONSTRAINT `asignaciontiquete_idregla_fkey` FOREIGN KEY (`idregla`) REFERENCES `reglaasignacion`(`idregla`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asignaciontiquete` ADD CONSTRAINT `asignaciontiquete_asignadopor_fkey` FOREIGN KEY (`asignadopor`) REFERENCES `usuario`(`idusuario`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificacion` ADD CONSTRAINT `notificacion_idusuariodestino_fkey` FOREIGN KEY (`idusuariodestino`) REFERENCES `usuario`(`idusuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificacion` ADD CONSTRAINT `notificacion_idusuarioorigen_fkey` FOREIGN KEY (`idusuarioorigen`) REFERENCES `usuario`(`idusuario`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificacion` ADD CONSTRAINT `notificacion_idtiquete_fkey` FOREIGN KEY (`idtiquete`) REFERENCES `tiquete`(`idtiquete`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `valoracionservicio` ADD CONSTRAINT `valoracionservicio_idtiquete_fkey` FOREIGN KEY (`idtiquete`) REFERENCES `tiquete`(`idtiquete`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `valoracionservicio` ADD CONSTRAINT `valoracionservicio_idcliente_fkey` FOREIGN KEY (`idcliente`) REFERENCES `usuario`(`idusuario`) ON DELETE CASCADE ON UPDATE CASCADE;
