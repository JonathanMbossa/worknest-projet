const request = require('supertest');
const app = require('../server');
const prisma = require('../config/database');
const bcrypt = require('bcryptjs');

describe('Spaces API', () => {
  let adminToken;
  let adminUser;

  beforeAll(async () => {
    // Créer un utilisateur admin pour les tests
    const hashedPassword = await bcrypt.hash('Admin1234!', 12);
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN'
      }
    });

    // Se connecter pour obtenir le token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'Admin1234!'
      });
    adminToken = loginResponse.body.token;
  });

  afterAll(async () => {
    // Nettoyer
    await prisma.space.deleteMany({
      where: {
        name: {
          startsWith: 'Test Space'
        }
      }
    });
    await prisma.user.delete({
      where: { id: adminUser.id }
    });
    await prisma.$disconnect();
  });

  describe('POST /api/spaces', () => {
    it('devrait créer un nouvel espace (admin)', async () => {
      const response = await request(app)
        .post('/api/spaces')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Space 1',
          description: 'Description du test',
          capacity: 10,
          price: 50.0,
          location: 'Paris',
          address: '123 Rue Test',
          city: 'Paris',
          postalCode: '75001',
          equipment: ['WiFi', 'Projecteur'],
          images: []
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('space');
      expect(response.body.space.name).toBe('Test Space 1');
    });

    it('devrait refuser la création sans authentification', async () => {
      const response = await request(app)
        .post('/api/spaces')
        .send({
          name: 'Test Space 2',
          description: 'Description',
          capacity: 10,
          price: 50.0,
          location: 'Paris',
          address: '123 Rue Test',
          city: 'Paris',
          postalCode: '75001'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/spaces', () => {
    it('devrait retourner la liste des espaces', async () => {
      const response = await request(app)
        .get('/api/spaces');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('spaces');
      expect(response.body).toHaveProperty('pagination');
    });

    it('devrait filtrer par capacité', async () => {
      const response = await request(app)
        .get('/api/spaces?capacity=5');

      expect(response.status).toBe(200);
      expect(response.body.spaces.every(space => space.capacity >= 5)).toBe(true);
    });
  });
});

