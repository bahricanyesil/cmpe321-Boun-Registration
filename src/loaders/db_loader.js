import mysql from 'mysql';
import { dbName, dbPort, host, password, user } from '../config/index.js';

const dbConfig = {
  host: host,
  user: user,
  password: password,
  port: dbPort,
  database: dbName,
};

const departmentTableQuery = `CREATE TABLE IF NOT EXISTS Departments (
  department_ID CHAR(200), 
  name CHAR(200),
  PRIMARY KEY (department_ID),
  UNIQUE (name)
);`;

const studentTableQuery = `CREATE TABLE IF NOT EXISTS Students (
  student_ID CHAR(200) NOT NULL,
  username CHAR(200),
  password CHAR(200),
  name CHAR(200),
  surname CHAR(200),
  email CHAR(200),
  completed_credits INTEGER DEFAULT 0,
  gpa REAL,
  department_ID CHAR(200) NOT NULL,
  PRIMARY KEY(username),
  FOREIGN KEY(department_ID) REFERENCES Departments(department_ID)
  ON DELETE CASCADE  
  ON UPDATE CASCADE,
  UNIQUE(student_ID)
);`;

const instructorsTableQuery = `CREATE TABLE IF NOT EXISTS Instructors (
  username CHAR(200),
  password CHAR(200),
  name CHAR(200),
  surname CHAR(200),
  email CHAR(200),
  department_ID CHAR(200) NOT NULL,
  title CHAR(200), 
  PRIMARY KEY (username), 
  FOREIGN KEY (department_ID) REFERENCES Departments(department_ID)
  ON DELETE CASCADE  
  ON UPDATE CASCADE
);`;

const classroomsTableQuery = `CREATE TABLE IF NOT EXISTS Classrooms (
  classroom_ID CHAR(200),
  campus CHAR(200),
  classroom_capacity INTEGER,
  PRIMARY KEY (classroom_ID)
);`;

const coursesTableQuery = `CREATE TABLE IF NOT EXISTS Courses (
  course_ID CHAR(200),
  name CHAR(200),
  credits INTEGER,
  quota INTEGER,
  instructor_username CHAR(200) NOT NULL,
  classroom_ID CHAR(200) NOT NULL,
  time_slot INTEGER NOT NULL,
  department_ID CHAR(200) NOT NULL,
  PRIMARY KEY(course_ID),
  FOREIGN KEY(instructor_username) REFERENCES Instructors(username)
  ON DELETE CASCADE
  ON UPDATE CASCADE,
  FOREIGN KEY (department_ID) REFERENCES Departments(department_ID)
  ON DELETE CASCADE  
  ON UPDATE CASCADE,
  FOREIGN KEY(classroom_ID) REFERENCES Classrooms(classroom_ID)
  ON DELETE CASCADE
  ON UPDATE CASCADE,
  UNIQUE(classroom_ID, time_slot),
  CONSTRAINT time_slot_check CHECK(1 <= time_slot AND  time_slot <= 10)
);`;

const gradesTableQuery = `CREATE TABLE IF NOT EXISTS Grades (
  student_ID CHAR(200),
  course_ID CHAR(200),
  grade REAL,
  PRIMARY KEY (student_ID, course_ID),
  FOREIGN KEY (student_ID) REFERENCES Students(student_ID)
  ON DELETE CASCADE
  ON UPDATE CASCADE,
  FOREIGN KEY (course_ID) REFERENCES Courses(course_ID)
  ON DELETE CASCADE
  ON UPDATE CASCADE
);`;

const enrollmentTableQuery = `CREATE TABLE IF NOT EXISTS Enrollment (
  student_ID CHAR(200),
  course_ID CHAR(200), 
  PRIMARY KEY (student_ID, course_ID), 
  FOREIGN KEY (student_ID) REFERENCES Students(student_ID)
  ON DELETE CASCADE
  ON UPDATE CASCADE,
  FOREIGN KEY (course_ID) REFERENCES Courses(course_ID)
  ON DELETE CASCADE
  ON UPDATE CASCADE
);`;

const prerequisitesTableQuery = `CREATE TABLE IF NOT EXISTS Prerequisites (
  course_ID CHAR(200), 
  prerequisite_ID CHAR(200),
  PRIMARY KEY (course_ID, prerequisite_ID),
  FOREIGN KEY (course_ID) REFERENCES Courses(course_ID)
  ON DELETE CASCADE,
  FOREIGN KEY (prerequisite_ID) REFERENCES Courses(course_ID)
  ON DELETE CASCADE,
  CONSTRAINT precourse_name_control CHECK (STRCMP(prerequisite_ID, course_ID) = -1)
);`;

const databaseManagerTableQuery = `CREATE TABLE IF NOT EXISTS DatabaseManager (
  username CHAR(200),
  password CHAR(200), 
  PRIMARY KEY (username)
);`;

const filterProcedure = `CREATE PROCEDURE IF NOT EXISTS
filterCourses(IN campus VARCHAR(200), IN department_ID VARCHAR(200), IN min_credits INTEGER, IN max_credits INTEGER)
BEGIN
	SELECT * FROM Courses
  INNER JOIN Classrooms
  ON Classrooms.classroom_ID = Courses.classroom_ID AND Classrooms.campus = campus
  WHERE Courses.department_ID = department_ID AND Courses.credits BETWEEN min_credits AND max_credits;
END;`;

const instructorTitleCheckTrigger = `
  CREATE TRIGGER IF NOT EXISTS instructorTitleCheck BEFORE INSERT ON Instructors
  FOR EACH ROW
  BEGIN
      IF (NEW.title != "Assistant Professor") AND (NEW.title != "Associate Professor") AND (NEW.title != "Professor") THEN 
          SIGNAL SQLSTATE '50001' SET MESSAGE_TEXT = 'Title is not valid!';
      END IF;
  END;`;

const isPassedBeforeTrigger = `
CREATE TRIGGER IF NOT EXISTS isPassedBefore BEFORE INSERT ON Enrollment
FOR EACH ROW
BEGIN
    IF(EXISTS(SELECT Grades.student_ID, Grades.Course_ID FROM Grades WHERE Grades.student_ID=NEW.student_ID AND Grades.course_ID=NEW.course_ID)) THEN
        SIGNAL SQLSTATE '50001' SET MESSAGE_TEXT = 'Course is passed already';
    END IF;
END;`;

const arePrerequisitesPassedTrigger = `
CREATE TRIGGER IF NOT EXISTS arePrerequisitesPassed BEFORE INSERT ON Enrollment
FOR EACH ROW
BEGIN
    IF(EXISTS(SELECT Prerequisites.prerequisite_ID FROM Prerequisites WHERE Prerequisites.course_ID=NEW.course_ID AND Prerequisites.prerequisite_ID NOT IN 
    (SELECT Grades.course_ID FROM Grades WHERE Grades.student_ID=NEW.student_ID))) THEN
        SIGNAL SQLSTATE '50001' SET MESSAGE_TEXT = 'Not all prerequisites are passed';
    END IF;
END;`;

const isCourseFullTrigger = `
CREATE TRIGGER IF NOT EXISTS isCourseFull BEFORE INSERT ON Enrollment
FOR EACH ROW
BEGIN
    IF((SELECT count(Enrollment.student_ID) FROM Enrollment WHERE Enrollment.course_ID=NEW.course_ID) >= (SELECT Courses.quota FROM Courses WHERE Courses.course_ID=NEW.course_ID)) THEN
        SIGNAL SQLSTATE '50001' SET MESSAGE_TEXT = 'Quota is reached for this course';
    END IF;
END; `;

const quotaVCapacityTrigger = `
CREATE TRIGGER IF NOT EXISTS quotaVCapacity BEFORE INSERT ON Courses
FOR EACH ROW
BEGIN
    IF(NEW.quota > (SELECT Classrooms.classroom_capacity FROM Classrooms WHERE Classrooms.classroom_ID=NEW.classroom_ID)) THEN
        SIGNAL SQLSTATE '50001' SET MESSAGE_TEXT = 'Quota cannot exceed capacity';
    END IF;
END;`;

const instructorDepartmentMatchTrigger = `
CREATE TRIGGER IF NOT EXISTS instructorDepartmentMatch BEFORE INSERT ON Courses
FOR EACH ROW
BEGIN
  IF(NEW.department_ID!=(SELECT Departments.department_ID 
      FROM Departments 
      INNER JOIN Instructors ON Departments.department_ID=Instructors.department_ID 
      WHERE Instructors.username=NEW.instructor_username)) THEN
      SIGNAL SQLSTATE '50001' SET MESSAGE_TEXT = 'Department of course must match with the department of its instructor.';
  END IF;
END;`;

const increaseCreditsTrigger = `
CREATE TRIGGER IF NOT EXISTS increaseCredits AFTER INSERT ON Grades
FOR EACH ROW
BEGIN
    UPDATE Students SET completed_credits = completed_credits + (SELECT Courses.credits FROM Courses WHERE course_ID=NEW.course_ID) WHERE student_ID=NEW.student_ID;
END;`;

const updateGPATrigger = `
CREATE TRIGGER IF NOT EXISTS updateGPA AFTER INSERT ON Grades
FOR EACH ROW
BEGIN
    UPDATE Students SET GPA = (SELECT SUM(Grades.grade * Courses.credits) AS total FROM Grades INNER JOIN Courses ON Grades.course_ID=Courses.course_ID WHERE NEW.student_ID=Grades.student_ID)/(completed_credits) WHERE student_ID=NEW.student_ID;
END;`;

const areFourManagersTrigger = `
CREATE TRIGGER IF NOT EXISTS areFourManagers BEFORE INSERT ON DatabaseManager
FOR EACH ROW BEGIN
    IF ((SELECT COUNT(DatabaseManager.username) FROM DatabaseManager) >= 4) THEN
        SIGNAL SQLSTATE '50001' SET MESSAGE_TEXT = 'Capacity is reached';
    END IF;
END;`;

const isGradingAllowedTrigger = `
CREATE TRIGGER IF NOT EXISTS isGradingAllowed BEFORE INSERT ON Grades
FOR EACH ROW
BEGIN
    IF((SELECT count(Enrollment.course_ID) FROM Enrollment WHERE Enrollment.course_ID=NEW.course_ID AND Enrollment.student_ID=NEW.student_ID) = 0) THEN
        SIGNAL SQLSTATE '50001' SET MESSAGE_TEXT = 'Grading cannot be performed';
    END IF;
END;`;

const isValidTimeSlotTrigger = `
CREATE TRIGGER IF NOT EXISTS isValidTimeSlot BEFORE INSERT ON Courses
FOR EACH ROW
BEGIN
    IF(NEW.time_slot>10 OR NEW.time_slot<1) THEN
        SIGNAL SQLSTATE '50001' SET MESSAGE_TEXT = 'Time slot is not valid, it should be between 1 and 10 (including).';
    END IF;
END;`;

const removeEnrollmentTrigger = `
CREATE TRIGGER IF NOT EXISTS removeEnrollment AFTER INSERT ON Grades
FOR EACH ROW
BEGIN
    DELETE FROM Enrollment WHERE NEW.student_ID=Enrollment.student_ID AND NEW.course_ID=Enrollment.course_ID;
END;`;

export default async () => {
  try {
    const dbConnection = mysql.createConnection(dbConfig);
    dbConnection.query(departmentTableQuery);
    dbConnection.query(studentTableQuery);
    dbConnection.query(instructorsTableQuery);
    dbConnection.query(classroomsTableQuery);
    dbConnection.query(coursesTableQuery);
    dbConnection.query(gradesTableQuery);
    dbConnection.query(enrollmentTableQuery);
    dbConnection.query(prerequisitesTableQuery);
    dbConnection.query(databaseManagerTableQuery);
    dbConnection.query(filterProcedure);
    dbConnection.query(instructorTitleCheckTrigger);
    dbConnection.query(isPassedBeforeTrigger);
    dbConnection.query(arePrerequisitesPassedTrigger);
    dbConnection.query(isCourseFullTrigger);
    dbConnection.query(quotaVCapacityTrigger);
    dbConnection.query(instructorDepartmentMatchTrigger);
    dbConnection.query(increaseCreditsTrigger);
    dbConnection.query(updateGPATrigger);
    dbConnection.query(areFourManagersTrigger);
    dbConnection.query(isGradingAllowedTrigger);
    dbConnection.query(isValidTimeSlotTrigger);
    dbConnection.query(removeEnrollmentTrigger);
    console.log("Successfully connected to the database.");
    return dbConnection;
  } catch (err) {
    console.log("An error occurred while connecting to the database.");
    return err;
  }
};