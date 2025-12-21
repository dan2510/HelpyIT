import { roles } from "./seeds/roles";
import { categoriasMenu } from "./seeds/categorias";
import { productosMenu } from "./seeds/productos";
import { mapeoVariantes } from "./seeds/variantes";
import { PrismaClient, EstadoOrden, TipoNotificacion, EstadoNotificacion, Disponibilidad, TipoPedido } from "../generated/prisma";

const prisma = new PrismaClient();

// Función para generar número de pedido único
let contadorPedidos = 0;
const generarNumeroPedido = (): string => {
  const fecha = new Date();
  const año = fecha.getFullYear().toString().slice(-2);
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const dia = fecha.getDate().toString().padStart(2, '0');
  contadorPedidos++;
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const secuencial = contadorPedidos.toString().padStart(3, '0');
  return `ORD-${año}${mes}${dia}-${secuencial}-${random}`;
};

const main = async () => {
  try {
    // Limpiar datos existentes (opcional, solo para desarrollo)
    // await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`;
    // await prisma.$executeRaw`TRUNCATE TABLE Orden;`;
    // await prisma.$executeRaw`TRUNCATE TABLE ItemOrden;`;
    // await prisma.$executeRaw`TRUNCATE TABLE MenuItem;`;
    // await prisma.$executeRaw`TRUNCATE TABLE CategoriaMenu;`;
    // await prisma.$executeRaw`TRUNCATE TABLE Usuario;`;
    // await prisma.$executeRaw`TRUNCATE TABLE Rol;`;
    // await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`;

    // Crear roles
    await prisma.rol.createMany({
      data: roles,
      skipDuplicates: true,
    });
    
    // Obtener los roles creados para usar sus IDs
    const rolAdmin = await prisma.rol.findFirst({ where: { nombre: 'ADMIN' } });
    const rolCliente = await prisma.rol.findFirst({ where: { nombre: 'CLIENTE' } });
    
    // Validar que los roles existan
    if (!rolAdmin || !rolCliente) {
      throw new Error(`Roles no encontrados. Admin: ${rolAdmin ? 'OK' : 'FALTA'}, Cliente: ${rolCliente ? 'OK' : 'FALTA'}`);
    }
    
    console.log(`✅ Roles encontrados - Admin ID: ${rolAdmin.id}, Cliente ID: ${rolCliente.id}`);

    // Crear categorías de menú
    await prisma.categoriaMenu.createMany({
      data: categoriasMenu,
      skipDuplicates: true,
    });

    console.log(`✅ Categorías creadas: ${categoriasMenu.length}`);

    // Obtener las categorías creadas para mapear IDs
    const categorias = await prisma.categoriaMenu.findMany({ orderBy: { orden: 'asc' } });
    const categoriaMap: { [key: number]: number } = {};
    categorias.forEach((cat, index) => {
      categoriaMap[index + 1] = cat.id; // Mapear índice (1-based) a ID real
    });

    // Crear items del menú con sus variantes
    console.log(`📦 Creando ${productosMenu.length} productos...`);
    
    for (const producto of productosMenu) {
      // Usar el idcategoria del producto (que es el índice 1-based)
      const categoriaId = categoriaMap[producto.idcategoria] || producto.idcategoria;
      
      // Buscar si el producto ya existe
      const productoExistente = await prisma.menuItem.findFirst({
        where: { nombre: producto.nombre }
      });

      let productoCreado;
      if (productoExistente) {
        // Actualizar producto existente
        productoCreado = await prisma.menuItem.update({
          where: { id: productoExistente.id },
          data: {
            descripcion: producto.descripcion,
            precio: producto.precio,
            idcategoria: categoriaId,
            activo: producto.activo,
            disponible: producto.disponible,
            tiempoPreparacion: producto.tiempoPreparacion,
            tieneVariantes: producto.tieneVariantes,
            precioVariable: producto.precioVariable,
          },
        });
      } else {
        // Crear nuevo producto
        productoCreado = await prisma.menuItem.create({
          data: {
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            precio: producto.precio,
            idcategoria: categoriaId,
            activo: producto.activo,
            disponible: producto.disponible,
            tiempoPreparacion: producto.tiempoPreparacion,
            tieneVariantes: producto.tieneVariantes,
            precioVariable: producto.precioVariable,
          },
        });
      }

      // Si el producto tiene variantes, crearlas o actualizarlas
      if (producto.tieneVariantes && mapeoVariantes[producto.nombre]) {
        // Eliminar variantes existentes para recrearlas
        const gruposExistentes = await prisma.grupoVariante.findMany({
          where: { idmenuitem: productoCreado.id }
        });
        
        for (const grupoExistente of gruposExistentes) {
          await prisma.opcionVariante.deleteMany({
            where: { idgrupo: grupoExistente.id }
          });
        }
        await prisma.grupoVariante.deleteMany({
          where: { idmenuitem: productoCreado.id }
        });

        const variantes = mapeoVariantes[producto.nombre];
        const gruposVariantes = Array.isArray(variantes) ? variantes : [variantes];

        for (const grupoVariante of gruposVariantes) {
          // Crear el grupo de variantes
          const grupoCreado = await prisma.grupoVariante.create({
            data: {
              idmenuitem: productoCreado.id,
              nombre: grupoVariante.nombreGrupo,
              descripcion: grupoVariante.descripcionGrupo,
              obligatorio: grupoVariante.obligatorio,
              tipoSeleccion: grupoVariante.tipoSeleccion,
              orden: grupoVariante.orden,
              definePrecioBase: grupoVariante.definePrecioBase || false,
            },
          });

          // Crear las opciones del grupo
          for (const opcion of grupoVariante.opciones) {
            await prisma.opcionVariante.create({
              data: {
                idgrupo: grupoCreado.id,
                nombre: opcion.nombre,
                descripcion: opcion.descripcion,
                precioBase: opcion.precioBase || null,
                incrementoPrecio: opcion.incrementoPrecio,
                requiereSubSeleccion: opcion.requiereSubSeleccion,
                subOpciones: opcion.subOpciones || null,
                orden: opcion.orden,
                activo: true,
              },
            });
          }
        }
      }
    }

    console.log(`✅ Productos y variantes creados exitosamente`);

    // Crear usuarios
    if (!rolAdmin || !rolCliente) {
      throw new Error("No se pudieron crear los roles necesarios");
    }

    // Usuario 1 - Admin
    await prisma.usuario.upsert({
      where: { correo: "admin@gorroles.com" },
      update: {},
      create: {
        correo: "admin@gorroles.com",
        contrasenahash: "$2b$10$RLXRtvUua5Yf6QNiFXbSDOGcv7QBs44cy6D31dNqv0os7QPSN.tyG", // password123
        nombrecompleto: "Administrador Sistema",
        telefono: "123-456-7890",
        rol: { connect: { id: rolAdmin.id } },
        activo: true,
        disponibilidad: Disponibilidad.DISPONIBLE,
      },
    });

    // Usuario 2 - Cliente
    await prisma.usuario.upsert({
      where: { correo: "cliente@gorroles.com" },
      update: {},
      create: {
        correo: "cliente@gorroles.com",
        contrasenahash: "$2b$10$RLXRtvUua5Yf6QNiFXbSDOGcv7QBs44cy6D31dNqv0os7QPSN.tyG", // password123
        nombrecompleto: "María González",
        telefono: "123-456-7892",
        rol: { connect: { id: rolCliente.id } },
        activo: true,
        disponibilidad: Disponibilidad.DISPONIBLE,
      },
    });

    // Crear algunas órdenes de ejemplo
    const admin = await prisma.usuario.findUnique({ where: { correo: "admin@gorroles.com" } });
    const cliente = await prisma.usuario.findUnique({ where: { correo: "cliente@gorroles.com" } });
    const nachos = await prisma.menuItem.findFirst({ where: { nombre: "Nachos con Queso" } });
    const pollo = await prisma.menuItem.findFirst({ where: { nombre: "Pollo a la Plancha" } });
    const jugo = await prisma.menuItem.findFirst({ where: { nombre: "Jugo de Naranja" } });

    if (cliente && nachos && pollo && jugo) {
      // Orden 1 - Pendiente
      const orden1 = await prisma.orden.create({
        data: {
          numeropedido: generarNumeroPedido(),
          cliente: { connect: { id: cliente.id } },
          estado: EstadoOrden.PENDIENTE,
          tipopedido: TipoPedido.COMER_AQUI,
          total: 26.50,
          notas: "Sin cebolla en el pollo",
          items: {
            create: [
              {
                menuItem: { connect: { id: nachos.id } },
                cantidad: 1,
                precio: nachos.precio,
                subtotal: nachos.precio,
              },
              {
                menuItem: { connect: { id: pollo.id } },
                cantidad: 1,
                precio: pollo.precio,
                subtotal: pollo.precio,
              },
              {
                menuItem: { connect: { id: jugo.id } },
                cantidad: 2,
                precio: jugo.precio,
                subtotal: Number(jugo.precio) * 2,
              },
            ],
          },
        },
      });

      // Orden 2 - En Preparación
      const orden2 = await prisma.orden.create({
        data: {
          numeropedido: generarNumeroPedido(),
          cliente: { connect: { id: cliente.id } },
          estado: EstadoOrden.EN_PREPARACION,
          tipopedido: TipoPedido.PARA_LLEVAR,
          total: 15.00,
          items: {
            create: [
              {
                menuItem: { connect: { id: pollo.id } },
                cantidad: 1,
                precio: pollo.precio,
                subtotal: pollo.precio,
              },
            ],
          },
        },
      });

      // Notificación de ejemplo para admin
      if (admin) {
        await prisma.notificacion.create({
          data: {
            tipo: TipoNotificacion.NUEVA_ORDEN,
            usuarioDestino: { connect: { id: admin.id } },
            usuarioOrigen: { connect: { id: cliente.id } },
            orden: { connect: { id: orden1.id } },
            titulo: "Nueva orden recibida",
            contenido: `Nueva orden ${orden1.numeropedido} creada`,
            estado: EstadoNotificacion.NO_LEIDA,
          },
        });
      }
    }

    console.log("✅ Seed completado exitosamente!");
  } catch (error) {
    console.error("❌ Error al insertar los datos en la DB:", error);
    throw error;
  }
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
