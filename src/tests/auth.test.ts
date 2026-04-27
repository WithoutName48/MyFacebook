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

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

beforeEach(async () => {
  await sequelize.truncate({ cascade: true });
});

describe('Auth routes', () => {
  /* =========================
     REGISTER TESTS
  ========================= */

  it('should fail if passwords do not match', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        login: 'user1',
        password: '123456',
        repeat_password: '654321',
        email: 'user1@test.com',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      'Passwords not matching',
    );
  });

  it('should fail if password too short', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        login: 'user2',
        password: '123',
        repeat_password: '123',
        email: 'user2@test.com',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      'Password too short',
    );
  });

  it('should register user successfully', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        login: 'user3',
        password: '123456',
        repeat_password: '123456',
        email: 'user3@test.com',
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('should not allow duplicate login', async () => {
    await request(app)
      .post('/auth/register')
      .send({
        login: 'user4',
        password: '123456',
        repeat_password: '123456',
        email: 'user4@test.com',
      });

    const res = await request(app)
      .post('/auth/register')
      .send({
        login: 'user4',
        password: '123456',
        repeat_password: '123456',
        email: 'user4b@test.com',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      'login already exists',
    );
  });

  it('should not allow duplicate email', async () => {
    await request(app)
      .post('/auth/register')
      .send({
        login: 'user5',
        password: '123456',
        repeat_password: '123456',
        email: 'user5@test.com',
      });

    const res = await request(app)
      .post('/auth/register')
      .send({
        login: 'user5b',
        password: '123456',
        repeat_password: '123456',
        email: 'user5@test.com',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      'email already exists',
    );
  });

  it('should store hashed password (not plain text)', async () => {
    await request(app)
      .post('/auth/register')
      .send({
        login: 'user6',
        password: '123456',
        repeat_password: '123456',
        email: 'user6@test.com',
      });

    const user = await User.findOne({
      where: { login: 'user6' },
    });

    expect(user).toBeTruthy();
    expect(
      user!.getDataValue('password'),
    ).not.toBe('123456');
  });

  /* =========================
     LOGIN TESTS
  ========================= */

  it('should login successfully with login', async () => {
    await request(app)
      .post('/auth/register')
      .send({
        login: 'user7',
        password: '123456',
        repeat_password: '123456',
        email: 'user7@test.com',
      });

    const res = await request(app)
      .post('/auth/login')
      .send({
        login: 'user7',
        password: '123456',
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('should login successfully with email', async () => {
    await request(app)
      .post('/auth/register')
      .send({
        login: 'user8',
        password: '123456',
        repeat_password: '123456',
        email: 'user8@test.com',
      });

    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'user8@test.com',
        password: '123456',
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('should fail login with wrong password', async () => {
    await request(app)
      .post('/auth/register')
      .send({
        login: 'user9',
        password: '123456',
        repeat_password: '123456',
        email: 'user9@test.com',
      });

    const res = await request(app)
      .post('/auth/login')
      .send({
        login: 'user9',
        password: 'wrong',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('wrong data');
  });

  it('should fail login with non-existing user', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        login: 'ghost',
        password: '123456',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('wrong data');
  });

  it('should fail if neither login nor email provided', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        password: '123456',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      'login or email required',
    );
  });

  /* =========================
     TOKEN TESTS
  ========================= */

  it('should save token in database after register', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        login: 'tokenUser1',
        password: '123456',
        repeat_password: '123456',
        email: 'token1@test.com',
      });

    const token = res.body.token;

    expect(token).toBeDefined();

    const savedToken = await UserToken.findOne({
      where: { token },
    });

    expect(savedToken).toBeTruthy();
  });

  it('should assign token to correct user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        login: 'tokenUser2',
        password: '123456',
        repeat_password: '123456',
        email: 'token2@test.com',
      });

    const token = res.body.token;

    const user = await User.findOne({
      where: { login: 'tokenUser2' },
    });
    const savedToken = await UserToken.findOne({
      where: { token },
    });

    expect(savedToken).toBeTruthy();
    expect(
      savedToken!.getDataValue('id_user'),
    ).toBe(user!.getDataValue('id_user'));
  });

  it('should save token in database after login', async () => {
    await request(app)
      .post('/auth/register')
      .send({
        login: 'tokenUser3',
        password: '123456',
        repeat_password: '123456',
        email: 'token3@test.com',
      });

    const res = await request(app)
      .post('/auth/login')
      .send({
        login: 'tokenUser3',
        password: '123456',
      });

    const token = res.body.token;

    const savedToken = await UserToken.findOne({
      where: { token },
    });

    expect(savedToken).toBeTruthy();
  });

  it('should generate different tokens for multiple logins', async () => {
    await request(app)
      .post('/auth/register')
      .send({
        login: 'tokenUser4',
        password: '123456',
        repeat_password: '123456',
        email: 'token4@test.com',
      });

    const res1 = await request(app)
      .post('/auth/login')
      .send({
        login: 'tokenUser4',
        password: '123456',
      });

    const res2 = await request(app)
      .post('/auth/login')
      .send({
        login: 'tokenUser4',
        password: '123456',
      });

    expect(res1.body.token).not.toBe(
      res2.body.token,
    );
  });

  it('should delete token successfully', async () => {
    const registerRes = await request(app)
      .post('/auth/register')
      .send({
        login: 'delUser',
        password: '123456',
        repeat_password: '123456',
        email: 'del@test.com',
      });

    const token = registerRes.body.token;

    const res = await request(app)
      .delete('/auth/deleteToken')
      .send({ token });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
      'token successfully deleted',
    );
  });

  it('should return error if token not found', async () => {
    const res = await request(app)
      .delete('/auth/deleteToken')
      .send({ token: 'fakeToken' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe(
      'token not found',
    );
  });

  it('should fail if token not provided', async () => {
    const res = await request(app)
      .delete('/auth/deleteToken')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('token required');
  });

  /* =========================
     TOKEN PASSWORD TESTS
  ========================= */

  it('should not allow actions after token deletion', async () => {
    const register = await request(app)
      .post('/auth/register')
      .send({
        login: 'tok1',
        password: '123456',
        repeat_password: '123456',
        email: 'tok1@test.com',
      });

    const token = register.body.token;

    await request(app)
      .delete('/auth/deleteToken')
      .send({ token });

    const res = await request(app)
      .post('/user/changeEmail')
      .send({
        token,
        password: '123456',
        new_email: 'newtok@test.com',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      'token not valid',
    );
  });
});
