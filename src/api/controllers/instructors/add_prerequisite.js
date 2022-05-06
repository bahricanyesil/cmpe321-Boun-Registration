import dbConnection from '../../../loaders/db_loader.js';

export default async (req, res) => {
  const body = req.body;
  if (!body || !body.course_ID || !body.prerequisite_ID || !body.instructor_username) {
    return res.status(400).json({ "resultMessage": "Please provide all required fields to add a prerequisite." });
  }

  if (body.course_ID == body.prerequisite_ID) return res.status(400).json({ "resultMessage": "A course cannot be a prerequisite of itself." });

  try {
    const db = await dbConnection();
    const preQuery = `
      SELECT *
      FROM Courses
      WHERE Courses.course_ID = "${body.course_ID}"  
    `;

    return await db.query(preQuery, async (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ resultMessage: `An error occurred in the db pre-query. Err: ${err.message}` });
      }
      const course = data[0];
      if (!course) return res.status(404).json({ resultMessage: 'A course with the given id could not find.' });
      if (course.instructor_username != body.instructor_username) {
        return res.status(400).json({ resultMessage: 'The course doesn\'t belong to this instructor.' });
      }
      const query = `
        INSERT INTO Prerequisites (course_ID, prerequisite_ID)
        VALUES ("${body.course_ID}", "${body.prerequisite_ID}");
      `;
      return await db.query(query, (err, data) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ resultMessage: `An error occurred in the db query. Err: ${err.message}` });
        }
        return res.status(200).json({ resultMessage: "Prerequisite is successfully created." });
      });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ resultMessage: `An unexpected server error occurred. Err: ${err.message}` });
  }
};