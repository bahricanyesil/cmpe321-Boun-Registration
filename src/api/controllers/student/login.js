import crypto from 'crypto';
import dbConnection from '../../../loaders/db_loader.js';

export default async (req, res) => {
  const body = req.body;
  if (!body || !body.username || !body.password) {
    return res.status(400).render('pages/login/login', { "resultMessage": "Please provide a username, password.", "type": "student" });
  }

  try {
    const db = await dbConnection();
    const hashedPassword = crypto.createHash('sha256').update(body.password).digest('base64');
    const query = `
      SELECT *
      FROM Students
      WHERE username = "${body.username}" AND password = "${hashedPassword}";
    `;

    return await db.query(query, (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).render('pages/login/login', { resultMessage: `An error occurred in the db query. Err: ${err.message}`, "type": "student" });
      }
      const user = data[0];
      if (!user) return res.status(404).render('pages/login/login', { resultMessage: 'Could not found a user with the given username and password.', "type": "student" });
      delete user.password;
      return res.status(200).render('pages/login/login', { user, "type": "student" });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).render('pages/login/login', { resultMessage: `An unexpected server error occurred. Err: ${err.message}`, "type": "student" });
  }
};