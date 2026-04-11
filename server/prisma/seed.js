const { PrismaClient } = require("@prisma/client");
const seedProducts = require("./seed-data.json");

const prisma = new PrismaClient();

async function main() {
  for (const product of seedProducts) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: {
        ...product,
        sizes: product.sizes ?? undefined,
        colors: product.colors,
        images: product.images,
        vehicleSpecs: product.vehicleSpecs ?? undefined,
        motoSpecs: product.motoSpecs ?? undefined,
      },
    });
  }

  console.log(`Seed terminé: ${seedProducts.length} produits traités.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });