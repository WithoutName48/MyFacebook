import express from 'express';
import { Post } from '../models/Post.js';
import { UserToken } from '../models/UserToken.js';
import { Image } from '../models/Image.js';
import { Video } from '../models/Video.js';
import { PostReactions } from '../models/PostReactions.js';
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

router.get('/getPost', async (req, res) => {
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
        error:
          'there is no post with this id in database',
      });
    }

    const images = await Image.findAll({
      where: { id_post },
      order: [['position', 'ASC']],
    });

    const videos = await Video.findAll({
      where: { id_post },
      order: [['position', 'ASC']],
    });

    const reactions =
      await PostReactions.findByPk(id_post);

    const formattedReactions = reactions
      ? [
          {
            type: 'like',
            count:
              reactions.getDataValue(
                'like_count',
              ),
          },
          {
            type: 'love',
            count:
              reactions.getDataValue(
                'love_count',
              ),
          },
          {
            type: 'care',
            count:
              reactions.getDataValue(
                'care_count',
              ),
          },
          {
            type: 'haha',
            count:
              reactions.getDataValue(
                'haha_count',
              ),
          },
          {
            type: 'wow',
            count:
              reactions.getDataValue('wow_count'),
          },
          {
            type: 'sad',
            count:
              reactions.getDataValue('sad_count'),
          },
          {
            type: 'angry',
            count: reactions.getDataValue(
              'angry_count',
            ),
          },
        ]
      : [];

    res.json({
      content: post.getDataValue('content'),
      date_created: post.getDataValue(
        'date_created',
      ),
      images: images.map((i) =>
        i.getDataValue('id_image'),
      ),
      videos: videos.map((v) =>
        v.getDataValue('id_video'),
      ),
      post_reactions: formattedReactions,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post(
  '/editPostContent',
  async (req, res) => {
    try {
      const { token, id_post, new_content } =
        req.body;

      const id_user =
        await getUserFromToken(token);
      if (!id_user) {
        return res
          .status(400)
          .json({ error: 'token not valid' });
      }

      const post = await Post.findByPk(id_post);
      if (!post) {
        return res.status(400).json({
          error:
            'there is no post with this id in database',
        });
      }

      // ownership check
      if (
        post.getDataValue('id_user') !== id_user
      ) {
        return res
          .status(403)
          .json({ error: 'not your post' });
      }

      await post.update({ content: new_content });

      res.json({ message: 'post updated' });
    } catch (err: any) {
      res
        .status(500)
        .json({ error: err.message });
    }
  },
);

router.post('/createPost', async (req, res) => {
  try {
    const { token, content } = req.body;

    const id_user = await getUserFromToken(token);
    if (!id_user) {
      return res
        .status(400)
        .json({ error: 'token not valid' });
    }

    if (!content || content.trim() === '') {
      return res.status(400).json({
        error: 'post must have content',
      });
    }

    const post = await Post.create({
      id_user,
      content,
      date_created: new Date().toISOString(),
    });

    await PostReactions.create({
      id_post: post.getDataValue('id_post'),
      like_count: 0,
      love_count: 0,
      care_count: 0,
      haha_count: 0,
      wow_count: 0,
      sad_count: 0,
      angry_count: 0,
    });

    res.json({
      id_post: post.getDataValue('id_post'),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/deletePost', async (req, res) => {
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
        error:
          'there is no post with this id in database',
      });
    }

    // ownership check
    if (
      post.getDataValue('id_user') !== id_user
    ) {
      return res
        .status(403)
        .json({ error: 'not your post' });
    }

    await post.destroy(); // cascade should handle the rest

    res.json({ message: 'post deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/getImage', async (req, res) => {
  try {
    const { token, id_image } = req.body;

    const id_user = await getUserFromToken(token);

    if (!id_user) {
      return res
        .status(400)
        .json({ error: 'token not valid' });
    }

    const image = await Image.findByPk(id_image);

    if (!image) {
      return res.status(400).json({
        error: "image with this id doesn't exist",
      });
    }

    res.json({
      id_image: image.getDataValue('id_image'),
      id_post: image.getDataValue('id_post'),
      path: image.getDataValue('path'),
      position: image.getDataValue('position'),
    });
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
    });
  }
});

router.post('/addImage', async (req, res) => {
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

    if (
      post.getDataValue('id_user') !== id_user
    ) {
      return res.status(403).json({
        error: "this user doesn't own this post",
      });
    }

    // read images folder
    const imagesDir = path.join(
      process.cwd(),
      'images',
    );

    const files = fs.readdirSync(imagesDir);

    if (files.length === 0) {
      return res.status(500).json({
        error:
          'no images available in /images folder',
      });
    }

    // pick random file
    const randomFile =
      files[
        Math.floor(Math.random() * files.length)
      ];

    const imagePath = `/images/${randomFile}`;

    // position logic
    const images = await Image.findAll({
      where: { id_post },
    });

    const maxPosition =
      images.length > 0
        ? Math.max(
            ...images.map(
              (i) =>
                i.getDataValue('position') || 0,
            ),
          )
        : -1;

    const image = await Image.create({
      id_post,
      position: maxPosition + 1,
      path: imagePath,
    });

    res.json({
      id_image: image.getDataValue('id_image'),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/editImage', async (req, res) => {
  try {
    const {
      token,
      id_post,
      id_image,
      new_path,
      new_position,
    } = req.body;

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

    if (
      post.getDataValue('id_user') !== id_user
    ) {
      return res.status(403).json({
        error: "this user doesn't own this post",
      });
    }

    const image = await Image.findOne({
      where: { id_image, id_post },
    });

    if (!image) {
      return res.status(400).json({
        error:
          "image with this id_image either completely doesn't exist or is not linked to this id_post",
      });
    }

    // change path
    if (new_path) {
      await image.update({ path: new_path });
    }

    // change position
    if (new_position !== undefined) {
      const existing = await Image.findOne({
        where: {
          id_post,
          position: new_position,
        },
      });

      if (existing) {
        await existing.update({ position: -1 });
      }

      await image.update({
        position: new_position,
      });
    }

    res.json({ message: 'image updated' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete(
  '/deleteImage',
  async (req, res) => {
    try {
      const { token, id_post, id_image } =
        req.body;

      const id_user =
        await getUserFromToken(token);
      if (!id_user) {
        return res
          .status(400)
          .json({ error: 'token not valid' });
      }

      const post = await Post.findByPk(id_post);
      if (!post) {
        return res.status(400).json({
          error:
            "post with this id doesn't exist",
        });
      }

      if (
        post.getDataValue('id_user') !== id_user
      ) {
        return res.status(403).json({
          error:
            "this user doesn't own this post",
        });
      }

      const image = await Image.findOne({
        where: { id_image, id_post },
      });

      if (!image) {
        return res.status(400).json({
          error:
            "image with this id_image either completely doesn't exist or is not linked to this id_post",
        });
      }

      const deletedPosition =
        image.getDataValue('position');

      await image.destroy();

      // shift positions down
      const images = await Image.findAll({
        where: { id_post },
      });

      for (const img of images) {
        const pos = img.getDataValue('position');
        if (pos > deletedPosition) {
          await img.update({ position: pos - 1 });
        }
      }

      res.json({ message: 'image deleted' });
    } catch (err: any) {
      res
        .status(500)
        .json({ error: err.message });
    }
  },
);

router.get('/getVideo', async (req, res) => {
  try {
    const { token, id_video } = req.body;

    const id_user = await getUserFromToken(token);

    if (!id_user) {
      return res
        .status(400)
        .json({ error: 'token not valid' });
    }

    const video = await Video.findByPk(id_video);

    if (!video) {
      return res.status(400).json({
        error: "video with this id doesn't exist",
      });
    }

    res.json({
      id_video: video.getDataValue('id_video'),
      id_post: video.getDataValue('id_post'),
      path: video.getDataValue('path'),
      position: video.getDataValue('position'),
    });
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
    });
  }
});

router.post('/addVideo', async (req, res) => {
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

    if (
      post.getDataValue('id_user') !== id_user
    ) {
      return res.status(403).json({
        error: "this user doesn't own this post",
      });
    }

    // read videos folder
    const videosDir = path.join(
      process.cwd(),
      'videos',
    );

    let files = fs
      .readdirSync(videosDir)
      .filter((file) =>
        /\.(mp4|mov|avi|webm)$/i.test(file),
      );

    if (files.length === 0) {
      return res.status(500).json({
        error:
          'no videos available in /videos folder',
      });
    }

    const randomFile =
      files[
        Math.floor(Math.random() * files.length)
      ];

    const videoPath = `/videos/${randomFile}`;

    const videos = await Video.findAll({
      where: { id_post },
    });

    const maxPosition =
      videos.length > 0
        ? Math.max(
            ...videos.map(
              (v) =>
                v.getDataValue('position') || 0,
            ),
          )
        : -1;

    const video = await Video.create({
      id_post,
      position: maxPosition + 1,
      path: videoPath,
    });

    res.json({
      id_video: video.getDataValue('id_video'),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/editVideo', async (req, res) => {
  try {
    const {
      token,
      id_post,
      id_video,
      new_path,
      new_position,
    } = req.body;

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

    if (
      post.getDataValue('id_user') !== id_user
    ) {
      return res.status(403).json({
        error: "this user doesn't own this post",
      });
    }

    const video = await Video.findOne({
      where: { id_video, id_post },
    });

    if (!video) {
      return res.status(400).json({
        error:
          "video with this id_video either completely doesn't exist or is not linked to this id_post",
      });
    }

    // change path
    if (new_path) {
      await video.update({ path: new_path });
    }

    // change position
    if (new_position !== undefined) {
      const existing = await Video.findOne({
        where: {
          id_post,
          position: new_position,
        },
      });

      if (existing) {
        await existing.update({ position: -1 });
      }

      await video.update({
        position: new_position,
      });
    }

    res.json({ message: 'video updated' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete(
  '/deleteVideo',
  async (req, res) => {
    try {
      const { token, id_post, id_video } =
        req.body;

      const id_user =
        await getUserFromToken(token);
      if (!id_user) {
        return res
          .status(400)
          .json({ error: 'token not valid' });
      }

      const post = await Post.findByPk(id_post);
      if (!post) {
        return res.status(400).json({
          error:
            "post with this id doesn't exist",
        });
      }

      if (
        post.getDataValue('id_user') !== id_user
      ) {
        return res.status(403).json({
          error:
            "this user doesn't own this post",
        });
      }

      const video = await Video.findOne({
        where: { id_video, id_post },
      });

      if (!video) {
        return res.status(400).json({
          error:
            "video with this id_video either completely doesn't exist or is not linked to this id_post",
        });
      }

      const deletedPosition =
        video.getDataValue('position');

      await video.destroy();

      // shift positions
      const videos = await Video.findAll({
        where: { id_post },
      });

      for (const v of videos) {
        const pos = v.getDataValue('position');
        if (pos > deletedPosition) {
          await v.update({ position: pos - 1 });
        }
      }

      res.json({ message: 'video deleted' });
    } catch (err: any) {
      res
        .status(500)
        .json({ error: err.message });
    }
  },
);

router.post(
  '/changePostReactions',
  async (req, res) => {
    try {
      const { token, id_post, reaction } =
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

      const post = await Post.findByPk(id_post);
      if (!post) {
        return res.status(400).json({
          error:
            "post with this id doesn't exist",
        });
      }

      let postReactions =
        await PostReactions.findByPk(id_post);

      if (!postReactions) {
        postReactions =
          await PostReactions.create({ id_post });
      }

      let userReaction =
        await UserPostsReaction.findOne({
          where: { id_user, id_post },
        });

      // no previous reaction
      if (!userReaction) {
        const newData: any = {
          id_user,
          id_post,
        };

        validReactions.forEach(
          (r) => (newData[r] = false),
        );
        newData[reaction] = true;

        await UserPostsReaction.create(newData);
        await postReactions.increment(
          reactionMap[reaction],
        );

        return res.json({
          message: 'reaction added',
        });
      }

      // find previous reaction
      let previousReaction: string = '';

      for (const r of validReactions) {
        if (userReaction.getDataValue(r)) {
          previousReaction = r;
          break;
        }
      }

      // remove reaction if same clicked
      if (previousReaction === reaction) {
        await postReactions.decrement(
          reactionMap[previousReaction],
        );

        const resetData: any = {};
        validReactions.forEach(
          (r) => (resetData[r] = false),
        );

        await userReaction.update(resetData);

        return res.json({
          message: 'reaction removed',
        });
      }

      // change reaction
      if (previousReaction) {
        await postReactions.decrement(
          reactionMap[previousReaction],
        );
      }

      await postReactions.increment(
        reactionMap[reaction],
      );

      const updateData: any = {};
      validReactions.forEach(
        (r) => (updateData[r] = false),
      );
      updateData[reaction] = true;

      await userReaction.update(updateData);

      res.json({ message: 'reaction updated' });
    } catch (err: any) {
      res
        .status(500)
        .json({ error: err.message });
    }
  },
);

export default router;
