import dbConnection from '../../../loaders/db_loader.js';

export default async (req, res) => {
  if (!req.query.id) {
    return res.status(400).json({ "resultMessage": "Please provide the id of the student." });
  }

  try {
    const db = await dbConnection();
    const preQuery = `
      SELECT *
      FROM Students
      WHERE Students.student_ID = "${req.query.id}"  
    `;

    return await db.query(preQuery, async (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ resultMessage: `An error occurred in the db query. Err: ${err.message}` });
      }
      const user = data[0];
      if (!user) return res.status(404).json({ resultMessage: "Student with the given id could not find." });
      const query = `
        SELECT Grades.course_ID, name, grade
        FROM Grades
        INNER JOIN Courses
        ON Courses.course_ID = Grades.course_ID
        WHERE student_ID = "${req.query.id}";
      `;
      return await db.query(query, (err, data) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ resultMessage: `An error occurred in the db query. Err: ${err.message}` });
        }
        return res.status(200).json({ resultMessage: "Grades are successfully fetched.", grades: data });
      });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ resultMessage: `An unexpected server error occurred. Err: ${err.message}` });
  }
};