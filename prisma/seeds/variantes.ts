// Este archivo contiene las definiciones de variantes para los productos
// Se importará en seed.ts para poblar la base de datos

export interface VarianteSeed {
  nombreGrupo: string;
  descripcionGrupo?: string;
  obligatorio: boolean;
  tipoSeleccion: string; // "unica" o "multiple"
  orden: number;
  definePrecioBase?: boolean;
  opciones: OpcionVarianteSeed[];
}

export interface OpcionVarianteSeed {
  nombre: string;
  descripcion?: string;
  precioBase?: number;
  incrementoPrecio: number;
  requiereSubSeleccion: boolean;
  subOpciones?: string; // JSON string con las sub-opciones
  orden: number;
}

// Función helper para crear sub-opciones JSON
function crearSubOpciones(opciones: string[]): string {
  return JSON.stringify(opciones);
}

// Variantes para POLLO FRITO - Porción de Pechuga, Muslo, Picada
export const variantesPolloFrito: VarianteSeed = {
  nombreGrupo: "Selecciona tu Acompañamiento",
  descripcionGrupo: "Elige cómo deseas acompañar tu porción de pollo",
  obligatorio: true,
  tipoSeleccion: "unica",
  orden: 1,
  definePrecioBase: false,
  opciones: [
    {
      nombre: "Solo (sin acompañamiento)",
      descripcion: "Porción de pollo sin guarnición",
      incrementoPrecio: 0,
      requiereSubSeleccion: false,
      orden: 1,
    },
    {
      nombre: "1 Acompañamiento",
      descripcion: "Bananitos o ensalada dulce",
      incrementoPrecio: 300,
      requiereSubSeleccion: true,
      subOpciones: crearSubOpciones(["Bananitos", "Ensalada dulce"]),
      orden: 2,
    },
    {
      nombre: "Con papas o doraditas",
      descripcion: "Papas fritas o doraditas",
      incrementoPrecio: 1000,
      requiereSubSeleccion: true,
      subOpciones: crearSubOpciones(["Papas fritas", "Doraditas"]),
      orden: 3,
    },
    {
      nombre: "Papas + 1 acompañamiento",
      descripcion: "Papas + bananitos o ensalada dulce",
      incrementoPrecio: 1300,
      requiereSubSeleccion: true,
      subOpciones: crearSubOpciones(["Papas fritas", "Doraditas", "Bananitos", "Ensalada dulce"]),
      orden: 4,
    },
  ],
};

// Variantes para ALITAS
export const variantesAlitas: VarianteSeed[] = [
  {
    nombreGrupo: "Selecciona el Tamaño",
    descripcionGrupo: "Elige la cantidad de alitas",
    obligatorio: true,
    tipoSeleccion: "unica",
    orden: 1,
    definePrecioBase: true,
    opciones: [
      {
        nombre: "6 piezas",
        descripcion: "Orden de 6 alitas",
        precioBase: 4000,
        incrementoPrecio: 0,
        requiereSubSeleccion: false,
        orden: 1,
      },
      {
        nombre: "12 piezas",
        descripcion: "Orden de 12 alitas",
        precioBase: 7500,
        incrementoPrecio: 0,
        requiereSubSeleccion: false,
        orden: 2,
      },
      {
        nombre: "18 piezas",
        descripcion: "Orden de 18 alitas",
        precioBase: 10500,
        incrementoPrecio: 0,
        requiereSubSeleccion: false,
        orden: 3,
      },
      {
        nombre: "24 piezas",
        descripcion: "Orden de 24 alitas",
        precioBase: 14000,
        incrementoPrecio: 0,
        requiereSubSeleccion: false,
        orden: 4,
      },
    ],
  },
  {
    nombreGrupo: "Preparación",
    descripcionGrupo: "Cómo deseas las alitas",
    obligatorio: true,
    tipoSeleccion: "unica",
    orden: 2,
    definePrecioBase: false,
    opciones: [
      {
        nombre: "Salsa Aparte",
        descripcion: "Salsa en contenedor separado",
        incrementoPrecio: 0,
        requiereSubSeleccion: false,
        orden: 1,
      },
      {
        nombre: "Bañadas",
        descripcion: "Alitas cubiertas en salsa",
        incrementoPrecio: 300,
        requiereSubSeleccion: false,
        orden: 2,
      },
    ],
  },
  {
    nombreGrupo: "Tipo de Salsa",
    descripcionGrupo: "Elige tu salsa favorita",
    obligatorio: true,
    tipoSeleccion: "unica",
    orden: 3,
    definePrecioBase: false,
    opciones: [
      {
        nombre: "Mostaza Miel",
        incrementoPrecio: 0,
        requiereSubSeleccion: false,
        orden: 1,
      },
      {
        nombre: "BBQ",
        incrementoPrecio: 0,
        requiereSubSeleccion: false,
        orden: 2,
      },
      {
        nombre: "Búfalo",
        incrementoPrecio: 0,
        requiereSubSeleccion: false,
        orden: 3,
      },
    ],
  },
  {
    nombreGrupo: "Acompañamiento",
    descripcionGrupo: "Elige tu acompañamiento",
    obligatorio: true,
    tipoSeleccion: "unica",
    orden: 4,
    definePrecioBase: false,
    opciones: [
      {
        nombre: "Papas o doraditas",
        incrementoPrecio: 0,
        requiereSubSeleccion: true,
        subOpciones: crearSubOpciones(["Papas fritas", "Doraditas"]),
        orden: 1,
      },
      {
        nombre: "Bananitos o ensalada dulce",
        incrementoPrecio: 0,
        requiereSubSeleccion: true,
        subOpciones: crearSubOpciones(["Bananitos", "Ensalada dulce"]),
        orden: 2,
      },
    ],
  },
];

// Variantes para NUGGETS
export const variantesNuggets: VarianteSeed[] = [
  {
    nombreGrupo: "Preparación",
    descripcionGrupo: "Cómo deseas los nuggets",
    obligatorio: true,
    tipoSeleccion: "unica",
    orden: 1,
    definePrecioBase: true,
    opciones: [
      {
        nombre: "Normal",
        descripcion: "Nuggets normales",
        precioBase: 3700,
        incrementoPrecio: 0,
        requiereSubSeleccion: false,
        orden: 1,
      },
      {
        nombre: "Salsa aparte",
        descripcion: "Nuggets con salsa aparte",
        precioBase: 4000,
        incrementoPrecio: 0,
        requiereSubSeleccion: false,
        orden: 2,
      },
      {
        nombre: "Bañados",
        descripcion: "Nuggets bañados en salsa",
        precioBase: 4500,
        incrementoPrecio: 0,
        requiereSubSeleccion: false,
        orden: 3,
      },
    ],
  },
  {
    nombreGrupo: "Acompañamiento",
    descripcionGrupo: "Elige tu acompañamiento",
    obligatorio: true,
    tipoSeleccion: "unica",
    orden: 2,
    definePrecioBase: false,
    opciones: [
      {
        nombre: "Papas o doraditas",
        incrementoPrecio: 0,
        requiereSubSeleccion: true,
        subOpciones: crearSubOpciones(["Papas fritas", "Doraditas"]),
        orden: 1,
      },
      {
        nombre: "Bananitos o ensalada dulce",
        incrementoPrecio: 300,
        requiereSubSeleccion: true,
        subOpciones: crearSubOpciones(["Bananitos", "Ensalada dulce"]),
        orden: 2,
      },
    ],
  },
];

// Variantes para HAMBURGUESAS
export const variantesHamburguesas: VarianteSeed = {
  nombreGrupo: "Acompañamiento",
  descripcionGrupo: "Elige tu acompañamiento",
  obligatorio: true,
  tipoSeleccion: "unica",
  orden: 1,
  definePrecioBase: false,
  opciones: [
    {
      nombre: "Sin acompañamiento",
      incrementoPrecio: 0,
      requiereSubSeleccion: false,
      orden: 1,
    },
    {
      nombre: "Con papas o doraditas",
      incrementoPrecio: 1000,
      requiereSubSeleccion: true,
      subOpciones: crearSubOpciones(["Papas fritas", "Doraditas"]),
      orden: 2,
    },
  ],
};

// Variantes para SÁNDWICHES
export const variantesSandwiches: VarianteSeed = {
  nombreGrupo: "Acompañamiento",
  descripcionGrupo: "Elige tu acompañamiento",
  obligatorio: true,
  tipoSeleccion: "unica",
  orden: 1,
  definePrecioBase: false,
  opciones: [
    {
      nombre: "Sin acompañamiento",
      incrementoPrecio: 0,
      requiereSubSeleccion: false,
      orden: 1,
    },
    {
      nombre: "Con papas o doraditas",
      incrementoPrecio: 1000,
      requiereSubSeleccion: true,
      subOpciones: crearSubOpciones(["Papas fritas", "Doraditas"]),
      orden: 2,
    },
  ],
};

// Variantes para ESPECIALIDADES
export const variantesEspecialidades: VarianteSeed = {
  nombreGrupo: "Acompañamiento",
  descripcionGrupo: "Elige tu acompañamiento",
  obligatorio: true,
  tipoSeleccion: "unica",
  orden: 1,
  definePrecioBase: false,
  opciones: [
    {
      nombre: "Sin acompañamiento",
      incrementoPrecio: 0,
      requiereSubSeleccion: false,
      orden: 1,
    },
    {
      nombre: "Con papas o doraditas",
      incrementoPrecio: 600, // Varía según producto, usando promedio
      requiereSubSeleccion: true,
      subOpciones: crearSubOpciones(["Papas fritas", "Doraditas"]),
      orden: 2,
    },
  ],
};

// Variantes para GASEOSA
export const variantesGaseosa: VarianteSeed = {
  nombreGrupo: "Selecciona el Tamaño",
  descripcionGrupo: "Elige el tamaño de tu gaseosa",
  obligatorio: true,
  tipoSeleccion: "unica",
  orden: 1,
  definePrecioBase: true,
  opciones: [
    {
      nombre: "355ml (Lata)",
      precioBase: 1000,
      incrementoPrecio: 0,
      requiereSubSeleccion: false,
      orden: 1,
    },
    {
      nombre: "600ml (Personal)",
      precioBase: 1300,
      incrementoPrecio: 0,
      requiereSubSeleccion: false,
      orden: 2,
    },
    {
      nombre: "1.5L",
      precioBase: 2000,
      incrementoPrecio: 0,
      requiereSubSeleccion: false,
      orden: 3,
    },
    {
      nombre: "2.5L",
      precioBase: 2700,
      incrementoPrecio: 0,
      requiereSubSeleccion: false,
      orden: 4,
    },
    {
      nombre: "3L",
      precioBase: 3000,
      incrementoPrecio: 0,
      requiereSubSeleccion: false,
      orden: 5,
    },
  ],
};

// Mapeo de productos a sus variantes
export const mapeoVariantes: { [key: string]: VarianteSeed | VarianteSeed[] } = {
  "Porción de Pechuga": variantesPolloFrito,
  "Porción de Muslo": variantesPolloFrito,
  "Porción Picada": variantesPolloFrito,
  "Orden de Alitas": variantesAlitas,
  "Nuggets de pollo": variantesNuggets,
  "La Clásica": variantesHamburguesas,
  "La BBQ": variantesHamburguesas,
  "La Honey": variantesHamburguesas,
  "La Hot": variantesHamburguesas,
  "Sencilla": variantesHamburguesas,
  "Doble Torta": variantesHamburguesas,
  "Gorroburguesa": variantesHamburguesas,
  "Sándwich de carne": variantesSandwiches,
  "Sándwich de pollo a la plancha": variantesSandwiches,
  "Sándwich de pollo empanizado": variantesSandwiches,
  "Nacho de pollo": variantesEspecialidades,
  "Nacho de carne": variantesEspecialidades,
  "Nacho mixto": variantesEspecialidades,
  "Papa suprema de pollo": variantesEspecialidades,
  "Papa suprema de carne": variantesEspecialidades,
  "Papa suprema mixta": variantesEspecialidades,
  "Super taco": variantesEspecialidades,
  "Raviol": variantesEspecialidades,
  "Torta arreglada": variantesEspecialidades,
  "Gaseosa": variantesGaseosa,
};

