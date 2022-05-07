import { Router } from 'express';
import dbManager from './database_manager.js';
import instructor from './instructors.js';
import student from './student.js';
const router = Router();

router.use('/dbManager', dbManager);
router.use('/instructor', instructor);
router.use('/student', student);

export default router;