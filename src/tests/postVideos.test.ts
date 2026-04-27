import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { sequelize } from '../db.js';
import { Video } from '../models/Video.js';
import fs from 'fs';
import path from 'path';

describe('Post Videos routes', () => {
  let token: string;
  let id_post: number;

  beforeAll(() => {
    // ensure /videos exists with dummy files
    const dir = path.join(
      process.cwd(),
      'videos',
    );

    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    const files = fs.readdirSync(dir);
    if (files.length === 0) {
      fs.writeFileSync(
        path.join(dir, '1.mp4'),
        'test',
      );
      fs.writeFileSync(
        path.join(dir, '2.mp4'),
        'test',
      );
    }
  });

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    const register = await request(app)
      .post('/auth/register')
      .send({
        login: 'video_user',
        password: '123456',
        repeat_password: '123456',
        email: 'video@test.com',
      });

    token = register.body.token;

    const post = await request(app)
      .post('/post/createPost')
      .send({
        token,
        content: 'Post with videos',
      });

    id_post = post.body.id_post;
  });

  /* =========================
     ADD VIDEO
  ========================= */

  it('should add videos with increasing positions', async () => {
    await request(app)
      .post('/post/addVideo')
      .send({ token, id_post });

    await request(app)
      .post('/post/addVideo')
      .send({ token, id_post });

    const videos = await Video.findAll({
      where: { id_post },
    });

    const positions = videos.map((v) =>
      v.getDataValue('position'),
    );

    expect(positions).toContain(0);
    expect(positions).toContain(1);
  });

  it('should fail addVideo with invalid token', async () => {
    const res = await request(app)
      .post('/post/addVideo')
      .send({
        token: 'fake',
        id_post,
      });

    expect(res.status).toBe(400);
  });

  /* =========================
     EDIT VIDEO
  ========================= */

  it('should edit video path', async () => {
    const add = await request(app)
      .post('/post/addVideo')
      .send({ token, id_post });

    const id_video = add.body.id_video;

    const res = await request(app)
      .post('/post/editVideo')
      .send({
        token,
        id_post,
        id_video,
        new_path: '/videos/custom.mp4',
      });

    expect(res.status).toBe(200);

    const video = await Video.findByPk(id_video);
    expect(video?.getDataValue('path')).toBe(
      '/videos/custom.mp4',
    );
  });

  it('should change video position and move existing one to -1', async () => {
    const v1 = await request(app)
      .post('/post/addVideo')
      .send({ token, id_post });

    const v2 = await request(app)
      .post('/post/addVideo')
      .send({ token, id_post });

    await request(app)
      .post('/post/editVideo')
      .send({
        token,
        id_post,
        id_video: v2.body.id_video,
        new_position: 0,
      });

    const videos = await Video.findAll({
      where: { id_post },
    });

    const v1Db = videos.find(
      (v) =>
        v.getDataValue('id_video') ===
        v1.body.id_video,
    );
    const v2Db = videos.find(
      (v) =>
        v.getDataValue('id_video') ===
        v2.body.id_video,
    );

    expect(v2Db?.getDataValue('position')).toBe(
      0,
    );
    expect(v1Db?.getDataValue('position')).toBe(
      -1,
    );
  });

  it('should fail editVideo if not owner', async () => {
    const add = await request(app)
      .post('/post/addVideo')
      .send({ token, id_post });

    const register2 = await request(app)
      .post('/auth/register')
      .send({
        login: 'other_user',
        password: '123456',
        repeat_password: '123456',
        email: 'other@test.com',
      });

    const res = await request(app)
      .post('/post/editVideo')
      .send({
        token: register2.body.token,
        id_post,
        id_video: add.body.id_video,
        new_path: 'hack.mp4',
      });

    expect(res.status).toBe(403);
  });

  /* =========================
     DELETE VIDEO
  ========================= */

  it('should delete video and shift positions', async () => {
    const v1 = await request(app)
      .post('/post/addVideo')
      .send({ token, id_post });

    const v2 = await request(app)
      .post('/post/addVideo')
      .send({ token, id_post });

    const v3 = await request(app)
      .post('/post/addVideo')
      .send({ token, id_post });

    // delete middle
    await request(app)
      .delete('/post/deleteVideo')
      .send({
        token,
        id_post,
        id_video: v2.body.id_video,
      });

    const videos = await Video.findAll({
      where: { id_post },
      order: [['position', 'ASC']],
    });

    const positions = videos.map((v) =>
      v.getDataValue('position'),
    );

    expect(positions).toEqual([0, 1]);
  });

  it('should fail deleteVideo with invalid token', async () => {
    const v = await request(app)
      .post('/post/addVideo')
      .send({ token, id_post });

    const res = await request(app)
      .delete('/post/deleteVideo')
      .send({
        token: 'fake',
        id_post,
        id_video: v.body.id_video,
      });

    expect(res.status).toBe(400);
  });

  it('should fail deleteVideo if video not linked to post', async () => {
    const res = await request(app)
      .delete('/post/deleteVideo')
      .send({
        token,
        id_post,
        id_video: 999,
      });

    expect(res.status).toBe(400);
  });
});
