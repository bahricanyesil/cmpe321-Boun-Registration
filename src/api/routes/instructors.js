import { Router } from 'express';
import { addPrerequisite, createCourse, getClassrooms, getCourses, getStudents, gradeStudent, login, updateCourse } from '../controllers/instructors/index.js';

const router = Router();

router.get('/classroom', getClassrooms);
router.get('/course', getCourses);
router.get('/student', getStudents);

router.post('/login', login);
router.post('/course', createCourse);
router.post('/prerequisite', addPrerequisite);
router.post('/grade', gradeStudent);

router.put('/course', updateCourse);

export default router