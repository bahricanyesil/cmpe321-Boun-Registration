import dbConnection from '../../../loaders/db_loader.js';

export default async (req, res) => {
  if (!req.query.username) {
    return res.status(400).json({ "resultMessage": "Please provide the username of the instructor." });
  }

  try {
    const db = await dbConnection();
    const preQuery = `
      SELECT *
      FROM Instructors
      WHERE Instructors.username = "${req.query.username}"  
    `;

    return await db.query(preQuery, async (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ resultMessage: `An error occurred in the db query. Err: ${err.message}` });
      }
      const user = data[0];
      if (!user) return res.status(404).json({ resultMessage: "Instructor with the given username could not find." });
      const query = `
        SELECT course_ID, name, classroom_ID, time_slot, quota, (SELECT GROUP_CONCAT(prerequisite_ID SEPARATOR ', ') 
          FROM Prerequisites 
          WHERE Prerequisites.course_ID=Courses.course_ID
          GROUP BY course_ID) AS prerequisites
        FROM Courses
        WHERE instructor_username = "${req.query.username}"
        ORDER BY course_ID ASC;
      `;
      return await db.query(query, (err, data) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ resultMessage: `An error occurred in the db query. Err: ${err.message}` });
        }
        return res.status(200).json({ resultMessage: "Courses are successfully fetched.", courses: data });
      });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ resultMessage: `An unexpected server error occurred. Err: ${err.message}` });
  }
};