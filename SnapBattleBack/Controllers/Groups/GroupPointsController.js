const Group = require("../../Models/Group");
const {User} = require("../../Models/User");
const Achievement = require("../../Models/Achievement")

/**
 * Creates a getListUserPOints
 * /user/:userID/groups/:groupID/getListUserPoints
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
module.exports.getListUsersPoints = async(req, res)=> {
    try {
        const { groupID, userID} = req.params;

        const group = await Group.findById(groupID)
            .populate('userList.user')
        if (!group) {
            return res.status(404).json({errorMessage: 'Group could not be found.'})
        }

        const isUserInGroup = group.userList.some(list => list.user._id.toString() === userID);
        if (!isUserInGroup) {
            return res.status(401).json({errorMessage: 'You don\'t belong to this group.'});
        }

        const userList = group.userList.map(list => ({
            _id: list.user._id,
            name: list.user.name,
            username: list.user.username,
            profilePicture: list.user.profilePicture,
            points: list.points,
        }));
        return res.status(200).json({list: userList})
    } catch (error) {
        console.log("getListUsersPoints module: " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}

module.exports.resetPoints = async(req, res) => {
    try {
        const groupID = req.body.groupID

        // find group
        const group = await Group.findById(groupID).populate('userList.user');
    
        if (!group) {
            return res.status(404).json("Group not found");
        }
    
        let userList = group.userList

        // iterate through list to find user with most points
        let maxIndex = 0;
        let maxPoints = 0;
        for (let i = 0; i < userList.length; i++) {
            if (userList[i].points > maxPoints) {
                maxPoints = userList[i].points;
                maxIndex = i;
            }
        }

        // winner of period
        const winner = userList[maxIndex].user;

        // set winstreaks
        for (let i = 0; i < userList.length; i++) {
            if (i == maxIndex) {
                userList[i].winStreak++;
            } else {
                userList[i].winStreak = 0;
            }
        }

        // get date
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); 
        const day = String(currentDate.getDate()).padStart(2, '0');

        const formattedDate = `${month}-${day}-${year}`;

        // create achievement
        const medal = new Achievement({
            name: "Winner of " + formattedDate,
            user: winner._id,
            type: "medal"
        })

        await medal.save();


        // increase winner's wins and add achievement to profile
        winner.numWins++;
        winner.achievements.push(medal);
        await winner.save();

        // award achievement for 5 wins
        if (winner.numWins == 5) {
            const trophy = new Achievement({
                name: "5x wins!",
                user: winner._id,
                type: "trophy"
            })

            await trophy.save();

            winner.achievements.push(trophy);
            winner.save();
        }

        // award achievement for 10 wins
        if (winner.numWins == 10) {
            const success = new Achievement({
                name: "10x wins!",
                user: winner._id,
                type: "success"
            })

            await success.save();

            winner.achievements.push(success);
            winner.save();
        }

        if (userList[maxIndex].winStreak == 3) {
            const streak = new Achievement({
                name: "3x wins in a row",
                user: winner._id,
                type: "streak"
            })

            await streak.save();

            winner.achievements.push(streak);
            winner.save();
        }

        // reset points
        userList = group.userList;
        for (let i = 0; i < userList.length; i++) {
            userList[i].points = 0;
        }

        await group.save();

        return res.status(200).json({
            status: "Points reset"
        })
    } catch (error) {
        console.log("Server err:", error)
        return res.status(500).json({error: "Server error: ", error})
    }
}

