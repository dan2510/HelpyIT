-- Primero actualizar todos los registros que tienen ABIERTO a PENDIENTE
UPDATE `Tiquete` SET `estado` = 'PENDIENTE' WHERE `estado` = 'ABIERTO';
UPDATE `HistorialTiquete` SET `estadoanterior` = 'PENDIENTE' WHERE `estadoanterior` = 'ABIERTO';
UPDATE `HistorialTiquete` SET `estadonuevo` = 'PENDIENTE' WHERE `estadonuevo` = 'ABIERTO';

-- Ahora modificar el enum para eliminar ABIERTO
ALTER TABLE `Tiquete` MODIFY `estado` ENUM('PENDIENTE', 'EN_PROGRESO', 'RESUELTO', 'CERRADO', 'CANCELADO', 'ASIGNADO') NOT NULL DEFAULT 'PENDIENTE';
ALTER TABLE `HistorialTiquete` MODIFY `estadoanterior` ENUM('PENDIENTE', 'EN_PROGRESO', 'RESUELTO', 'CERRADO', 'CANCELADO', 'ASIGNADO') NULL;
ALTER TABLE `HistorialTiquete` MODIFY `estadonuevo` ENUM('PENDIENTE', 'EN_PROGRESO', 'RESUELTO', 'CERRADO', 'CANCELADO', 'ASIGNADO') NULL;

