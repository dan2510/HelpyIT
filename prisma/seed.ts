const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedRoles() {
  try {
    // Verificar si ya existen roles
    const existingRoles = await prisma.rol.count();
    
    if (existingRoles > 0) {
      console.log('Los roles ya existen en la base de datos');
      return;
    }

    // Crear los roles iniciales
    const roles = [
      {
        nombre: 'ADMIN',
        descripcion: 'Administrador del sistema con acceso completo'
      },
      {
        nombre: 'USER',
        descripcion: 'Usuario regular con permisos básicos'
      },
      {
        nombre: 'MODERATOR',
        descripcion: 'Moderador con permisos intermedios'
      },
      {
        nombre: 'GUEST',
        descripcion: 'Usuario invitado con permisos limitados'
      }
    ];

    // Insertar roles usando createMany para mejor rendimiento
    await prisma.rol.createMany({
      data: roles,
      skipDuplicates: true
    });

    console.log('✅ Roles creados exitosamente');
    
    // Mostrar los roles creados
    const createdRoles = await prisma.rol.findMany();
    console.log('Roles en la base de datos:', createdRoles);
    
  } catch (error) {
    console.error('❌ Error al crear roles:', error);
    throw error;
  }
}

async function main() {
  console.log('🌱 Iniciando seed de roles...');
  
  await seedRoles();
  
  console.log('🌱 Seed completado');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

module.exports = { seedRoles