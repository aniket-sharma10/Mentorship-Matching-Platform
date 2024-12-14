import express from 'express';
import { discoverUsers } from '../controllers/discovery-controller.js';
import auth from '../middlewares/authentication.js';

const router = express.Router();

router.get('/', auth, discoverUsers);

export default router;
