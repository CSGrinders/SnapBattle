const Group = require('../../Models/Group');
const {User} = require("../../Models/User");
const Prompt = require('../../Models/Prompt')
const {Configuration, OpenAI} = require('openai')
const {Post} = require("../../Models/Post");
const mongoose = require("mongoose");
const {OPENAI_API_KEY} = process.env


async function updateDailyWinner(todayPrompt) {
    const posts = todayPrompt.posts
    //no posts -> no daily winner
    if (posts.length === 0) {
        todayPrompt.dailyWinnerID = null
        await todayPrompt.save()
        return
    }

    //find post with highest number of votes
    let maxVotes = 0;
    let winner = null
    for (let i = 0; i < posts.length; i++) {
        if (posts[i].dailyVotes.length > maxVotes) {
            maxVotes = posts[i].dailyVotes.length
            winner = posts[i]
        }

        //tie exists -> no winner
        else if (posts[i].dailyVotes.length === maxVotes) {
            winner = null
        }
    }

    //save the winner (null if no winner exists)
    if (winner != null) {
        todayPrompt.dailyWinnerID = winner._id
    }
    else {
        todayPrompt.dailyWinnerID = null
    }

    await todayPrompt.save()
}

/*
    PERIOD 0 = waiting period (have not reached submission period yet)
    PERIOD 1 = submission period (users can submit posts)
    PERIOD 2 = daily voting period (users can do their daily vote)
    PERIOD 3 = weekly voting period
    PERIOD 4 = waiting period
 */
module.exports.getPrompt = async (req, res) => {
    const {userID, groupID} = req.params

    //nested populate
    const group = await Group.findById(groupID)
        .populate([{
                path: 'prompts',
                populate: {
                    path: 'posts',
                    populate: {
                        path: 'owner',
                        select: '_id name username profilePicture',
                    }
                }
            },
                {
                    path: 'userList.user',
                    populate: '_id'
                }
            ]
        )
    if (!group) {
        return res.status(404).json({errorMessage: 'Group not found.'})
    }
    const prompts = group.prompts

    const isUserInGroup = group.userList.some(list => list.user._id.toString() === userID);
    if (!isUserInGroup) {
        return res.status(401).json({errorMessage: 'You don\'t belong to this group.'});
    }

    //parsing from group
    const promptReleaseHour = parseInt(group.timeStart.substring(0, 2))
    const promptReleaseMin = parseInt(group.timeStart.substring(3, 5))
    const promptSubmitHour = parseInt(group.timeEnd.substring(0, 2))
    const promptSubmitMin = parseInt(group.timeEnd.substring(3, 5))
    const votingHour = parseInt(group.timeToVote.substring(0, 2))
    const votingMin = parseInt(group.timeToVote.substring(3, 5))
    const weeklyVotingDay = group.weeklyVotingDay

    const now = new Date();
    //now.setSeconds(0)

    const promptReleaseTime = new Date(now)
    promptReleaseTime.setHours(promptReleaseHour)
    promptReleaseTime.setMinutes(promptReleaseMin)
    promptReleaseTime.setSeconds(0)

    const promptSubmitTime = new Date(now)
    promptSubmitTime.setHours(promptSubmitHour)
    promptSubmitTime.setMinutes(promptSubmitMin)
    promptSubmitTime.setSeconds(0)

    const dailyVotingTime = new Date(promptSubmitTime)
    dailyVotingTime.setHours(dailyVotingTime.getHours() + votingHour)
    dailyVotingTime.setMinutes(dailyVotingTime.getMinutes() + votingMin)
    dailyVotingTime.setSeconds(0)

    const weeklyVotingTime = new Date(dailyVotingTime)
    weeklyVotingTime.setHours(weeklyVotingTime.getHours() + votingHour)
    weeklyVotingTime.setMinutes(weeklyVotingTime.getMinutes() + votingMin)
    weeklyVotingTime.setSeconds(0)

    let todayPrompt = null


    //PERIOD 0 - if current time has not yet reached the prompt release time, get yesterday's prompt
    if (now.getTime() < promptReleaseTime.getTime()) {
        let yesterdayPrompt = null
        const yesterday = new Date(now)
        yesterday.setDate(now.getDate() - 1)

        for (let i = 0; i < prompts.length; i++) {
            if (prompts[i].timeEnd.getMonth() === yesterday.getMonth() && prompts[i].timeEnd.getDate() === yesterday.getDate()) {
                yesterdayPrompt = prompts[i]
            }
        }

        //yesterday's prompt could not be found (yesterdayPrompt = null) means that the group is new
        //timer should display time until prompt release time
        const promptTime = new Date(now)
        promptTime.setHours(promptReleaseHour)
        promptTime.setMinutes(promptReleaseMin)
        promptTime.setSeconds(0)
        return res.status(200).json({
            promptObj: yesterdayPrompt,
            submissionAllowed: false,
            period: 0,
            timeEnd: promptTime
        })
    }

    //Any other period needs today's prompt -> generate if nonexistent
    for (let i = 0; i < prompts.length; i++) {
        if (prompts[i].timeEnd.getMonth() === now.getMonth() && prompts[i].timeEnd.getDay() === now.getDay()) {
            todayPrompt = prompts[i]
        }
    }

    //if not found, need to create a new prompt
    if (todayPrompt === null) {
        console.log("Create prompt module: creating new prompt ")

        //getting response from chat-gpt
        const openai = new OpenAI({apiKey: OPENAI_API_KEY})
        const completion = await openai.chat.completions.create({
            messages: [{
                role: "system",
                content: "In an imperative form and in less than 20 words, give me some object or some task for me to take a picture of today! Feel free to make it funny!"
            }],
            model: "gpt-3.5-turbo",

        });

        todayPrompt = new Prompt({
            prompt: completion.choices[0].message.content,
            timeStart: promptReleaseTime,
            timeEnd: promptSubmitTime,
        })
        await todayPrompt.save()

        group.prompts.push(todayPrompt)
        await group.save()
    }

    /*
        SET TO FALSE IF YOU WANT WEEKLY VOTING TO HAPPEN NORMALLY (EVERY SEVEN DAYS)
        SET TO TRUE IF YOU WANT WEEKLY VOTING TO HAPPEN TODAY (OVERRIDE)
     */
    const weeklyVotingOverride = false

    //PERIOD 1 - if current time has not yet reached prompt submission time
    if (now.getTime() < promptSubmitTime.getTime()) {

        //checking # of submissions by the user
        const posts = todayPrompt.posts
        for (let i = 0; i < posts.length; i++) {
            if (posts[i].owner._id.toString() === userID && posts[i].submissionNumber >= 3) {
                return res.status(200).json({
                    promptObj: todayPrompt,
                    submissionAllowed: false,
                    period: 1,
                    timeEnd: promptSubmitTime
                })
            }
        }

        return res.status(200).json({
            promptObj: todayPrompt,
            submissionAllowed: true,
            period: 1,
            timeEnd: promptSubmitTime
        })
    }

    //PERIOD 2 - if current time has not yet reached daily voting deadline
    else if (now.getTime() < dailyVotingTime.getTime()) {
        return res.status(200).json({
            promptObj: todayPrompt,
            submissionAllowed: false,
            period: 2,
            timeEnd: dailyVotingTime
        })
    }

    //PERIOD 3 - if today is a weekly voting day and current time has not reached weekly voting deadline
    else if ((weeklyVotingOverride || now.getDay() === weeklyVotingDay) && now.getTime() < weeklyVotingTime.getTime()) {

        //update the daily winner for today's prompt if not yet updated
        if (todayPrompt.dailyWinnerID === undefined) {
            await updateDailyWinner(todayPrompt)
        }

        //need to gather all the winners from the last 7 days -> dailyWinnerPosts
        const dailyWinnerPosts = []

        const weekAgo = new Date(now)
        weekAgo.setDate(now.getDate() - 6)
        weekAgo.setHours(0)
        weekAgo.setMinutes(0)
        weekAgo.setSeconds(0)

        for (let i = 0; i < prompts.length; i++) {
            if (prompts[i].timeEnd.getTime() >= weekAgo.getTime() && prompts[i].timeEnd.getTime() <= now.getTime()) {
                if (prompts[i].dailyWinnerID === undefined || prompts[i].dailyWinnerID === null) {
                    continue
                }

                const dailyWinner = await Post.findById(prompts[i].dailyWinnerID).populate('prompt owner')

                //attach the prompt as a field of the post
                console.log(dailyWinner.prompt)
                dailyWinnerPosts.push(dailyWinner)

                /* - proof that having multiple posts will change the prompt on the frontend during weekly voting
                const copy = JSON.parse(JSON.stringify(dailyWinner))
                copy.prompt.prompt = "test prompt ??"
                dailyWinnerPosts.push(copy)
                 */
            }
        }

        return res.status(200).json({
            dailyWinnerPosts: dailyWinnerPosts,
            submissionAllowed: false,
            period: 3,
            timeEnd: weeklyVotingTime
        })
    }

    //PERIOD 4 - waiting for next day
    else {

        //update the daily winner for today's prompt if not yet updated
        if (todayPrompt.dailyWinnerID === undefined) {
            await updateDailyWinner(todayPrompt)
        }
        //TODO: update the weekly winner if today is a weekly voting day

        const nextPromptRelease = new Date()
        nextPromptRelease.setDate(nextPromptRelease.getDate() + 1)
        nextPromptRelease.setHours(promptReleaseHour)
        nextPromptRelease.setMinutes(promptReleaseMin)
        nextPromptRelease.setSeconds(0)
        return res.status(200).json({
            promptObj: todayPrompt,
            submissionAllowed: false,
            period: 4,
            timeEnd: nextPromptRelease
        })
    }
}


module.exports.voteDaily = async(req, res) => {
    const {userID, groupID} = req.params
    const {promptID, postID} = req.body
    //console.log("\nSTART")
    //console.log("User: ", userID)
    //console.log("Post:" , postID)

    //look through all other posts for the prompt and see if the user has already voted for a post
    const prompt = await Prompt.findById(promptID).populate('posts')
    const posts = prompt.posts
    for (let i = 0; i < posts.length; i++) {
        console.log(posts[i]._id)
        console.log(posts[i].dailyVotes)
        const userIndex = posts[i].dailyVotes.indexOf(userID)

        //user is trying to vote for the same post
        if (userIndex !== -1 && posts[i]._id.toString() === postID) {
            //console.log("user is trying to vote for same post twice")
            return res.status(200).json({differentPost: false})
        }

        //remove daily vote from any other post that the user has already voted for
        if (userIndex !== -1) {
            //console.log("removing user's previous daily vote")
            posts[i].dailyVotes.splice(userIndex, 1)
            await posts[i].save()
        }
    }

    //adding vote to the post that the user clicked on
    const votePost = await Post.findById(postID)
    votePost.dailyVotes.push(userID)
    await votePost.save()
    return res.status(200).json({differentPost: true})
}

module.exports.voteWeekly = async(req, res) => {
    const {userID} = req.params
    const {posts, votePostID} = req.body

    for (let i = 0; i < posts.length; i++) {
        console.log(posts[i]._id)
        console.log(posts[i].dailyVotes)
        const userIndex = posts[i].weeklyVotes.indexOf(userID)

        //user is trying to vote for the same post
        if (userIndex !== -1 && posts[i]._id.toString() === votePostID) {
            //console.log("user is trying to vote for same post twice")
            return res.status(200).json({differentPost: false})
        }

        //remove weekly vote from any other post that the user has already voted for
        if (userIndex !== -1) {
            //console.log("removing user's previous daily vote")
            posts[i].weeklyVotes.splice(userIndex, 1)
            await posts[i].save()
        }
    }

    //adding vote to the post that the user clicked on
    const votePost = await Post.findById(postID)
    votePost.weeklyVotes.push(userID)
    await votePost.save()
    return res.status(200).json({differentPost: true})
}

module.exports.getDailyWinner = async(req, res) => {
    const {userID, groupID} = req.params

    //nested populate
    const group = await Group.findById(groupID)
        .populate([{
                path: 'prompts',
                populate: {
                    path: 'posts',
                    populate: {
                        path: 'owner',
                        select: '_id name username profilePicture',
                    }
                }
            },
                {
                    path: 'userList.user',
                    populate: '_id'
                }
            ]
        )
    if (!group) {
        return res.status(404).json({errorMessage: 'Group not found.'})
    }

    const prompts = group.prompts

    const isUserInGroup = group.userList.some(list => list.user._id.toString() === userID);
    if (!isUserInGroup) {
        return res.status(401).json({errorMessage: 'You don\'t belong to this group.'});
    }

    if (prompts.length == 0) {
        return res.status(401).json({errorMessage: 'There is no existing prompt in this group'});
    }

    let lastPrompt;
    for (let i = 0; i < prompts.length; i++) {
        lastPrompt = prompts[i];
        if (lastPrompt.dailyWinnerID !== undefined ) {
            break;
        }
    }
    if (lastPrompt.dailyWinnerID === undefined ) {
        return res.status(401).json({errorMessage: 'There is no existing prompt in this group'});
    }

    await lastPrompt.populate({path: 'dailyWinnerID', populate: [{path: 'owner'}]});
    console.log("in prompt controller, dailyWinnerPost", lastPrompt.dailyWinnerID);

    return res.status(200).json({
        promptObj: lastPrompt,
        dailyWinnerPostObj: lastPrompt.dailyWinnerID,
    })
}