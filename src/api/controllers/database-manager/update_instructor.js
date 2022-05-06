import dbConnection from '../../../loaders/db_loader.js';

export default async (req, res) => {
  const body = req.body;
  if (!body || !body.title || !body.username) {
    return res.status(400).json({ "resultMessage": "Please provide a username and title to update an instructor." });
  }

  if (body.title != 'Assistant Professor' && body.title != 'Associate Professor' && body.title != 'Professor') {
    return res.status(400).json({ "resultMessage": "Please provide a valid title. Allowed titles are: Professor, Associate Professor, Assistant Professor" });
  }

  try {
    const db = await dbConnection();
    const query = `
      UPDATE Instructors
      SET title = "${body.title}"
      WHERE username = "${body.username}";
    `;

    return await db.query(query, (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ resultMessage: `An error occurred in the db query. Err: ${err.message}` });
      }
      const isUpdated = data['affectedRows'] > 0;
      if (!isUpdated) return res.status(404).json({ resultMessage: 'An instructor with the given username could not find.' });
      return res.status(200).json({ resultMessage: "Instructor is successfully updated." });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ resultMessage: `An unexpected server error occurred. Err: ${err.message}` });
  }
};