const issue = require("../models/issue");
const project = require("../models/project");

// NEW ISSUE FUNCTION
const newIssue = async (req, res) => {
  let project_name = req.params.project;
  let { issue_title, created_by, assigned_to, status_text, issue_text } =
    req.body;
  let created_on = new Date().toUTCString();
  let updated_on = new Date().toUTCString();

  if (!issue_title || !issue_text || !created_by)
    return res.json({ error: "required field(s) missing" });

  try {
    let current_project = await project.findOne({ project_name: project_name });

    let current_issue = await issue.create({
      issue_title: issue_title,
      created_by: created_by,
      assigned_to: assigned_to || "",
      status_text: status_text || "",
      issue_text: issue_text,
      created_on: created_on,
      updated_on: updated_on,
    });

    // If project exist => PUSH / ADD issue
    if (current_project) {
      current_project = await project.findOneAndUpdate(
        { project_name: project_name },
        { $push: { issues: current_issue } },
        { new: true }
      );
      // If project doesn't not exist yet then create project and PUSH / ADD issue
    } else {
      current_project = await project.create({
        project_name: project_name,
        issues: current_issue,
      });
    }

    res.json({
      _id: current_issue._id,
      open: current_issue.open,
      issue_title: current_issue.issue_title,
      created_by: current_issue.created_by,
      assigned_to: current_issue.assigned_to,
      status_text: current_issue.status_text,
      issue_text: current_issue.issue_text,
      created_on: current_issue.created_on,
      updated_on: current_issue.updated_on,
    });
  } catch (err) {
    res.status(500).send(err);
  }
};

// GET ISSUE FUNCTION
const getIssues = async (req, res) => {
  let project_name = req.params.project;
  let queryObj = req.query;

  try {
    let current_project = await project.findOne({ project_name: project_name });
    let issues = current_project.issues;

    if (!issues)
      return res.json({ error: `no ${project_name} issues found !` });

    if (queryObj) {
      // FILTER BASED ON QUERIES
      let filteredIssues = issues.filter((issue) => {
        let isValid = true;
        for (key in queryObj) {
          // toString() is to convert boolean property 'open' into String
          // as queries are strings
          isValid =
            isValid && issue[key].toString() == queryObj[key].toString();
        }
        return isValid;
      });

      res.json(filteredIssues);
    } else {
      res.json(issues);
    }
  } catch (err) {
    res.status(500).send(err);
  }
};

// UPDATE ISSUE FUNCTION
const updateIssue = async (req, res) => {
  let project_name = req.params.project;
  let _id = req.body._id;

  // Check if an ID is provided
  if (!_id) return res.json({ error: "missing _id" });
  // Retrieve project from database
  let projectToUpdate = await project.findOne({ project_name: project_name });
  // body object of provided parameters
  let update = req.body;
  // Get rid of empty string (parameters not provided)
  let updatefilter = emptyStringFilter(update);
  // Delete id as it will never be updated
  delete updatefilter._id;

  try {
    // IF NO PROJECT
    if (!projectToUpdate) {
      return res.json({ error: "could not update", _id: _id });
    } else {
      // IF NO UPDATE PARAMETERS PROVIDED
      if (Object.keys(updatefilter).length === 0) {
        return res.json({ error: "no update field(s) sent", _id: _id });
      } else if (Object.keys(updatefilter).length > 0) {
        // IF PARAMETERS PROVIDED

        // Get issue to update in corresponding project
        let issueToUpdate = projectToUpdate.issues.filter((issue) => {
          return issue._id == _id;
        });

        // IF NO ISSUE WITH PROVIDED ID
        if (issueToUpdate.length === 0) {
          return res.json({ error: "could not update", _id: _id });
        }

        // BUILD updated issue based on issue to update and issue update
        let updatedIssue = {
          issue_title: update.issue_title || issueToUpdate[0].issue_title,
          created_by: update.created_by || issueToUpdate[0].created_by,
          assigned_to: update.assigned_to || issueToUpdate[0].assigned_to,
          status_text: update.status_text || issueToUpdate[0].status_text,
          issue_text: update.issue_text || issueToUpdate[0].issue_text,
          created_on: update.created_on || issueToUpdate[0].created_on,
          updated_on: new Date().toUTCString(),
          open: update.open ? false : issueToUpdate[0].open,
          _id: issueToUpdate[0]._id,
          __v: issueToUpdate[0].__v,
        };

        // Get ID of issue to delete
        let issueToDelete = await issue.findById(_id);
        //  DELETE / PULL issue to Update
        await project.findOneAndUpdate(
          { project_name: project_name },
          { $pull: { issues: issueToDelete } },
          { new: true }
        );
        // PUSH updated issue to project.issues
        await project.findOneAndUpdate(
          { project_name: project_name },
          { $push: { issues: updatedIssue } },
          { new: true }
        );

        res.json({ result: "successfully updated", _id: _id });
      }
    }
  } catch (err) {
    res.status(500).send(err);
  }
};

// DELETE ISSUE FUNCTION
const deleteIssue = async (req, res) => {
  let project_name = req.params.project;
  let _id = req.body._id;

  // IF no ID provided
  if (!_id) return res.json({ error: "missing _id" });

  let current_project = await project.findOne({ project_name: project_name });

  try {
    if (!current_project) {
      // If project or issue doesn't exist in database
      res.json({ error: "could not delete", _id: _id });
    } else {
      // DELETE / PULL issue from project

      // Get issue to delete in corresponding project
      let issueToDelete = current_project.issues.filter((issue) => {
        return issue._id == _id;
      });

      // IF NO ISSUE WITH PROVIDED ID
      if (issueToDelete.length === 0) {
        return res.json({ error: "could not delete", _id: _id });
      }

      await project.findOneAndUpdate(
        { project_name: project_name },
        { $pull: { issues: issueToDelete } },
        { new: true }
      );
      res.json({ result: "successfully deleted", _id: _id });
    }
  } catch (err) {
    res.status(500).send(err);
  }
};

// Function that filter empty string value
const emptyStringFilter = (obj) => {
  let returnedObj = {};
  for (key in obj) {
    if (obj[key] !== "") {
      returnedObj[key] = obj[key];
    }
  }
  return returnedObj;
};

// for (let key in update) {
//   // if(key == 'open') {
//   //   issueToUpdate[0][key] = false;
//   // }
//   issueToUpdate[0][key] = update[key];
// }

module.exports = { newIssue, getIssues, updateIssue, deleteIssue };
