import dbConnection from '../../../loaders/db_loader.js';

export default async (req, res) => {
  if (!req.query.campus || !req.query.min_credits || !req.query.max_credits || !req.query.department_ID) {
    return res.status(400).json({ "resultMessage": "Please provide all required data (campus, min_credits, max_credits, department_ID) to filter courses." });
  }

  try {
    const db = await dbConnection();

    const query = `
      CALL filterCourses("${req.query.campus}", "${req.query.department_ID}", ${req.query.min_credits}, ${req.query.max_credits})
    `;

    return await db.query(query, (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ resultMessage: `An error occurred in the db query. Err: ${err.message}` });
      }
      return res.status(200).json({ resultMessage: "Filtered courses are successfully fetched.", courses: data[0] });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ resultMessage: `An unexpected server error occurred. Err: ${err.message}` });
  }
};