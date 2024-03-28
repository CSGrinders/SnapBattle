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
const Group = require("../../Models/Group");


module.exports.viewComments = async(req, res) => {
    try {
        const {postID} = req.params;


        const post = await Post.findById(postID).populate({path: 'comments',
            populate: [{ path: 'userID', select: '_id name profilePicture username', model: 'User'},
                {path: 'replyBy', populate: {path: 'userID', select: '_id name profilePicture username'
                }},
                {path: 'replyTo', populate: {path: 'userID', select: '_id name profilePicture username'
                }}
            ]
        });

        if (post) {
            const comments = post.comments;
            console.log("comments: ", comments)
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
        console.log("viewReplies:", req.params);
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

        console.log(replyComments);

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
        // console.log(userID, postID, commentBody, replyTo);

        const user = await User.findById(userID);
        const post = await Post.findById(postID);
        let replyComment = null;
        let originalReplyComment = null;
        let replyTraverseID;

        if (replyTo !== null && replyTo !== undefined && replyTo !== '') {
            originalReplyComment = await Comment.findById(replyTo);
            replyTraverseID = replyTo;
            do {
                replyComment = await Comment.findById(replyTraverseID);
                replyTraverseID = replyComment.replyTo;
            } while(replyTraverseID !== null && replyTraverseID !== undefined);
        }

        if (originalReplyComment && user) {
            const originalReplyUser = await User.findById(originalReplyComment.userID);
            commentBody = "@" + originalReplyUser.username + " " + commentBody;
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
            replyBy: [],
            likes: [],
        });

        console.log("PostComment module: New comment created");

        await newComment.save();

        post.comments.push(newComment);
        await post.save();

        if (replyComment) {
            replyComment.replyBy.push(newComment);
            replyComment.save();
        }



        const post_temp = await Post.findById(postID).populate({path: 'comments',
            populate: [{ path: 'userID', select: '_id name profilePicture username', model: 'User'},
                {path: 'replyBy', populate: {path: 'userID'}},
                {path: 'replyTo', populate: {path: 'userID'}}
            ]
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
        await comment.populate([{path: 'replyBy'}, {path: 'userID'}]);
        console.log("delteed reply by: ", comment.userID);
        if (comment.replyBy.length > 0) {
            console.log("replies not empty");
            comment.body = "This message is deleted by the user";
            // comment.userID = new User({
            //     username: 'deletedUser',
            //     email: 'delete',
            //     password: 'afsdf'
            // });
            // shat
            await comment.save();
            console.log(comment.userID);
        } else {
            post.comments.pull(commentID);
            await post.save();
            await Comment.findByIdAndDelete(commentID);
        }
    }

    const post_temp = await Post.findById(postID).populate({path: 'comments',
        populate: [{ path: 'userID', select: '_id name profilePicture username', model: 'User'},
            {path: 'replyBy', populate: {path: 'userID'}},
            {path: 'replyTo', populate: {path: 'userID'}}
        ]
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

        const post_temp = await Post.findById(postID).populate({path: 'comments',
            populate: [{ path: 'userID', select: '_id name profilePicture username', model: 'User'},
                {path: 'replyBy', populate: {path: 'userID', select: '_id name profilePicture username'}},
                {path: 'replyTo', populate: {path: 'userID', select: '_id name profilePicture username'}}
            ]
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
module.exports.postLike = async(req, res) => {
    console.log("getLikes");
    const {postID, commentID, userID} = req.params;

    const post = await Post.findById(postID);
    const comment = await Comment.findById(commentID);
    const user = await User.findById(userID);

    if (!post) {
        return res.status(404).json({errorMessage: "Post not found"});
    }

    if (!comment) {
        return res.status(404).json({errorMessage: "Comment not found"});
    }

    if (!comment.likes.includes(user._id)) {
        comment.likes.push(user);
        await comment.save();
    } else {
        return res.status(500).json({errorMessage: "user already liked it"});
    }

    const post_temp = await Post.findById(postID).populate({path: 'comments',
        populate: [{ path: 'userID', select: '_id name profilePicture username', model: 'User'},
            {path: 'replyBy', populate: {path: 'userID', select: '_id name profilePicture username'}},
            {path: 'replyTo', populate: {path: 'userID', select: '_id name profilePicture username'}}
        ]
    });

    const comments = post_temp.comments;

    return res.status(200).json({commentUpdated: true, comments: comments});

    console.log(comment);
    res.status(200).json({likes: comment.likes});
}


module.exports.deleteLike = async(req, res) => {
    console.log("delete Likes");
    const {postID, commentID, userID} = req.params;

    const post = await Post.findById(postID);
    const comment = await Comment.findById(commentID);
    const user = await User.findById(userID);

    if (!post) {
        return res.status(404).json({errorMessage: "Post not found"});
    }

    if (!comment) {
        return res.status(404).json({errorMessage: "Comment not found"});
    }

    // delete likes
    comment.likes = comment.likes.filter(like => like.toString() !== userID);
    await comment.save();

    const post_temp = await Post.findById(postID).populate({path: 'comments',
        populate: [{ path: 'userID', select: '_id name profilePicture username', model: 'User'},
            {path: 'replyBy', populate: {path: 'userID', select: '_id name profilePicture username'}},
            {path: 'replyTo', populate: {path: 'userID', select: '_id name profilePicture username'}}
        ]
    });

    const comments = post_temp.comments;

    return res.status(200).json({commentUpdated: true, comments: comments});

    console.log(comment);
    res.status(200).json({likes: comment.likes});
}