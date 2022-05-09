# cmpe321-Boun-Registration
3rd project of the CMPE321 lecture. Simple Boun Registration System

First, you need to make sure that you are in the folder we sent called "2018400012_2018400033". If not, you can do so by simply typing following command to terminal: "cd 2018400012_2018400033"

To make our file's size less than 2MB, we did not include "node_modules" file in our project submission. You need to install all necessary modules simply by typing following command to terminal when you are under directory called "2018400012_2018400033":
"npm install"

To execute this program, you need to enter to "src" directory. You can do so by typing "cd src" in terminal.

Under this directory, there is a file named ".env". Go into that file and configure necessary fields.

Then, under "src" directory you need to type following command in terminal to execute this application: "node app.js"

Now, the application is running, you can enter "http://localhost:3000" on your browser to reach the UI we designed.


For implementing back-end operations, we used Node.js. We used "mysql" module for connecting our mysql database. We wrote all SQL queries, tables, triggers and stored procedures we need and used "mysql" module just to execute those queries. We also implemented necessary APIs and used those APIs with corresponding routings. 

In the front-end of our application, we chose to use Flutter. We used Flutter widgets and APIs we created in our back-end application to complete our project.
