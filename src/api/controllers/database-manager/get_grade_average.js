import dbConnection from '../../../loaders/db_loader.js';

export default async (req, res) => {
  if (!req.query.id) {
    return res.status(400).json({ "resultMessage": "Please provide the id of the course." });
  }

  try {
    const db = await dbConnection();
    const preQuery = `
      SELECT *
      FROM Courses
      WHERE Courses.course_ID = "${req.query.id}"  
    `;

    return await db.query(preQuery, async (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ resultMessage: `An error occurred in the db query. Err: ${err.message}` });
      }
      const course = data[0];
      if (!course) return res.status(404).json({ resultMessage: "Course with the given id could not find." });
      const query = `
        SELECT Grades.course_ID, name, AVG(Grades.grade) as average_grade
        FROM Grades
        INNER JOIN Courses
        ON Courses.course_ID = Grades.course_ID
        WHERE Grades.course_ID = "${req.query.id}";
      `;
      return await db.query(query, (err, data) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ resultMessage: `An error occurred in the db query. Err: ${err.message}` });
        }
        return res.status(200).json({ resultMessage: "Average grade of the course is successfully fetched.", grade: data[0] });
      });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ resultMessage: `An unexpected server error occurred. Err: ${err.message}` });
  }
};