/*
 * GroupRoutes.js
 *
 * This routing module manages all HTTP requests related to group functionalities.
 *
 * Routes:
 * - "/"
 * - "/create"
 * - "/list-users/:groupID"
 * - "/:groupID/invite"
 * - "/:groupID/groupname"
 * - "/:groupID/groupsize"
 * - "/:groupID/prompttime"
 * - "/:groupID/submissiontime"
 *
 * @SnapBattle, 2024
 * Author: CSGrinders
 *
 * Note: before any group route, the path should include /user/:userid/
 */

const router = require("express").Router( { mergeParams: true });

const {
    inviteToGroup
} = require("../../Controllers/Groups/GroupInviteController");

const { getGroups, createGroup, listUsers } = require("../../Controllers/Groups/GroupActionsController");
const { editGroupName, editGroupSize, editPromptTime, editSubmissionTime } = require("../../Controllers/Groups/GroupSettingsController");

router.get('/', getGroups);

router.post('/create', createGroup);

router.get('/list-users/:groupID', listUsers);

router.post('/:groupID/invite', inviteToGroup);

router.post('/:groupID/groupname', editGroupName)

router.post('/:groupID/groupsize', editGroupSize)

router.post('/:groupID/prompttime', editPromptTime)

router.post('/:groupID/submissiontime', editSubmissionTime)



module.exports = router;