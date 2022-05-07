import { Router } from 'express';
import { addInstructor, addStudent, deleteStudent, getCourses, getGradeAverage, getGrades, getInstructors, getStudents, login, updateInstructor } from '../controllers/database-manager/index.js';

const router = Router();

router.get('/student', getStudents);
router.get('/instructor', getInstructors);
router.get('/grade', getGrades);
router.get('/gradeAverage', getGradeAverage);
router.get('/course', getCourses);

router.post('/login', login);
router.post('/student', addStudent);
router.post('/instructor', addInstructor);

router.post('/updateInstructor', updateInstructor);

router.post('/deleteStudent', deleteStudent);

export default router