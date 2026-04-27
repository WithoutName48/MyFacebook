import {
  describe,
  it,
  expect,
  beforeEach,
} from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { sequelize } from '../db.js';
import { User } from '../models/User.js';
import { Post } from '../models/Post.js';
import { UserPersonalData } from '../models/UserPersonalData.js';

describe('Search routes', () => {
  let token: string;
  let id_user: number;

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    const register = await request(app)
      .post('/auth/register')
      .send({
        login: 'search_user',
        password: '123456',
        repeat_password: '123456',
        email: 'search@test.com',
      });

    token = register.body.token;

    const user = await User.findOne({
      where: { login: 'search_user' },
    });

    id_user = user!.getDataValue('id_user');
  });

  /* =========================
     POSTS FEED
  ========================= */

  it('should return random posts (max 30)', async () => {
    // create 60 posts
    for (let i = 0; i < 60; i++) {
      await request(app)
        .post('/post/createPost')
        .send({
          token,
          content: `post ${i}`,
        });
    }

    const res = await request(app)
      .get('/search/postsFeed')
      .send({ token });

    expect(res.status).toBe(200);
    expect(res.body.length).toBeLessThanOrEqual(
      30,
    );
  });

  it('should fail postsFeed with invalid token', async () => {
    const res = await request(app)
      .get('/search/postsFeed')
      .send({ token: 'fake' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      'token not valid',
    );
  });

  it('should not return user own posts in feed', async () => {
    // create own post
    const ownPost = await request(app)
      .post('/post/createPost')
      .send({
        token,
        content: 'my post',
      });

    // create another user + post
    const reg2 = await request(app)
      .post('/auth/register')
      .send({
        login: 'other',
        password: '123456',
        repeat_password: '123456',
        email: 'other@test.com',
      });

    const otherToken = reg2.body.token;

    const otherPost = await request(app)
      .post('/post/createPost')
      .send({
        token: otherToken,
        content: 'other post',
      });

    const res = await request(app)
      .get('/search/postsFeed')
      .send({ token });

    expect(res.status).toBe(200);

    // should NOT contain own post
    expect(res.body).not.toContain(
      ownPost.body.id_post,
    );

    // should contain other post
    expect(res.body).toContain(
      otherPost.body.id_post,
    );
  });

  /* =========================
     POSTS USER
  ========================= */

  it('should return posts of specific user sorted DESC', async () => {
    // create posts with slight delay for ordering
    await request(app)
      .post('/post/createPost')
      .send({ token, content: 'first' });

    await new Promise((r) => setTimeout(r, 10));

    await request(app)
      .post('/post/createPost')
      .send({ token, content: 'second' });

    const res = await request(app)
      .get('/search/postsUser')
      .send({ token, id_user });

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);

    // check order (second should be first)
    const posts = await Post.findAll({
      where: { id_user },
      order: [['date_created', 'DESC']],
    });

    expect(res.body[0]).toBe(
      posts[0]!.getDataValue('id_post'),
    );
  });

  it('should fail postsUser if user does not exist', async () => {
    const res = await request(app)
      .get('/search/postsUser')
      .send({
        token,
        id_user: 999,
      });

    expect(res.status).toBe(400);
  });

  it('should fail postsUser with invalid token', async () => {
    const res = await request(app)
      .get('/search/postsUser')
      .send({
        token: 'fake',
        id_user,
      });

    expect(res.status).toBe(400);
  });

  /* =========================
     SEARCH
  ========================= */

  it('should return matching users and posts', async () => {
    // add personal data
    await UserPersonalData.create({
      id_user,
      name: 'John',
      surname: 'Doe',
    });

    // create posts
    const post1 = await request(app)
      .post('/post/createPost')
      .send({
        token,
        content: 'hello world',
      });

    const post2 = await request(app)
      .post('/post/createPost')
      .send({
        token,
        content: 'another hello',
      });

    const res = await request(app)
      .get('/search/search')
      .send({
        token,
        input: 'Jo',
      });

    expect(res.status).toBe(200);

    // first elements should include user id
    expect(res.body).toContain(id_user);

    // now search posts
    const resPosts = await request(app)
      .get('/search/search')
      .send({
        token,
        input: 'hello',
      });

    expect(resPosts.body).toContain(
      post1.body.id_post,
    );
    expect(resPosts.body).toContain(
      post2.body.id_post,
    );
  });

  it('should limit users to 10 and posts to 20', async () => {
    // create many users
    for (let i = 0; i < 15; i++) {
      const reg = await request(app)
        .post('/auth/register')
        .send({
          login: `user${i}`,
          password: '123456',
          repeat_password: '123456',
          email: `user${i}@test.com`,
        });

      const user = await User.findOne({
        where: { login: `user${i}` },
      });

      await UserPersonalData.create({
        id_user: user!.getDataValue('id_user'),
        name: 'Test',
        surname: `${i}`,
      });
    }

    // create many posts
    for (let i = 0; i < 30; i++) {
      await request(app)
        .post('/post/createPost')
        .send({
          token,
          content: 'common',
        });
    }

    const res = await request(app)
      .get('/search/search')
      .send({
        token,
        input: 'T',
      });

    expect(res.status).toBe(200);

    // total should be max 30 (10 users + 20 posts)
    expect(res.body.length).toBeLessThanOrEqual(
      30,
    );
  });

  it('should fail search with invalid token', async () => {
    const res = await request(app)
      .get('/search/search')
      .send({
        token: 'fake',
        input: 'test',
      });

    expect(res.status).toBe(400);
  });

  it('should fail search with empty input', async () => {
    const res = await request(app)
      .get('/search/search')
      .send({
        token,
        input: '',
      });

    expect(res.status).toBe(400);
  });
});
