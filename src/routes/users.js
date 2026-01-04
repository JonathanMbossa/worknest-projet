const express = require('express');
const bcrypt = require('bcryptjs');
const { body, param } = require('express-validator');
const prisma = require('../config/database');
const validate = require('../middleware/validation');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Récupérer le profil utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur
 */
router.get('/profile',
  authenticate,
  async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          company: true,
          role: true,
          createdAt: true,
          reservations: {
            include: {
              space: {
                select: {
                  id: true,
                  name: true,
                  location: true,
                  city: true
                }
              },
              payment: {
                select: {
                  id: true,
                  status: true,
                  amount: true
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      });

      res.json({ user });
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Mettre à jour le profil utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               company:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profil mis à jour
 */
router.put('/profile',
  authenticate,
  [
    body('email').optional().isEmail().normalizeEmail(),
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    body('phone').optional().isMobilePhone('fr-FR'),
    body('company').optional().trim()
  ],
  validate,
  async (req, res) => {
    try {
      const { email, firstName, lastName, phone, company } = req.body;

      // Si l'email est modifié, vérifier qu'il n'est pas déjà utilisé
      if (email && email !== req.user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email }
        });
        if (existingUser) {
          return res.status(409).json({ error: 'Cet email est déjà utilisé' });
        }
      }

      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          ...(email && { email }),
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(phone !== undefined && { phone }),
          ...(company !== undefined && { company })
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          company: true,
          role: true
        }
      });

      res.json({
        message: 'Profil mis à jour avec succès',
        user
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

/**
 * @swagger
 * /api/users/profile/password:
 *   put:
 *     summary: Changer le mot de passe
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Mot de passe changé
 */
router.put('/profile/password',
  authenticate,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  ],
  validate,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await prisma.user.findUnique({
        where: { id: req.user.id }
      });

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await prisma.user.update({
        where: { id: req.user.id },
        data: { password: hashedPassword }
      });

      res.json({ message: 'Mot de passe changé avec succès' });
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Liste des utilisateurs (Admin uniquement)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 */
router.get('/',
  authenticate,
  authorize('ADMIN'),
  async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          company: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          reservations: {
            select: {
              id: true,
              status: true,
              createdAt: true
            }
          },
          payments: {
            select: {
              id: true,
              status: true,
              amount: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({ users });
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur (Admin uniquement)
 *     tags: [Users]
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
 *         description: Utilisateur supprimé
 *       404:
 *         description: Utilisateur non trouvé
 */
router.delete('/:id',
  authenticate,
  authorize('ADMIN'),
  [param('id').isUUID()],
  validate,
  async (req, res) => {
    try {
      // Ne pas permettre de supprimer son propre compte
      if (req.params.id === req.user.id) {
        return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
      }

      // Désactiver l'utilisateur au lieu de le supprimer (pour préserver l'historique)
      await prisma.user.update({
        where: { id: req.params.id },
        data: { isActive: false }
      });

      res.json({ message: 'Utilisateur désactivé avec succès' });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

module.exports = router;

