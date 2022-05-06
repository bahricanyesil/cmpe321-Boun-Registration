import dbConnection from '../../../loaders/db_loader.js';

export default async (req, res) => {
  if (!req.query.slot) {
    return res.status(400).json({ "resultMessage": "Please provide a slot to list the classrooms." });
  }

  if (req.query.slot < 1 || req.query.slot > 10) return res.status(400).json({ "resultMessage": "Time slot should be between 1 and 10 (inclusive)." });

  try {
    const db = await dbConnection();
    const query = `
      SELECT *
      FROM Classrooms 
      WHERE Classrooms.classroom_ID NOT IN (SELECT Courses.classroom_ID FROM Courses WHERE Courses.time_slot = ${req.query.slot});
    `;

    return await db.query(query, (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ resultMessage: `An error occurred in the db query. Err: ${err.message}` });
      }
      return res.status(200).json({ resultMessage: "Classrooms are successfully fetched.", classrooms: data });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ resultMessage: `An unexpected server error occurred. Err: ${err.message}` });
  }
};