"use strict";
const express = require("express");
const router = express.Router();

// Controllers
const {
  newIssue,
  getIssues,
  updateIssue,
  deleteIssue,
} = require("../controllers/issueController");

router
  .route("/issues/:project")
  .post(newIssue)
  .get(getIssues)
  .put(updateIssue)
  .delete(deleteIssue);

module.exports = router;
