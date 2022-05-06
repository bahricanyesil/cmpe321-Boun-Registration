import dbConnection from '../../../loaders/db_loader.js';

export default async (req, res) => {
  try {
    const db = await dbConnection();
    const query = `
      SELECT username, Instructors.name, surname, email, Instructors.department_ID, title, Departments.name as department_name
      FROM Instructors
      INNER JOIN Departments
      ON Departments.department_ID = Instructors.department_ID
    `;

    return await db.query(query, (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ resultMessage: `An error occurred in the db query. Err: ${err.message}` });
      }
      return res.status(200).json({ resultMessage: "Instructors are successfully fetched.", instructors: data });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ resultMessage: `An unexpected server error occurred. Err: ${err.message}` });
  }
};