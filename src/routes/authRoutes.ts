import { Router } from 'express';
import { User } from '../models/User.js';
import { UserToken } from '../models/UserToken.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const router = Router();

const SALT_ROUNDS = 10;

/* =========================
   POST /register
========================= */
router.post('/register', async (req, res) => {
  try {
    const {
      login,
      password,
      repeat_password,
      email,
    } = req.body;

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: 'Password too short' });
    }

    // 1. Password match
    if (password !== repeat_password) {
      return res.status(400).json({
        error: 'Passwords not matching',
      });
    }

    // 2. Check login/email existence
    const existingLogin = await User.findOne({
      where: { login },
    });
    if (existingLogin) {
      return res
        .status(400)
        .json({ error: 'login already exists' });
    }

    const existingEmail = await User.findOne({
      where: { email },
    });
    if (existingEmail) {
      return res
        .status(400)
        .json({ error: 'email already exists' });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      SALT_ROUNDS,
    );

    // 4. Create user
    const user = await User.create({
      login,
      password: hashedPassword,
      email,
    });

    // 5. Generate token
    const token = crypto
      .randomBytes(32)
      .toString('hex');

    // 6. Save token
    await UserToken.create({
      id_user: user.getDataValue('id_user'),
      token,
    });

    res.json({ token });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   POST /login
========================= */
router.post('/login', async (req, res) => {
  try {
    const { login, email, password } = req.body;

    if (!login && !email) {
      return res.status(400).json({
        error: 'login or email required',
      });
    }

    // 1. Find user
    const user = await User.findOne({
      where: login ? { login } : { email },
    });

    if (!user) {
      return res
        .status(400)
        .json({ error: 'wrong data' });
    }

    // 2. Compare hashed password
    const isMatch = await bcrypt.compare(
      password,
      user.getDataValue('password'),
    );

    if (!isMatch) {
      return res
        .status(400)
        .json({ error: 'wrong data' });
    }

    // 3. Generate token
    const token = crypto
      .randomBytes(32)
      .toString('hex');

    // 4. Save token
    await UserToken.create({
      id_user: user.getDataValue('id_user'),
      token,
    });

    res.json({ token });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   DELETE /deleteToken
========================= */
router.delete(
  '/deleteToken',
  async (req, res) => {
    try {
      const { token } = req.body;

      // 1. Validate input
      if (!token) {
        return res
          .status(400)
          .json({ error: 'token required' });
      }

      // 2. Find token
      const tokenEntry = await UserToken.findOne({
        where: { token },
      });

      if (!tokenEntry) {
        return res
          .status(404)
          .json({ error: 'token not found' });
      }

      // 3. Delete token
      await tokenEntry.destroy();

      return res.json({
        message: 'token successfully deleted',
      });
    } catch (err: any) {
      return res
        .status(500)
        .json({ error: err.message });
    }
  },
);

export default router;
