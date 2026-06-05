# Frontend

[GitHub repository of frontend](https://github.com/St0dent/facebook-api-frontend)

# Running the project

## Prerequisites

Make sure the following are installed:

* Git
* Node.js (includes npm)

Check the versions:

```bash
git --version
node --version
npm --version
```

---

## Clone the Repository

```bash
git clone https://github.com/WithoutName48/MyFacebook.git
```

This creates a local copy of the project.

---

## Navigate to the Project Folder

```bash
cd MyFacebook
```

---

## Install Dependencies

```bash
npm install
```

This downloads all packages defined in `package.json`.

---

## Configure Environment Variables

Create a `.env` file in `/src`, with the data as below.

Example:

```
NODE_ENV=test
PORT=3000
```

You can change the values if needed

---

## Run the Project in Development Mode

```bash
npm run dev
```

---

## Build the Project

```bash
npm run build
```

This compiles TypeScript files into JavaScript and creates the `/dist` directory.

---

## Run the Compiled Application

```bash
npm start
```

---

## Test the Application

```bash
npm test
```

---

## Pull Future Updates

After the repository has already been cloned, download the latest changes with:

```bash
git pull
```

If new dependencies were added, run:

```bash
npm install
```

# Authentication

## POST `/auth/register`

### Request

```json
{
  "login": "string",
  "password": "string",
  "repeat_password": "string",
  "email": "string"
}
```

### Response

#### Error

- If `password != repeat_password`

```json
{
  "error": "Passwords not matching"
}
```

- If `login` or `email` already exists

```json
{
  "error": "(login | email) already exists"
}
```

#### Success

```json
{
  "token": "string"
}
```

> The generated token should be saved in `Users_tokens`.

---

## POST `/auth/login`

### Request

```json
{
  "login_or_email": "string",
  "password": "string"
}
```

### Response

#### Error

```json
{
  "error": "wrong data"
}
```

#### Success

```json
{
  "token": "string"
}
```

> The generated token should be saved in `Users_tokens`.

---

## DELETE `/auth/deleteToken`

### Request

```json
{
  "token": "string"
}
```

### Response

#### Error

```json
{
  "error": "token not found"
}
```

#### Success

```json
{
  "message": "token successfully deleted"
}
```

---

# User

## GET `/user/userProfile`

### Request

```json
{
  "token": "string",
  "id_user": "number"
}
```

### Response

#### Error

- If token is not valid:

```json
{
  "error": "token not valid"
}
```

- If user does not exist:

```json
{
  "error": "user with this id doesn't exist"
}
```

#### Success

```json
{
  "name": "string",
  "surname": "string",
  "date_of_birth": "date",
  "current_place": "string",
  "hometown": "string",
  "relationship_status": "string",
  "education": "string",
  "work": "string"
}
```

---

## POST `/user/changePassword`

### Request

```json
{
  "token": "string",
  "password": "string",
  "new_password": "string",
  "repeat_new_password": "string"
}
```

### Response

#### Error

- Invalid token

```json
{
  "error": "token not valid"
}
```

- Wrong password

```json
{
  "error": "wrong password"
}
```

- Passwords do not match

```json
{
  "error": "new password doesn't match with the repeated one"
}
```

#### Success

```json
{
  "message": "password changed successfully"
}
```

---

## POST `/user/changeEmail`

### Request

```json
{
  "token": "string",
  "password": "string",
  "new_email": "string"
}
```

### Response

#### Error

- Invalid token

```json
{
  "error": "token not valid"
}
```

- Wrong password

```json
{
  "error": "wrong password"
}
```

#### Success

```json
{
  "message": "email changed successfully"
}
```

---

## POST `/user/changeDateOfBirth`

### Request

```json
{
  "token": "string",
  "new_date_of_birth": "YYYY-MM-DD"
}
```

### Response

#### Error

- Invalid token

```json
{
  "error": "token not valid"
}
```

- Invalid date format

```json
{
  "error": "new_date_of_birth wrong format"
}
```

- Date is in the future

```json
{
  "error": "new_date_of_birth can't be in the future"
}
```

#### Success

```json
{
  "message": "date_of_birth changed successfully"
}
```

---

## DELETE `/user/deleteDateOfBirth`

### Request

```json
{
  "token": "string"
}
```

### Response

#### Error

```json
{
  "error": "token not valid"
}
```

#### Success

```json
{
  "message": "date_of_birth deleted successfully"
}
```

---

## POST `/user/changeCurrentPlace`

### Request

```json
{
  "token": "string",
  "new_current_place": "string"
}
```

### Response

#### Error

```json
{
  "error": "token not valid"
}
```

#### Success

```json
{
  "message": "current_place changed successfully"
}
```

---

## DELETE `/user/deleteCurrentPlace`

### Request

```json
{
  "token": "string"
}
```

### Response

#### Error

```json
{
  "error": "token not valid"
}
```

#### Success

```json
{
  "message": "current_place deleted successfully"
}
```

---

## POST `/user/changeHometown`

### Request

```json
{
  "token": "string",
  "new_hometown": "string"
}
```

### Response

#### Error

```json
{
  "error": "token not valid"
}
```

#### Success

```json
{
  "message": "hometown changed successfully"
}
```

---

## DELETE `/user/deleteHometown`

### Request

```json
{
  "token": "string"
}
```

### Response

#### Error

```json
{
  "error": "token not valid"
}
```

#### Success

```json
{
  "message": "hometown deleted successfully"
}
```

---

## POST `/user/changeRelationshipStatus`

### Request

```json
{
  "token": "string",
  "new_relationship_status": "string"
}
```

### Response

#### Error

```json
{
  "error": "token not valid"
}
```

#### Success

```json
{
  "message": "relationship_status changed successfully"
}
```

---

## DELETE `/user/deleteRelationshipStatus`

### Request

```json
{
  "token": "string"
}
```

### Response

#### Error

```json
{
  "error": "token not valid"
}
```

#### Success

```json
{
  "message": "relationship_status deleted successfully"
}
```

---

## POST `/user/changeEducation`

### Request

```json
{
  "token": "string",
  "new_education": "string"
}
```

### Response

#### Error

```json
{
  "error": "token not valid"
}
```

#### Success

```json
{
  "message": "education changed successfully"
}
```

---

## DELETE `/user/deleteEducation`

### Request

```json
{
  "token": "string"
}
```

### Response

#### Error

```json
{
  "error": "token not valid"
}
```

#### Success

```json
{
  "message": "education deleted successfully"
}
```

---

## POST `/user/changeWork`

### Request

```json
{
  "token": "string",
  "new_work": "string"
}
```

### Response

#### Error

```json
{
  "error": "token not valid"
}
```

#### Success

```json
{
  "message": "work changed successfully"
}
```

## DELETE `/user/deleteWork`

### Request

```json
{
  "token": "string"
}
```

### Response

#### Error

```json
{
  "error": "token not valid"
}
```

#### Success

```json
{
  "message": "work deleted successfully"
}
```

---

# Posts

## GET `/post/getPost`

### Request

```json
{
  "token": "string",
  "id_post": "number"
}
```

### Response

#### Error

- Invalid token

```json
{
  "error": "token not valid"
}
```

- Post not found

```json
{
  "error": "there is no post with this id in database"
}
```

#### Success

```json
{
  "content": "string",
  "date_created": "datetime",
  "images": [1, 2, 3],
  "videos": [1, 2, 3],
  "post_reactions": {
    "like": 10,
    "love": 5,
    "haha": 2
  }
}
```

- `images` contains an array of `id_image` values sorted by position.
- `videos` contains an array of `id_video` values sorted by position.
- `post_reactions` contains reaction types as keys and counts as values.

---

## POST `/post/editPostContent`

### Request

```json
{
  "token": "string",
  "id_post": "number",
  "new_content": "string"
}
```

### Response

#### Error

- Invalid token

```json
{
  "error": "token not valid"
}
```

- Post not found

```json
{
  "error": "there is no post with this id in database"
}
```

#### Success

```json
{
  "message": "post content updated successfully"
}
```

---

## POST `/post/createPost`

### Request

```json
{
  "token": "string",
  "content": "string"
}
```

### Response

#### Error

- Invalid token

```json
{
  "error": "token not valid"
}
```

- Empty content

```json
{
  "error": "post must have content"
}
```

#### Success

```json
{
  "id_post": 123
}
```

- Creates a new post.
- Initializes all post reactions with a value of `0`.

---

## DELETE `/post/deletePost`

### Request

```json
{
  "token": "string",
  "id_post": "number"
}
```

### Response

#### Error

- Invalid token

```json
{
  "error": "token not valid"
}
```

- Post not found

```json
{
  "error": "there is no post with this id in database"
}
```

#### Success

```json
{
  "message": "post deleted successfully"
}
```

- Deletes the post together with all linked:
  - images
  - videos
  - reactions
  - comments

---

## GET `/post/getImage`

### Request

```json
{
  "token": "string",
  "id_image": "number"
}
```

### Response

#### Error

- Invalid token

```json
{
  "error": "token not valid"
}
```

- Image not found

```json
{
  "error": "image with this id doesn't exist"
}
```

#### Success

```json
{
  "id_image": 1,
  "id_post": 123,
  "path": "/images/example.jpg",
  "position": 0
}
```

---

## POST `/post/addImage`

### Request

```json
{
  "token": "string",
  "id_post": "number"
}
```

### Response

#### Error

- Invalid token

```json
{
  "error": "token not valid"
}
```

- Post not found

```json
{
  "error": "post with this id doesn't exist"
}
```

- User does not own the post

```json
{
  "error": "this user doesn't own this post"
}
```

#### Success

```json
{
  "id_image": 1
}
```

- Creates a new image.
- Chooses a random image path from `/images`.
- Sets the image position to `max(position) + 1` among images linked to the post.

---

## POST `/post/editImage`

### Request

```json
{
  "token": "string",
  "id_post": "number",
  "id_image": "number",
  "new_path": "string",
  "new_position": "number"
}
```

### Response

#### Error

- Invalid token

```json
{
  "error": "token not valid"
}
```

- Post not found

```json
{
  "error": "post with this id doesn't exist"
}
```

- User does not own the post

```json
{
  "error": "this user doesn't own this post"
}
```

- Image not linked to the post

```json
{
  "error": "image with this id_image either completely doesn't exist or is not linked to this id_post"
}
```

#### Success

```json
{
  "message": "image updated successfully"
}
```

Behavior:

- If `new_path` is provided, the image path is updated.
- If `new_position` is provided:
  - The image position is changed to `new_position`.
  - If another image already has that position, its position is set to `-1`.

---

## DELETE `/post/deleteImage`

### Request

```json
{
  "token": "string",
  "id_post": "number",
  "id_image": "number"
}
```

### Response

#### Error

- Invalid token

```json
{
  "error": "token not valid"
}
```

- Post not found

```json
{
  "error": "post with this id doesn't exist"
}
```

- User does not own the post

```json
{
  "error": "this user doesn't own this post"
}
```

- Image not linked to the post

```json
{
  "error": "image with this id_image either completely doesn't exist or is not linked to this id_post"
}
```

#### Success

```json
{
  "message": "image deleted successfully"
}
```

- Deletes the image from the database.
- Updates positions of the remaining images linked to the post accordingly.

## GET `/post/getVideo`

### Request

```json
{
  "token": "string",
  "id_video": "number"
}
```

### Response

#### Error

- Invalid token

```json
{
  "error": "token not valid"
}
```

- Video not found

```json
{
  "error": "video with this id doesn't exist"
}
```

#### Success

```json
{
  "id_video": 1,
  "id_post": 123,
  "path": "/videos/example.mp4",
  "position": 0
}
```

---

## POST `/post/addVideo`

### Request

```json
{
  "token": "string",
  "id_post": "number"
}
```

### Response

#### Error

- Invalid token

```json
{
  "error": "token not valid"
}
```

- Post not found

```json
{
  "error": "post with this id doesn't exist"
}
```

- User does not own the post

```json
{
  "error": "this user doesn't own this post"
}
```

#### Success

```json
{
  "id_video": 1
}
```

- Creates a new video.
- Chooses a random video path from `/videos`.
- Sets the video position to `max(position) + 1` among videos linked to the post.

---

## POST `/post/editVideo`

### Request

```json
{
  "token": "string",
  "id_post": "number",
  "id_video": "number",
  "new_path": "string",
  "new_position": "number"
}
```

### Response

#### Error

- Invalid token

```json
{
  "error": "token not valid"
}
```

- Post not found

```json
{
  "error": "post with this id doesn't exist"
}
```

- User does not own the post

```json
{
  "error": "this user doesn't own this post"
}
```

- Video not linked to the post

```json
{
  "error": "video with this id_video either completely doesn't exist or is not linked to this id_post"
}
```

#### Success

```json
{
  "message": "video updated successfully"
}
```

Behavior:

- If `new_path` is provided, the video path is updated.
- If `new_position` is provided:
  - The video position is changed to `new_position`.
  - If another video already has that position, its position is set to `-1`.

---

## DELETE `/post/deleteVideo`

### Request

```json
{
  "token": "string",
  "id_post": "number",
  "id_video": "number"
}
```

### Response

#### Error

- Invalid token

```json
{
  "error": "token not valid"
}
```

- Post not found

```json
{
  "error": "post with this id doesn't exist"
}
```

- User does not own the post

```json
{
  "error": "this user doesn't own this post"
}
```

- Video not linked to the post

```json
{
  "error": "video with this id_video either completely doesn't exist or is not linked to this id_post"
}
```

#### Success

```json
{
  "message": "video deleted successfully"
}
```

- Deletes the video from the database.
- Updates positions of the remaining videos linked to the post accordingly.

---

## POST `/post/changePostReactions`

### Request

```json
{
  "token": "string",
  "id_post": "number",
  "reaction": "like | love | care | haha | wow | sad | angry"
}
```

### Response

#### Error

- Invalid token

```json
{
  "error": "token not valid"
}
```

- Post not found

```json
{
  "error": "post with this id doesn't exist"
}
```

#### Success

```json
{
  "message": "reaction added successfully"
}
```

Behavior:

- Updates `PostReactions` by incrementing the selected reaction count by `1`.
- Updates `UserPostsReactions` by setting the selected reaction field to `true` for the specified post.

---

# Comments

## GET `/post/comments/getComments`

### Request

```json
{
  "token": "string",
  "id_post": "number"
}
```

### Response

#### Error

- Invalid token

```json
{
  "error": "token not valid"
}
```

- Post not found

```json
{
  "error": "post with this id doesn't exist"
}
```

#### Success

```json
{
  "comments": []
}
```

- Returns an array containing all comments for the specified post.

---

## GET `/post/comments/getComment`

### Request

```json
{
  "token": "string",
  "id_comment": "number"
}
```

### Response

#### Error

- Invalid token

```json
{
  "error": "token not valid"
}
```

- Comment not found

```json
{
  "error": "comment with this id doesn't exist"
}
```

#### Success

```json
{
  "id_user": 1,
  "id_post": 123,
  "id_comment_replied_to": 45,
  "date_created": "2026-06-02T12:00:00Z",
  "content": "Comment content",
  "children": []
}
```

- `children` contains child comments sorted in descending order by `date_created`.

---

## POST `/post/comments/createComment`

### Request

```json
{
  "token": "string",
  "id_post": "number",
  "id_comment_replied_to": "number",
  "content": "string"
}
```

> Either `id_post` or `id_comment_replied_to` must be provided.

### Response

#### Error

- Invalid token

```json
{
  "error": "token not valid"
}
```

- Post not found

```json
{
  "error": "post with this id doesn't exist"
}
```

- Parent comment not found

```json
{
  "error": "comment, which is the parent (replied to), with this id doesn't exist"
}
```

#### Success

```json
{
  "message": "comment created successfully",
  "id_comment": 1
}
```

- Creates a comment with the provided content and appropriate parent/post relationship.

## DELETE `/post/comments/deleteComment`

### Request

```json
{
  "token": "string",
  "id_comment": "number"
}
```

### Response

#### Error

- Invalid token

```json
{
  "error": "token not valid"
}
```

- Comment not found

```json
{
  "error": "comment with this id doesn't exist"
}
```

#### Success

```json
{
  "message": "comment deleted successfully"
}
```

Behavior:

- Deletes the specified comment.
- Deletes all descendant comments recursively.

---

## POST `/post/comments/changeCommentReactions`

### Request

```json
{
  "token": "string",
  "id_comment": "number",
  "reaction": "like | love | care | haha | wow | sad | angry"
}
```

### Response

#### Error

- Invalid token

```json
{
  "error": "token not valid"
}
```

- Comment not found

```json
{
  "error": "comment with this id doesn't exist"
}
```

#### Success

```json
{
  "message": "reaction added successfully"
}
```

Behavior:

- Updates `CommentReactions` by incrementing the selected reaction count by `1`.
- Updates `UserCommentsReactions` by setting the selected reaction field to `true` for the specified comment.

---

# Search

## GET `/search/postsFeed`

### Request

```json
{
  "token": "string"
}
```

### Response

#### Error

- Invalid token

```json
{
  "error": "token not valid"
}
```

#### Success

```json
[
  123,
  456,
  789
]
```

- Returns an array containing **50 randomly selected post IDs** from the database.

---

## GET `/search/postsUser`

### Request

```json
{
  "token": "string",
  "id_user": "number"
}
```

### Response

#### Error

- Invalid token

```json
{
  "error": "token not valid"
}
```

- User not found

```json
{
  "error": "user with this id doesn't exist"
}
```

#### Success

```json
[
  123,
  456,
  789
]
```

- Returns up to **50 post IDs** belonging to the specified user.
- Posts are sorted in **descending order by `date_created`**.

---

## GET `/search/search`

### Request

```json
{
  "token": "string",
  "input": "string"
}
```

### Response

#### Error

- Invalid token

```json
{
  "error": "token not valid"
}
```

#### Success

```json
{
  "users": [1, 2, 3, 4, 5],
  "posts": [101, 102, 103, 104]
}
```

Behavior:

- Returns up to **10 user IDs** where `input` is a prefix of:
  - `name`
  - `surname`
  - `"name surname"`

- Returns up to **20 post IDs** where the post content contains `input` as a substring.

Alternative flat-array representation (matching the original specification):

```json
[
  "user_id_1",
  "user_id_2",
  "...",
  "user_id_10",
  "post_id_1",
  "post_id_2",
  "...",
  "post_id_20"
]
```

- The first 10 elements are matching user IDs.
- The next 20 elements are matching post IDs.
