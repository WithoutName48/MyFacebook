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

describe('User Personal Data routes', () => {
  let token: string;

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    const register = await request(app)
      .post('/auth/register')
      .send({
        login: 'testuser',
        password: '123456',
        repeat_password: '123456',
        email: 'test@test.com',
      });

    token = register.body.token;
  });

  /* =========================
     DATE OF BIRTH
  ========================= */

  it('should change date_of_birth successfully', async () => {
    const res = await request(app)
      .post('/user/changeDateOfBirth')
      .send({
        token,
        new_date_of_birth: '2000-01-01',
      });

    expect(res.status).toBe(200);
  });

  it('should fail with invalid date format', async () => {
    const res = await request(app)
      .post('/user/changeDateOfBirth')
      .send({
        token,
        new_date_of_birth: 'invalid-date',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      'new_date_of_birth wrong format',
    );
  });

  it('should fail if date is in the future', async () => {
    const futureDate = '2999-01-01';

    const res = await request(app)
      .post('/user/changeDateOfBirth')
      .send({
        token,
        new_date_of_birth: futureDate,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('future');
  });

  it('should fail if token is invalid', async () => {
    const res = await request(app)
      .post('/user/changeDateOfBirth')
      .send({
        token: 'fake',
        new_date_of_birth: '2000-01-01',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      'token not valid',
    );
  });

  it('should delete date_of_birth', async () => {
    await request(app)
      .post('/user/changeDateOfBirth')
      .send({
        token,
        new_date_of_birth: '2000-01-01',
      });

    const res = await request(app)
      .delete('/user/deleteDateOfBirth')
      .send({ token });

    expect(res.status).toBe(200);
  });

  /* =========================
     CURRENT PLACE
  ========================= */

  it('should change current_place', async () => {
    const res = await request(app)
      .post('/user/changeCurrentPlace')
      .send({
        token,
        new_current_place: 'Krakow',
      });

    expect(res.status).toBe(200);
  });

  it('should delete current_place', async () => {
    await request(app)
      .post('/user/changeCurrentPlace')
      .send({
        token,
        new_current_place: 'Krakow',
      });

    const res = await request(app)
      .delete('/user/deleteCurrentPlace')
      .send({ token });

    expect(res.status).toBe(200);
  });

  it('should fail current_place with invalid token', async () => {
    const res = await request(app)
      .post('/user/changeCurrentPlace')
      .send({
        token: 'fake',
        new_current_place: 'Krakow',
      });

    expect(res.status).toBe(400);
  });

  it('should actually save current_place in DB', async () => {
    await request(app)
      .post('/user/changeCurrentPlace')
      .send({
        token,
        new_current_place: 'Krakow',
      });

    const data = await UserPersonalData.findOne();

    expect(
      data?.getDataValue('current_place'),
    ).toBe('Krakow');
  });

  /* =========================
     HOMETOWN
  ========================= */

  it('should change hometown', async () => {
    const res = await request(app)
      .post('/user/changeHometown')
      .send({
        token,
        new_hometown: 'Warsaw',
      });

    expect(res.status).toBe(200);
  });

  it('should delete hometown', async () => {
    await request(app)
      .post('/user/changeHometown')
      .send({
        token,
        new_hometown: 'Warsaw',
      });

    const res = await request(app)
      .delete('/user/deleteHometown')
      .send({ token });

    expect(res.status).toBe(200);
  });

  it('should fail hometown with invalid token', async () => {
    const res = await request(app)
      .post('/user/changeHometown')
      .send({
        token: 'fake',
        new_hometown: 'Warsaw',
      });

    expect(res.status).toBe(400);
  });

  /* =========================
     RELATIONSHIP STATUS
  ========================= */

  it('should change relationship_status', async () => {
    const res = await request(app)
      .post('/user/changeRelationshipStatus')
      .send({
        token,
        new_relationship_status: 'single',
      });

    expect(res.status).toBe(200);
  });

  it('should delete relationship_status', async () => {
    await request(app)
      .post('/user/changeRelationshipStatus')
      .send({
        token,
        new_relationship_status: 'single',
      });

    const res = await request(app)
      .delete('/user/deleteRelationshipStatus')
      .send({ token });

    expect(res.status).toBe(200);
  });

  it('should fail relationship_status with invalid token', async () => {
    const res = await request(app)
      .post('/user/changeRelationshipStatus')
      .send({
        token: 'fake',
        new_relationship_status: 'single',
      });

    expect(res.status).toBe(400);
  });

  /* =========================
     EDUCATION
  ========================= */

  it('should change education', async () => {
    const res = await request(app)
      .post('/user/changeEducation')
      .send({
        token,
        new_education: 'MIT',
      });

    expect(res.status).toBe(200);
  });

  it('should delete education', async () => {
    await request(app)
      .post('/user/changeEducation')
      .send({
        token,
        new_education: 'MIT',
      });

    const res = await request(app)
      .delete('/user/deleteEducation')
      .send({ token });

    expect(res.status).toBe(200);
  });

  it('should fail education with invalid token', async () => {
    const res = await request(app)
      .post('/user/changeEducation')
      .send({
        token: 'fake',
        new_education: 'MIT',
      });

    expect(res.status).toBe(400);
  });

  it('should actually store education in DB', async () => {
    await request(app)
      .post('/user/changeEducation')
      .send({
        token,
        new_education: 'MIT',
      });

    const data = await UserPersonalData.findOne();

    expect(data?.getDataValue('education')).toBe(
      'MIT',
    );
  });

  /* =========================
     WORK
  ========================= */

  it('should change work', async () => {
    const res = await request(app)
      .post('/user/changeWork')
      .send({
        token,
        new_work: 'Software Engineer',
      });

    expect(res.status).toBe(200);
  });

  it('should delete work', async () => {
    await request(app)
      .post('/user/changeWork')
      .send({
        token,
        new_work: 'Software Engineer',
      });

    const res = await request(app)
      .delete('/user/deleteWork')
      .send({ token });

    expect(res.status).toBe(200);
  });

  it('should fail work with invalid token', async () => {
    const res = await request(app)
      .post('/user/changeWork')
      .send({
        token: 'fake',
        new_work: 'Software Engineer',
      });

    expect(res.status).toBe(400);
  });
});
