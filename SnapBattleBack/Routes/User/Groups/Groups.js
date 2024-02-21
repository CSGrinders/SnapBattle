const router = require("express").Router( { mergeParams: true });
const { AsyncLocalStorage } = require("async_hooks");
const Group = require('../../../Models/Group')
const User = require('../../../Models/User')

const {
    inviteToGroup
} = require("../../../Controllers/Groups/GroupInviteController");

const { getGroups, createGroup, listUsers } = require("../../../Controllers/Groups/GroupActionsController");
const {editGroupName} = require("../../../Controllers/Groups/GroupSettingsController");

router.get('/', getGroups)

router.post('/create', createGroup)

router.get('/list-users/:groupID', listUsers)

router.post('/:groupID/invite', inviteToGroup)

router.post('/:groupID/groupname', editGroupName)


module.exports = router