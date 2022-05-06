import { config } from 'dotenv';
config();

//NOTE: If you are running the project in an instance, you should store these secret keys in its configuration settings.

const { PORT, DB_HOST, DB_USER, DB_PASSWORD, DB_PORT, DB_NAME } = process.env

export const port = PORT || 3000;
export const host = DB_HOST;
export const user = DB_USER;
export const password = DB_PASSWORD;
export const dbPort = DB_PORT;
export const dbName = DB_NAME;
export const prefix = '';