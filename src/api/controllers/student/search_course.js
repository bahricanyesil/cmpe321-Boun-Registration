import dbConnection from '../../../loaders/db_loader.js';

export default async (req, res) => {
  if (!req.query.name) {
    return res.status(400).json({ "resultMessage": "Please provide a name to search a course." });
  }

  try {
    const db = await dbConnection();

    const query = `
      SELECT Courses.course_ID, Courses.name, Instructors.surname, Departments.name, Courses.credits, Courses.classroom_ID, Courses.time_slot, Courses.quota,
      (SELECT GROUP_CONCAT(prerequisite_ID SEPARATOR ', ') 
        FROM Prerequisites 
        WHERE Prerequisites.course_ID=Courses.course_ID
        GROUP BY course_ID) AS prerequisites
      FROM Courses 
      INNER JOIN Instructors ON Courses.instructor_username=Instructors.username
      INNER JOIN Departments ON Courses.department_ID=Departments.department_ID
      WHERE LOCATE("${req.query.name}", Courses.name) > 0;
    `;

    return await db.query(query, (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ resultMessage: `An error occurred in the db query. Err: ${err.message}` });
      }
      return res.status(200).json({ resultMessage: "Searched courses are successfully fetched.", courses: data });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ resultMessage: `An unexpected server error occurred. Err: ${err.message}` });
  }
};