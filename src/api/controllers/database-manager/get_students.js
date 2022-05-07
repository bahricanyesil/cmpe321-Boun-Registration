import dbConnection from '../../../loaders/db_loader.js';

export default async (req, res) => {
  try {
    const db = await dbConnection();
    const query = `
      SELECT Students.student_ID, username, Students.name, surname, email, Students.department_ID, completed_credits, gpa, Departments.name as department_name
      FROM Students
      INNER JOIN Departments
      ON Departments.department_ID = Students.department_ID
      ORDER BY completed_credits ASC;
    `;

    return await db.query(query, (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).render('pages/db-manager/student_home', { resultMessage: `An error occurred in the db query. Err: ${err.message}` });
      }
      req.session.students = data;
      return res.status(200).render('pages/db-manager/student_home', { students: data });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).render('pages/db-manager/student_home', { resultMessage: `An unexpected server error occurred. Err: ${err.message}` });
  }
};