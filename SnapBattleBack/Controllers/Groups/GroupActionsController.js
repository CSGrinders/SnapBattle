const Group = require('../../Models/Group')
const {User} = require("../../Models/User")

/**
  * /user/:userID/groups/
  * @params userID
  * @returns list of all groups (groupID, name) that the user is in
  **/

module.exports.getGroups = async(req, res)=> {
    try {
        console.log("?")
        const {userID} = req.params

        //get user's groups as an array of {_id, name}
        const findGroups = await User.findById(userID, 'groups -_id').populate('groups', 'name')
        if (findGroups) {
            let groups = findGroups.groups
            groups = groups.map((group) => ({groupID: group._id.toString(), name: group.name}))
            console.log(groups)
            res.status(200).json(groups)
        }
        else {
            res.status(404).json({errorMessage: "Groups could not be found"})
        }
    }
    catch {
        res.status(500).json({errorMessage: "Internal server error"})
    }
}

/** 
  *  /user/:userID/groups/create
  *  @params username, groupName, maxUsers, 
  *          timeStart, timeEnd, timeToVote,
  *  
  *  Creates a group
  * 
  *  @returns 200 for success, 404 for not found, 500 for server errs
  **/

module.exports.createGroup = async(req, res) => {
    try {
        const userID = req.body.userID;
        const groupName = req.body.groupName;
        const maxUsers = req.body.maxUsers;
        const timeStart = req.body.timeStart;
        const timeEnd = req.body.timeEnd;
        const timeToVote = req.body.timeToVote;

        console.log(userID, groupName, maxUsers, timeStart, timeEnd, timeToVote)
        
        const user = await User.findById(userID);
        
        console.log("user:", user)

        if (user) {
            const userList = []
            userList.push(user._id)
    
            const prompts = []
    
            const newGroup = new Group({
                name: groupName,
                maxUsers: maxUsers,
                timeStart: timeStart,
                timeEnd: timeEnd,
                userList: userList,
                adminUserID: user._id,
                timeToVote: timeToVote,
                prompts: prompts
            })
    
            await newGroup.save()

            user.groups.push(newGroup._id)
            await user.save()
    
            res.status(200).json({
                "group": newGroup,
                "message": "New Group Created"
            })
        } else {
            res.status(404).json("User not found")
        }
    } catch (error) {
        res.status(500).json("Error: " + error)
    }
}

/**
  * /user/:userID/groups/:groupID
  *  @params userID, groupID
  * 
  *  @returns list of users
  **/

module.exports.listUsers = async(req, res) => {
    try {
        console.log("bruh")
        const groupID = req.params.groupID
        const group = await Group.findById(groupID).populate('userList')

        if (group) {
            console.log(group.userList)
            res.send(group.userList)
        } else {
            res.status(404).json("Group not found")
        }
    } catch (error) {
        res.status(500).json("Error: " + error)
    }
}