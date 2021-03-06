CREATE TABLE IF NOT EXISTS Departments (
department_ID CHAR(30), 
name CHAR(30),
PRIMARY KEY (department_ID),
UNIQUE (name));

CREATE TABLE IF NOT EXISTS Students (
student_ID CHAR(30),
username CHAR(30),
password CHAR(50),
name CHAR(30),
surname CHAR(30),
email CHAR(30), 
department_ID CHAR(30) NOT NULL,
completed_credits INTEGER DEFAULT 0,
GPA REAL, 
PRIMARY KEY (username), 
FOREIGN KEY (department_ID) REFERENCES Departments(department_ID)
ON DELETE CASCADE  
ON UPDATE CASCADE, 
UNIQUE (student_ID));

CREATE TABLE IF NOT EXISTS Instructors (
username CHAR(30),
password CHAR(50),
name CHAR(30),
surname CHAR(30),
email CHAR(30),
department_ID CHAR(30) NOT NULL,
title CHAR(30), 
PRIMARY KEY (username), 
FOREIGN KEY (department_ID) REFERENCES Departments(department_ID)
ON DELETE CASCADE  
ON UPDATE CASCADE);

CREATE TABLE IF NOT EXISTS Classrooms (
classroom_ID CHAR(30), 
campus CHAR(30),
classroom_capacity INTEGER, 
PRIMARY KEY (classroom_ID));

CREATE TABLE IF NOT EXISTS Courses (
course_ID CHAR(30),
name CHAR(30),
department_ID CHAR(30),
credits INTEGER,
quota INTEGER, 
instructor_username CHAR(30) NOT NULL, 
classroom_ID CHAR(30) NOT NULL, 
time_slot INTEGER NOT NULL,
PRIMARY KEY (course_ID),
FOREIGN KEY (instructor_username) REFERENCES Instructors(username)
ON DELETE CASCADE
ON UPDATE CASCADE,
FOREIGN KEY (classroom_ID) REFERENCES Classrooms(classroom_ID)
ON DELETE CASCADE
ON UPDATE CASCADE,
UNIQUE (classroom_ID, time_slot),
CONSTRAINT time_slot_check CHECK(1 <= time_slot <= 10));

CREATE TABLE IF NOT EXISTS Grades(
student_ID CHAR(30) NOT NULL,
course_ID CHAR(30) NOT NULL,
grade REAL NOT NULL,
PRIMARY KEY (student_ID, course_ID),
FOREIGN KEY (student_ID) REFERENCES Students(student_ID)
ON DELETE CASCADE
ON UPDATE CASCADE,
FOREIGN KEY (course_ID) REFERENCES Courses(course_ID)
ON DELETE CASCADE
ON UPDATE CASCADE);

CREATE TABLE IF NOT EXISTS Enrollment (
student_ID CHAR(30) NOT NULL,
course_ID CHAR(30) NOT NULL, 
PRIMARY KEY (student_ID, course_ID), 
FOREIGN KEY (student_ID) REFERENCES Students(student_ID)
ON DELETE CASCADE
ON UPDATE CASCADE,
FOREIGN KEY (course_ID) REFERENCES Courses(course_ID)
ON DELETE CASCADE
ON UPDATE CASCADE);

CREATE TABLE IF NOT EXISTS Prerequisites (
course_ID CHAR(30) NOT NULL, 
prerequisite_ID CHAR(30) NOT NULL,
PRIMARY KEY (course_ID, prerequisite_ID),
FOREIGN KEY (course_ID) REFERENCES Courses(course_ID)
ON DELETE CASCADE,
FOREIGN KEY (prerequisite_ID) REFERENCES Courses(course_ID)
ON DELETE CASCADE,
CONSTRAINT precourse_name_control CHECK (STRCMP(prerequisite_ID, course_ID) = -1));

CREATE TABLE IF NOT EXISTS DatabaseManager (
username CHAR(30), 
password CHAR(30), 
PRIMARY KEY (username));

DELIMITER |
CREATE TRIGGER instructorTitleCheck BEFORE INSERT ON Instructors
FOR EACH ROW
BEGIN
	IF (NEW.title != "Assistant Professor") AND (NEW.title != "Associate Professor") AND (NEW.title != "Professor") THEN 
		SIGNAL SQLSTATE '50001' SET MESSAGE_TEXT = 'Title is not valid!';
	END IF;
END;
|
DELIMITER ;

DELIMITER |
CREATE TRIGGER courseEnroll BEFORE INSERT ON Enrollment
FOR EACH ROW
BEGIN
	IF(EXISTS(SELECT Grades.student_ID, Grades.course_ID FROM Grades WHERE Grades.student_ID=NEW.student_ID AND Grades.course_ID=NEW.course_ID)) THEN
		SIGNAL SQLSTATE '50001' SET MESSAGE_TEXT = 'Course is passed already';
    END IF;
END; 
|
DELIMITER ;


DELIMITER |
CREATE TRIGGER capacityEnough BEFORE INSERT ON Courses
FOR EACH ROW
BEGIN
	IF(NEW.quota > (SELECT Classrooms.classroom_capacity FROM Classrooms WHERE Classrooms.classroom_ID=NEW.classroom_ID)) THEN
		SIGNAL SQLSTATE '50001' SET MESSAGE_TEXT = 'Quota cannot exceed capacity';
	END IF;
END; 
|
DELIMITER ;

DELIMITER |
CREATE TRIGGER instructorDepartmentMatch BEFORE INSERT ON Courses
FOR EACH ROW
BEGIN
	IF(NEW.department_ID!=(SELECT Departments.department_ID 
							FROM Departments 
                            INNER JOIN Instructors ON Departments.department_ID=Instructors.department_ID 
                            WHERE Instructors.username=NEW.instructor_username)) THEN
		SIGNAL SQLSTATE '50001' SET MESSAGE_TEXT = 'Course\'s department must match with its instructor\'s';
	END IF;
END; 
|
DELIMITER ;

DELIMITER |
CREATE TRIGGER increaseCredits AFTER INSERT ON Grades
FOR EACH ROW
BEGIN
	UPDATE Students SET completed_credits = completed_credits + (SELECT Courses.credits FROM Courses WHERE course_ID=NEW.course_ID) WHERE student_ID=NEW.student_ID;
END;
|
DELIMITER ;

DELIMITER |
CREATE TRIGGER updateGPA AFTER INSERT ON Grades
FOR EACH ROW
BEGIN
	UPDATE Students SET GPA = (SELECT SUM(Grades.grade * Courses.credits) AS total FROM Grades INNER JOIN Courses ON Grades.course_ID=Courses.course_ID WHERE NEW.student_ID=Grades.student_ID)/(completed_credits) WHERE student_ID=NEW.student_ID;
END;
|
DELIMITER ;

DELIMITER |
CREATE TRIGGER addDatabaseManager BEFORE INSERT ON DatabaseManager
FOR EACH ROW BEGIN
	IF ((SELECT COUNT(DatabaseManager.username) FROM DatabaseManager) >= 4) THEN
		SIGNAL SQLSTATE '50001' SET MESSAGE_TEXT = 'Capacity is reached';
	END IF;
END;
|
DELIMITER ;    