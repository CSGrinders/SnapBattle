const Group = require('../../Models/Group');
const {User} = require("../../Models/User");
const Prompt = require('../../Models/Prompt')

module.exports.getPrompt = async (req, res) => {
    const {userID, groupID} = req.params

    const group = await Group.findById(groupID).populate({path: 'prompts', populate: {path: 'posts'}})
    const prompts = group.prompts

    const promptReleaseHour = parseInt(group.timeStart.substring(0, 2))
    const promptReleaseMin = parseInt(group.timeStart.substring(3, 5))
    const promptSubmitHour = parseInt(group.timeEnd.substring(0, 2))
    const promptSubmitMin = parseInt(group.timeEnd.substring(3, 5))

    //if current time has not yet reached the prompt release time, get yesterday's prompt
    //if current time has passed the prompt release time, get today's prompt
    const now = new Date()

    //if current time has not yet reached the prompt release time, get yesterday's prompt
    if (now.getHours() < promptReleaseHour || (now.getHours() === promptReleaseHour && now.getMinutes() < promptReleaseMin)) {
        let yesterdayPrompt = null
        for (let i = 0; i < prompts.length; i++) {
            //TODO: add edge case for when today is the first day of the month
            if (prompts[i].timeEnd.getDay() === now.getDay() - 1) {
                yesterdayPrompt = prompts[i]
            }
        }

        //yesterday's prompt could not be found (yesterdayPrompt = null) means that the group is new
        return res.status(200).json({promptObj: yesterdayPrompt, submissionAllowed: false})
    }

    //if current time has passed the prompt release time, get today's prompt
    else {
        console.log("getting today's prompt")
        let todayPrompt = null
        for (let i = 0; i < prompts.length; i++) {
            if (prompts[i].timeEnd.getDay() === now.getDay()) {
                todayPrompt = prompts[i]
            }
        }

        //if not found, need to create a new prompt
        if (todayPrompt === null) {
            console.log("creating new prompt")
            let timeStart = new Date(now)
            timeStart.setHours(promptReleaseHour, promptReleaseMin)
            let timeEnd = new Date(now)
            timeEnd.setHours(promptSubmitHour, promptSubmitMin)

            todayPrompt = new Prompt({
                prompt: "Prompt for " + now.getMonth() + "/" + now.getDate(),
                timeStart: timeStart,
                timeEnd: timeEnd,
            })
            await todayPrompt.save()

            group.prompts.push(todayPrompt)
            await group.save()

            return res.status(200).json({promptObj: todayPrompt, submissionAllowed: true})
        }

        //today's prompt was found
        else {

            //if the time has past the submission deadline, the user should not be able to submit
            //TODO: need to consider voting times here next sprint
            if (now.getHours() > promptSubmitHour || (now.getHours() === promptSubmitHour && now.getMinutes() >= promptSubmitMin)) {
                return res.status(200).json({promptObj: todayPrompt, submissionAllowed: false})
            }

            //checking # of submissions by the user
            const posts = todayPrompt.posts
            for (let i = 0; i < posts.length; i++) {
                if (posts[i].owner.toString() === userID && posts[i].submissionNumber >= 3) {
                    return res.status(200).json({promptObj: todayPrompt, submissionAllowed: false})
                }
            }

            return res.status(200).json({promptObj: todayPrompt, submissionAllowed: true})
        }
    }
}