import { Router } from 'express';
import { User } from '../models/User.js';
import { UserToken } from '../models/UserToken.js';
import { UserPersonalData } from '../models/UserPersonalData.js';
import bcrypt from 'bcrypt';

const router = Router();

const SALT_ROUNDS = 10;

async function getUserFromToken(token: string) {
  const tokenEntry = await UserToken.findOne({
    where: { token },
  });
  if (!tokenEntry) return null;

  return tokenEntry.getDataValue('id_user');
}

router.get('/userProfile', async (req, res) => {
  try {
    const { token, id_user } = req.body;

    // validate token
    const requesterId =
      await getUserFromToken(token);
    if (!requesterId) {
      return res
        .status(400)
        .json({ error: 'token not valid' });
    }

    // check if user exists
    const user = await User.findByPk(id_user);
    if (!user) {
      return res.status(400).json({
        error: "user with this id doesn't exist",
      });
    }

    // get or create personal data
    let personalData =
      await UserPersonalData.findByPk(id_user);

    if (!personalData) {
      personalData =
        await UserPersonalData.create({
          id_user,
        });
    }

    // success
    res.json({
      name:
        personalData.getDataValue('name') ?? null,
      surname:
        personalData.getDataValue('surname') ??
        null,
      date_of_birth:
        personalData.getDataValue(
          'date_of_birth',
        ) ?? null,
      current_place:
        personalData.getDataValue(
          'current_place',
        ) ?? null,
      hometown:
        personalData.getDataValue('hometown') ??
        null,
      relationship_status:
        personalData.getDataValue(
          'relationship_status',
        ) ?? null,
      education:
        personalData.getDataValue('education') ??
        null,
      work:
        personalData.getDataValue('work') ?? null,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post(
  '/changePassword',
  async (req, res) => {
    try {
      const {
        token,
        password,
        new_password,
        repeat_new_password,
      } = req.body;

      // 1. Validate token
      const tokenEntry = await UserToken.findOne({
        where: { token },
      });
      if (!tokenEntry) {
        return res
          .status(400)
          .json({ error: 'token not valid' });
      }

      // 2. Get user
      const user = await User.findByPk(
        tokenEntry.getDataValue('id_user'),
      );

      if (!user) {
        return res
          .status(400)
          .json({ error: 'token not valid' });
      }

      // 3. Check current password
      const isMatch = await bcrypt.compare(
        password,
        user.getDataValue('password'),
      );

      if (!isMatch) {
        return res
          .status(400)
          .json({ error: 'wrong password' });
      }

      // 4. Check new passwords match
      if (new_password !== repeat_new_password) {
        return res.status(400).json({
          error:
            "new password doesn't match with the repeated one",
        });
      }

      // 5. Hash new password
      const hashedPassword = await bcrypt.hash(
        new_password,
        SALT_ROUNDS,
      );

      // 6. Update password
      await user.update({
        password: hashedPassword,
      });

      return res.json({
        message: 'password successfully changed',
      });
    } catch (err: any) {
      return res
        .status(500)
        .json({ error: err.message });
    }
  },
);

router.post('/changeEmail', async (req, res) => {
  try {
    const { token, password, new_email } =
      req.body;

    // 1. Validate token
    const tokenEntry = await UserToken.findOne({
      where: { token },
    });
    if (!tokenEntry) {
      return res
        .status(400)
        .json({ error: 'token not valid' });
    }

    // 2. Get user
    const user = await User.findByPk(
      tokenEntry.getDataValue('id_user'),
    );

    if (!user) {
      return res
        .status(400)
        .json({ error: 'token not valid' });
    }

    // 3. Check password
    const isMatch = await bcrypt.compare(
      password,
      user.getDataValue('password'),
    );

    if (!isMatch) {
      return res
        .status(400)
        .json({ error: 'wrong password' });
    }

    // 4. Check if email already exists
    const existingEmail = await User.findOne({
      where: { email: new_email },
    });

    if (existingEmail) {
      return res
        .status(400)
        .json({ error: 'email already exists' });
    }

    // 5. Update email
    await user.update({ email: new_email });

    return res.json({
      message: 'email successfully changed',
    });
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: err.message });
  }
});

router.post(
  '/changeDateOfBirth',
  async (req, res) => {
    try {
      const { token, new_date_of_birth } =
        req.body;

      const id_user =
        await getUserFromToken(token);
      if (!id_user) {
        return res
          .status(400)
          .json({ error: 'token not valid' });
      }

      // Validate format (YYYY-MM-DD)
      const date = new Date(new_date_of_birth);
      if (isNaN(date.getTime())) {
        return res.status(400).json({
          error: 'new_date_of_birth wrong format',
        });
      }

      // Check future date
      if (date > new Date()) {
        return res.status(400).json({
          error:
            "new_date_of_birth can't be in the future",
        });
      }

      // Upsert (create or update)
      await UserPersonalData.upsert({
        id_user,
        date_of_birth: new_date_of_birth,
      });

      res.json({
        message: 'date_of_birth updated',
      });
    } catch (err: any) {
      res
        .status(500)
        .json({ error: err.message });
    }
  },
);

router.delete(
  '/deleteDateOfBirth',
  async (req, res) => {
    try {
      const { token } = req.body;

      const id_user =
        await getUserFromToken(token);
      if (!id_user) {
        return res
          .status(400)
          .json({ error: 'token not valid' });
      }

      await UserPersonalData.update(
        { date_of_birth: null },
        { where: { id_user } },
      );

      res.json({
        message: 'date_of_birth deleted',
      });
    } catch (err: any) {
      res
        .status(500)
        .json({ error: err.message });
    }
  },
);

router.post(
  '/changeCurrentPlace',
  async (req, res) => {
    try {
      const { token, new_current_place } =
        req.body;

      const id_user =
        await getUserFromToken(token);
      if (!id_user) {
        return res
          .status(400)
          .json({ error: 'token not valid' });
      }

      await UserPersonalData.upsert({
        id_user,
        current_place: new_current_place,
      });

      res.json({
        message: 'current_place updated',
      });
    } catch (err: any) {
      res
        .status(500)
        .json({ error: err.message });
    }
  },
);

router.delete(
  '/deleteCurrentPlace',
  async (req, res) => {
    try {
      const { token } = req.body;

      const id_user =
        await getUserFromToken(token);
      if (!id_user) {
        return res
          .status(400)
          .json({ error: 'token not valid' });
      }

      await UserPersonalData.update(
        { current_place: null },
        { where: { id_user } },
      );

      res.json({
        message: 'current_place deleted',
      });
    } catch (err: any) {
      res
        .status(500)
        .json({ error: err.message });
    }
  },
);

router.post(
  '/changeHometown',
  async (req, res) => {
    try {
      const { token, new_hometown } = req.body;

      const id_user =
        await getUserFromToken(token);
      if (!id_user) {
        return res
          .status(400)
          .json({ error: 'token not valid' });
      }

      await UserPersonalData.upsert({
        id_user,
        hometown: new_hometown,
      });

      res.json({ message: 'hometown updated' });
    } catch (err: any) {
      res
        .status(500)
        .json({ error: err.message });
    }
  },
);

router.delete(
  '/deleteHometown',
  async (req, res) => {
    try {
      const { token } = req.body;

      const id_user =
        await getUserFromToken(token);
      if (!id_user) {
        return res
          .status(400)
          .json({ error: 'token not valid' });
      }

      await UserPersonalData.update(
        { hometown: null },
        { where: { id_user } },
      );

      res.json({ message: 'hometown deleted' });
    } catch (err: any) {
      res
        .status(500)
        .json({ error: err.message });
    }
  },
);

router.post(
  '/changeRelationshipStatus',
  async (req, res) => {
    try {
      const { token, new_relationship_status } =
        req.body;

      const id_user =
        await getUserFromToken(token);
      if (!id_user) {
        return res
          .status(400)
          .json({ error: 'token not valid' });
      }

      await UserPersonalData.upsert({
        id_user,
        relationship_status:
          new_relationship_status,
      });

      res.json({
        message: 'relationship_status updated',
      });
    } catch (err: any) {
      res
        .status(500)
        .json({ error: err.message });
    }
  },
);

router.delete(
  '/deleteRelationshipStatus',
  async (req, res) => {
    try {
      const { token } = req.body;

      const id_user =
        await getUserFromToken(token);
      if (!id_user) {
        return res
          .status(400)
          .json({ error: 'token not valid' });
      }

      await UserPersonalData.update(
        { relationship_status: null },
        { where: { id_user } },
      );

      res.json({
        message: 'relationship_status deleted',
      });
    } catch (err: any) {
      res
        .status(500)
        .json({ error: err.message });
    }
  },
);

router.post(
  '/changeEducation',
  async (req, res) => {
    try {
      const { token, new_education } = req.body;

      const id_user =
        await getUserFromToken(token);
      if (!id_user) {
        return res
          .status(400)
          .json({ error: 'token not valid' });
      }

      await UserPersonalData.upsert({
        id_user,
        education: new_education,
      });

      res.json({ message: 'education updated' });
    } catch (err: any) {
      res
        .status(500)
        .json({ error: err.message });
    }
  },
);

router.delete(
  '/deleteEducation',
  async (req, res) => {
    try {
      const { token } = req.body;

      const id_user =
        await getUserFromToken(token);
      if (!id_user) {
        return res
          .status(400)
          .json({ error: 'token not valid' });
      }

      await UserPersonalData.update(
        { education: null },
        { where: { id_user } },
      );

      res.json({ message: 'education deleted' });
    } catch (err: any) {
      res
        .status(500)
        .json({ error: err.message });
    }
  },
);

router.post('/changeWork', async (req, res) => {
  try {
    const { token, new_work } = req.body;

    const id_user = await getUserFromToken(token);
    if (!id_user) {
      return res
        .status(400)
        .json({ error: 'token not valid' });
    }

    await UserPersonalData.upsert({
      id_user,
      work: new_work,
    });

    res.json({ message: 'work updated' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/deleteWork', async (req, res) => {
  try {
    const { token } = req.body;

    const id_user = await getUserFromToken(token);
    if (!id_user) {
      return res
        .status(400)
        .json({ error: 'token not valid' });
    }

    await UserPersonalData.update(
      { work: null },
      { where: { id_user } },
    );

    res.json({ message: 'work deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
