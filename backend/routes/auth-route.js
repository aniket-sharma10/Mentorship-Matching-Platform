import express from 'express';
import { signup, signin, logout, google } from '../controllers/auth-controller.js';

const router = express.Router();

router.post('/register', signup);
router.post('/login', signin);
router.delete('/logout', logout);
router.post('/google', google);

export default router;
