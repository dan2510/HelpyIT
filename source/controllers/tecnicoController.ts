import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PlataformaVideojuego, PrismaClient } from "../../generated/prisma";
export class VideojuegoController {
  prisma = new PrismaClient();

  //Listado de videojuegos
  get = async (request: Request, response: Response, next: NextFunction) => {
    try {
      //Select * from videojuego
      const listado = await this.prisma.videojuego.findMany({
        orderBy: {
          nombre: "asc",
        },
        include: {
          generos: true,
          plataformas: true,
        },
      });
      //Dar respuesta
      response.json(listado);
    } catch (error) {
      next(error);
    }
  };
  //Obtener por Id
  getById = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      let idVideojuego = parseInt(request.params.id);
      if (isNaN(idVideojuego)) {
        next(AppError.badRequest("El ID no es válido"));
      }
      const objVideojuego = await this.prisma.videojuego.findFirst({
        where: { id: idVideojuego },
        include: {
          generos: true,
          plataformas: {
            select: {
              anno_lanzamiento: true,
              plataforma: true,
            },
          },
        },
      });
      if (objVideojuego) {
        response.status(200).json(objVideojuego);
      } else {
        next(AppError.notFound("No existe el videojuego"));
      }
    } catch (error: any) {
      next(error);
    }
  };
  search = async (request: Request, response: Response, next: NextFunction) => {
    try {
      //Obtener los valores del query string
      const { termino } = request.query;

      //const { categoria,etiquetas } =request.query;
      if (typeof termino !== "string" || termino.trim() === "") {
        next(AppError.badRequest("El término de búsqueda es requerido"));
      }
      const searchTerm: string = termino as string;
      const objVideojuego = await this.prisma.videojuego.findMany({
        where: {
          nombre: {
            contains: searchTerm,
          },
        },
        include: {
          generos: true,
          plataformas: {
            select: {
              anno_lanzamiento: true,
              plataforma: true,
            },
          },
        },
      });
      //Dar respuesta
      response.json(objVideojuego);
    } catch (error) {
      next(error);
    }
  };
  //Crear

  create = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const body = request.body;

      const newVideojuego = await this.prisma.videojuego.create({
        data: {
          nombre: body.nombre,
          descripcion: body.descripcion,
          precio: body.precio,
          publicar: body.publicar,
          imagen: body.imagen,
          //generos:[{id: valor},{id: valor}]
          generos: {
            connect: body.generos,
          },
          plataformas: {
            create: await Promise.all(
              body.plataformas.map(async (plat: PlataformaVideojuego) => {
                return {
                  anno_lanzamiento: plat.anno_lanzamiento,
                  plataforma: { connect: { id: plat.plataformaId } },
                };
              })
            ),
          },
        },
      });
      response.status(201).json(newVideojuego);
    } catch (error) {
      console.error("Error creando videojuego:", error);
      next(error);
    }
  };
  //Actualizar un videojuego 
  update = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const body = request.body;
      const idVideojuego = parseInt(request.params.id);

      //Obtener videojuego anterior
      const videojuegoExistente = await this.prisma.videojuego.findUnique({
        where: { id: idVideojuego },
        include: {
          generos: {
            select: {
              id: true,
            },
          },
        },
      });
      if (!videojuegoExistente) {
        response
          .status(404)
          .json({ message: "El videojuego no existe" });
        return
      }
      // Determinar la imagen a usar (si se envía una nueva o se mantiene la existente)
      const finalImage =
        body.imagen !== undefined ? body.imagen : videojuegoExistente.imagen;

      // Desconectar géneros antiguos y conectar los nuevos
      const disconnectGeneros = videojuegoExistente.generos.map(
        (genero: { id: number }) => ({ id: genero.id })
      );
      const connectGeneros = body.generos
        ? body.generos.map((genero: { id: number }) => ({ id: genero.id }))
        : [];
      // Establecer la creación de nuevas plataformas
      const createPlataformas = body.plataformas
        ? await Promise.all(
          body.plataformas.map(
            async (plat: {
              anno_lanzamiento: number;
              plataformaId: number;
            }) => ({
              anno_lanzamiento: plat.anno_lanzamiento,
              plataforma: { connect: { id: plat.plataformaId } },
            })
          )
        )
        : [];
      //Actualizar
      const updateVideojuego = await this.prisma.videojuego.update({
        where: {
          id: idVideojuego,
        },
        data: {
          nombre: body.nombre,
          descripcion: body.descripcion,
          precio: body.precio,
          publicar: body.publicar,
          imagen: finalImage,
          generos: {
            disconnect: disconnectGeneros, // Desconectar todos los géneros actuales
            connect: connectGeneros, // Conectar los nuevos géneros
          },
          plataformas: {
            deleteMany: { videojuegoId: idVideojuego }, // Eliminar todas las plataformas existentes asociadas a este videojuego
            create: createPlataformas, // Crear las nuevas plataformas
          },
        },
      });

      response.json(updateVideojuego);
    } catch (error) {
      next(error);
    }
  };
}



