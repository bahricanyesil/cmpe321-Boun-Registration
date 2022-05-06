import dbConnection from '../../../loaders/db_loader.js';

export default async (req, res) => {
  if (!req.query.course_ID || !req.query.username) {
    return res.status(400).json({ "resultMessage": "Please provide a course_ID and username to view enrolled students." });
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
      const preCourseQuery = `
        SELECT *
        FROM Courses
        WHERE Courses.course_ID = "${req.query.course_ID}" AND Courses.instructor_username = "${req.query.username}"
      `;

      return await db.query(preCourseQuery, async (err, data) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ resultMessage: `An error occurred in the db query. Err: ${err.message}` });
        }
        const course = data[0];
        if (!course) return res.status(404).json({ resultMessage: "Course with the given id and instructor could not find." });
        const query = `
          SELECT Students.username, Students.student_ID, Students.email, Students.name, Students.surname
          FROM Students
          INNER JOIN Enrollment
          ON Enrollment.course_ID = "${req.query.course_ID}" AND Enrollment.student_ID = Students.student_ID
          INNER JOIN Courses
          ON Courses.course_ID = "${req.query.course_ID}" AND Courses.instructor_username = "${req.query.username}";
        `;
        return await db.query(query, (err, data) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ resultMessage: `An error occurred in the db query. Err: ${err.message}` });
          }
          return res.status(200).json({ resultMessage: "Students are successfully fetched.", students: data });
        });
      });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ resultMessage: `An unexpected server error occurred. Err: ${err.message}` });
  }
};