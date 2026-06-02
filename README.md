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

DELETE /user/deleteWork
req:
    - token
res:
    if token not valid (isn't in UserToken):
        error: token not valid  
    success:
        delete user's work from database










GET /post/getPost
req:
    - token
    - id_post
res:
    if token not valid (isn't in UserToken):
        error: token not valid  
    if id_post not found in database 
        error: there is no post with this id in database
    success:
        return {
            content,
            date_created,
            images (array of id_image linked to this post in sorted order based on positions),
            videos (array of id_video linked to this post in sorted order based on positions),
            post_reactions (as an array with key: type of reaction, and value: number of such reactions)
        }

POST /post/editPostContent
req:
    - token
    - id_post
    - new_content
res:
    if token not valid (isn't in UserToken):
        error: token not valid  
    if id_post not found in database 
        error: there is no post with this id in database
    success:
        change current content of post with new_content

POST /post/createPost
req:
    - token
    - content
res:
    if token not valid (isn't in UserToken):
        error: token not valid  
    if content empty
        error: post must have content
    success:
        create post with this content, as a post_reactions linked to this post set all reactions to 0
        return id_post

DELETE /post/deletePost
req:
    - token
    - id_post
res:
    if token not valid (isn't in UserToken):
        error: token not valid  
    if id_post not found in database 
        error: there is no post with this id in database
    success:
        delete this post from databases with all the images, videos, reactions and comments linked to this post

GET /post/getImage
req:
    - token
    - id_image
res:
    if token not valid (isn't in UserToken):
        error: token not valid  
    if id_image not found in database
        error: image with this id doesn't exist
    success:
        return {
            "id_image"
            "id_post"
            "path"
            "position"
        }

POST /post/addImage
req:
    - token
    - id_post
res:
    if token not valid (isn't in UserToken):
        error: token not valid  
    if id_post not found in database
        error: post with this id doesn't exist
    if post with this id_post doesn't belong to this user
        error: this user doesn't own this post
    success:
        create image in database, as path choose randomly some image from /images, as postion add the postion that is +1 than the biggest postion from other images linked to this post
        return id_image

POST /post/editImage
req:
    - token
    - id_post
    - id_image
    - new_path or new_position
res:
    if token not valid (isn't in UserToken):
        error: token not valid  
    if id_post not found in database
        error: post with this id doesn't exist
    if post with this id_post doesn't belong to this user
        error: this user doesn't own this post
    if there is no id_image belonging to this id_post
        error: image with this id_image either completely doesn't exist or is not linked to this id_post
    success:
        if new_path is given then change the path of image with new_path
        if new_postion is given then change the current postion of this image to new_postion. If there exists image with this new_positon then change the position of that image to -1

DELETE /post/deleteImage
req:
    - token
    - id_post
    - id_image
res:
    if token not valid (isn't in UserToken):
        error: token not valid  
    if id_post not found in database
        error: post with this id doesn't exist
    if post with this id_post doesn't belong to this user
        error: this user doesn't own this post
    if there is no image with this id_image belonging to post with this id_post:
        error: image with this id_image either completely doesn't exist or is not linked to this id_post
    success:
        delete image from database, update the positon of other images belonging to this post appropriately

GET /post/getVideo
req:
    - token
    - id_video
res:
    if token not valid (isn't in UserToken):
        error: token not valid  
    if id_video not found in database
        error: image with this id doesn't exist
    success:
        return {
            "id_video"
            "id_post"
            "path"
            "position"
        }

POST /post/addVideo
req:
    - token
    - id_post
res:
    if token not valid (isn't in UserToken):
        error: token not valid  
    if id_post not found in database
        error: post with this id doesn't exist
    if post with this id_post doesn't belong to this user
        error: this user doesn't own this post
    success:
        create video in database, as path choose randomly some video from /videos, as postion add the postion that is +1 than the biggest postion from other videos linked to this post
        return id_video

POST /post/editVideo
req:
    - token
    - id_post
    - id_video
    - new_path or new_position
res:
    if token not valid (isn't in UserToken):
        error: token not valid  
    if id_post not found in database
        error: post with this id doesn't exist
    if post with this id_post doesn't belong to this user
        error: this user doesn't own this post
    if there is no id_video belonging to this id_post
        error: video with this id_video either completely doesn't exist or is not linked to this id_post
    success:
        if new_path is given then change the path of video with new_path
        if new_postion is given then change the current postion of this video to new_postion. If there exists video with this new_positon then change the position of that video to -1

DELETE /post/deleteVideo
req:
    - token
    - id_post
    - id_video
res:
    if token not valid (isn't in UserToken):
        error: token not valid 
    if id_post not found in database
        error: post with this id doesn't exist
    if post with this id_post doesn't belong to this user
        error: this user doesn't own this post
    if there is no video with this id_video belonging to post with this id_post:
        error: video with this id_video either completely doesn't exist or is not linked to this id_post
    success:
        delete video from database, update the positon of other videos belonging to this post appropriately

POST /post/changePostReactions
req:
    - token
    - id_post
    - reaction ("like" or "love" or "care" or "haha" or "wow" or "sad" or "angry")
res:
    if token not valid (isn't in UserToken):
        error: token not valid 
    if id_post not found in database
        error: post with this id doesn't exist
    success:
        update PostReactions. Add +1 to appropriate field
        update UserPostsReacions. set True to the appropriate field, with id_post from req










GET /post/comments/getComments
req:
    - token
    - id_post
res:
    if token not valid (isn't in UserToken):
        error: token not valid  
    if id_post not found in database
        error: post with this id doesn't exist
    success:
        return {
            comments (array of comments)
        }

GET /post/comments/getComment
req:
    - token
    - id_comment
res:
    if token not valid (isn't in UserToken):
        error: token not valid  
    if id_comment not found in database
        error: comment with this id doesn't exist
    success:
        return {
            id_user,
            id_post,
            id_comment_replied_to,
            date_created,
            content,
            children (array of children of this comment sorted in descending order based on date_created)
        }

POST /post/comments/createComment
req:
    - token
    - id_post or id_comment_replied_to
    - content
res:
    if token not valid (isn't in UserToken):
        error: token not valid  
    if id_post not found in database
        error: post with this id doesn't exist
    if id_comment_replied_to not found in database
        error: comment, which is the parent (replied to), with this id doesn't exist
    success:
        create comment with appropriate data

DELETE /post/comments/deleteComment
req:
    - token 
    - id_comment
res:
    if token not valid (isn't in UserToken):
        error: token not valid  
    if id_comment not found in database
        error: comment with this id doesn't exist
    success:
        delete this comment and all other comments that are descendants

POST /post/comments/changeCommentReactions
req:
    - token
    - id_comment
    - reaction ("like" or "love" or "care" or "haha" or "wow" or "sad" or "angry")
res:
    if token not valid (isn't in UserToken):
        error: token not valid  
    if id_comment not found in database
        error: comment with this id doesn't exist
    success:
        update CommentReactions. Add +1 to appropriate field
        update UserCommentsReacions. set True to the appropriate field, with id_comment from req










GET /search/postsFeed
req:
    - token
res:
    if token not valid (isn't in UserToken):
        error: token not valid 
    success:
        return array (of length 50) of randomly chosen indexes of posts from database

GET /search/postsUser
req:
    - token
    - id_user
res:
    if token not valid (isn't in UserToken):
        error: token not valid 
    if id_user not found in database
        error: user with this id doesn't exist
    success:
        return array (of length 50) of indexes of posts from database that belong to this id_user and are sorted in descending order based on date_created

GET /search/search
req:
    - token
    - input
res:
    if token not valid (isn't in UserToken):
        error: token not valid 
    success:
        return array:
        first ten elements are user_id of user whose input is a prefix of either name or surname or prefix of `${name} ${surname}`
        next 20 elements are post_id of posts which content has somewhere a substring of input
