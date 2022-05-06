import dbConnection from '../../../loaders/db_loader.js';

export default async (req, res) => {
  const body = req.body;
  if (!body || !body.student_ID) {
    return res.status(400).json({ "resultMessage": "Please provide a student_ID to enroll." });
  }

  try {
    const db = await dbConnection();

    const query = `
      SELECT Enrollment.course_ID, name, grade
      FROM Enrollment
      FULL OUTER JOIN Grades ON Grades.course_ID = Enrollment.course_ID
      INNER JOIN Courses ON Courses.course_ID = Enrollment.course_ID
      WHERE Enrollment.student_ID = "${body.student_ID}";
    `;

    return await db.query(query, (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ resultMessage: `An error occurred in the db query. Err: ${err.message}` });
      }
      return res.status(200).json({ resultMessage: "Enrolled courses are successfully fetched.", courses: data });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ resultMessage: `An unexpected server error occurred. Err: ${err.message}` });
  }
};