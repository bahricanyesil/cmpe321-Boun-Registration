import dbConnection from '../../../loaders/db_loader.js';

export default async (req, res) => {
  const body = req.body;
  if (!body || !body.course_ID || !body.student_ID || !body.grade || !body.instructor_username) {
    return res.status(400).json({ "resultMessage": "Please provide all required fields (course_ID, student_ID, grade, instructor_username) to grade a student." });
  }

  // We checked whether a course is enrolled before grading and 
  // the enrollment is deleted after grading with the help of triggers.
  try {

    const db = await dbConnection();
    const preQuery = `
      SELECT *
      FROM Courses
      WHERE Courses.course_ID = "${body.course_ID}"
    `;

    return await db.query(preQuery, async (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ resultMessage: `An error occurred in the db pre-query. Err: ${err.message}` });
      }
      const course = data[0];
      if (!course) return res.status(404).json({ resultMessage: 'A course with the given id could not find.' });
      if (course.instructor_username != body.instructor_username) {
        return res.status(400).json({ resultMessage: 'The course doesn\'t belong to this instructor.' });
      }
      const query = `
        INSERT INTO Grades (course_ID, student_ID, grade)
        VALUES ("${body.course_ID}", "${body.student_ID}", ${body.grade});
      `;
      return await db.query(query, (err, data) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ resultMessage: `An error occurred in the db query. Err: ${err.message}` });
        }
        return res.status(200).json({ resultMessage: "Grade is successfully created." });
      });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ resultMessage: `An unexpected server error occurred. Err: ${err.message}` });
  }
};