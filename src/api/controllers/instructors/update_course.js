import dbConnection from '../../../loaders/db_loader.js';

export default async (req, res) => {
  const body = req.body;
  if (!body || !body.name || !body.course_ID || !body.instructor_username) {
    return res.status(400).json({ "resultMessage": "Please provide a name and a course_ID to update a course." });
  }

  try {
    const db = await dbConnection();
    const preQuery = `
      SELECT *
      FROM Courses
      WHERE Courses.course_ID = "${body.course_ID}"  
    ;`;

    return await db.query(preQuery, async (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ resultMessage: `An error occurred in the db pre- query.Err: ${err.message}` });
      }
      const course = data[0];
      if (!course) return res.status(404).json({ resultMessage: 'A course with the given id could not find.' });
      if (course.instructor_username != body.instructor_username) {
        return res.status(400).json({ resultMessage: "The course doesn't belong to this instructor." });
      }
      const query = `
        UPDATE Courses
        SET name = "${body.name}"
        WHERE course_ID = "${body.course_ID}";
      `;
      return await db.query(query, (err, data) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ resultMessage: `An error occurred in the db query.Err: ${err.message}` });
        }
        const isUpdated = data['affectedRows'] > 0;
        if (!isUpdated) return res.status(404).json({ resultMessage: 'A course with the given id could not find.' });
        return res.status(200).json({ resultMessage: "Course is successfully updated." });
      });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ resultMessage: `An unexpected server error occurred.Err: ${err.message}` });
  }
};