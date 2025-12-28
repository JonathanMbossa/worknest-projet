const express = require('express');
const { body, param, query } = require('express-validator');
const prisma = require('../config/database');
const validate = require('../middleware/validation');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/reservations:
 *   post:
 *     summary: Créer une réservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - spaceId
 *               - startDate
 *               - endDate
 *             properties:
 *               spaceId:
 *                 type: string
 *                 format: uuid
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Réservation créée
 *       400:
 *         description: Données invalides ou créneau indisponible
 */
router.post('/',
  authenticate,
  [
    body('spaceId').isUUID(),
    body('startDate').isISO8601().toDate(),
    body('endDate').isISO8601().toDate(),
    body('notes').optional().trim()
  ],
  validate,
  async (req, res) => {
    try {
      const { spaceId, startDate, endDate, notes } = req.body;

      // Vérifier que l'espace existe et est actif
      const space = await prisma.space.findUnique({
        where: { id: spaceId }
      });

      if (!space || !space.isActive) {
        return res.status(404).json({ error: 'Espace non trouvé ou indisponible' });
      }

      // Vérifier que les dates sont valides
      if (new Date(startDate) >= new Date(endDate)) {
        return res.status(400).json({ error: 'La date de fin doit être après la date de début' });
      }

      if (new Date(startDate) < new Date()) {
        return res.status(400).json({ error: 'La date de début ne peut pas être dans le passé' });
      }

      // Vérifier les conflits de réservation
      const conflictingReservations = await prisma.reservation.findMany({
        where: {
          spaceId,
          status: { in: ['PENDING', 'CONFIRMED'] },
          OR: [
            {
              AND: [
                { startDate: { lte: new Date(startDate) } },
                { endDate: { gt: new Date(startDate) } }
              ]
            },
            {
              AND: [
                { startDate: { lt: new Date(endDate) } },
                { endDate: { gte: new Date(endDate) } }
              ]
            },
            {
              AND: [
                { startDate: { gte: new Date(startDate) } },
                { endDate: { lte: new Date(endDate) } }
              ]
            }
          ]
        }
      });

      if (conflictingReservations.length > 0) {
        return res.status(409).json({
          error: 'Créneau déjà réservé',
          conflicts: conflictingReservations
        });
      }

      // Calculer le prix total
      const hours = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60);
      const totalPrice = space.price * hours;

      // Créer la réservation
      const reservation = await prisma.reservation.create({
        data: {
          userId: req.user.id,
          spaceId,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          totalPrice,
          notes,
          status: 'PENDING'
        },
        include: {
          space: {
            select: {
              id: true,
              name: true,
              location: true,
              address: true,
              city: true
            }
          }
        }
      });

      res.status(201).json({
        message: 'Réservation créée avec succès',
        reservation
      });
    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

/**
 * @swagger
 * /api/reservations:
 *   get:
 *     summary: Liste des réservations
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, CANCELLED, COMPLETED]
 *       - in: query
 *         name: spaceId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des réservations
 */
router.get('/',
  authenticate,
  [
    query('status').optional().isIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']),
    query('spaceId').optional().isUUID()
  ],
  validate,
  async (req, res) => {
    try {
      const where = {};

      // Si l'utilisateur n'est pas admin, ne voir que ses réservations
      if (req.user.role !== 'ADMIN') {
        where.userId = req.user.id;
      } else if (req.query.spaceId) {
        where.spaceId = req.query.spaceId;
      }

      if (req.query.status) {
        where.status = req.query.status;
      }

      const reservations = await prisma.reservation.findMany({
        where,
        include: {
          space: {
            select: {
              id: true,
              name: true,
              location: true,
              city: true,
              images: true
            }
          },
          user: req.user.role === 'ADMIN' ? {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              company: true
            }
          } : false,
          payment: {
            select: {
              id: true,
              status: true,
              amount: true,
              method: true
            }
          }
        },
        orderBy: { startDate: 'desc' }
      });

      res.json({ reservations });
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

/**
 * @swagger
 * /api/reservations/{id}:
 *   get:
 *     summary: Détails d'une réservation
 *     tags: [Reservations]
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
 *         description: Détails de la réservation
 *       404:
 *         description: Réservation non trouvée
 */
router.get('/:id',
  authenticate,
  [param('id').isUUID()],
  validate,
  async (req, res) => {
    try {
      const reservation = await prisma.reservation.findUnique({
        where: { id: req.params.id },
        include: {
          space: true,
          user: req.user.role === 'ADMIN' ? true : false,
          payment: true
        }
      });

      if (!reservation) {
        return res.status(404).json({ error: 'Réservation non trouvée' });
      }

      // Vérifier que l'utilisateur a le droit de voir cette réservation
      if (req.user.role !== 'ADMIN' && reservation.userId !== req.user.id) {
        return res.status(403).json({ error: 'Accès refusé' });
      }

      res.json({ reservation });
    } catch (error) {
      console.error('Erreur lors de la récupération de la réservation:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

/**
 * @swagger
 * /api/reservations/{id}/cancel:
 *   post:
 *     summary: Annuler une réservation
 *     tags: [Reservations]
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
 *         description: Réservation annulée
 */
router.post('/:id/cancel',
  authenticate,
  [param('id').isUUID()],
  validate,
  async (req, res) => {
    try {
      const reservation = await prisma.reservation.findUnique({
        where: { id: req.params.id },
        include: { payment: true }
      });

      if (!reservation) {
        return res.status(404).json({ error: 'Réservation non trouvée' });
      }

      // Vérifier les droits
      if (req.user.role !== 'ADMIN' && reservation.userId !== req.user.id) {
        return res.status(403).json({ error: 'Accès refusé' });
      }

      // Vérifier que la réservation peut être annulée
      if (reservation.status === 'CANCELLED') {
        return res.status(400).json({ error: 'Réservation déjà annulée' });
      }

      if (reservation.status === 'COMPLETED') {
        return res.status(400).json({ error: 'Impossible d\'annuler une réservation terminée' });
      }

      // Annuler la réservation
      await prisma.reservation.update({
        where: { id: req.params.id },
        data: { status: 'CANCELLED' }
      });

      // Si un paiement existe, le marquer comme remboursé
      if (reservation.payment) {
        await prisma.payment.update({
          where: { id: reservation.payment.id },
          data: { status: 'REFUNDED' }
        });
      }

      res.json({ message: 'Réservation annulée avec succès' });
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la réservation:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

/**
 * @swagger
 * /api/reservations/{id}/confirm:
 *   post:
 *     summary: Confirmer une réservation (Admin uniquement)
 *     tags: [Reservations]
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
 *         description: Réservation confirmée
 */
router.post('/:id/confirm',
  authenticate,
  authorize('ADMIN'),
  [param('id').isUUID()],
  validate,
  async (req, res) => {
    try {
      const reservation = await prisma.reservation.update({
        where: { id: req.params.id },
        data: { status: 'CONFIRMED' }
      });

      res.json({
        message: 'Réservation confirmée',
        reservation
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Réservation non trouvée' });
      }
      console.error('Erreur lors de la confirmation de la réservation:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

module.exports = router;

