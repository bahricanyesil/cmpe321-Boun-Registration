import { Router } from 'express';
import { enrollCourse, filterCourse, getAllCourses, getEnrolledCourses, searchCourse } from '../controllers/student/index.js';

const router = Router();

router.get('/course/all', getAllCourses);
router.get('/course/enrolled', getEnrolledCourses);
router.get('/course/filter', filterCourse);
router.get('/course', searchCourse);

router.post('/course/enroll', enrollCourse);

export default router