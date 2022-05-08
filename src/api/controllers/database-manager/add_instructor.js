import crypto from 'crypto';
import dbConnection from '../../../loaders/db_loader.js';

export default async (req, res) => {
  const body = req.body;
  if (!body || !body.username || !body.password || !body.name || !body.surname || !body.email || !body.department_ID || !body.title) {
    return res.status(400).json({ "resultMessage": "Please provide all required fields to create an instructor." });
  }

  if (body.title != 'Assistant Professor' && body.title != 'Associate Professor' && body.title != 'Professor') {
    return res.status(400).json({ "resultMessage": "Please provide a valid title. Allowed titles are: Professor, Associate Professor, Assistant Professor" });
  }

  try {
    const db = await dbConnection();
    const hashedPassword = crypto.createHash('sha256').update(body.password).digest('base64');
    const query = `
      INSERT INTO Instructors (username, password, name, surname, email, department_ID, title)
      VALUES ("${body.username}", "${hashedPassword}", "${body.name}", "${body.surname}", "${body.email}", "${body.department_ID}", "${body.title}"); 
    `;

    return await db.query(query, (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ resultMessage: `An error occurred in the db query. Err: ${err.message}` });
      }
      return res.status(200).json({ resultMessage: "Instructor is successfully added." });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ resultMessage: `An unexpected server error occurred. Err: ${err.message}` });
  }
};