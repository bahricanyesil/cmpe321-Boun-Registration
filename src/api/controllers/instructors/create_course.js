import dbConnection from '../../../loaders/db_loader.js';

export default async (req, res) => {
  const body = req.body;
  if (!body || !body.course_ID || !body.name || !body.credits || !body.classroom_ID || !body.instructor_username || !body.time_slot || !body.quota || !body.department_ID) {
    return res.status(400).json({ "resultMessage": "Please provide all required fields to create a course." });
  }

  if (body.quota < 0) return res.status(400).json({ "resultMessage": "Quota cannot be less than 0." });
  if (body.time_slot < 1 || body.time_slot > 10) return res.status(400).json({ "resultMessage": "Time slot should be between 1 and 10 (inclusive)." });

  try {
    const db = await dbConnection();
    // We did controls of the 12th item with Triggers.
    const query = `
      INSERT INTO Courses (course_ID, name, credits, quota, instructor_username, classroom_ID, time_slot, department_ID)
      VALUES ("${body.course_ID}", "${body.name}", ${body.credits}, ${body.quota}, "${body.instructor_username}", ${body.classroom_ID}, ${body.time_slot}, "${body.department_ID}"); 
    `;

    return await db.query(query, (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ resultMessage: `An error occurred in the db query. Err: ${err.message}` });
      }
      return res.status(200).json({ resultMessage: "Course is successfully created." });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ resultMessage: `An unexpected server error occurred. Err: ${err.message}` });
  }
};