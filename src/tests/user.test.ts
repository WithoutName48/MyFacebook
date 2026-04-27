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
import { UserPersonalData } from '../models/UserPersonalData.js';

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

beforeEach(async () => {
  await sequelize.truncate({ cascade: true });
});

describe('User routes', () => {
  /* =========================
     CHANGE PASSWORD TESTS
  ========================= */

  it('should change password successfully', async () => {
    const register = await request(app)
      .post('/auth/register')
      .send({
        login: 'cp1',
        password: '123456',
        repeat_password: '123456',
        email: 'cp1@test.com',
      });

    const token = register.body.token;

    const res = await request(app)
      .post('/user/changePassword')
      .send({
        token,
        password: '123456',
        new_password: '654321',
        repeat_new_password: '654321',
      });

    expect(res.status).toBe(200);
  });

  it('should fail if old password is wrong', async () => {
    const register = await request(app)
      .post('/auth/register')
      .send({
        login: 'cp2',
        password: '123456',
        repeat_password: '123456',
        email: 'cp2@test.com',
      });

    const res = await request(app)
      .post('/user/changePassword')
      .send({
        token: register.body.token,
        password: 'wrong',
        new_password: '654321',
        repeat_new_password: '654321',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('wrong password');
  });

  it('should allow login with new password after change', async () => {
    const register = await request(app)
      .post('/auth/register')
      .send({
        login: 'cp_login1',
        password: '123456',
        repeat_password: '123456',
        email: 'cp1@test.com',
      });

    const token = register.body.token;

    await request(app)
      .post('/user/changePassword')
      .send({
        token,
        password: '123456',
        new_password: '654321',
        repeat_new_password: '654321',
      });

    const res = await request(app)
      .post('/auth/login')
      .send({
        login: 'cp_login1',
        password: '654321',
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('should not allow login with old password after change', async () => {
    const register = await request(app)
      .post('/auth/register')
      .send({
        login: 'cp_login2',
        password: '123456',
        repeat_password: '123456',
        email: 'cp2@test.com',
      });

    const token = register.body.token;

    await request(app)
      .post('/user/changePassword')
      .send({
        token,
        password: '123456',
        new_password: '654321',
        repeat_new_password: '654321',
      });

    const res = await request(app)
      .post('/auth/login')
      .send({
        login: 'cp_login2',
        password: '123456',
      });

    expect(res.status).toBe(400);
  });

  it('should fail if new passwords do not match', async () => {
    const register = await request(app)
      .post('/auth/register')
      .send({
        login: 'cp_mismatch',
        password: '123456',
        repeat_password: '123456',
        email: 'cp3@test.com',
      });

    const res = await request(app)
      .post('/user/changePassword')
      .send({
        token: register.body.token,
        password: '123456',
        new_password: '111111',
        repeat_new_password: '222222',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain(
      "doesn't match",
    );
  });

  it('should fail if token invalid', async () => {
    const res = await request(app)
      .post('/user/changePassword')
      .send({
        token: 'fake',
        password: '123456',
        new_password: '654321',
        repeat_new_password: '654321',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      'token not valid',
    );
  });

  /* =========================
     CHANGE EMAIL TESTS
  ========================= */

  it('should change email successfully', async () => {
    const register = await request(app)
      .post('/auth/register')
      .send({
        login: 'ce1',
        password: '123456',
        repeat_password: '123456',
        email: 'old@test.com',
      });

    const res = await request(app)
      .post('/user/changeEmail')
      .send({
        token: register.body.token,
        password: '123456',
        new_email: 'new@test.com',
      });

    expect(res.status).toBe(200);
  });

  it('should fail if new email already exists', async () => {
    await request(app)
      .post('/auth/register')
      .send({
        login: 'ce2',
        password: '123456',
        repeat_password: '123456',
        email: 'existing@test.com',
      });

    const register2 = await request(app)
      .post('/auth/register')
      .send({
        login: 'ce3',
        password: '123456',
        repeat_password: '123456',
        email: 'another@test.com',
      });

    const res = await request(app)
      .post('/user/changeEmail')
      .send({
        token: register2.body.token,
        password: '123456',
        new_email: 'existing@test.com',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      'email already exists',
    );
  });

  it('should fail changeEmail with wrong password', async () => {
    const register = await request(app)
      .post('/auth/register')
      .send({
        login: 'ce4',
        password: '123456',
        repeat_password: '123456',
        email: 'ce4@test.com',
      });

    const res = await request(app)
      .post('/user/changeEmail')
      .send({
        token: register.body.token,
        password: 'wrong',
        new_email: 'newce4@test.com',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('wrong password');
  });

  it('should fail changeEmail with invalid token', async () => {
    const res = await request(app)
      .post('/user/changeEmail')
      .send({
        token: 'fake',
        password: '123456',
        new_email: 'test@test.com',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      'token not valid',
    );
  });

  /* =========================
   USER PROFILE TESTS
========================= */

  it('should return empty personal data and create row if not exists', async () => {
    const register = await request(app)
      .post('/auth/register')
      .send({
        login: 'profile1',
        password: '123456',
        repeat_password: '123456',
        email: 'profile1@test.com',
      });

    const token = register.body.token;

    // get user id from DB
    const user = await User.findOne({
      where: { login: 'profile1' },
    });

    const res = await request(app)
      .get('/user/userProfile')
      .send({
        token,
        id_user: user!.getDataValue('id_user'),
      });

    expect(res.status).toBe(200);

    expect(res.body).toMatchObject({
      name: null,
      surname: null,
      date_of_birth: null,
      current_place: null,
      hometown: null,
      relationship_status: null,
      education: null,
      work: null,
    });

    // ensure row was created in DB
    const personalData =
      await UserPersonalData.findByPk(
        user!.getDataValue('id_user'),
      );

    expect(personalData).toBeTruthy();
  });

  it('should return existing personal data', async () => {
    const register = await request(app)
      .post('/auth/register')
      .send({
        login: 'profile2',
        password: '123456',
        repeat_password: '123456',
        email: 'profile2@test.com',
      });

    const token = register.body.token;

    const user = await User.findOne({
      where: { login: 'profile2' },
    });

    const id_user = user!.getDataValue('id_user');

    // manually create personal data
    await UserPersonalData.create({
      id_user,
      name: 'John',
      surname: 'Doe',
      current_place: 'NY',
    });

    const res = await request(app)
      .get('/user/userProfile')
      .send({
        token,
        id_user,
      });

    expect(res.status).toBe(200);

    expect(res.body.name).toBe('John');
    expect(res.body.surname).toBe('Doe');
    expect(res.body.current_place).toBe('NY');
  });

  it('should fail if token is invalid', async () => {
    const res = await request(app)
      .get('/user/userProfile')
      .send({
        token: 'fake',
        id_user: 1,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      'token not valid',
    );
  });

  it('should fail if user does not exist', async () => {
    const register = await request(app)
      .post('/auth/register')
      .send({
        login: 'profile3',
        password: '123456',
        repeat_password: '123456',
        email: 'profile3@test.com',
      });

    const token = register.body.token;

    const res = await request(app)
      .get('/user/userProfile')
      .send({
        token,
        id_user: 999,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      "user with this id doesn't exist",
    );
  });
});
