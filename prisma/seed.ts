// =====================================================
// SEED COMPLETO - SISTEMA HELPYIT
// ARCHIVO: prisma/seed.ts
// Todos los datos iniciales para las 16 tablas
// =====================================================

import { PrismaClient } from '@prisma/client';
import { roles } from './seeds/roles';
import { especialidades } from './seeds/especialidades';
import { politicassla } from './seeds/politicassla';
import { etiquetas } from './seeds/etiquetas';
import {reglasasignacion} from './seeds/reglasasignacion';

const prisma = new PrismaClient();

const main = async () => {
  try {

    // Modelos - Sin relaciones directa 
    await prisma.roles.createMany({
      data: roles
        });
 
    await prisma.especialidad.createMany({
      data: especialidades,
    });
 ;

   
    await prisma.politicasla.createMany({
      data: politicassla,
    });
 
    await prisma.etiqueta.createMany({
      data: etiquetas,
    });
   


    await prisma.reglaasignacion.createMany({
      data: reglasasignacion,
    });


  
    //Modelos - Con relaciones incluidas
    
    
    // Categoría 1 - Hardware
    await prisma.categoria.create({
      data: {
        nombre: "Hardware",
        descripcion: "Problemas con equipos físicos: teclado, mouse, monitor, impresora, laptop",
        idsla: 2,
        activo: true,
        categoriaetiqueta: {
          createMany: {
            data: [
              { idetiqueta: 1 },
              { idetiqueta: 2 },
              { idetiqueta: 3 },
              { idetiqueta: 4 },
              { idetiqueta: 5 },
            ],
          },
        },
        categoriaespecialidad: {
          createMany: {
            data: [
              { idespecialidad: 2 },
            ],
          },
        },
      },
    });
  

    // Categoría 2 - Software
    await prisma.categoria.create({
      data: {
        nombre: "Software",
        descripcion: "Instalación y configuración de aplicaciones",
        idsla: 3,
        activo: true,
        categoriaetiqueta: {
          createMany: {
            data: [
              { idetiqueta: 6 },
              { idetiqueta: 7 },
              { idetiqueta: 8 },
            ],
          },
        },
        categoriaespecialidad: {
          createMany: {
            data: [
              { idespecialidad: 3 },
            ],
          },
        },
      },
    });
 

    // Categoría 3 - Red
    await prisma.categoria.create({
      data: {
        nombre: "Red",
        descripcion: "Problemas de conectividad: wifi, internet, VPN",
        idsla: 1,
        activo: true,
        categoriaetiqueta: {
          createMany: {
            data: [
              { idetiqueta: 9 },
              { idetiqueta: 10 },
              { idetiqueta: 11 },
            ],
          },
        },
        categoriaespecialidad: {
          createMany: {
            data: [
              { idespecialidad: 4 },
            ],
          },
        },
      },
    });


    // Categoría 4 - Cuenta de Usuario
    await prisma.categoria.create({
      data: {
        nombre: "Cuenta de Usuario",
        descripcion: "Creación, restablecimiento de contraseña, permisos",
        idsla: 3,
        activo: true,
        categoriaetiqueta: {
          createMany: {
            data: [
              { idetiqueta: 12 },
              { idetiqueta: 13 },
              { idetiqueta: 14 },
            ],
          },
        },
        categoriaespecialidad: {
          createMany: {
            data: [
              { idespecialidad: 1 },
            ],
          },
        },
      },
    });
 

    // Categoría 5 - Seguridad
    await prisma.categoria.create({
      data: {
        nombre: "Seguridad",
        descripcion: "Antivirus, malware, firewall",
        idsla: 1,
        activo: true,
        categoriaetiqueta: {
          createMany: {
            data: [
              { idetiqueta: 15 },
              { idetiqueta: 16 },
            ],
          },
        },
        categoriaespecialidad: {
          createMany: {
            data: [
              { idespecialidad: 5 },
            ],
          },
        },
      },
    });


    // Categoría 6 - Base de Datos
    await prisma.categoria.create({
      data: {
        nombre: "Base de Datos",
        descripcion: "Problemas con MySQL, SQL Server, respaldos",
        idsla: 2,
        activo: true,
        categoriaespecialidad: {
          createMany: {
            data: [
              { idespecialidad: 6 },
            ],
          },
        },
      },
    });
 

    //  USUARIOS - Con relaciones incluidas
  
    
    const passwordHash = '$2b$10$YhP8QZvZ1kJ7dXqK3xGsS.F5nF7yK5qZ9xGsS.F5nF7yK5qZ9xGsS';

    // Admin
    await prisma.usuario.create({
      data: {
        correo: 'admin@helpyit.com',
        contrasenahash: passwordHash,
        nombrecompleto: 'Administrador del Sistema',
        telefono: '8888-0000',
        idrol: 1,
        activo: true,
      },
    });
 

    // Técnico 1 - Juan (Hardware/Redes)
    await prisma.usuario.create({
      data: {
        correo: 'juan.perez@helpyit.com',
        contrasenahash: passwordHash,
        nombrecompleto: 'Juan Pérez Rodríguez',
        telefono: '8888-1111',
        idrol: 2,
        activo: true,
        disponibilidad: 'disponible',
        cargaactual: 2,
        maxticketsimultaneos: 10,
        usuarioespecialidad: {
          createMany: {
            data: [
              { idespecialidad: 2, nivelexperiencia: 'experto' },
              { idespecialidad: 4, nivelexperiencia: 'avanzado' },
            ],
          },
        },
      },
    });
 
    // Técnico 2 - María (Software/BD)
    await prisma.usuario.create({
      data: {
        correo: 'maria.gonzalez@helpyit.com',
        contrasenahash: passwordHash,
        nombrecompleto: 'María González López',
        telefono: '8888-2222',
        idrol: 2,
        activo: true,
        disponibilidad: 'disponible',
        cargaactual: 1,
        maxticketsimultaneos: 15,
        usuarioespecialidad: {
          createMany: {
            data: [
              { idespecialidad: 3, nivelexperiencia: 'experto' },
              { idespecialidad: 6, nivelexperiencia: 'experto' },
            ],
          },
        },
      },
    });
 

    // Técnico 3 - Carlos (Soporte/Seguridad)
    await prisma.usuario.create({
      data: {
        correo: 'carlos.mora@helpyit.com',
        contrasenahash: passwordHash,
        nombrecompleto: 'Carlos Mora Solís',
        telefono: '8888-3333',
        idrol: 2,
        activo: true,
        disponibilidad: 'ocupado',
        cargaactual: 5,
        maxticketsimultaneos: 8,
        usuarioespecialidad: {
          createMany: {
            data: [
              { idespecialidad: 1, nivelexperiencia: 'avanzado' },
              { idespecialidad: 5, nivelexperiencia: 'intermedio' },
            ],
          },
        },
      },
    });
  

    // Técnico 4 - Ana (Soporte/Software)
    await prisma.usuario.create({
      data: {
        correo: 'ana.lopez@helpyit.com',
        contrasenahash: passwordHash,
        nombrecompleto: 'Ana López Vargas',
        telefono: '8888-4444',
        idrol: 2,
        activo: true,
        disponibilidad: 'disponible',
        cargaactual: 0,
        maxticketsimultaneos: 12,
        usuarioespecialidad: {
          createMany: {
            data: [
              { idespecialidad: 1, nivelexperiencia: 'experto' },
              { idespecialidad: 3, nivelexperiencia: 'avanzado' },
            ],
          },
        },
      },
    });
  

    // Clientes
    await prisma.usuario.createMany({
      data: [
        {
          correo: 'roberto.campos@empresa.com',
          contrasenahash: passwordHash,
          nombrecompleto: 'Roberto Campos Arias',
          telefono: '7777-1111',
          idrol: 3,
          activo: true,
        },
        {
          correo: 'sofia.ramirez@empresa.com',
          contrasenahash: passwordHash,
          nombrecompleto: 'Sofia Ramírez Castro',
          telefono: '7777-2222',
          idrol: 3,
          activo: true,
        },
        {
          correo: 'daniel.vega@empresa.com',
          contrasenahash: passwordHash,
          nombrecompleto: 'Daniel Vega Herrera',
          telefono: '7777-3333',
          idrol: 3,
          activo: true,
        },
        {
          correo: 'laura.jimenez@empresa.com',
          contrasenahash: passwordHash,
          nombrecompleto: 'Laura Jiménez Mora',
          telefono: '7777-4444',
          idrol: 3,
          activo: true,
        },
      ],
    });


 
    // TICKETS - Con todas las relaciones
   

    const ahora = new Date();
    const ayer = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);
    const hace2dias = new Date(ahora.getTime() - 2 * 24 * 60 * 60 * 1000);
    const hace3dias = new Date(ahora.getTime() - 3 * 24 * 60 * 60 * 1000);
    const hace5dias = new Date(ahora.getTime() - 5 * 24 * 60 * 60 * 1000);
    const hace7dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Ticket 1 - PENDIENTE
    await prisma.tiquete.create({
      data: {
        titulo: "Mouse no funciona correctamente",
        descripcion: "El mouse dejó de responder. Probé cambiar de puerto USB y sigue sin funcionar. Es urgente porque no puedo trabajar.",
        prioridad: 'media',
        estado: 'pendiente',
        idcategoria: 1,
        idcliente: 6,
        creadoen: hace2dias,
        vencerespuesta: new Date(hace2dias.getTime() + 2 * 60 * 60 * 1000),
        venceresolucion: new Date(hace2dias.getTime() + 8 * 60 * 60 * 1000),
        historialtiquete: {
          create: {
            estadoanterior: null,
            estadonuevo: 'pendiente',
            observacion: 'Ticket creado por el cliente',
            cambiadopor: 6,
            cambiadoen: hace2dias,
          },
        },
      },
    });


    // Ticket 2 - PENDIENTE
    await prisma.tiquete.create({
      data: {
        titulo: "Antivirus bloqueando aplicación necesaria",
        descripcion: "El antivirus está bloqueando una aplicación que necesito usar para mi trabajo diario.",
        prioridad: 'alta',
        estado: 'pendiente',
        idcategoria: 5,
        idcliente: 7,
        creadoen: ahora,
        vencerespuesta: new Date(ahora.getTime() + 30 * 60 * 1000),
        venceresolucion: new Date(ahora.getTime() + 4 * 60 * 60 * 1000),
        historialtiquete: {
          create: {
            estadoanterior: null,
            estadonuevo: 'pendiente',
            cambiadopor: 7,
            cambiadoen: ahora,
          },
        },
      },
    });


    // Ticket 3 - ASIGNADO (a Ana)
    await prisma.tiquete.create({
      data: {
        titulo: "No puedo acceder al sistema de nómina",
        descripcion: "Al intentar iniciar sesión me dice que mi usuario no existe. Necesito acceder urgente.",
        prioridad: 'alta',
        estado: 'asignado',
        idcategoria: 4,
        idcliente: 8,
        idtecnicoactual: 5,
        creadoen: ayer,
        vencerespuesta: new Date(ayer.getTime() + 4 * 60 * 60 * 1000),
        venceresolucion: new Date(ayer.getTime() + 24 * 60 * 60 * 1000),
        historialtiquete: {
          createMany: {
            data: [
              {
                estadoanterior: null,
                estadonuevo: 'pendiente',
                cambiadopor: 8,
                cambiadoen: ayer,
              },
              {
                estadoanterior: 'pendiente',
                estadonuevo: 'asignado',
                observacion: 'Asignado a Ana López',
                cambiadopor: 1,
                cambiadoen: new Date(ayer.getTime() + 30 * 60 * 1000),
              },
            ],
          },
        },
        asignaciontiquete: {
          create: {
            idtecnico: 5,
            idregla: 1,
            metodo: 'automatica',
            justificacion: 'Asignado automáticamente por Regla Balanceada - Ana tiene menor carga',
            puntajeasignacion: 3850,
            asignadoen: new Date(ayer.getTime() + 30 * 60 * 1000),
          },
        },
      },
    });

    // Ticket 4 - ASIGNADO (a Juan)
    await prisma.tiquete.create({
      data: {
        titulo: "Monitor parpadea constantemente",
        descripcion: "El monitor principal está parpadeando cada 5 minutos aproximadamente. Muy molesto.",
        prioridad: 'media',
        estado: 'asignado',
        idcategoria: 1,
        idcliente: 9,
        idtecnicoactual: 2,
        creadoen: ayer,
        vencerespuesta: new Date(ayer.getTime() + 2 * 60 * 60 * 1000),
        venceresolucion: new Date(ayer.getTime() + 8 * 60 * 60 * 1000),
        historialtiquete: {
          createMany: {
            data: [
              {
                estadoanterior: null,
                estadonuevo: 'pendiente',
                cambiadopor: 9,
                cambiadoen: ayer,
              },
              {
                estadoanterior: 'pendiente',
                estadonuevo: 'asignado',
                cambiadopor: 1,
                cambiadoen: new Date(ayer.getTime() + 45 * 60 * 1000),
              },
            ],
          },
        },
        asignaciontiquete: {
          create: {
            idtecnico: 2,
            idregla: 1,
            metodo: 'automatica',
            justificacion: 'Juan es experto en Hardware',
            puntajeasignacion: 2900,
            asignadoen: new Date(ayer.getTime() + 45 * 60 * 1000),
          },
        },
      },
    });


    // Ticket 5 - EN PROCESO (Juan - Internet lento)
    await prisma.tiquete.create({
      data: {
        titulo: "Internet muy lento en toda la oficina",
        descripcion: "La conexión a internet está muy lenta desde hace 2 días. Afecta a todo el departamento. Es crítico.",
        prioridad: 'critica',
        estado: 'enproceso',
        idcategoria: 3,
        idcliente: 6,
        idtecnicoactual: 2,
        creadoen: hace2dias,
        primerarespuestaen: new Date(hace2dias.getTime() + 20 * 60 * 1000),
        vencerespuesta: new Date(hace2dias.getTime() + 30 * 60 * 1000),
        venceresolucion: new Date(hace2dias.getTime() + 4 * 60 * 60 * 1000),
        cumplioslarespuesta: true,
        historialtiquete: {
          createMany: {
            data: [
              {
                estadoanterior: null,
                estadonuevo: 'pendiente',
                cambiadopor: 6,
                cambiadoen: hace2dias,
              },
              {
                estadoanterior: 'pendiente',
                estadonuevo: 'asignado',
                cambiadopor: 1,
                cambiadoen: new Date(hace2dias.getTime() + 10 * 60 * 1000),
              },
              {
                estadoanterior: 'asignado',
                estadonuevo: 'enproceso',
                observacion: 'Revisando router principal, switches y cableado de red',
                cambiadopor: 2,
                cambiadoen: new Date(hace2dias.getTime() + 25 * 60 * 1000),
              },
            ],
          },
        },
        asignaciontiquete: {
          create: {
            idtecnico: 2,
            idregla: 2,
            metodo: 'automatica',
            justificacion: 'Ticket crítico asignado por Regla Urgente a experto en Redes',
            puntajeasignacion: 7950,
            asignadoen: new Date(hace2dias.getTime() + 10 * 60 * 1000),
          },
        },
      },
    });
;

    // Ticket 6 - EN PROCESO (María - BD)
    await prisma.tiquete.create({
      data: {
        titulo: "Backup de base de datos fallando",
        descripcion: "El respaldo automático de la base de datos principal está fallando desde el lunes pasado.",
        prioridad: 'critica',
        estado: 'enproceso',
        idcategoria: 6,
        idcliente: 7,
        idtecnicoactual: 3,
        creadoen: hace3dias,
        primerarespuestaen: new Date(hace3dias.getTime() + 15 * 60 * 1000),
        vencerespuesta: new Date(hace3dias.getTime() + 30 * 60 * 1000),
        venceresolucion: new Date(hace3dias.getTime() + 4 * 60 * 60 * 1000),
        cumplioslarespuesta: true,
        historialtiquete: {
          createMany: {
            data: [
              {
                estadoanterior: null,
                estadonuevo: 'pendiente',
                cambiadopor: 7,
                cambiadoen: hace3dias,
              },
              {
                estadoanterior: 'pendiente',
                estadonuevo: 'asignado',
                cambiadopor: 1,
                cambiadoen: new Date(hace3dias.getTime() + 10 * 60 * 1000),
              },
              {
                estadoanterior: 'asignado',
                estadonuevo: 'enproceso',
                observacion: 'Revisando logs del servidor. Encontré error en script de backup.',
                cambiadopor: 3,
                cambiadoen: new Date(hace3dias.getTime() + 15 * 60 * 1000),
              },
            ],
          },
        },
        asignaciontiquete: {
          create: {
            idtecnico: 3,
            metodo: 'manual',
            justificacion: 'Ticket crítico de BD asignado manualmente a la experta María',
            asignadopor: 1,
            asignadoen: new Date(hace3dias.getTime() + 10 * 60 * 1000),
          },
        },
      },
    });
  

    // Ticket 7 - RESUELTO
    await prisma.tiquete.create({
      data: {
        titulo: "No puedo instalar Office 2021",
        descripcion: "Me sale un error 0x80070005 al intentar instalar Office 2021 en mi computadora nueva.",
        prioridad: 'media',
        estado: 'resuelto',
        idcategoria: 2,
        idcliente: 8,
        idtecnicoactual: 3,
        creadoen: hace5dias,
        primerarespuestaen: new Date(hace5dias.getTime() + 2 * 60 * 60 * 1000),
        resueltoen: new Date(hace5dias.getTime() + 5 * 60 * 60 * 1000),
        vencerespuesta: new Date(hace5dias.getTime() + 4 * 60 * 60 * 1000),
        venceresolucion: new Date(hace5dias.getTime() + 24 * 60 * 60 * 1000),
        cumplioslarespuesta: true,
        cumplioslaresolucion: true,
        historialtiquete: {
          createMany: {
            data: [
              {
                estadoanterior: null,
                estadonuevo: 'pendiente',
                cambiadopor: 8,
                cambiadoen: hace5dias,
              },
              {
                estadoanterior: 'pendiente',
                estadonuevo: 'asignado',
                cambiadopor: 1,
                cambiadoen: new Date(hace5dias.getTime() + 30 * 60 * 1000),
              },
              {
                estadoanterior: 'asignado',
                estadonuevo: 'enproceso',
                observacion: 'Conectándome remotamente para revisar el error',
                cambiadopor: 3,
                cambiadoen: new Date(hace5dias.getTime() + 2 * 60 * 60 * 1000),
              },
              {
                estadoanterior: 'enproceso',
                estadonuevo: 'resuelto',
                observacion: 'Instalación completada. Se desinstalaron versiones previas que causaban conflicto.',
                cambiadopor: 3,
                cambiadoen: new Date(hace5dias.getTime() + 5 * 60 * 60 * 1000),
              },
            ],
          },
        },
        asignaciontiquete: {
          create: {
            idtecnico: 3,
            idregla: 1,
            metodo: 'automatica',
            justificacion: 'Asignado a María, experta en Software',
            puntajeasignacion: 2950,
            asignadoen: new Date(hace5dias.getTime() + 30 * 60 * 1000),
          },
        },
      },
    });
  

    // Ticket 8 - RESUELTO
    await prisma.tiquete.create({
      data: {
        titulo: "Solicitud de cuenta de correo nueva",
        descripcion: "Necesito una cuenta de correo corporativa para el nuevo empleado del departamento de ventas.",
        prioridad: 'baja',
        estado: 'resuelto',
        idcategoria: 4,
        idcliente: 9,
        idtecnicoactual: 5,
        creadoen: hace5dias,
        primerarespuestaen: new Date(hace5dias.getTime() + 3 * 60 * 60 * 1000),
        resueltoen: new Date(hace5dias.getTime() + 5 * 60 * 60 * 1000),
        vencerespuesta: new Date(hace5dias.getTime() + 4 * 60 * 60 * 1000),
        venceresolucion: new Date(hace5dias.getTime() + 24 * 60 * 60 * 1000),
        cumplioslarespuesta: true,
        cumplioslaresolucion: true,
        historialtiquete: {
          createMany: {
            data: [
              {
                estadoanterior: null,
                estadonuevo: 'pendiente',
                cambiadopor: 9,
                cambiadoen: hace5dias,
              },
              {
                estadoanterior: 'pendiente',
                estadonuevo: 'asignado',
                cambiadopor: 1,
                cambiadoen: new Date(hace5dias.getTime() + 1 * 60 * 60 * 1000),
              },
              {
                estadoanterior: 'asignado',
                estadonuevo: 'enproceso',
                observacion: 'Creando cuenta en Active Directory',
                cambiadopor: 5,
                cambiadoen: new Date(hace5dias.getTime() + 3 * 60 * 60 * 1000),
              },
              {
                estadoanterior: 'enproceso',
                estadonuevo: 'resuelto',
                observacion: 'Cuenta creada: nuevoempleado@empresa.com. Credenciales enviadas por correo.',
                cambiadopor: 5,
                cambiadoen: new Date(hace5dias.getTime() + 5 * 60 * 60 * 1000),
              },
            ],
          },
        },
        asignaciontiquete: {
          create: {
            idtecnico: 5,
            idregla: 1,
            metodo: 'automatica',
            puntajeasignacion: 1850,
            asignadoen: new Date(hace5dias.getTime() + 1 * 60 * 60 * 1000),
          },
        },
      },
    });


    // Ticket 9 - CERRADO (con valoración)
    await prisma.tiquete.create({
      data: {
        titulo: "Impresora no imprime documentos",
        descripcion: "La impresora del segundo piso no está imprimiendo. Sale el mensaje 'Sin conexión'.",
        prioridad: 'baja',
        estado: 'cerrado',
        idcategoria: 1,
        idcliente: 6,
        idtecnicoactual: 2,
        creadoen: hace7dias,
        primerarespuestaen: new Date(hace7dias.getTime() + 3 * 60 * 60 * 1000),
        resueltoen: new Date(hace7dias.getTime() + 6 * 60 * 60 * 1000),
        cerradoen: new Date(hace7dias.getTime() + 7 * 60 * 60 * 1000),
        vencerespuesta: new Date(hace7dias.getTime() + 4 * 60 * 60 * 1000),
        venceresolucion: new Date(hace7dias.getTime() + 24 * 60 * 60 * 1000),
        cumplioslarespuesta: true,
        cumplioslaresolucion: true,
        historialtiquete: {
          createMany: {
            data: [
              {
                estadoanterior: null,
                estadonuevo: 'pendiente',
                cambiadopor: 6,
                cambiadoen: hace7dias,
              },
              {
                estadoanterior: 'pendiente',
                estadonuevo: 'asignado',
                cambiadopor: 1,
                cambiadoen: new Date(hace7dias.getTime() + 1 * 60 * 60 * 1000),
              },
              {
                estadoanterior: 'asignado',
                estadonuevo: 'enproceso',
                observacion: 'Revisando conexión física de la impresora',
                cambiadopor: 2,
                cambiadoen: new Date(hace7dias.getTime() + 3 * 60 * 60 * 1000),
              },
              {
                estadoanterior: 'enproceso',
                estadonuevo: 'resuelto',
                observacion: 'Cable de red estaba desconectado. Reconectado y probado exitosamente.',
                cambiadopor: 2,
                cambiadoen: new Date(hace7dias.getTime() + 6 * 60 * 60 * 1000),
              },
              {
                estadoanterior: 'resuelto',
                estadonuevo: 'cerrado',
                observacion: 'Cliente confirmó que funciona correctamente',
                cambiadopor: 6,
                cambiadoen: new Date(hace7dias.getTime() + 7 * 60 * 60 * 1000),
              },
            ],
          },
        },
        asignaciontiquete: {
          create: {
            idtecnico: 2,
            metodo: 'manual',
            justificacion: 'Asignado manualmente por administrador - Juan está cerca de la ubicación',
            asignadopor: 1,
            asignadoen: new Date(hace7dias.getTime() + 1 * 60 * 60 * 1000),
          },
        },
        valoracionservicio: {
          create: {
            idcliente: 6,
            calificacion: 5,
            comentario: 'Excelente servicio. Juan fue muy rápido y profesional. Resolvió el problema en minutos.',
            creadaen: new Date(hace7dias.getTime() + 7 * 60 * 60 * 1000 + 15 * 60 * 1000),
          },
        },
      },
    });


    // Ticket 10 - CERRADO (con valoración)
    await prisma.tiquete.create({
      data: {
        titulo: "Actualización de Windows bloqueada",
        descripcion: "Windows Update no funciona correctamente. Dice que hay un error 0x80070002.",
        prioridad: 'media',
        estado: 'cerrado',
        idcategoria: 2,
        idcliente: 7,
        idtecnicoactual: 4,
        creadoen: hace5dias,
        primerarespuestaen: new Date(hace5dias.getTime() + 2 * 60 * 60 * 1000),
        resueltoen: new Date(hace5dias.getTime() + 4 * 60 * 60 * 1000),
        cerradoen: new Date(hace5dias.getTime() + 5 * 60 * 60 * 1000),
        vencerespuesta: new Date(hace5dias.getTime() + 4 * 60 * 60 * 1000),
        venceresolucion: new Date(hace5dias.getTime() + 24 * 60 * 60 * 1000),
        cumplioslarespuesta: true,
        cumplioslaresolucion: true,
        historialtiquete: {
          createMany: {
            data: [
              {
                estadoanterior: null,
                estadonuevo: 'pendiente',
                cambiadopor: 7,
                cambiadoen: hace5dias,
              },
              {
                estadoanterior: 'pendiente',
                estadonuevo: 'asignado',
                cambiadopor: 1,
                cambiadoen: new Date(hace5dias.getTime() + 40 * 60 * 1000),
              },
              {
                estadoanterior: 'asignado',
                estadonuevo: 'enproceso',
                observacion: 'Ejecutando herramienta de reparación de Windows Update',
                cambiadopor: 4,
                cambiadoen: new Date(hace5dias.getTime() + 2 * 60 * 60 * 1000),
              },
              {
                estadoanterior: 'enproceso',
                estadonuevo: 'resuelto',
                observacion: 'Windows Update reparado. Actualizaciones instalándose correctamente ahora.',
                cambiadopor: 4,
                cambiadoen: new Date(hace5dias.getTime() + 4 * 60 * 60 * 1000),
              },
              {
                estadoanterior: 'resuelto',
                estadonuevo: 'cerrado',
                observacion: 'Confirmado por cliente. Problema totalmente resuelto.',
                cambiadopor: 7,
                cambiadoen: new Date(hace5dias.getTime() + 5 * 60 * 60 * 1000),
              },
            ],
          },
        },
        asignaciontiquete: {
          create: {
            idtecnico: 4,
            idregla: 1,
            metodo: 'automatica',
            puntajeasignacion: 2700,
            asignadoen: new Date(hace5dias.getTime() + 40 * 60 * 1000),
          },
        },
        valoracionservicio: {
          create: {
            idcliente: 7,
            calificacion: 4,
            comentario: 'Buen servicio. Carlos resolvió el problema aunque tardó un poco más de lo esperado.',
            creadaen: new Date(hace5dias.getTime() + 5 * 60 * 60 * 1000 + 30 * 60 * 1000),
          },
        },
      },
    });
    console.log('   ✓ Ticket #10 - CERRADO (con valoración 4★)\n');

    // ==============================
    // 9. IMÁGENES DE TICKETS
    // ==============================
 
    await prisma.imagentiquete.createMany({
      data: [
        // Imágenes del Ticket 5 (Internet lento - historial id 13)
        {
          idhistorial: 13, // Estado "enproceso" de ticket 5
          rutaarchivo: '/uploads/tickets/ticket5_router_principal.jpg',
          subidopor: 2,
          subidoen: new Date(hace2dias.getTime() + 30 * 60 * 1000),
        },
        {
          idhistorial: 13,
          rutaarchivo: '/uploads/tickets/ticket5_diagnostico_ping.jpg',
          subidopor: 2,
          subidoen: new Date(hace2dias.getTime() + 35 * 60 * 1000),
        },
        
        // Imágenes del Ticket 6 (BD - historial id 18)
        {
          idhistorial: 18,
          rutaarchivo: '/uploads/tickets/ticket6_log_error_backup.jpg',
          subidopor: 3,
          subidoen: new Date(hace3dias.getTime() + 20 * 60 * 1000),
        },
        
        // Imágenes del Ticket 7 (Office - historial id 23)
        {
          idhistorial: 23,
          rutaarchivo: '/uploads/tickets/ticket7_office_instalado.jpg',
          subidopor: 3,
          subidoen: new Date(hace5dias.getTime() + 5 * 60 * 60 * 1000),
        },
        
        // Imágenes del Ticket 9 (Impresora - historial id 29 y 30)
        {
          idhistorial: 29,
          rutaarchivo: '/uploads/tickets/ticket9_cable_desconectado.jpg',
          subidopor: 2,
          subidoen: new Date(hace7dias.getTime() + 3 * 60 * 60 * 1000),
        },
        {
          idhistorial: 30,
          rutaarchivo: '/uploads/tickets/ticket9_impresora_funcionando.jpg',
          subidopor: 2,
          subidoen: new Date(hace7dias.getTime() + 6 * 60 * 60 * 1000),
        },
      ],
    });
 

   
    // 10. NOTIFICACIONES
  

    
    await prisma.notificacion.createMany({
      data: [
        // Notificaciones de tickets creados
        {
          tipo: 'ticketcreado',
          idusuariodestino: 1,
          idusuarioorigen: 6,
          idtiquete: 1,
          titulo: 'Nuevo ticket creado',
          contenido: 'Roberto Campos creó el ticket #1: Mouse no funciona',
          estado: 'leida',
          creadaen: hace2dias,
          leidaen: new Date(hace2dias.getTime() + 5 * 60 * 1000),
        },
        {
          tipo: 'ticketcreado',
          idusuariodestino: 1,
          idusuarioorigen: 7,
          idtiquete: 2,
          titulo: 'Nuevo ticket creado',
          contenido: 'Sofia Ramírez creó el ticket #2: Antivirus bloqueando aplicación',
          estado: 'pendiente',
          creadaen: ahora,
        },
        {
          tipo: 'ticketcreado',
          idusuariodestino: 1,
          idusuarioorigen: 8,
          idtiquete: 3,
          titulo: 'Nuevo ticket creado',
          contenido: 'Daniel Vega creó el ticket #3: No puedo acceder al sistema',
          estado: 'leida',
          creadaen: ayer,
          leidaen: new Date(ayer.getTime() + 10 * 60 * 1000),
        },
        
        // Notificaciones de asignación
        {
          tipo: 'asignacion',
          idusuariodestino: 5,
          idusuarioorigen: 1,
          idtiquete: 3,
          titulo: 'Ticket asignado',
          contenido: 'Se te asignó el ticket #3: No puedo acceder al sistema de nómina',
          estado: 'leida',
          creadaen: new Date(ayer.getTime() + 30 * 60 * 1000),
          leidaen: new Date(ayer.getTime() + 35 * 60 * 1000),
        },
        {
          tipo: 'asignacion',
          idusuariodestino: 2,
          idusuarioorigen: 1,
          idtiquete: 5,
          titulo: 'Ticket crítico asignado',
          contenido: 'Se te asignó el ticket crítico #5: Internet muy lento',
          estado: 'leida',
          creadaen: new Date(hace2dias.getTime() + 10 * 60 * 1000),
          leidaen: new Date(hace2dias.getTime() + 12 * 60 * 1000),
        },
        {
          tipo: 'asignacion',
          idusuariodestino: 3,
          idusuarioorigen: 1,
          idtiquete: 6,
          titulo: 'Ticket crítico asignado',
          contenido: 'Se te asignó manualmente el ticket #6: Backup de base de datos',
          estado: 'leida',
          creadaen: new Date(hace3dias.getTime() + 10 * 60 * 1000),
          leidaen: new Date(hace3dias.getTime() + 15 * 60 * 1000),
        },
        
        // Notificaciones de cambio de estado
        {
          tipo: 'cambioestado',
          idusuariodestino: 6,
          idusuarioorigen: 2,
          idtiquete: 5,
          titulo: 'Tu ticket está en proceso',
          contenido: 'El ticket #5 ahora está siendo atendido por Juan Pérez',
          estado: 'leida',
          creadaen: new Date(hace2dias.getTime() + 25 * 60 * 1000),
          leidaen: new Date(hace2dias.getTime() + 2 * 60 * 60 * 1000),
        },
        {
          tipo: 'cambioestado',
          idusuariodestino: 8,
          idusuarioorigen: 3,
          idtiquete: 7,
          titulo: 'Tu ticket fue resuelto',
          contenido: 'El ticket #7 ha sido marcado como resuelto. Por favor verifica la solución.',
          estado: 'leida',
          creadaen: new Date(hace5dias.getTime() + 5 * 60 * 60 * 1000),
          leidaen: new Date(hace5dias.getTime() + 5 * 60 * 60 * 1000 + 30 * 60 * 1000),
        },
        
        // Notificaciones de tickets cerrados
        {
          tipo: 'ticketcerrado',
          idusuariodestino: 6,
          idusuarioorigen: 6,
          idtiquete: 9,
          titulo: 'Ticket cerrado',
          contenido: 'Tu ticket #9 ha sido cerrado. Por favor valora el servicio recibido.',
          estado: 'leida',
          creadaen: new Date(hace7dias.getTime() + 7 * 60 * 60 * 1000),
          leidaen: new Date(hace7dias.getTime() + 7 * 60 * 60 * 1000 + 10 * 60 * 1000),
        },
        {
          tipo: 'ticketcerrado',
          idusuariodestino: 2,
          idusuarioorigen: 6,
          idtiquete: 9,
          titulo: 'Cliente cerró ticket',
          contenido: 'El cliente cerró el ticket #9 que atendiste',
          estado: 'leida',
          creadaen: new Date(hace7dias.getTime() + 7 * 60 * 60 * 1000),
          leidaen: new Date(hace7dias.getTime() + 8 * 60 * 60 * 1000),
        },
        
        // Notificación de vencimiento próximo
        {
          tipo: 'vencimientoproximo',
          idusuariodestino: 2,
          idtiquete: 5,
          titulo: 'SLA próximo a vencer',
          contenido: 'El ticket crítico #5 vence en 1 hora. Prioridad: CRÍTICA',
          estado: 'pendiente',
          creadaen: new Date(hace2dias.getTime() + 3 * 60 * 60 * 1000),
        },
        
        // Notificaciones de inicio de sesión
        {
          tipo: 'iniciosesion',
          idusuariodestino: 1,
          titulo: 'Inicio de sesión exitoso',
          contenido: 'Iniciaste sesión en el sistema HelpyIT',
          estado: 'leida',
          creadaen: ahora,
          leidaen: ahora,
        },
        {
          tipo: 'iniciosesion',
          idusuariodestino: 2,
          titulo: 'Bienvenido',
          contenido: 'Iniciaste sesión como técnico',
          estado: 'leida',
          creadaen: new Date(ahora.getTime() - 2 * 60 * 60 * 1000),
          leidaen: new Date(ahora.getTime() - 2 * 60 * 60 * 1000),
        },
      ],
    });

  } catch (error) {
    console.error(' Error durante la insert de datos:', error);
    throw error;
  }
};

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
  })
