import express from 'express';
import path from 'path';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import searchRoutes from './routes/searchRoutes.js';

export const app = express();

app.use(express.json());

app.use(
  '/images',
  express.static(
    path.join(process.cwd(), 'images'),
  ),
);
app.use(
  '/videos',
  express.static(
    path.join(process.cwd(), 'videos'),
  ),
);

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/post', postRoutes);
app.use('/post/comments', commentRoutes);
app.use('/search', searchRoutes);
