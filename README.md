# cmpe321-Boun-Registration

3rd project of the CMPE321 lecture. Simple Boun Registration System

First, you need to make sure that you are in the folder we sent called "2018400012_2018400033". If not, you can do so by simply typing following command to terminal: "cd 2018400012_2018400033"

Then you should enter to the "cmpe321-Boun-Registration" folder to see and execute the back-end code.

To make our file's size less than 2MB, we did not include "node_modules" folder in our project submission. You need to install all necessary modules simply by typing following command to terminal when you are under directory called "2018400012_2018400033/cmpe321-Boun-Registration":
"npm install"

Under the root directory of the back-end project, you should create a file named ".env" to configure the environment variables. Create and go into that file and configure necessary fields. You can directly contact with us to learn the environment variables. We are attaching a sample file content here:

> DB_HOST=localhost

> DB_USER=root

> DB_PASSWORD=secretpassword22-

> DB_PORT=3306

> DB_NAME=cmpe_321

> SECRET_SESSION_KEY=TopSecretSessionKey2022

Then, you need to type following command in terminal to execute this application: "node src/app.js"

Now, the application is running, you can enter "http://localhost:3000" to see that it is working. You can also sent example requests and test the project with some tools like Postman by using this base url.

For implementing back-end operations, we used Node.js. We used "mysql" module for connecting to our mysql database. We wrote all SQL queries, tables, triggers and stored procedures we need and used "mysql" module just to execute those queries. We also implemented necessary APIs and used those APIs with corresponding routings.

In the front-end of our application, we chose to use Flutter Web. We used Flutter widgets and integrated APIs we created in our back-end application to complete our project.
