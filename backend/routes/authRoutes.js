const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/users', authMiddleware, authController.getAllUsers);
router.get('/users/:id', authMiddleware, authController.getUserById);
router.delete('/users/:id', authMiddleware, authController.deleteUser);
router.put('/profile', authMiddleware, authController.updateUserProfile);
router.get('/users/stats/by-role', authMiddleware, authController.getUserStatsByRole);
router.get('/users/export', authMiddleware, authController.exportUsers);

//upload da foto de perfil
router.post('/upload-avatar', authMiddleware, upload.single('avatar'), authController.uploadAvatar);

module.exports = router;