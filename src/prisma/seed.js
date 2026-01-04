const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // Créer un admin
  const adminPassword = await bcrypt.hash('Admin1234!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@worknest.fr' },
    update: {},
    create: {
      email: 'admin@worknest.fr',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'WorkNest',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin créé:', admin.email);

  // Créer un client de test
  const clientPassword = await bcrypt.hash('Client1234!', 12);
  const client = await prisma.user.upsert({
    where: { email: 'client@test.fr' },
    update: {},
    create: {
      email: 'client@test.fr',
      password: clientPassword,
      firstName: 'Jean',
      lastName: 'Dupont',
      role: 'CLIENT',
    },
  });
  console.log('✅ Client créé:', client.email);

  // Créer quelques espaces
  const spaces = [
    {
      name: 'Salle de réunion moderne - Paris',
      description: 'Salle de réunion équipée pour 10 personnes avec projecteur et écran. Idéale pour les présentations et réunions d\'équipe.',
      capacity: 10,
      price: 50.0,
      location: 'Paris Centre',
      address: '123 Rue de Rivoli',
      city: 'Paris',
      postalCode: '75001',
      country: 'France',
      equipment: ['WiFi', 'Projecteur', 'Écran', 'Tableau blanc'],
      images: [],
    },
    {
      name: 'Bureau individuel - Lyon',
      description: 'Bureau individuel calme et lumineux, parfait pour le télétravail. Équipé d\'un écran externe et d\'une connexion fibre.',
      capacity: 1,
      price: 30.0,
      location: 'Lyon Part-Dieu',
      address: '456 Avenue de la République',
      city: 'Lyon',
      postalCode: '69003',
      country: 'France',
      equipment: ['WiFi', 'Écran externe', 'Climatisation'],
      images: [],
    },
    {
      name: 'Espace créatif - Marseille',
      description: 'Grand espace ouvert pour les équipes créatives. Tables modulables, zones de détente et matériel créatif disponible.',
      capacity: 20,
      price: 75.0,
      location: 'Marseille Vieux-Port',
      address: '789 Boulevard de la Canebière',
      city: 'Marseille',
      postalCode: '13001',
      country: 'France',
      equipment: ['WiFi', 'Projecteur', 'Matériel créatif', 'Cuisine', 'Terrasse'],
      images: [],
    },
  ];

  for (const space of spaces) {
    // Vérifier si l'espace existe déjà
    const existing = await prisma.space.findFirst({
      where: { name: space.name }
    });

    if (existing) {
      console.log(`⏭️  Espace déjà existant: ${space.name}`);
    } else {
      const created = await prisma.space.create({
        data: space,
      });
      console.log(`✅ Espace créé: ${created.name}`);
    }
  }

  console.log('🎉 Seeding terminé !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

