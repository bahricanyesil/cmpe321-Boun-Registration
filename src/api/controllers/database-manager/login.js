import crypto from 'crypto';
import dbConnection from '../../../loaders/db_loader.js';

export default async (req, res) => {
  const redirectUrl = 'pages/login/login';
  const body = req.body;
  if (!body || !body.username || !body.password) {
    return res.status(400).render(redirectUrl, { "resultMessage": "Please provide a username, password.", "type": "dbManager" });
  }

  try {
    const db = await dbConnection();
    const hashedPassword = crypto.createHash('sha256').update(body.password).digest('base64');
    console.log(hashedPassword);
    const query = `
      SELECT *
      FROM DatabaseManager
      WHERE username = "${body.username}" AND password = "${hashedPassword}";
    `;

    return await db.query(query, (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).render(redirectUrl, { resultMessage: `An error occurred in the db query. Err: ${err.message}`, "type": "dbManager" });
      }
      const user = data[0];
      if (!user) return res.status(404).render(redirectUrl, { resultMessage: 'Could not found a user with the given username and password.', "type": "dbManager" });
      delete user.password;
      return res.status(200).redirect('/dbManager/student');
    });
  } catch (err) {
    console.log(err);
    return res.status(500).render(redirectUrl, { resultMessage: `An unexpected server error occurred. Err: ${err.message}`, "type": "dbManager" });
  }
};