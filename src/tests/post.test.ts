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
import { User } from '../models/User.js';
import { UserToken } from '../models/UserToken.js';
import { Post } from '../models/Post.js';
import { PostReactions } from '../models/PostReactions.js';
import { UserPostsReaction } from '../models/UserPostsReaction.js';

describe('Post routes', () => {
  let token: string;
  let id_post: number;

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    const register = await request(app)
      .post('/auth/register')
      .send({
        login: 'post_user',
        password: '123456',
        repeat_password: '123456',
        email: 'post@test.com',
      });

    token = register.body.token;
  });

  /* =========================
     CREATE POST
  ========================= */

  it('should create a post', async () => {
    const res = await request(app)
      .post('/post/createPost')
      .send({
        token,
        content: 'Hello world',
      });

    expect(res.status).toBe(200);
    expect(res.body.id_post).toBeDefined();

    id_post = res.body.id_post;
  });

  it('should fail createPost with empty content', async () => {
    const res = await request(app)
      .post('/post/createPost')
      .send({
        token,
        content: '',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      'post must have content',
    );
  });

  it('should fail createPost with invalid token', async () => {
    const res = await request(app)
      .post('/post/createPost')
      .send({
        token: 'fake',
        content: 'Hello',
      });

    expect(res.status).toBe(400);
  });

  /* =========================
     GET POST
  ========================= */

  it('should get post data', async () => {
    const create = await request(app)
      .post('/post/createPost')
      .send({ token, content: 'Test post' });

    const res = await request(app)
      .get('/post/getPost')
      .send({
        token,
        id_post: create.body.id_post,
      });

    expect(res.status).toBe(200);
    expect(res.body.content).toBe('Test post');
    expect(Array.isArray(res.body.images)).toBe(
      true,
    );
    expect(Array.isArray(res.body.videos)).toBe(
      true,
    );
    expect(
      Array.isArray(res.body.post_reactions),
    ).toBe(true);
  });

  it('should fail getPost with invalid token', async () => {
    const res = await request(app)
      .get('/post/getPost')
      .send({
        token: 'fake',
        id_post: 1,
      });

    expect(res.status).toBe(400);
  });

  it('should fail getPost with non-existing post', async () => {
    const res = await request(app)
      .get('/post/getPost')
      .send({
        token,
        id_post: 999,
      });

    expect(res.status).toBe(400);
  });

  /* =========================
     EDIT POST
  ========================= */

  it('should edit post content', async () => {
    const create = await request(app)
      .post('/post/createPost')
      .send({ token, content: 'Old content' });

    const res = await request(app)
      .post('/post/editPostContent')
      .send({
        token,
        id_post: create.body.id_post,
        new_content: 'New content',
      });

    expect(res.status).toBe(200);

    const post = await Post.findByPk(
      create.body.id_post,
    );
    expect(post?.getDataValue('content')).toBe(
      'New content',
    );
  });

  it('should fail edit if not owner', async () => {
    // create post with first user
    const create = await request(app)
      .post('/post/createPost')
      .send({ token, content: 'Post' });

    // register second user
    const register2 = await request(app)
      .post('/auth/register')
      .send({
        login: 'user2',
        password: '123456',
        repeat_password: '123456',
        email: 'user2@test.com',
      });

    const res = await request(app)
      .post('/post/editPostContent')
      .send({
        token: register2.body.token,
        id_post: create.body.id_post,
        new_content: 'Hacked',
      });

    expect(res.status).toBe(403);
  });

  /* =========================
     DELETE POST
  ========================= */

  it('should delete post', async () => {
    const create = await request(app)
      .post('/post/createPost')
      .send({ token, content: 'To delete' });

    const res = await request(app)
      .delete('/post/deletePost')
      .send({
        token,
        id_post: create.body.id_post,
      });

    expect(res.status).toBe(200);

    const post = await Post.findByPk(
      create.body.id_post,
    );
    expect(post).toBeNull();
  });

  it('should fail delete if not owner', async () => {
    const create = await request(app)
      .post('/post/createPost')
      .send({ token, content: 'Post' });

    const register2 = await request(app)
      .post('/auth/register')
      .send({
        login: 'user3',
        password: '123456',
        repeat_password: '123456',
        email: 'user3@test.com',
      });

    const res = await request(app)
      .delete('/post/deletePost')
      .send({
        token: register2.body.token,
        id_post: create.body.id_post,
      });

    expect(res.status).toBe(403);
  });

  it('should fail delete with non-existing post', async () => {
    const res = await request(app)
      .delete('/post/deletePost')
      .send({
        token,
        id_post: 999,
      });

    expect(res.status).toBe(400);
  });
});

describe('Post reactions', () => {
  let token: string;
  let id_post: number;

  beforeEach(async () => {
    await sequelize.sync({ force: true });
    await sequelize.truncate({ cascade: true });

    const register = await request(app)
      .post('/auth/register')
      .send({
        login: 'react_user',
        password: '123456',
        repeat_password: '123456',
        email: 'react@test.com',
      });

    token = register.body.token;

    const post = await request(app)
      .post('/post/createPost')
      .send({
        token,
        content: 'Reaction post',
      });

    id_post = post.body.id_post;
  });

  /* =========================
     ADD REACTION
  ========================= */

  it('should add reaction', async () => {
    const res = await request(app)
      .post('/post/changePostReactions')
      .send({
        token,
        id_post,
        reaction: 'like',
      });

    expect(res.status).toBe(200);

    const postReactions =
      await PostReactions.findByPk(id_post);
    expect(
      postReactions?.getDataValue('like_count'),
    ).toBe(1);

    const userReaction =
      await UserPostsReaction.findOne({
        where: { id_post },
      });

    expect(
      userReaction?.getDataValue('like'),
    ).toBe(true);
  });

  /* =========================
     CHANGE REACTION
  ========================= */

  it('should change reaction from like to love', async () => {
    await request(app)
      .post('/post/changePostReactions')
      .send({ token, id_post, reaction: 'like' });

    await request(app)
      .post('/post/changePostReactions')
      .send({ token, id_post, reaction: 'love' });

    const postReactions =
      await PostReactions.findByPk(id_post);

    expect(
      postReactions?.getDataValue('like_count'),
    ).toBe(0);
    expect(
      postReactions?.getDataValue('love_count'),
    ).toBe(1);

    const userReaction =
      await UserPostsReaction.findOne({
        where: { id_post },
      });

    expect(
      userReaction?.getDataValue('like'),
    ).toBe(false);
    expect(
      userReaction?.getDataValue('love'),
    ).toBe(true);
  });

  /* =========================
     REMOVE REACTION
  ========================= */

  it('should remove reaction when clicking same again', async () => {
    await request(app)
      .post('/post/changePostReactions')
      .send({ token, id_post, reaction: 'haha' });

    const res = await request(app)
      .post('/post/changePostReactions')
      .send({ token, id_post, reaction: 'haha' });

    expect(res.status).toBe(200);

    const postReactions =
      await PostReactions.findByPk(id_post);
    expect(
      postReactions?.getDataValue('haha_count'),
    ).toBe(0);

    const userReaction =
      await UserPostsReaction.findOne({
        where: { id_post },
      });

    expect(
      userReaction?.getDataValue('haha'),
    ).toBe(false);
  });

  /* =========================
     INVALID REACTION
  ========================= */

  it('should fail on invalid reaction type', async () => {
    const res = await request(app)
      .post('/post/changePostReactions')
      .send({
        token,
        id_post,
        reaction: 'invalid',
      });

    expect(res.status).toBe(400);
  });

  /* =========================
     INVALID TOKEN
  ========================= */

  it('should fail with invalid token', async () => {
    const res = await request(app)
      .post('/post/changePostReactions')
      .send({
        token: 'fake',
        id_post,
        reaction: 'like',
      });

    expect(res.status).toBe(400);
  });

  /* =========================
     MULTIPLE USERS
  ========================= */

  it('should handle multiple users reacting', async () => {
    // first user
    await request(app)
      .post('/post/changePostReactions')
      .send({ token, id_post, reaction: 'like' });

    // second user
    const register2 = await request(app)
      .post('/auth/register')
      .send({
        login: 'react_user2',
        password: '123456',
        repeat_password: '123456',
        email: 'react2@test.com',
      });

    await request(app)
      .post('/post/changePostReactions')
      .send({
        token: register2.body.token,
        id_post,
        reaction: 'like',
      });

    const postReactions =
      await PostReactions.findByPk(id_post);

    expect(
      postReactions?.getDataValue('like_count'),
    ).toBe(2);
  });
});
