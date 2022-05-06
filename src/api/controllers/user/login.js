import crypto from 'crypto';
import dbConnection from '../../../loaders/db_loader.js';

export default async (req, res) => {
  const body = req.body;
  if (!body || !body.username || !body.password || !body.user_type) {
    return res.status(400).json({ "resultMessage": "Please provide an username, password and user type." });
  }

  const userType = body.user_type;
  if (userType !== 'Students' && userType !== 'Instructors' && userType !== 'DatabaseManager') {
    return res.status(400).json({ "resultMessage": "Please provide a valid user type. Followings are allowed: Students, Instructors, DatabaseManager" });
  }

  try {
    const db = await dbConnection();
    const hashedPassword = crypto.createHash('sha256').update(body.password).digest('base64');
    const query = `
      SELECT *
      FROM ${userType}
      WHERE username = "${body.username}" AND password = "${hashedPassword}";
    `;

    return await db.query(query, (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ resultMessage: `An error occurred in the db query. Err: ${err.message}` });
      }
      const user = data[0];
      if (!user) return res.status(404).json({ resultMessage: 'Could not found a user with the given username and password.' });
      delete user.password;
      return res.status(200).json({ resultMessage: "User is successfully logged in.", user });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ resultMessage: `An unexpected server error occurred. Err: ${err.message}` });
  }
};