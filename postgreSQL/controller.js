import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
// Path
import { join } from 'path';
import * as url from 'url';
// Import routers
import authRouter from './routes/auth.js';
import eventRouter from './routes/events.js';
import userRouter from './routes/users.js';
import pool from './utils/postgresqlClient.js';

const app = express();
app.disable('x-powered-by');

// Add middleware
app.use(
  cors({
    origin: '*',
  })
);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set the port and URl
const PORT = process.env.PORT;
const HTTP_URL = process.env.HTTP_URL;

// Create path to HTML
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// Start of actions
app.use('/', authRouter);
app.use('/events', eventRouter);
app.use('/users', userRouter);

app.get('/tables', async (req, res) => {
  try {
    // Use the pool imported from db.js to query the database
    const result = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Failed to retrieve table list' });
  }
});

// Start our API server
app.listen(PORT, () => {
  console.log(
    `\nServer is running on ${HTTP_URL}${PORT} \n This no longer consumes souls\n`
  );
});
