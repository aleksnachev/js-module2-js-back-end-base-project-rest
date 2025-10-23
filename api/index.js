import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import routes from './routes.js';
import { authMiddleware } from './middlewares/authMiddleware.js';

// Setup database
await mongoose.connect('mongodb://localhost:27017', {
    dbName: 'posts-sept-2025',
});

const app = express();

// JSON Parser middleware
app.use(express.json());

// Manually config CORS
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');

//     next();
// });

// Confgi CORS with library
app.use(cors());

app.use(authMiddleware);

app.use(routes);

app.listen(5000, () => console.log('Server is listening on http://localhost:5000...'));
