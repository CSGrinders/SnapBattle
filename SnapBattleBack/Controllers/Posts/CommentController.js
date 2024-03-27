/*
 * GroupActionsController.js
 *
 * This controller manages group-related actions.
 *
 * Functionalities:
 * - GetGroups: Lists all groups a user is a member of, including group ID and name.
 * - CreateGroup: Allows a user to create a new group with specified fields such as group name, maximum users,
 *   start and end time for the group's activity, and voting period.
 * - ListUsers: Provides a list of all users within a specified group, helping group management and interaction.
 * - AcceptGroupInvite: Accepts an existing invite to a group
 * - RejectGroupInvite: Rejects an existing invite to a group
 * - LeaveGroup: Allows a user to leave a group they are in
 *
 * @SnapBattle, 2024
 * Author: CSGrinders
 *
 */

const {User} = require('../../Models/User');
const {Post, Comment} = require('../../Models/Post');


module.exports.viewComments = async(req, res) => {
    try {
        const {postID} = req.params;

        const post = await Post.findById(postID).populate({
            path: 'comments',
            populate: {
                path: 'userID',
                model: 'User'
            }
        });
        if (post) {
            const comments = post.comments;
            res.status(200).json({comments: comments});
        } else {
            res.status(404).json({errorMessage: "Post not found"});
        }
    } catch (error) {
        console.log("CommentController viewComments: " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}

module.exports.viewReplies = async(req, res) => {
    try {
        const {commentID} = req.params;

        const comment = await Comment.findById(commentID);
        if (comment.replyBy.length === 0) {
            return res.status(500).json({errorMessage: "reply empty"});
        }

        const replies = comment.replyBy;
        const replyComments = [];
        for (const replyCommentID of replies) {
            const replyComment = await Comment.findById(replyCommentID);
            if (replyComment) {
                replyComments.push(replyComment);
            } else {
                // what to do
            }
        }

        return res.status(200).json({replyComments: replyComments});
    } catch (error) {
        console.log("CommentController viewComments: " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}

module.exports.postComment = async(req, res) => {
    try {
        const {userID, postID} = req.params;
        // const userID = req.params.userID;
        // const postID = req.params.postID;
        let {commentBody, replyTo} = req.body;
        // const commentBody = req.body.commentBody;
        // let replyTo = req.body.replyTo;

        if (commentBody === '' || commentBody.trim() === '') {
            return res.status(500).json({errorMessage: "empty message is not available"});
        }
        console.log(userID, postID, commentBody, replyTo);

        const user = await User.findById(userID);
        const post = await Post.findById(postID);
        let replyComment = null;

        console.log(replyComment);
        if (replyTo !== null && replyTo !== undefined && replyTo !== '') {
            replyComment = await Comment.findById(replyTo);
        }

        if (replyComment && user) {
            commentBody = "@" + user.username + " " + commentBody;
        }

        if (!user) {
            res.status(404).json({errorMessage: "User not found"});
        }
        if (!post) {
            res.status(404).json({errorMessage: "Post not found"});
        }

        const newComment = new Comment({
            userID: userID,
            postID: postID,
            body: commentBody,
            replyTo: replyComment,
            replyBy: []
        });

        console.log("PostComment module: New comment created");

        await newComment.save();

        post.comments.push(newComment);
        await post.save();

        if (replyComment) {
            replyComment.replyBy.push(newComment);
            replyComment.save();
        }



        const post_temp = await Post.findById(postID).populate({
            path: 'comments',
            populate: {
                path: 'userID',
                model: 'User'
            }
        });

        const comments = post_temp.comments;
        res.status(200).json({comments: comments});

    } catch (error) {
        console.log("CommentController postComment: " + error)
        res.status(500).json({errorMessage: "Something went wrong"})
    }

}


module.exports.deleteComment = async(req, res) => {
    console.log("deleteComment in Commentcontroller");
    const {userID, groupID, postID, commentID} = req.params;

    const post = await Post.findById(postID);
    const comment = await Comment.findById(commentID);

    if (!post) {
        return res.status(404).json({errorMessage: "Post not found"});
    }

    if (!comment) {
        return res.status(404).json({errorMessage: "Comment not found"});
    }

    if (post.comments.includes(commentID)) {
        post.comments.pull(commentID);
        await post.save();
    }

    await Comment.findByIdAndDelete(commentID);

    const post_temp = await Post.findById(postID).populate({
        path: 'comments',
        populate: {
            path: 'userID',
            model: 'User'
        }
    });

    const comments = post_temp.comments;
    console.log(comments);
    res.status(200).json({comments: comments});
}

module.exports.editComment = async(req, res) => {
    try {
        const userID = req.body.userID;
        const commentID = req.body.commentID;
        const content = req.body.content;
        const postID = req.params.postID;

        console.log(userID, commentID, content)
    
        const user = await User.findById(userID);
        const comment = await Comment.findById(commentID);
    
        if (!user) {
            return res.status(404).json({errorMessage: "User not found"});
        }
    
        if (!comment) {
            return res.status(404).json({errorMessage: "Comment not found"});
        }

        if (comment.userID.toString() !== userID) {
            console.log(comment.userID, userID)
            return res.status(404).json({errorMessage: "Comment owner does not match user"});
        }

        comment.body = content;
        await comment.save();

        const post_temp = await Post.findById(postID).populate({
            path: 'comments',
            populate: {
                path: 'userID',
                model: 'User'
            }
        });

        const comments = post_temp.comments;

        return res.status(200).json({commentUpdated: true, comments: comments});

    } catch (error) {
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}

module.exports.toggleComments = async(req, res) => {
    try {
        const postID = req.body.postID;
        const userID = req.body.userID;
        const commentsAllowed = req.body.commentsAllowed

        console.log(postID, userID, commentsAllowed)

        const user = await User.findById(userID);
        const post = await Post.findById(postID);

        if (!user) {
            console.log("1")
            return res.status(404).json({errorMessage: "User not found"});
        }

        if (!post) {
            console.log("2")
            return res.status(404).json({errorMessage: "Post not found"})
        }

        if (post.owner.toString() !== user._id.toString()) {
            return res.status(404).json({errorMessage: "User does not match post owner"});
        }

        post.commentsAllowed = commentsAllowed;
        await post.save();

        return res.status(200).json({commentsAllowed: post.commentsAllowed});
    } catch (error) {
        res.status(500).json({errorMessage: "Something went wrong..."})
    }
}

module.exports.commentsEnabled = async(req, res) => {
    try {
        const {postID} = req.params
        const post = await Post.findById(postID);
        if (post) {
            res.status(200).json({commentsAllowed: post.commentsAllowed})
        } else {
            console.log("Post not found")
            res.status(404).json({errorMessage: "Post not found"})
        }
    } catch (error) {
        console.log("Comment enabled: server error")
        res.status(500).json({errorMessage: "Server error"})
    }
}
