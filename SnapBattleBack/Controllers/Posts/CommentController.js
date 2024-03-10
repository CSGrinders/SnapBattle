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

        const post = await Post.findById(postID).populate('comments');
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

module.exports.postComment = async(req, res) => {
    try {
        const userID = req.body.userID;
        const postID = req.body.postID;
        const commentBody = req.body.commentBody;
        const replyTo = req.body.replyTo;

        const user = await User.findById(userID);
        const post = await Post.findById(postID);
        const replyComment = await Comment.findById(replyTo);

        if (!user) {
            res.status(404).json({errorMessage: "User not found"});
        }
        if (!post) {
            res.status(404).json({errorMessage: "Post not found"});
        }

        if (!replyComment) {
            replyTo = null;
        }

        const newComment = new Comment({
            userID: userID,
            postID: postID,
            body: commentBody,
            replyTo: replyTo
        });

        console.log("PostComment module: New comment created");

        await newComment.save();

        post.comments.push(newComment._id);
        await post.save();

        res.status(200).json({commentCreated: true});

    } catch (error) {
        console.log("CommentController postComment: " + error)
        res.status(500).json({errorMessage: "Something went wrong"})
    }

}


module.exports.deleteComment = async(req, res) => {
    const postID = req.body.postID;
    const commentID = req.body.commentID;

    const post = await Post.findById(postID);
    const comment = await Comment.findById(commentID);

    if (!post) {
        res.status(404).json({errorMessage: "Post not found"});
    }

    if (!comment) {
        res.status(404).json({errorMessage: "Comment not found"});
    }

    post.comments.filter((id) => id.toString() !== comment._id.toString());
    await post.save();
    await Comment.findByIdAndDelete(commentID);
}

module.exports.editComment = async(req, res) => {
    try {
        const userID = req.body.userID;
        const commentID = req.body.commentID;
        const content = req.body.content;
    
        const user = await User.findById(userID);
        const comment = await Comment.findById(commentID);
    
        if (!user) {
            res.status(404).json({errorMessage: "User not found"});
        }
    
        if (!comment) {
            res.status(404).json({errorMessage: "Comment not found"});
        }

        if (comment.userID !== userID) {
            res.status(404).json({errorMessage: "Comment owner does not match user"});
        }

        comment.body = content;
        await comment.save();

        res.status(200).json({commentUpdated: true});

    } catch (error) {
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}

module.exports.toggleComments = async(req, res) => {
    try {
        const postID = req.body.postID;
        const userID = req.body.userID;

        const user = await User.findById(userID);
        const post = await Post.findById(postID);

        if (!user) {
            res.status(404).json({errorMessage: "User not found"});
        }

        if (!post) {
            res.status(404).json({errorMessage: "Post not found"})
        }

        if (post.owner !== user._id) {
            res.status(404).json({errorMessage: "User does not match post owner"});
        }

        post.commentsAllowed = !post.commentsAllowed;
        await post.save();

        res.status(200).json({commentsAllowed: post.commentsAllowed});
    } catch (error) {
        res.status(500).json({errorMessage: "Something went wrong..."})
    }

}