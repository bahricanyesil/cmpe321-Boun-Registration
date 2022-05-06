import dbConnection from '../../../loaders/db_loader.js';

export default async (req, res) => {
  const body = req.body;
  if (!body || !body.course_ID || !body.student_ID || !body.grade) {
    return res.status(400).json({ "resultMessage": "Please provide all required fields (course_ID, student_ID, grade) to grade a student." });
  }

  //TODO: Test this
  //TODO: Check whether the course is belong to the instructor.
  // We checked whether a course is enrolled before grading and 
  // the enrollment is deleted after grading with the help of triggers.
  try {
    const db = await dbConnection();
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
  } catch (err) {
    console.log(err);
    return res.status(500).json({ resultMessage: `An unexpected server error occurred. Err: ${err.message}` });
  }
};