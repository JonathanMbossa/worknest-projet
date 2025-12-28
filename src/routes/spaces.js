const express = require('express');
const { query, body, param } = require('express-validator');
const prisma = require('../config/database');
const validate = require('../middleware/validation');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/spaces:
 *   get:
 *     summary: Liste des espaces disponibles
 *     tags: [Spaces]
 *     parameters:
 *       - in: query
 *         name: capacity
 *         schema:
 *           type: integer
 *         description: Capacité minimale
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Prix minimum
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Prix maximum
 *       - in: query
 *         name: equipment
 *         schema:
 *           type: string
 *         description: Équipement recherché
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Ville
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Liste des espaces
 */
router.get('/',
  [
    query('capacity').optional().isInt({ min: 1 }),
    query('minPrice').optional().isFloat({ min: 0 }),
    query('maxPrice').optional().isFloat({ min: 0 }),
    query('equipment').optional().trim(),
    query('city').optional().trim(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  validate,
  async (req, res) => {
    try {
      const {
        capacity,
        minPrice,
        maxPrice,
        equipment,
        city,
        page = 1,
        limit = 10
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Construction des filtres
      const where = {
        isActive: true
      };

      if (capacity) {
        where.capacity = { gte: parseInt(capacity) };
      }

      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = parseFloat(minPrice);
        if (maxPrice) where.price.lte = parseFloat(maxPrice);
      }

      if (equipment) {
        where.equipment = { has: equipment };
      }

      if (city) {
        where.city = { contains: city, mode: 'insensitive' };
      }

      const [spaces, total] = await Promise.all([
        prisma.space.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.space.count({ where })
      ]);

      res.json({
        spaces,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des espaces:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

/**
 * @swagger
 * /api/spaces/{id}:
 *   get:
 *     summary: Détails d'un espace
 *     tags: [Spaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Détails de l'espace
 *       404:
 *         description: Espace non trouvé
 */
router.get('/:id',
  [param('id').isUUID()],
  validate,
  async (req, res) => {
    try {
      const space = await prisma.space.findUnique({
        where: { id: req.params.id },
        include: {
          reservations: {
            where: {
              status: { in: ['CONFIRMED', 'PENDING'] },
              endDate: { gte: new Date() }
            },
            select: {
              id: true,
              startDate: true,
              endDate: true
            }
          }
        }
      });

      if (!space) {
        return res.status(404).json({ error: 'Espace non trouvé' });
      }

      res.json({ space });
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'espace:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

/**
 * @swagger
 * /api/spaces:
 *   post:
 *     summary: Créer un nouvel espace (Admin uniquement)
 *     tags: [Spaces]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - capacity
 *               - price
 *               - location
 *               - address
 *               - city
 *               - postalCode
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               price:
 *                 type: number
 *               location:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               equipment:
 *                 type: array
 *                 items:
 *                   type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Espace créé
 *       403:
 *         description: Accès refusé
 */
router.post('/',
  authenticate,
  authorize('ADMIN'),
  [
    body('name').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('capacity').isInt({ min: 1 }),
    body('price').isFloat({ min: 0 }),
    body('location').trim().notEmpty(),
    body('address').trim().notEmpty(),
    body('city').trim().notEmpty(),
    body('postalCode').trim().notEmpty(),
    body('equipment').optional().isArray(),
    body('images').optional().isArray()
  ],
  validate,
  async (req, res) => {
    try {
      const space = await prisma.space.create({
        data: req.body
      });

      res.status(201).json({
        message: 'Espace créé avec succès',
        space
      });
    } catch (error) {
      console.error('Erreur lors de la création de l\'espace:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

/**
 * @swagger
 * /api/spaces/{id}:
 *   put:
 *     summary: Modifier un espace (Admin uniquement)
 *     tags: [Spaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Espace modifié
 *       404:
 *         description: Espace non trouvé
 */
router.put('/:id',
  authenticate,
  authorize('ADMIN'),
  [param('id').isUUID()],
  validate,
  async (req, res) => {
    try {
      const space = await prisma.space.update({
        where: { id: req.params.id },
        data: req.body
      });

      res.json({
        message: 'Espace modifié avec succès',
        space
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Espace non trouvé' });
      }
      console.error('Erreur lors de la modification de l\'espace:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

/**
 * @swagger
 * /api/spaces/{id}:
 *   delete:
 *     summary: Supprimer un espace (Admin uniquement)
 *     tags: [Spaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Espace supprimé
 */
router.delete('/:id',
  authenticate,
  authorize('ADMIN'),
  [param('id').isUUID()],
  validate,
  async (req, res) => {
    try {
      await prisma.space.update({
        where: { id: req.params.id },
        data: { isActive: false }
      });

      res.json({ message: 'Espace désactivé avec succès' });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Espace non trouvé' });
      }
      console.error('Erreur lors de la suppression de l\'espace:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

module.exports = router;

