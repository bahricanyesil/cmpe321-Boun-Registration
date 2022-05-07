import mysql from 'mysql';
import { dbName, dbPort, host, password, user } from '../config/index.js';
import dbLoader from './db_loader.js';
import expressLoader from './express.js';

const dbConfig = {
  host: host,
  user: user,
  password: password,
  port: dbPort
};

export default async (app) => {
  const dbConnection = mysql.createConnection(dbConfig);
  dbConnection.connect();
  dbConnection.query(`CREATE DATABASE IF NOT EXISTS ${dbName};`, (err, res) => {
    if (err) console.log('An error has occurred: ', err)
    else console.log("Successfully connected to the database.");
    return dbLoader();
  });
  expressLoader(app);
}