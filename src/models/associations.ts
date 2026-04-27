import { User } from './User.js';
import { UserToken } from './UserToken.js';
import { UserPersonalData } from './UserPersonalData.js';
import { Post } from './Post.js';
import { Comment } from './Comment.js';
import { Image } from './Image.js';
import { Video } from './Video.js';
import { PostReactions } from './PostReactions.js';
import { CommentReactions } from './CommentReactions.js';
import { UserPostsReaction } from './UserPostsReaction.js';
import { UserCommentsReaction } from './UserCommentsReaction.js';

// User relations
User.hasMany(Post, { foreignKey: 'id_user' });
User.hasMany(Comment, { foreignKey: 'id_user' });
User.hasMany(UserToken, {
  foreignKey: 'id_user',
});

User.hasOne(UserPersonalData, {
  foreignKey: 'id_user',
});

// Posts
Post.belongsTo(User, { foreignKey: 'id_user' });

Post.hasMany(Comment, { foreignKey: 'id_post' });
Post.hasMany(Image, { foreignKey: 'id_post' });
Post.hasMany(Video, { foreignKey: 'id_post' });
Post.hasOne(PostReactions, {
  foreignKey: 'id_post',
});

// Comments
Comment.belongsTo(User, {
  foreignKey: 'id_user',
});
Comment.belongsTo(Post, {
  foreignKey: 'id_post',
});

Comment.hasOne(CommentReactions, {
  foreignKey: 'id_comment',
});
// Parent comment
Comment.belongsTo(Comment, {
  as: 'parent',
  foreignKey: 'id_comment_replied_to',
});
// Replies (children)
Comment.hasMany(Comment, {
  as: 'replies',
  foreignKey: 'id_comment_replied_to',
});

// Media
Image.belongsTo(Post, { foreignKey: 'id_post' });
Video.belongsTo(Post, { foreignKey: 'id_post' });

// Reactions
PostReactions.belongsTo(Post, {
  foreignKey: 'id_post',
});
CommentReactions.belongsTo(Comment, {
  foreignKey: 'id_comment',
});

// Post reactions
UserPostsReaction.belongsTo(User, {
  foreignKey: 'id_user',
});
UserPostsReaction.belongsTo(Post, {
  foreignKey: 'id_post',
});

// Comment reactions
UserCommentsReaction.belongsTo(User, {
  foreignKey: 'id_user',
});
UserCommentsReaction.belongsTo(Comment, {
  foreignKey: 'id_comment',
});
