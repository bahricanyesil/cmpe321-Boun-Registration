import dbConnection from '../../../loaders/db_loader.js';

export default async (req, res) => {
  const body = req.body;
  if (!body || !body.course_ID || !body.student_ID) {
    return res.status(400).json({ "resultMessage": "Please provide a course_ID and student_ID to enroll." });
  }

  try {
    const db = await dbConnection();
    
    // We did all required checks at step 19 with the help of triggers.
    // So we didn't put extra checks and statements here.
    const query = `
      INSERT INTO Enrollment (student_ID, course_ID)
      VALUES ("${body.student_ID}", "${body.course_ID}");
    `;

    return await db.query(query, (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ resultMessage: `An error occurred in the db query. Err: ${err.message}` });
      }
      return res.status(200).json({ resultMessage: "Successfully enrolled to the course." });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ resultMessage: `An unexpected server error occurred. Err: ${err.message}` });
  }
};