const Group = require('../../Models/Group');
const {User} = require("../../Models/User");
const Prompt = require('../../Models/Prompt')
const {Configuration, OpenAI} = require('openai')
const {Post} = require("../../Models/Post");
const mongoose = require("mongoose");
const {OPENAI_API_KEY} = process.env

const Mutex = require('async-mutex').Mutex;

//mutex for handling race conditions w/ prompt
const mutex = new Mutex()


async function updateDailyWinner(todayPrompt, group) {
    const posts = todayPrompt.posts
    //no posts -> no daily winner
    if (posts.length === 0) {
        todayPrompt.dailyWinnerID = null
        await todayPrompt.save()
        return
    }

    //find post with highest number of votes
    let maxVotes = -1;
    let winner = null
    let winningUser = null
    for (let i = 0; i < posts.length; i++) {
        if (posts[i].dailyVotes.length > maxVotes) {
            maxVotes = posts[i].dailyVotes.length
            winner = posts[i]
            winningUser = posts[i].owner
        }

        //tie exists -> no winner
        else if (posts[i].dailyVotes.length === maxVotes) {
            winner = null
            winningUser = null
        }
    }

    //save the winner (null if no winner exists)
    if (winner != null) {
        todayPrompt.dailyWinnerID = winner._id
        const userIndex = group.userList.findIndex(item => item.user._id.toString() === winningUser._id.toString());
        group.userList[userIndex].points += 1;

    }
    else {
        todayPrompt.dailyWinnerID = null
    }

    await todayPrompt.save()
    await group.save()
}

async function updateWeeklyWinner(group, now, weekAgo, prompts) {
    let maxVotes = -1
    let winner = null
    for (let i = 0; i < prompts.length; i++) {
        if (prompts[i].timeEnd.getTime() >= weekAgo.getTime() && prompts[i].timeEnd.getTime() <= now.getTime()) {
            if (prompts[i].dailyWinnerID === undefined || prompts[i].dailyWinnerID === null) {
                continue
            }

            if (prompts[i].dailyWinnerID.weeklyVotes.length > maxVotes) {
                maxVotes = prompts[i].dailyWinnerID.weeklyVotes
                winner = prompts[i].dailyWinnerID
            }

            //tie exists -> no winner
            else if (prompts[i].dailyWinnerID.weeklyVotes.length === maxVotes) {
                winner = null
            }
        }
    }

    //save the winner (do nothing if no winner exists)
    if (winner != null) {
        winner = await Post.findById(winner)
        group.weeklyWinners.push(winner._id)
        const userIndex = group.userList.findIndex(item => item.user._id.toString() === winner.owner._id.toString());
        group.userList[userIndex].points += 3;
        await group.save()

        winner.isWeeklyWinner = true
        await winner.save()
    }
}

async function makeDummyDailyWinner(todayPrompt, dailyWinner, group) {
    let newPrompt = new Prompt({
        prompt: "dummy prompt",
        timeStart: todayPrompt.timeStart,
        timeEnd: todayPrompt.timeEnd,
        dailyWinnerID: null
    })
    await newPrompt.save()

    group.prompts.push(newPrompt)
    await group.save()

    let newPost = new Post({
        prompt: newPrompt._id,
        picture: "https://cdn-media-2.freecodecamp.org/w1280/5f9c9819740569d1a4ca1826.jpg",
        owner: dailyWinner.owner,
        submissionNumber: 3,
        time: dailyWinner.time,
        dailyVotes: [],
        weeklyVotes: []
    })
    await newPost.save()

    await Post.populate(newPost,{path: "prompt"})

    newPrompt.dailyWinnerID = newPost._id
    await newPrompt.save()

    return newPost
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
    const release = await mutex.acquire()



    //nested populate
    const group = await Group.findById(groupID)
        .populate([
            {
                path: 'prompts',
                populate: [{
                    path: 'posts',
                    populate:
                    {
                        path: 'owner',
                        select: '_id name username profilePicture',
                    }
                },
                {
                    path: 'dailyWinnerID',
                    select: 'weeklyVotes isWeeklyWinner',
                }]
            },
            {
                path: 'userList.user',
                select: '_id username'
            },
            {
                path: 'weeklyWinners'
            },
        ])
    if (!group) {
        release()
        return res.status(404).json({errorMessage: 'Group could not be found.'})
    }
    const prompts = group.prompts

    const userIndex = group.userList.findIndex(item => item.user._id.toString() === userID);
    if (userIndex === -1) {
        release()
        return res.status(401).json({ errorMessage: 'You don\'t belong to this group.' });
    }
    //console.log("HERE: " + group.userList[userIndex])

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

    const weekAgo = new Date(now)
    weekAgo.setDate(now.getDate() - 6)
    weekAgo.setHours(0)
    weekAgo.setMinutes(0)
    weekAgo.setSeconds(0)

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
        release()
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
    const weeklyVotingOverride = true

    //PERIOD 1 - if current time has not yet reached prompt submission time
    if (now.getTime() < promptSubmitTime.getTime()) {

        //checking # of submissions by the user
        const posts = todayPrompt.posts
        for (let i = 0; i < posts.length; i++) {
            if (posts[i].owner._id.toString() === userID && posts[i].submissionNumber >= 3) {
                release()
                return res.status(200).json({
                    promptObj: todayPrompt,
                    submissionAllowed: false,
                    period: 1,
                    timeEnd: promptSubmitTime
                })
            }
        }

        release()
        return res.status(200).json({
            promptObj: todayPrompt,
            submissionAllowed: true,
            period: 1,
            timeEnd: promptSubmitTime
        })
    }

    //PERIOD 2 - if current time has not yet reached daily voting deadline
    else if (now.getTime() < dailyVotingTime.getTime()) {
        release()
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
            await updateDailyWinner(todayPrompt, group)
        }

        //need to gather all the winners from the last 7 days -> dailyWinnerPosts
        const dailyWinnerPosts = []
        let dailyWinner

        for (let i = 0; i < prompts.length; i++) {
            if (prompts[i].timeEnd.getTime() >= weekAgo.getTime() && prompts[i].timeEnd.getTime() <= now.getTime()) {
                if (prompts[i].dailyWinnerID === undefined || prompts[i].dailyWinnerID === null) {
                    continue
                }

                dailyWinner = await Post.findById(prompts[i].dailyWinnerID).populate('prompt owner')
                /*
                console.log("DAILY WINNER")
                console.log(dailyWinner)
                 */

                //attach the prompt as a field of the post
                dailyWinnerPosts.push(dailyWinner)
            }
        }


        /*
            UN-COMMENT THE BELOW CODE TO ADD A DUMMY POST TO THE DAILY WINNERS SO THAT
            WEEKLY VOTING FEATURES WHEN THERE IS MORE THAN 1 POST CAN BE SHOWN
        */
        /*
        if (dailyWinnerPosts.length === 1) {
            const dummy = await makeDummyDailyWinner(todayPrompt, dailyWinner, group)
            dailyWinnerPosts.push(dummy)
        }
         */


        release()
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
            await updateDailyWinner(todayPrompt, group)
        }
        //update the weekly winner for the week if today is a weekly voting day, and it has not yet been updated
        if (weeklyVotingOverride || now.getDay() === weeklyVotingDay) {
            let updatedWeekly = false

            const weeklyWinners = group.weeklyWinners
            for (let i = 0; i < weeklyWinners.length; i++) {
                if (weeklyWinners[i].time.getMonth() === now.getMonth() && weeklyWinners[i].time.getDate() === now.getDate()) {
                    //already updated the weekly winner
                    updatedWeekly = true
                }
            }

            if (!updatedWeekly) {
                await updateWeeklyWinner(group, now, weekAgo, prompts)
            }
        }

        const nextPromptRelease = new Date()
        nextPromptRelease.setDate(nextPromptRelease.getDate() + 1)
        nextPromptRelease.setHours(promptReleaseHour)
        nextPromptRelease.setMinutes(promptReleaseMin)
        nextPromptRelease.setSeconds(0)
        release()
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

    //look through all other posts for the prompt and see if the user has already voted for a post
    const prompt = await Prompt.findById(promptID).populate('posts')
    const posts = prompt.posts
    for (let i = 0; i < posts.length; i++) {
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
        const userIndex = posts[i].weeklyVotes.indexOf(userID)

        //user is trying to vote for the same post
        if (userIndex !== -1 && posts[i]._id.toString() === votePostID) {
            console.log("user is trying to vote for same post twice")
            return res.status(200).json({differentPost: false})
        }

        //remove weekly vote from any other post that the user has already voted for
        if (userIndex !== -1) {
            console.log("removing user's previous daily vote")
            const p = await Post.findById(posts[i]._id)
            p.weeklyVotes.splice(userIndex, 1)
            await p.save()
        }
    }

    //adding vote to the post that the user clicked on
    const votePost = await Post.findById(votePostID)
    votePost.weeklyVotes.push(userID)
    await votePost.save()
    console.log("VOTE POST")
    console.log(votePost)
    return res.status(200).json({differentPost: true})
}

module.exports.getLastDailyWinner = async(req, res) => {
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
        return res.status(404).json({errorMessage: 'Group could not be found.'})
    }

    const prompts = group.prompts

    const isUserInGroup = group.userList.some(list => list.user._id.toString() === userID);
    if (!isUserInGroup) {
        return res.status(401).json({errorMessage: 'You don\'t belong to this group.'});
    }

    if (prompts.length === 0) {
        return res.status(401).json({errorMessage: 'No daily winner.'});
    }

    let lastPrompt;
    for (let i = prompts.length - 1; i >= 0; i--) {
        lastPrompt = prompts[i];
        if (lastPrompt.dailyWinnerID !== undefined ) {
            break;
        }
    }
    if (lastPrompt.dailyWinnerID === undefined || lastPrompt.dailyWinnerID === null ) {
        return res.status(401).json({errorMessage: 'No daily winner.'});
    }

    await lastPrompt.populate({path: 'dailyWinnerID', populate: [{path: 'owner'}]});
    //console.log("in prompt controller, dailyWinnerPost", lastPrompt.dailyWinnerID);

    //get date string for the prompt
    const date = lastPrompt.timeEnd
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')

    return res.status(200).json({
        promptObj: lastPrompt,
        dailyWinnerPostObj: lastPrompt.dailyWinnerID,
        dayString: year + "-" + month + "-" + day,
    })
}

module.exports.getLastWeekWinner = async(req, res) => {
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
        return res.status(404).json({errorMessage: 'Group could not be found.'})
    }

    await group.populate({path: 'weeklyWinners'});
    const weeklyWinnerPosts = group.weeklyWinners;

    const isUserInGroup = group.userList.some(list => list.user._id.toString() === userID);
    if (!isUserInGroup) {
        return res.status(401).json({errorMessage: 'You don\'t belong to this group.'});
    }

    if (weeklyWinnerPosts.length === 0) {
        return res.status(401).json({errorMessage: 'No weekly winner'});
    }

    const lastPost = weeklyWinnerPosts[weeklyWinnerPosts.length - 1];

    await lastPost.populate([{path: 'prompt'}, {path: 'owner'}, {path: 'picture'}])
    //console.log("in prompt controller, weekly winner post", lastPost);

    const date = lastPost.time
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')

    return res.status(200).json({
        weeklyWinnerPost: lastPost,
        dayString: year + "-" + month + "-" + day,
    })
}

module.exports.getDailyWinner = async(req, res) => {
    const {userID, groupID, dayString} = req.params
    console.log("getting daily winner for " + dayString)

    const group = await Group.findById(groupID)
        .populate([
            {
                path: 'prompts',
                populate:
                    {
                        path: 'posts',
                        populate: {
                            path: 'owner',
                            select: '_id name username profilePicture',
                        },
                    }
            },
                {
                    path: 'userList.user',
                    populate: '_id'
                }
            ]
        )

    if (!group) {
        return res.status(404).json({errorMessage: 'Group could not be found.'})
    }

    const isUserInGroup = group.userList.some(list => list.user._id.toString() === userID);
    if (!isUserInGroup) {
        return res.status(401).json({errorMessage: 'You don\'t belong to this group.'});
    }

    const prompts = group.prompts;
    if (prompts.length === 0) {
        return res.status(401).json({errorMessage: 'No daily winner'});
    }

    let prompt = null;
    let returnDay;
    for (let i = prompts.length - 1; i >= 0; i--) {
        // get date of each prompt
        const year = prompts[i].timeStart.getFullYear();
        const month = String(prompts[i].timeStart.getMonth() + 1).padStart(2, '0');
        const day = String(prompts[i].timeStart.getDate()).padStart(2, '0');
        let promptDate = `${year}-${month}-${day}`;

        if (promptDate === dayString) {
            prompt = prompts[i];
            returnDay = promptDate;
            break;
        }
    }

    if (prompt === null || prompt.dailyWinnerID === undefined ||
        prompt.dailyWinnerID === null ) {
        return res.status(401).json({errorMessage: 'No daily winner'});
    }

    await prompt.populate({path: 'dailyWinnerID', populate: [{path: 'owner'}]});
    console.log("in prompt controller, dailyWinnerPost", prompt.dailyWinnerID);

    return res.status(200).json({
        promptObj: prompt,
        dailyWinnerPostObj: prompt.dailyWinnerID,
        dayString: returnDay
    })
}

module.exports.getWeeklyWinner = async(req, res) => {
    const {userID, groupID, dayString} = req.params
    console.log("getting weekly winner for" + dayString)

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
        return res.status(404).json({errorMessage: 'Group could not be found.'})
    }

    const isUserInGroup = group.userList.some(list => list.user._id.toString() === userID);
    if (!isUserInGroup) {
        return res.status(401).json({errorMessage: 'You don\'t belong to this group.'});
    }

    await group.populate({path: 'weeklyWinners'});
    const weeklyWinnerPosts = group.weeklyWinners;

    if (weeklyWinnerPosts.length === 0) {
        return res.status(401).json({errorMessage: 'No weekly winner'});
    }

    // get the bounds of the week (start date, end date)
    console.log(dayString)
    const selectedDate = new Date(dayString);
    selectedDate.setHours(0);
    selectedDate.setDate(selectedDate.getDate() + 1)
    console.log("selected date: " + selectedDate.toString())
    let start = null;
    let end = null;

    // if selected day is the weekly voting day
    if (selectedDate.getDay() === group.weeklyVotingDay) {
        start = new Date(selectedDate);
        start.setDate(start.getDate() - 6);

        end = new Date(selectedDate);
    } else if (selectedDate.getDay() > group.weeklyVotingDay) { // if after the voting day
        end = new Date(selectedDate);
        end.setDate(end.getDate() - (selectedDate.getDay() - group.weeklyVotingDay) + 7);

        start = new Date(end)
        start.setDate(start.getDate() - 6);
    } else { // before the voting day
        end = new Date(selectedDate);
        end.setDate(end.getDate() + (group.weeklyVotingDay - selectedDate.getDay()));

        start = new Date(end)
        start.setDate(start.getDate() - 6)
    }
    start.setHours(0)
    end.setHours(0)
    console.log("start of week: " + start.toString())
    console.log("end of week: " + end.toString())

    let returnPost = null;

    for (let i = 0; i < weeklyWinnerPosts.length; i++) {
        console.log("post submission time: " + weeklyWinnerPosts[i].time.toString());
        console.log()
        const dateToCheckTime = weeklyWinnerPosts[i].time.getTime();
        const startDateTIme = start.getTime();
        const endDateTIme = end.getTime();

        if (dateToCheckTime >= startDateTIme && dateToCheckTime <= endDateTIme) {
            returnPost = weeklyWinnerPosts[i];
            break;
        }
    }

    if (returnPost === null) {
        return res.status(401).json({errorMessage: 'No weekly winner'});
    }

    await returnPost.populate([{path: 'prompt'}, {path: 'owner'}, {path: 'picture'}])

    const date = returnPost.time
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')

    return res.status(200).json({
        weeklyWinnerPost: returnPost,
        dayString: year + "-" + month + "-" + day,
    })
}