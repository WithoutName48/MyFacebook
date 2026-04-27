import express from 'express';
import { Post } from '../models/Post.js';
import { UserToken } from '../models/UserToken.js';
import { Comment } from '../models/Comment.js';
import { CommentReactions } from '../models/CommentReactions.js';
import { UserCommentsReaction } from '../models/UserCommentsReaction.js';
import { UserPostsReaction } from '../models/UserPostsReaction.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

async function getUserFromToken(token: string) {
  const tokenEntry = await UserToken.findOne({
    where: { token },
  });
  if (!tokenEntry) return null;
  return tokenEntry.getDataValue('id_user');
}

router.get('/getComments', async (req, res) => {
  try {
    const { token, id_post } = req.body;

    const id_user = await getUserFromToken(token);
    if (!id_user) {
      return res
        .status(400)
        .json({ error: 'token not valid' });
    }

    const post = await Post.findByPk(id_post);
    if (!post) {
      return res.status(400).json({
        error: "post with this id doesn't exist",
      });
    }

    const comments = await Comment.findAll({
      where: { id_post },
      order: [['date_created', 'ASC']],
    });

    res.json({ comments });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/getComment', async (req, res) => {
  try {
    const { token, id_comment } = req.body;

    // validate token
    const id_user = await getUserFromToken(token);
    if (!id_user) {
      return res
        .status(400)
        .json({ error: 'token not valid' });
    }

    // find comment
    const comment =
      await Comment.findByPk(id_comment);
    if (!comment) {
      return res.status(400).json({
        error:
          "comment with this id doesn't exist",
      });
    }

    // get children (sorted DESC by date)
    const children = await Comment.findAll({
      where: {
        id_comment_replied_to: id_comment,
      },
      order: [['date_created', 'DESC']],
    });

    // format children
    const childrenFormatted = children.map(
      (c) => ({
        id_comment: c.getDataValue('id_comment'),
        id_user: c.getDataValue('id_user'),
        id_post: c.getDataValue('id_post'),
        id_comment_replied_to: c.getDataValue(
          'id_comment_replied_to',
        ),
        date_created: c.getDataValue(
          'date_created',
        ),
        content: c.getDataValue('content'),
      }),
    );

    // response
    res.json({
      id_user: comment.getDataValue('id_user'),
      id_post: comment.getDataValue('id_post'),
      id_comment_replied_to: comment.getDataValue(
        'id_comment_replied_to',
      ),
      date_created: comment.getDataValue(
        'date_created',
      ),
      content: comment.getDataValue('content'),
      children: childrenFormatted,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post(
  '/createComment',
  async (req, res) => {
    try {
      const {
        token,
        id_post,
        id_comment_replied_to,
        content,
      } = req.body;

      const id_user =
        await getUserFromToken(token);
      if (!id_user) {
        return res
          .status(400)
          .json({ error: 'token not valid' });
      }

      if (!content) {
        return res
          .status(400)
          .json({ error: 'content required' });
      }

      // enforce exactly one
      if (!id_post && !id_comment_replied_to) {
        return res.status(400).json({
          error:
            'id_post or id_comment_replied_to required',
        });
      }

      if (id_post && id_comment_replied_to) {
        return res.status(400).json({
          error:
            'provide only one: id_post OR id_comment_replied_to',
        });
      }

      // ROOT COMMENT
      if (id_post) {
        const post = await Post.findByPk(id_post);
        if (!post) {
          return res.status(400).json({
            error:
              "post with this id doesn't exist",
          });
        }

        const comment = await Comment.create({
          id_user,
          id_post,
          id_comment_replied_to: null,
          content,
          date_created: new Date().toISOString(),
        });

        return res.json({
          id_comment:
            comment.getDataValue('id_comment'),
        });
      }

      // CHILD COMMENT
      if (id_comment_replied_to) {
        const parent = await Comment.findByPk(
          id_comment_replied_to,
        );

        if (!parent) {
          return res.status(400).json({
            error:
              "comment, which is the parent (replied to), with this id doesn't exist",
          });
        }

        const comment = await Comment.create({
          id_user,
          id_post: null,
          id_comment_replied_to,
          content,
          date_created: new Date().toISOString(),
        });

        return res.json({
          id_comment:
            comment.getDataValue('id_comment'),
        });
      }
    } catch (err: any) {
      res
        .status(500)
        .json({ error: err.message });
    }
  },
);

async function deleteRecursive(
  id_comment: number,
) {
  const children = await Comment.findAll({
    where: { id_comment_replied_to: id_comment },
  });

  for (const child of children) {
    await deleteRecursive(
      child.getDataValue('id_comment'),
    );
  }

  await Comment.destroy({
    where: { id_comment },
  });
}

router.delete(
  '/deleteComment',
  async (req, res) => {
    try {
      const { token, id_comment } = req.body;

      const id_user =
        await getUserFromToken(token);
      if (!id_user) {
        return res
          .status(400)
          .json({ error: 'token not valid' });
      }

      const comment =
        await Comment.findByPk(id_comment);
      if (!comment) {
        return res.status(400).json({
          error:
            "comment with this id doesn't exist",
        });
      }

      await deleteRecursive(id_comment);

      res.json({ message: 'comment deleted' });
    } catch (err: any) {
      res
        .status(500)
        .json({ error: err.message });
    }
  },
);

router.post(
  '/changeCommentReactions',
  async (req, res) => {
    try {
      const { token, id_comment, reaction } =
        req.body;

      const validReactions = [
        'like',
        'love',
        'care',
        'haha',
        'wow',
        'sad',
        'angry',
      ];

      const reactionMap: any = {
        like: 'like_count',
        love: 'love_count',
        care: 'care_count',
        haha: 'haha_count',
        wow: 'wow_count',
        sad: 'sad_count',
        angry: 'angry_count',
      };

      if (!validReactions.includes(reaction)) {
        return res.status(400).json({
          error: 'invalid reaction type',
        });
      }

      const id_user =
        await getUserFromToken(token);
      if (!id_user) {
        return res
          .status(400)
          .json({ error: 'token not valid' });
      }

      const comment =
        await Comment.findByPk(id_comment);
      if (!comment) {
        return res.status(400).json({
          error:
            "comment with this id doesn't exist",
        });
      }

      let commentReactions =
        await CommentReactions.findByPk(
          id_comment,
        );

      if (!commentReactions) {
        commentReactions =
          await CommentReactions.create({
            id_comment,
          });
      }

      let userReaction =
        await UserCommentsReaction.findOne({
          where: { id_user, id_comment },
        });

      // no previous
      if (!userReaction) {
        const data: any = { id_user, id_comment };
        validReactions.forEach(
          (r) => (data[r] = false),
        );
        data[reaction] = true;

        await UserCommentsReaction.create(data);
        await commentReactions.increment(
          reactionMap[reaction],
        );

        return res.json({
          message: 'reaction added',
        });
      }

      // find previous
      let prev: string = '';
      for (const r of validReactions) {
        if (userReaction.getDataValue(r)) {
          prev = r;
          break;
        }
      }

      // remove
      if (prev === reaction) {
        await commentReactions.decrement(
          reactionMap[reaction],
        );

        const reset: any = {};
        validReactions.forEach(
          (r) => (reset[r] = false),
        );

        await userReaction.update(reset);

        return res.json({
          message: 'reaction removed',
        });
      }

      // change
      if (prev) {
        await commentReactions.decrement(
          reactionMap[prev],
        );
      }

      await commentReactions.increment(
        reactionMap[reaction],
      );

      const update: any = {};
      validReactions.forEach(
        (r) => (update[r] = false),
      );
      update[reaction] = true;

      await userReaction.update(update);

      res.json({ message: 'reaction updated' });
    } catch (err: any) {
      console.error(err);
      res
        .status(500)
        .json({ error: err.message });
    }
  },
);

export default router;
