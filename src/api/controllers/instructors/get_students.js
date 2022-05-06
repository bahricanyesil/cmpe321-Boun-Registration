import dbConnection from '../../../loaders/db_loader.js';

export default async (req, res) => {
  if (!req.query.id) {
    return res.status(400).json({ "resultMessage": "Please provide a course id to view enrolled students." });
  }

  //TODO: Test this
  try {
    const db = await dbConnection();

    const query = `
      SELECT username, Students.student_ID, email, name, surname
      FROM Students
      INNER JOIN Enrollment
      ON Enrollment.course_ID = "${req.query.id}" AND Enrollment.student_ID = Students.student_ID;
    `;

    return await db.query(query, (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ resultMessage: `An error occurred in the db query. Err: ${err.message}` });
      }
      return res.status(200).json({ resultMessage: "Students are successfully fetched.", students: data });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ resultMessage: `An unexpected server error occurred. Err: ${err.message}` });
  }
};