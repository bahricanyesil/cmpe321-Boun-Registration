import dbConnection from '../../../loaders/db_loader.js';

export default async (req, res) => {
  const body = req.body;
  if (!body || !body.course_ID || !body.prerequisite_ID) {
    return res.status(400).json({ "resultMessage": "Please provide all required fields to add a prerequisite." });
  }

  //TODO: Test this
  //TODO: Check whether the course is belong to the instructor.
  try {
    const db = await dbConnection();
    const query = `
      INSERT INTO Prerequisites (course_ID, prerequisite_ID)
      VALUES ("${body.course_ID}", "${body.prerequisite_ID}");
    `;

    return await db.query(query, (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ resultMessage: `An error occurred in the db query. Err: ${err.message}` });
      }
      return res.status(200).json({ resultMessage: "Prerequisite is successfully created." });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ resultMessage: `An unexpected server error occurred. Err: ${err.message}` });
  }
};