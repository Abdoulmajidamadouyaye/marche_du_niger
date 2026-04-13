import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'https://marche-du-niger.com';

async function main() {
  const products = await prisma.product.findMany();

  for (const product of products) {
    const images = (product.images ?? {}) as Record<string, string>;
    const nextImages: Record<string, string> = { ...images };
    let changed = false;

    for (const [color, url] of Object.entries(images)) {
      if (!url || url.includes('res.cloudinary.com')) continue;

      const sourceUrl = url.startsWith('http') ? url : `${FRONTEND_BASE_URL}${url}`;
      const uploaded = await cloudinary.uploader.upload(sourceUrl, { folder: 'products' });

      nextImages[color] = uploaded.secure_url;
      changed = true;
    }

    if (changed) {
      await prisma.product.update({
        where: { id: product.id },
        data: { images: nextImages as any },
      });
      console.log(`✅ ${product.name} migré vers Cloudinary`);
    }
  }

  console.log('🎉 Migration terminée');
}

main()
  .catch((e) => {
    console.error('❌ Erreur migration:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });