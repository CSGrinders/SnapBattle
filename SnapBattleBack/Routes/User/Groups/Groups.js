const router = require("express").Router();
const { AsyncLocalStorage } = require("async_hooks");
const Group = require('../../../Models/Group')
const User = require('../../../Models/User')

const {
    inviteToGroup
} = require("../../../Controllers/Groups/GroupInviteController");

const { getGroups, createGroup, listUsers } = require("../../../Controllers/Groups/GroupActionsController");

router.get('/', getGroups)

router.post('/create', createGroup)

router.get('/list-users/:groupID', listUsers)

router.post('/invite', inviteToGroup)

module.exports = router