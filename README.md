POST /auth/register <br>
req: <br>
    - login <br>
    - password <br>
    - repeat_password <br>
    - email <br> 
res: <br>
    if password != repeat_password <br>
        error: "Passwords not matching" <br>
    if login or email already exists: <br>
        error: "(login | email) already exists" <br>
    success <br>
        token, this token should be saved in Users_tokens <br>

POST /auth/login <br>
req:  <br>
    - login or email <br>
    - password <br>
res: <br>
    if req data not matching with the ones in database: <br>
        error: wrong data <br>
    success: <br>
        token, this token should be saved in Users_tokens <br>

DELETE /auth/deleteToken <br>
req: <br>
    -token <br>
res: <br>
    if token not found i database: <br>
        error: token not found <br>
    success: <br>
        token successfully deleted <br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
GET /user/userProfile <br>
req <br>
    - token <br>
    - id_user <br>
res: <br>
    if token not valid (isn't in UserToken): <br>
        error: token not valid <br>
    if id_user not found in database <br>
        error: user with this id doesn't exist <br>
    success: <br>
        return { <br>
            name, <br>
            surname, <br>
            date_of_birth, <br> 
            current_place, <br>
            hometown, <br>
            relationship_status, <br>
            education, <br>
            work <br> 
        } <br>
<br>
POST /user/changePassword <br>
req: <br>
    - token <br>
    - password <br>
    - new_password <br>
    - repeat_new_password <br>
res: <br>
    if token not valid (isn't in UserToken): <br>
        error: token not valid <br>
    if user's password that has this token doesn't match password <br>
        error: wrong password <br>
    if new_password != repeat_new_password <br>
        erorr: new password doesn't match with the repeated one <br>
    success: <br>
        change user's password in database to new_password <br>
<br>
POST /user/changeEmail
req:
    - token
    - password
    - new_email
res:
    if token not valid (isn't in UserToken):
        error: token not valid
    if user's password that has this token doesn't match password
        error: wrong password
    success:
        change user's emial in database to new_email

POST /user/changeDateOfBirth
req:
    - token
    - new_date_of_birth
res:
    if token not valid (isn't in UserToken):
        error: token not valid  
    if new_date_of_birth wrong format:
        error: new_date_of_birth wrong format
    if new_date_of_birth date in the future:
        error: new_date_of_birth can't be in the future
    success:
        change user's date_of_birth in database to new_date_of_birth

DELETE /user/deleteDateOfBirth
req:
    - token
res:
    if token not valid (isn't in UserToken):
        error: token not valid  
    success:
        delete user's date_of_birth from database

POST /user/changeCurrentPlace
req:
    - token
    - new_current_place
res:
    if token not valid (isn't in UserToken):
        error: token not valid  
    success:
        change user's current_place in database to new_current_place

DELETE /user/deleteCurrentPlace
req:
    - token
res:
    if token not valid (isn't in UserToken):
        error: token not valid  
    success:
        delete user's current_place from database

POST /user/changeHometown
req:
    - token
    - new_hometown
res:
    if token not valid (isn't in UserToken):
        error: token not valid 
    success:
        change user's hometown in database to new_hometown

DELETE /user/deleteHometown
req:
    - token
res:
    if token not valid (isn't in UserToken):
        error: token not valid  
    success:
        delete user's hometown from database

POST /user/changeRelationshipStatus
req:
    - token
    - new_relationship_status
res:
    if token not valid (isn't in UserToken):
        error: token not valid  
    success:
        change user's relationship_status in database to new_relationship_status

DELETE /user/deleteRelationshipStatus
req:
    - token
res:
    if token not valid (isn't in UserToken):
        error: token not valid 
    success:
        delete user's relationship_status from database

POST /user/changeEducation
req:
    - token
    - new_education
res:
    if token not valid (isn't in UserToken):
        error: token not valid  
    success:
        change user's education in database to new_education

DELETE /user/deleteEducation
req:
    - token
res:
    if token not valid (isn't in UserToken):
        error: token not valid  
    success:
        delete user's education from database

POST /user/changeWork
req:
    - token
    - new_work
res:
    if token not valid (isn't in UserToken):
        error: token not valid  
    success:
        change user's work in database to new_work

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
