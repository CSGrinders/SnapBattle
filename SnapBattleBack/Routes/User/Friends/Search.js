const {searchUser} = require("../../../Controllers/Friends/SearchController");
const router = require("express").Router( { mergeParams: true });

router.get("/:search", searchUser)

module.exports = router