const Group = require('../../Models/Group')
const User = require('../../Models/User')

/**
  * /groups/
  * @params none
  * @returns list of all groups
  **/

module.exports.getGroups = async(req, res)=> {
    Group.find()
        .then(groups => res.json(groups))
        .catch(err => res.status(400).json('Error: ' + err))
}

/** 
  *  /groups/create
  *  @params username, groupName, maxUsers, 
  *          timeStart, timeEnd, timeToVote,
  *  
  *  Creates a group
  * 
  *  @returns 200 for success, 404 for not found, 500 for server errs
  **/

module.exports.createGroup = async(req, res) => {
    try {
        const username = req.body.username;
        const groupName = req.body.groupName;
        const maxUsers = req.body.maxUsers;
        const timeStart = req.body.timeStart;
        const timeEnd = req.body.timeEnd;
        const timeToVote = req.body.timeToVote;
        
        const user = await User.findOne({username: username});
        
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
  * /groups/users/:groupID
  *  @params groupID
  * 
  *  @returns list of users
  **/

module.exports.listUsers = async(req, res) => {
    try {
        const groupID = req.params.groupID
        const group = await Group.findById(groupID).populate('userList')

        if (group) {
            res.send(group.userList)
        } else {
            res.status(404).json("Group not found")
        }
    } catch (error) {
        res.status(500).json("Error: " + error)
    }
}