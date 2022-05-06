import { Router } from 'express';
import { login } from '../controllers/user/index.js';

const router = Router();

// Auth
router.post('/login', login);

export default router