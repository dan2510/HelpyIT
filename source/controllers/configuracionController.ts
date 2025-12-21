import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PrismaClient } from "../../generated/prisma";

export class ConfiguracionController {
  prisma = new PrismaClient();

  // Obtener todas las configuraciones
  get = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const configuraciones = await this.prisma.configuracion.findMany({
        orderBy: {
          clave: 'asc'
        }
      });

      const responseData = {
        success: true,
        data: {
          configuraciones: configuraciones,
          total: configuraciones.length
        }
      };

      response.json(responseData);
    } catch (error) {
      next(error);
    }
  };

  // Obtener configuración por clave
  getByClave = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const clave = request.params.clave;

      console.log('📖 [CONFIGURACION] GetByClave - Clave:', clave);

      const configuracion = await this.prisma.configuracion.findUnique({
        where: { clave }
      });

      console.log('📖 [CONFIGURACION] Configuración encontrada:', configuracion ? 'Sí' : 'No');

      if (!configuracion) {
        console.log('❌ [CONFIGURACION] Configuración no encontrada para clave:', clave);
        return next(AppError.notFound("Configuración no encontrada"));
      }

      console.log('📖 [CONFIGURACION] Valor en BD:', configuracion.valor);
      console.log('📖 [CONFIGURACION] Tipo:', configuracion.tipo);

      // Parsear el valor según el tipo
      let valorParsed: any = configuracion.valor;
      if (configuracion.tipo === 'number') {
        valorParsed = Number(configuracion.valor);
        console.log('📖 [CONFIGURACION] Valor parseado (number):', valorParsed);
      } else if (configuracion.tipo === 'boolean') {
        valorParsed = configuracion.valor === 'true';
        console.log('📖 [CONFIGURACION] Valor parseado (boolean):', valorParsed);
      } else if (configuracion.tipo === 'json') {
        try {
          valorParsed = JSON.parse(configuracion.valor);
          console.log('📖 [CONFIGURACION] Valor parseado (json):', valorParsed);
        } catch {
          valorParsed = configuracion.valor;
          console.log('📖 [CONFIGURACION] Error al parsear JSON, usando valor original');
        }
      }

      const responseData = {
        success: true,
        data: {
          ...configuracion,
          valorParsed
        }
      };

      console.log('✅ [CONFIGURACION] Enviando respuesta:', responseData);
      response.json(responseData);
    } catch (error) {
      console.error('❌ [CONFIGURACION] Error en getByClave:', error);
      next(error);
    }
  };

  // Crear o actualizar configuración
  upsert = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { clave, valor, descripcion, tipo } = request.body;

      console.log('📝 [CONFIGURACION] Upsert - Clave:', clave);
      console.log('📝 [CONFIGURACION] Upsert - Valor recibido:', valor);
      console.log('📝 [CONFIGURACION] Upsert - Tipo:', tipo);

      if (!clave || valor === undefined) {
        console.log('❌ [CONFIGURACION] Error: Clave o valor faltante');
        return next(AppError.badRequest("Clave y valor son requeridos"));
      }

      // Convertir valor a string según el tipo
      let valorString = String(valor);
      if (tipo === 'json') {
        valorString = JSON.stringify(valor);
      }

      console.log('📝 [CONFIGURACION] Valor a guardar (string):', valorString);

      const configuracion = await this.prisma.configuracion.upsert({
        where: { clave },
        update: {
          valor: valorString,
          descripcion: descripcion || undefined,
          tipo: tipo || 'string'
        },
        create: {
          clave,
          valor: valorString,
          descripcion: descripcion || null,
          tipo: tipo || 'string'
        }
      });

      console.log('✅ [CONFIGURACION] Configuración guardada:', {
        id: configuracion.id,
        clave: configuracion.clave,
        valor: configuracion.valor
      });

      const responseData = {
        success: true,
        data: { configuracion },
        message: "Configuración guardada exitosamente"
      };

      response.json(responseData);
    } catch (error) {
      console.error('❌ [CONFIGURACION] Error en upsert:', error);
      next(error);
    }
  };

  // Actualizar configuración
  update = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const clave = request.params.clave;
      const { valor, descripcion, tipo } = request.body;

      if (valor === undefined) {
        return next(AppError.badRequest("El valor es requerido"));
      }

      const configuracionExistente = await this.prisma.configuracion.findUnique({
        where: { clave }
      });

      if (!configuracionExistente) {
        return next(AppError.notFound("Configuración no encontrada"));
      }

      // Convertir valor a string según el tipo
      let valorString = String(valor);
      if (tipo === 'json' || configuracionExistente.tipo === 'json') {
        valorString = JSON.stringify(valor);
      }

      const configuracion = await this.prisma.configuracion.update({
        where: { clave },
        data: {
          valor: valorString,
          descripcion: descripcion !== undefined ? descripcion : configuracionExistente.descripcion,
          tipo: tipo || configuracionExistente.tipo
        }
      });

      const responseData = {
        success: true,
        data: { configuracion },
        message: "Configuración actualizada exitosamente"
      };

      response.json(responseData);
    } catch (error) {
      next(error);
    }
  };
}

