const mongoose = require("mongoose");
const issueSchema = require("./issue");

const projectSchema = new mongoose.Schema({
  project_name: {
    type: String,
    require: true,
  },
  issues: {
    type: Array,
    value: [issueSchema],
  },
});

module.exports = mongoose.model("project", projectSchema);
