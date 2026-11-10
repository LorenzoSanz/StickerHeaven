/**
 * Script de seeding para poblar la base de datos con datos iniciales de prueba.
 * Crea un usuario administrador y varios stickers de ejemplo.
 */
import { v4 as uuidv4 } from "uuid";
import * as argon2 from "argon2";
import { connectMongo, disconnectMongo } from "../src/server/connectMongo";
import { UserModel } from "../src/modules/Identity/infrastructure/persistence/mongoose/UserModel";
import { StickerModel } from "../src/modules/Catalog/infrastructure/persistence/mongoose/StickerModel";
import { OrderModel } from "../src/modules/Sales/infrastructure/persistence/mongoose/OrderModel";
import { CartModel } from "../src/modules/Cart/infrastructure/persistence/mongoose/CartModel";
import { SessionModel } from "../src/modules/Identity/infrastructure/persistence/mongoose/SessionModel";
import { NullLogger } from "../src/shared/infrastructure/logger/NullLogger";

const logger = new NullLogger();

async function seed() {
  console.log("Iniciando seeding de la base de datos para que los profes prueben la app.");

  try {
    await connectMongo(logger);

    // 1. Limpiar colecciones existentes (opcional, pero recomendado para un seed limpio)
    await UserModel.deleteMany({});
    await StickerModel.deleteMany({});
    await OrderModel.deleteMany({});
    await CartModel.deleteMany({});
    await SessionModel.deleteMany({});
    console.log("Base de datos limpia (Usuarios, Stickers, Pedidos, Carritos y Sesiones).");

    // 2. Crear Usuario Administrador de prueba
    const adminId = uuidv4();
    const adminPasswordHash = await argon2.hash("admin123");
    
    await UserModel.create({
      _id: adminId,
      email: "admin@stickerheaven.com",
      name: "Admin Sticker",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      createdAt: new Date(),
    });
    console.log("Usuario administrador creado: admin@stickerheaven.com / admin123");

    // 3. Crear Stickers de ejemplo
    const baseStickers = [
      {
        name: "Holographic Cyberpunk",
        description: "Sticker holográfico con estética cyberpunk y neones.",
        price: 4.99,
        tags: ["holographic", "cyberpunk", "neon"],
        slug: "cyberpunk",
      },
      {
        name: "Minimalist Coffee",
        description: "Diseño minimalista para amantes del café.",
        price: 2.5,
        tags: ["minimalist", "coffee", "lifestyle"],
        slug: "coffee",
      },
      {
        name: "Space Explorer",
        description: "Un astronauta explorando galaxias lejanas.",
        price: 3.75,
        tags: ["space", "astronaut", "galaxy"],
        slug: "space",
      },
      {
        name: "Retro Gaming Console",
        description: "Consola clásica de los 80 en pixel art.",
        price: 3.0,
        tags: ["retro", "gaming", "pixel-art"],
        slug: "gaming",
      },
    ];

    const stickers = [];

    // Añadir los stickers base
    for (const base of baseStickers) {
      stickers.push({
        _id: uuidv4(),
        ownerId: adminId,
        name: base.name,
        description: base.description,
        price: { amount: base.price, currency: "EUR" },
        stock: Math.floor(Math.random() * 100) + 10,
        imageUrl: `https://picsum.photos/seed/${base.slug}/400/400`,
        tags: base.tags,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Generar stickers adicionales hasta llegar a 32 para que se pueda probar la paginación también
    const themes = ["Nature", "Animals", "Abstract", "Food", "Travel", "Music", "Science", "Sports"];
    const adjs = ["Vibrant", "Dark", "Golden", "Sketchy", "Glossy", "Matte", "Vintage", "Modern"];

    for (let i = stickers.length; i < 32; i++) {
      const theme = themes[i % themes.length];
      const adj = adjs[Math.floor(i / themes.length) % adjs.length];
      const name = `${adj} ${theme} Sticker #${i + 1}`;
      
      stickers.push({
        _id: uuidv4(),
        ownerId: adminId,
        name: name,
        description: `Un increíble sticker de estilo ${adj.toLowerCase()} con temática de ${theme.toLowerCase()}. Perfecto para cualquier superficie.`,
        price: { amount: Number((Math.random() * 8 + 1).toFixed(2)), currency: "EUR" },
        stock: Math.floor(Math.random() * 50) + 5,
        imageUrl: `https://picsum.photos/seed/sticker-${i}/400/400`,
        tags: [theme.toLowerCase(), adj.toLowerCase(), "sticker"],
        createdAt: new Date(Date.now() - i * 1000 * 60 * 60), // Fechas escalonadas para probar ordenamiento
        updatedAt: new Date(),
      });
    }

    // 4. Insertar Stickers en la base de datos
    await StickerModel.insertMany(stickers);
    console.log(`${stickers.length} stickers de ejemplo creados.`);

    console.log("Seeding completado con éxito.");
  } catch (error) {
    console.error("Error durante el seeding:", error);
  } finally {
    await disconnectMongo(logger);
    process.exit(0);
  }
}
// 5. Ejecutar el seeding
seed();
