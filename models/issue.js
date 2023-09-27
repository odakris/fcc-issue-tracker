const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({
  issue_title: {
    type: String,
    require: true,
  },
  created_by: {
    type: String,
    require: true,
  },
  assigned_to: {
    type: String,
  },
  status_text: {
    type: String,
  },
  issue_text: {
    type: String,
    require: true,
  },
  created_on: {
    type: String,
  },
  updated_on: {
    type: String,
  },
  open: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("issue", issueSchema);
