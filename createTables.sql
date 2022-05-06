CREATE TABLE IF NOT EXISTS Departments (
department_ID CHAR(20), 
name CHAR(20),
PRIMARY KEY (department_ID),
UNIQUE (name));

CREATE TABLE IF NOT EXISTS Students (
student_ID CHAR(20),
username CHAR(20),
password CHAR(20),
name CHAR(20),
surname CHAR(20),
email CHAR(20), 
department_ID CHAR(20) NOT NULL,
completed_credits INTEGER,
GPA REAL, 
PRIMARY KEY (username), 
FOREIGN KEY (department_ID) REFERENCES Departments(department_ID)
ON DELETE CASCADE  
ON UPDATE CASCADE, 
UNIQUE (student_ID));

CREATE TABLE IF NOT EXISTS Instructors (
username CHAR(20),
password CHAR(20),
name CHAR(20),
surname CHAR(20),
email CHAR(20),
department_ID CHAR(20) NOT NULL,
title CHAR(25), 
PRIMARY KEY (username), 
FOREIGN KEY (department_ID) REFERENCES Departments(department_ID)
ON DELETE CASCADE  
ON UPDATE CASCADE);

DELIMITER //
CREATE TRIGGER instructorAdd BEFORE INSERT ON Instructors
FOR EACH ROW
BEGIN
	IF (NEW.title != "Assistant Professor") AND (NEW.title != "Associate Professor") AND (NEW.title != "Professor ") THEN 
		SIGNAL SQLSTATE '50001' SET MESSAGE_TEXT = 'Title is not valid!';
	END IF;
END;
DELIMITER ;

CREATE TABLE IF NOT EXISTS Classrooms (
classroom_ID CHAR(20), 
campus CHAR(20),
classroom_capacity INTEGER, 
PRIMARY KEY (classroom_ID));

CREATE TABLE IF NOT EXISTS Courses (
course_ID CHAR(20),
name CHAR(20),
credits INTEGER,
quota INTEGER, 
instructor_username CHAR(20) NOT NULL, 
classroom_ID CHAR(20) NOT NULL, 
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
student_ID CHAR(20) NOT NULL,
course_ID CHAR(20) NOT NULL,
grade REAL NOT NULL,
PRIMARY KEY (student_ID, course_ID),
FOREIGN KEY (student_ID) REFERENCES Students(student_ID)
ON DELETE CASCADE
ON UPDATE CASCADE,
FOREIGN KEY (course_ID) REFERENCES Courses(course_ID)
ON DELETE CASCADE
ON UPDATE CASCADE);

DELIMITER //
CREATE TRIGGER increaseCredits AFTER INSERT ON Grades
FOR EACH ROW
BEGIN
	UPDATE Students SET completed_credits = (SELECT Students.completed_credits FROM Students WHERE Students.student_ID = NEW.student_ID) + (SELECT Courses.credits FROM Courses WHERE Courses.course_ID = NEW.course_ID);
END
DELIMITER ;


DELIMITER //
CREATE TRIGGER updateGPA AFTER INSERT ON Grades
FOR EACH ROW FOLLOWS increaseCredits
BEGIN
	UPDATE Students SET GPA = (SELECT SUM(Courses.credits * Grades.grade) FROM Grades
    INNER JOIN Courses ON Grades.course_ID=NEW.course_ID
    WHERE Courses.student_ID=NEW.student_ID) / (SELECT Students.completed_credits FROM STUDENTS WHERE Students.student_ID=NEW.student_ID);
END
DELIMITER ;

CREATE TABLE IF NOT EXISTS Enrollment (
student_ID CHAR(20) NOT NULL,
course_ID CHAR(20) NOT NULL, 
PRIMARY KEY (student_ID, course_ID), 
FOREIGN KEY (student_ID) REFERENCES Students(student_ID)
ON DELETE CASCADE
ON UPDATE CASCADE,
FOREIGN KEY (course_ID) REFERENCES Courses(course_ID)
ON DELETE CASCADE
ON UPDATE CASCADE);

CREATE TABLE IF NOT EXISTS Prerequisites (
course_ID CHAR(20) NOT NULL, 
prerequisite_ID CHAR(20) NOT NULL,
PRIMARY KEY (course_ID, prerequisite_ID),
FOREIGN KEY (course_ID) REFERENCES Courses(course_ID)
ON DELETE CASCADE,
FOREIGN KEY (prerequisite_ID) REFERENCES Courses(course_ID)
ON DELETE CASCADE,
CONSTRAINT precourse_name_control CHECK (STRCMP(prerequisite_ID, course_ID) = -1));

CREATE TABLE IF NOT EXISTS DatabaseManager (
username CHAR(20), 
password CHAR(20), 
PRIMARY KEY (username));


DELIMITER //
CREATE TRIGGER addDatabaseManager BEFORE INSERT ON DatabaseManager
FOR EACH ROW 
BEGIN
	IF ((SELECT COUNT(DatabaseManager.username) FROM DatabaseManager) >= 4)
		SIGNAL SQLSTATE '50001' SET MESSAGE_TEXT = 'Capacity is reached';
	END IF;
END
DELIMITER ;





    