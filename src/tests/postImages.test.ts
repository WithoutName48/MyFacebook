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
import { Image } from '../models/Image.js';
import fs from 'fs';
import path from 'path';

describe('Post Images routes', () => {
  let token: string;
  let id_post: number;

  beforeAll(() => {
    // ensure images folder exists with fake files
    const dir = path.join(
      process.cwd(),
      'images',
    );
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    // create dummy files if empty
    const files = fs.readdirSync(dir);
    if (files.length === 0) {
      fs.writeFileSync(
        path.join(dir, '1.jpg'),
        'test',
      );
      fs.writeFileSync(
        path.join(dir, '2.jpg'),
        'test',
      );
    }
  });

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    const register = await request(app)
      .post('/auth/register')
      .send({
        login: 'img_user',
        password: '123456',
        repeat_password: '123456',
        email: 'img@test.com',
      });

    token = register.body.token;

    const post = await request(app)
      .post('/post/createPost')
      .send({
        token,
        content: 'Post with images',
      });

    id_post = post.body.id_post;
  });

  /* =========================
     GET IMAGE
  ========================= */

  it('should get image by id', async () => {
    const imageRes = await request(app)
      .post('/post/addImage')
      .send({
        token,
        id_post,
      });

    const id_image = imageRes.body.id_image;

    const res = await request(app)
      .get('/post/getImage')
      .send({
        token,
        id_image,
      });

    expect(res.status).toBe(200);
    expect(res.body.id_image).toBe(id_image);
    expect(res.body.id_post).toBe(id_post);
    expect(res.body.path).toBeDefined();
    expect(res.body.position).toBe(0);
  });

  it('should fail getImage with invalid token', async () => {
    const res = await request(app)
      .get('/post/getImage')
      .send({
        token: 'fake-token',
        id_image: 1,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      'token not valid',
    );
  });

  it('should fail when image does not exist', async () => {
    const res = await request(app)
      .get('/post/getImage')
      .send({
        token,
        id_image: 999999,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      "image with this id doesn't exist",
    );
  });

  /* =========================
     ADD IMAGE
  ========================= */

  it('should add image with increasing positions', async () => {
    await request(app)
      .post('/post/addImage')
      .send({ token, id_post });

    await request(app)
      .post('/post/addImage')
      .send({ token, id_post });

    const images = await Image.findAll({
      where: { id_post },
    });

    const positions = images.map((i) =>
      i.getDataValue('position'),
    );

    expect(positions).toContain(0);
    expect(positions).toContain(1);
  });

  it('should fail addImage with invalid token', async () => {
    const res = await request(app)
      .post('/post/addImage')
      .send({
        token: 'fake',
        id_post,
      });

    expect(res.status).toBe(400);
  });

  /* =========================
     EDIT IMAGE
  ========================= */

  it('should edit image path', async () => {
    const add = await request(app)
      .post('/post/addImage')
      .send({ token, id_post });

    const id_image = add.body.id_image;

    const res = await request(app)
      .post('/post/editImage')
      .send({
        token,
        id_post,
        id_image,
        new_path: '/images/custom.jpg',
      });

    expect(res.status).toBe(200);

    const image = await Image.findByPk(id_image);
    expect(image?.getDataValue('path')).toBe(
      '/images/custom.jpg',
    );
  });

  it('should change image position and move existing one to -1', async () => {
    const img1 = await request(app)
      .post('/post/addImage')
      .send({ token, id_post });

    const img2 = await request(app)
      .post('/post/addImage')
      .send({ token, id_post });

    // move img2 to position 0
    await request(app)
      .post('/post/editImage')
      .send({
        token,
        id_post,
        id_image: img2.body.id_image,
        new_position: 0,
      });

    const images = await Image.findAll({
      where: { id_post },
    });

    const img1Db = images.find(
      (i) =>
        i.getDataValue('id_image') ===
        img1.body.id_image,
    );
    const img2Db = images.find(
      (i) =>
        i.getDataValue('id_image') ===
        img2.body.id_image,
    );

    expect(img2Db?.getDataValue('position')).toBe(
      0,
    );
    expect(img1Db?.getDataValue('position')).toBe(
      -1,
    );
  });

  it('should fail editImage if not owner', async () => {
    const img = await request(app)
      .post('/post/addImage')
      .send({ token, id_post });

    const register2 = await request(app)
      .post('/auth/register')
      .send({
        login: 'other',
        password: '123456',
        repeat_password: '123456',
        email: 'other@test.com',
      });

    const res = await request(app)
      .post('/post/editImage')
      .send({
        token: register2.body.token,
        id_post,
        id_image: img.body.id_image,
        new_path: 'hack.jpg',
      });

    expect(res.status).toBe(403);
  });

  /* =========================
     DELETE IMAGE
  ========================= */

  it('should delete image and shift positions', async () => {
    const img1 = await request(app)
      .post('/post/addImage')
      .send({ token, id_post });

    const img2 = await request(app)
      .post('/post/addImage')
      .send({ token, id_post });

    const img3 = await request(app)
      .post('/post/addImage')
      .send({ token, id_post });

    // delete middle image
    await request(app)
      .delete('/post/deleteImage')
      .send({
        token,
        id_post,
        id_image: img2.body.id_image,
      });

    const images = await Image.findAll({
      where: { id_post },
      order: [['position', 'ASC']],
    });

    const positions = images.map((i) =>
      i.getDataValue('position'),
    );

    expect(positions).toEqual([0, 1]); // shifted correctly
  });

  it('should fail deleteImage with invalid token', async () => {
    const img = await request(app)
      .post('/post/addImage')
      .send({ token, id_post });

    const res = await request(app)
      .delete('/post/deleteImage')
      .send({
        token: 'fake',
        id_post,
        id_image: img.body.id_image,
      });

    expect(res.status).toBe(400);
  });

  it('should fail deleteImage if image not linked to post', async () => {
    const res = await request(app)
      .delete('/post/deleteImage')
      .send({
        token,
        id_post,
        id_image: 999,
      });

    expect(res.status).toBe(400);
  });
});
