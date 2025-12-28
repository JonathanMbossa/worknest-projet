const express = require('express');
const { body, param } = require('express-validator');
const prisma = require('../config/database');
const validate = require('../middleware/validation');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Créer un paiement pour une réservation
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reservationId
 *               - method
 *             properties:
 *               reservationId:
 *                 type: string
 *                 format: uuid
 *               method:
 *                 type: string
 *                 enum: [CARD, BANK_TRANSFER, PAYPAL]
 *               transactionId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Paiement créé
 *       400:
 *         description: Données invalides
 */
router.post('/',
  authenticate,
  [
    body('reservationId').isUUID(),
    body('method').isIn(['CARD', 'BANK_TRANSFER', 'PAYPAL']),
    body('transactionId').optional().trim()
  ],
  validate,
  async (req, res) => {
    try {
      const { reservationId, method, transactionId } = req.body;

      // Vérifier que la réservation existe et appartient à l'utilisateur
      const reservation = await prisma.reservation.findUnique({
        where: { id: reservationId },
        include: { payment: true }
      });

      if (!reservation) {
        return res.status(404).json({ error: 'Réservation non trouvée' });
      }

      if (reservation.userId !== req.user.id) {
        return res.status(403).json({ error: 'Accès refusé' });
      }

      if (reservation.status === 'CANCELLED') {
        return res.status(400).json({ error: 'Impossible de payer une réservation annulée' });
      }

      // Vérifier si un paiement existe déjà
      if (reservation.payment) {
        return res.status(409).json({ error: 'Un paiement existe déjà pour cette réservation' });
      }

      // Créer le paiement
      const payment = await prisma.payment.create({
        data: {
          reservationId,
          userId: req.user.id,
          amount: reservation.totalPrice,
          method,
          transactionId,
          status: 'PAID' // En production, ce serait géré par le service de paiement
        }
      });

      // Mettre à jour le statut de la réservation
      await prisma.reservation.update({
        where: { id: reservationId },
        data: { status: 'CONFIRMED' }
      });

      res.status(201).json({
        message: 'Paiement effectué avec succès',
        payment
      });
    } catch (error) {
      console.error('Erreur lors de la création du paiement:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Liste des paiements
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des paiements
 */
router.get('/',
  authenticate,
  async (req, res) => {
    try {
      const where = {};

      // Si l'utilisateur n'est pas admin, ne voir que ses paiements
      if (req.user.role !== 'ADMIN') {
        where.userId = req.user.id;
      }

      const payments = await prisma.payment.findMany({
        where,
        include: {
          reservation: {
            include: {
              space: {
                select: {
                  id: true,
                  name: true,
                  location: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({ payments });
    } catch (error) {
      console.error('Erreur lors de la récupération des paiements:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Détails d'un paiement
 *     tags: [Payments]
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
 *         description: Détails du paiement
 */
router.get('/:id',
  authenticate,
  [param('id').isUUID()],
  validate,
  async (req, res) => {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: req.params.id },
        include: {
          reservation: {
            include: {
              space: true
            }
          }
        }
      });

      if (!payment) {
        return res.status(404).json({ error: 'Paiement non trouvé' });
      }

      // Vérifier les droits
      if (req.user.role !== 'ADMIN' && payment.userId !== req.user.id) {
        return res.status(403).json({ error: 'Accès refusé' });
      }

      res.json({ payment });
    } catch (error) {
      console.error('Erreur lors de la récupération du paiement:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

module.exports = router;

