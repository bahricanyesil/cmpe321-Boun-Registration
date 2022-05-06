import crypto from 'crypto';
import dbConnection from '../../../loaders/db_loader.js';

export default async (req, res) => {
  const body = req.body;
  if (!body || !body.student_ID || !body.username || !body.password || !body.name || !body.surname || !body.email || !body.department_ID) {
    return res.status(400).json({ "resultMessage": "Please provide all required fields to create a user." });
  }

  try {
    const db = await dbConnection();
    const hashedPassword = crypto.createHash('sha256').update(body.password).digest('base64');
    const query = `
      INSERT INTO Students (student_ID, username, password, name, surname, email, department_ID)
      VALUES ("${body.student_ID}",  "${body.username}", "${hashedPassword}", "${body.name}", "${body.surname}", "${body.email}", "${body.department_ID}");
    `;

    return await db.query(query, (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ resultMessage: `An error occurred in the db query. Err: ${err.message}` });
      }
      return res.status(200).json({ resultMessage: "Student is successfully added." });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ resultMessage: `An unexpected server error occurred. Err: ${err.message}` });
  }
};