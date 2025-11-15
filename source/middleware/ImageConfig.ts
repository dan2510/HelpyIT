import { Request, Response, NextFunction } from 'express';
import multer, { StorageEngine } from 'multer';
import util from 'util';
import path from "path";
import fs from 'fs'; 

// Definición del tamaño máximo del archivo en bytes
const maxSize: number = 2 * 1024 * 1024;
const __basedir = path.resolve();

// Configuración del almacenamiento con multer
const storage: StorageEngine = multer.diskStorage({
  destination: (request: Request, file: Express.Multer.File, cb ) => {
    cb(null, path.join(__basedir, "/assets/uploads/"));
  },
  filename: (request: Request, file: Express.Multer.File, cb) => {
      const uploadPath = path.join(__basedir, "/assets/uploads/");
    const previousFileName = request.body.previousFileName; 

    // Borrar el archivo anterior si existe
    if (previousFileName && previousFileName!='') {
      const previousFilePath = path.join(uploadPath, previousFileName);
      fs.unlink(previousFilePath, (err) => {
        if (err && err.code !== 'ENOENT') { // 'ENOENT' significa "archivo no encontrado"
          console.error('Error al intentar borrar el archivo anterior:', err);
        } else if (!err) {
          console.log(`Archivo anterior ${previousFileName} borrado exitosamente.`);
        }
      });
    }

    // Generar el nombre del nuevo archivo
    cb(null,'videojuego_' + Date.now() 
          + path.extname(file.originalname))
  },
});

// Configuración de multer con el tamaño máximo del archivo
const uploadFile = multer({
  storage: storage,
  limits: { fileSize: maxSize },
}).single('file');

// Convertir el middleware a una promesa
const ImageConfig = util.promisify(uploadFile);

export default ImageConfig;