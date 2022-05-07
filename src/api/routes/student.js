import { Router } from 'express';
import { enrollCourse, filterCourse, getAllCourses, getEnrolledCourses, login, searchCourse } from '../controllers/student/index.js';

const router = Router();

router.get('/course/all', getAllCourses);
router.get('/course/enrolled', getEnrolledCourses);
router.get('/course/filter', filterCourse);
router.get('/course', searchCourse);

router.post('/login', login);
router.post('/course/enroll', enrollCourse);

export default router