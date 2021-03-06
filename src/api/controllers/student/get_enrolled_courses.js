import dbConnection from '../../../loaders/db_loader.js';

export default async (req, res) => {
  if (!req.query.student_ID) {
    return res.status(400).json({ "resultMessage": "Please provide a student_ID to see enrolled courses." });
  }

  try {
    const db = await dbConnection();
    const query = `
      SELECT Enrollment.course_ID, Courses.name,
      CASE 
      WHEN EXISTS(SELECT * FROM Enrollment) THEN NULL
      END AS "grade"
      FROM Enrollment
      INNER JOIN Courses ON Courses.course_ID=Enrollment.course_ID
      WHERE Enrollment.student_ID = "${req.query.student_ID}"

      UNION

      SELECT Grades.course_ID, Courses.name, Grades.grade
      FROM Grades
      INNER JOIN Courses ON Courses.course_ID=Grades.course_ID
      WHERE Grades.student_ID = "${req.query.student_ID}"
    ;`;

    return await db.query(query, (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ resultMessage: `An error occurred in the db query. Err: ${err.message}` });
      }
      return res.status(200).json({ resultMessage: "Enrolled courses are successfully fetched.", courses: data });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ resultMessage: `An unexpected server error occurred. Err: ${err.message}` });
  }
};