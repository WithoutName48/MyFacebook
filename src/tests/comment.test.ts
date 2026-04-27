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
import { Comment } from '../models/Comment.js';
import { CommentReactions } from '../models/CommentReactions.js';
import { UserCommentsReaction } from '../models/UserCommentsReaction.js';

describe('Comments', () => {
  let token: string;
  let id_post: number;

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    const register = await request(app)
      .post('/auth/register')
      .send({
        login: 'comment_user',
        password: '123456',
        repeat_password: '123456',
        email: 'comment@test.com',
      });

    token = register.body.token;

    const post = await request(app)
      .post('/post/createPost')
      .send({
        token,
        content: 'Post for comments',
      });

    id_post = post.body.id_post;
  });

  /* =========================
     CREATE COMMENT
  ========================= */

  it('should create comment for post', async () => {
    const res = await request(app)
      .post('/post/comments/createComment')
      .send({
        token,
        id_post,
        content: 'hello',
      });

    expect(res.status).toBe(200);
    expect(res.body.id_comment).toBeDefined();

    const comment = await Comment.findByPk(
      res.body.id_comment,
    );
    expect(comment).toBeTruthy();
  });

  it('should create reply to comment without id_post', async () => {
    const parent = await request(app)
      .post('/post/comments/createComment')
      .send({
        token,
        id_post,
        content: 'parent',
      });

    const res = await request(app)
      .post('/post/comments/createComment')
      .send({
        token,
        id_comment_replied_to:
          parent.body.id_comment,
        content: 'child',
      });

    expect(res.status).toBe(200);

    const reply = await Comment.findByPk(
      res.body.id_comment,
    );

    expect(
      reply?.getDataValue(
        'id_comment_replied_to',
      ),
    ).toBe(parent.body.id_comment);

    expect(
      reply?.getDataValue('id_post'),
    ).toBeNull();
  });

  it('should fail when both id_post and id_comment_replied_to provided', async () => {
    const res = await request(app)
      .post('/post/comments/createComment')
      .send({
        token,
        id_post,
        id_comment_replied_to: 1,
        content: 'invalid',
      });

    expect(res.status).toBe(400);
  });

  it('should fail when no id_post or id_comment_replied_to', async () => {
    const res = await request(app)
      .post('/post/comments/createComment')
      .send({
        token,
        content: 'invalid',
      });

    expect(res.status).toBe(400);
  });

  it('should fail with invalid token', async () => {
    const res = await request(app)
      .post('/post/comments/createComment')
      .send({
        token: 'fake',
        id_post,
        content: 'fail',
      });

    expect(res.status).toBe(400);
  });

  it('should fail if parent comment does not exist', async () => {
    const res = await request(app)
      .post('/post/comments/createComment')
      .send({
        token,
        id_comment_replied_to: 999,
        content: 'child',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('parent');
  });

  it('should fail if content is empty', async () => {
    const res = await request(app)
      .post('/post/comments/createComment')
      .send({
        token,
        id_post,
        content: '',
      });

    expect(res.status).toBe(400);
  });

  /* =========================
     GET COMMENTS
  ========================= */

  it('should return only root comments for post', async () => {
    const parent = await request(app)
      .post('/post/comments/createComment')
      .send({
        token,
        id_post,
        content: 'parent',
      });

    await request(app)
      .post('/post/comments/createComment')
      .send({
        token,
        id_comment_replied_to:
          parent.body.id_comment,
        content: 'child',
      });

    const res = await request(app)
      .get('/post/comments/getComments')
      .send({ token, id_post });

    expect(res.status).toBe(200);

    expect(res.body.comments.length).toBe(1);
  });

  it('should create reply even if parent has no id_post', async () => {
    const parent = await request(app)
      .post('/post/comments/createComment')
      .send({
        token,
        id_post,
        content: 'parent',
      });

    const reply = await request(app)
      .post('/post/comments/createComment')
      .send({
        token,
        id_comment_replied_to:
          parent.body.id_comment,
        content: 'child',
      });

    expect(reply.status).toBe(200);

    const replyDb = await Comment.findByPk(
      reply.body.id_comment,
    );

    expect(replyDb).toBeTruthy();
    expect(
      replyDb?.getDataValue('id_post'),
    ).toBeNull();
  });

  it('should not include replies in getComments result', async () => {
    const parent = await request(app)
      .post('/post/comments/createComment')
      .send({
        token,
        id_post,
        content: 'parent',
      });

    await request(app)
      .post('/post/comments/createComment')
      .send({
        token,
        id_comment_replied_to:
          parent.body.id_comment,
        content: 'child1',
      });

    await request(app)
      .post('/post/comments/createComment')
      .send({
        token,
        id_comment_replied_to:
          parent.body.id_comment,
        content: 'child2',
      });

    const res = await request(app)
      .get('/post/comments/getComments')
      .send({ token, id_post });

    expect(res.body.comments.length).toBe(1);
  });

  /* =========================
     DELETE COMMENT (recursive)
  ========================= */

  it('should delete comment with children', async () => {
    const parent = await request(app)
      .post('/post/comments/createComment')
      .send({
        token,
        id_post,
        content: 'parent',
      });

    const child = await request(app)
      .post('/post/comments/createComment')
      .send({
        token,
        id_comment_replied_to:
          parent.body.id_comment,
        content: 'child',
      });

    await request(app)
      .delete('/post/comments/deleteComment')
      .send({
        token,
        id_comment: parent.body.id_comment,
      });

    const parentDb = await Comment.findByPk(
      parent.body.id_comment,
    );
    const childDb = await Comment.findByPk(
      child.body.id_comment,
    );

    expect(parentDb).toBeNull();
    expect(childDb).toBeNull();
  });

  it('should fail deleteComment if not exists', async () => {
    const res = await request(app)
      .delete('/post/comments/deleteComment')
      .send({
        token,
        id_comment: 999,
      });

    expect(res.status).toBe(400);
  });

  /* =========================
     COMMENT REACTIONS
  ========================= */

  it('should add reaction to comment', async () => {
    const comment = await request(app)
      .post('/post/comments/createComment')
      .send({ token, id_post, content: 'c' });

    const res = await request(app)
      .post(
        '/post/comments/changeCommentReactions',
      )
      .send({
        token,
        id_comment: comment.body.id_comment,
        reaction: 'like',
      });

    expect(res.status).toBe(200);

    const reactions =
      await CommentReactions.findByPk(
        comment.body.id_comment,
      );

    expect(
      reactions?.getDataValue('like_count'),
    ).toBe(1);
  });

  it('should change reaction', async () => {
    const comment = await request(app)
      .post('/post/comments/createComment')
      .send({ token, id_post, content: 'c' });

    await request(app)
      .post(
        '/post/comments/changeCommentReactions',
      )
      .send({
        token,
        id_comment: comment.body.id_comment,
        reaction: 'like',
      });

    await request(app)
      .post(
        '/post/comments/changeCommentReactions',
      )
      .send({
        token,
        id_comment: comment.body.id_comment,
        reaction: 'love',
      });

    const reactions =
      await CommentReactions.findByPk(
        comment.body.id_comment,
      );

    expect(
      reactions?.getDataValue('like_count'),
    ).toBe(0);
    expect(
      reactions?.getDataValue('love_count'),
    ).toBe(1);
  });

  it('should remove reaction when same clicked', async () => {
    const comment = await request(app)
      .post('/post/comments/createComment')
      .send({ token, id_post, content: 'c' });

    await request(app)
      .post(
        '/post/comments/changeCommentReactions',
      )
      .send({
        token,
        id_comment: comment.body.id_comment,
        reaction: 'haha',
      });

    await request(app)
      .post(
        '/post/comments/changeCommentReactions',
      )
      .send({
        token,
        id_comment: comment.body.id_comment,
        reaction: 'haha',
      });

    const reactions =
      await CommentReactions.findByPk(
        comment.body.id_comment,
      );

    expect(
      reactions?.getDataValue('haha_count'),
    ).toBe(0);
  });

  it('should fail with invalid reaction', async () => {
    const comment = await request(app)
      .post('/post/comments/createComment')
      .send({ token, id_post, content: 'c' });

    const res = await request(app)
      .post(
        '/post/comments/changeCommentReactions',
      )
      .send({
        token,
        id_comment: comment.body.id_comment,
        reaction: 'invalid',
      });

    expect(res.status).toBe(400);
  });
});
