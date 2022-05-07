import dbConnection from '../../../loaders/db_loader.js';

export default async (req, res) => {
  const redirectUrl = 'pages/db-manager/student_home';
  if (!req.query.id) {
    return res.status(400).render(redirectUrl, { "resultMessage": "Please provide the id of the student that will be deleted." });
  }

  try {
    const db = await dbConnection();
    const query = `DELETE FROM Students WHERE student_ID = "${req.query.id}"; `;

    return await db.query(query, (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).render(redirectUrl, { resultMessage: `An error occurred in the db query. Err: ${err.message}` });
      }
      const isDeleted = data['affectedRows'] > 0;
      if (!isDeleted) return res.status(404).redirect(redirectUrl, { resultMessage: 'A student with the given id could not find.' });
      return res.status(200).redirect('student');
    });
  } catch (err) {
    console.log(err);
    return res.status(500).render(redirectUrl, { resultMessage: `An unexpected server error occurred. Err: ${err.message}` });
  }
};