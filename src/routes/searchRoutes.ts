import express from 'express';
import { Post } from '../models/Post.js';
import { User } from '../models/User.js';
import { UserToken } from '../models/UserToken.js';
import { UserPersonalData } from '../models/UserPersonalData.js';
import { Op, literal } from 'sequelize';

const router = express.Router();

async function getUserFromToken(token: string) {
  const tokenEntry = await UserToken.findOne({
    where: { token },
  });
  if (!tokenEntry) return null;
  return tokenEntry.getDataValue('id_user');
}

router.get('/postsFeed', async (req, res) => {
  try {
    const { token } = req.body;

    const id_user = await getUserFromToken(token);
    if (!id_user) {
      return res
        .status(400)
        .json({ error: 'token not valid' });
    }

    const posts = await Post.findAll({
      attributes: ['id_post'],
      where: {
        id_user: {
          [Op.ne]: id_user,
        },
      },
      order: literal('RANDOM()'),
      limit: 30,
    });

    const result = posts.map((p) =>
      p.getDataValue('id_post'),
    );

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/postsUser', async (req, res) => {
  try {
    const { token, id_user } = req.body;

    const requester =
      await getUserFromToken(token);
    if (!requester) {
      return res
        .status(400)
        .json({ error: 'token not valid' });
    }

    const user = await User.findByPk(id_user);
    if (!user) {
      return res.status(400).json({
        error: "user with this id doesn't exist",
      });
    }

    const posts = await Post.findAll({
      where: { id_user },
      attributes: ['id_post'],
      order: [['date_created', 'DESC']],
      limit: 30,
    });

    const result = posts.map((p) =>
      p.getDataValue('id_post'),
    );

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { token, input } = req.body;

    const id_user = await getUserFromToken(token);
    if (!id_user) {
      return res
        .status(400)
        .json({ error: 'token not valid' });
    }

    if (!input) {
      return res
        .status(400)
        .json({ error: 'input required' });
    }

    //USERS SEARCH (prefix)
    const users = await UserPersonalData.findAll({
      attributes: ['id_user'],
      where: {
        [Op.or]: [
          { name: { [Op.like]: `${input}%` } },
          { surname: { [Op.like]: `${input}%` } },
          literal(
            `name || ' ' || surname LIKE '${input}%'`,
          ),
        ],
      },
      limit: 10,
    });

    const userIds = users.map((u) =>
      u.getDataValue('id_user'),
    );

    // POSTS SEARCH (substring)
    const posts = await Post.findAll({
      attributes: ['id_post'],
      where: {
        content: {
          [Op.like]: `%${input}%`,
        },
      },
      limit: 20,
    });

    const postIds = posts.map((p) =>
      p.getDataValue('id_post'),
    );

    // final response
    res.json([...userIds, ...postIds]);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
