import { Router } from 'express';
import { addInstructor, addStudent, deleteStudent, getCourses, getGradeAverage, getGrades, getInstructors, getStudents, updateInstructor } from '../controllers/database-manager/index.js';

const router = Router();

router.get('/student', getStudents);
router.get('/instructor', getInstructors);
router.get('/grade', getGrades);
router.get('/gradeAverage', getGradeAverage);
router.get('/course', getCourses);

router.post('/student', addStudent);
router.post('/instructor', addInstructor);

router.put('/instructor', updateInstructor);

router.delete('/student', deleteStudent);

export default router