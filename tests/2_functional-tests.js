const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", () => {
  let id_test;

  suite("1) Create an issue", () => {
    test("1-a Create an issue with every field", (done) => {
      chai
        .request(server)
        .post("/api/issues/apitest")
        .set("content-type", "application/json")
        .send({
          issue_title: "issue-title",
          created_by: "me",
          assigned_to: "you",
          status_text: "issues-to-resolve",
          issue_text: "issue-text",
        })
        .end((err, res) => {
          id_test = res.body._id;
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "issue-title");
          assert.equal(res.body.issue_text, "issue-text");
          assert.equal(res.body.created_by, "me");
          assert.equal(res.body.assigned_to, "you");
          assert.equal(res.body.status_text, "issues-to-resolve");
          if (err) {
            return done(err);
          } else {
            return done();
          }
        });
    });

    test("1-b Create an issue with only required fields", (done) => {
      chai
        .request(server)
        .post("/api/issues/apitest")
        .set("content-type", "application/json")
        .send({
          issue_title: "issue-title-required",
          created_by: "me-required",
          issue_text: "issue-text-required",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "issue-title-required");
          assert.equal(res.body.created_by, "me-required");
          assert.equal(res.body.issue_text, "issue-text-required");
          if (err) {
            return done(err);
          } else {
            return done();
          }
        });
    });

    test("1-c Create an issue with missing required fields", (done) => {
      chai
        .request(server)
        .post("/api/issues/apitest")
        .set("content-type", "application/json")
        .send({
          assigned_to: "yourself",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, {
            error: "required field(s) missing",
          });
          if (err) {
            return done(err);
          } else {
            return done();
          }
        });
    });
  });

  suite("2) View Issues", () => {
    test("2-a GET request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .get("/api/issues/apitest")
        .set("content-type", "application/json")
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.typeOf(res.body, "array");
          if (err) {
            return done(err);
          } else {
            done();
          }
        });
    });

    test("2-b GET request to /api/issues/{project} with one filter", (done) => {
      chai
        .request(server)
        .get("/api/issues/apitest")
        .query({ open: false })
        .set("content-type", "application/json")
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.typeOf(res.body, "array");
          for (let i = 0; i < res.body.length; i++) {
            assert.equal(res.body[i].open, false);
          }
          if (err) {
            return done(err);
          } else {
            return done();
          }
        });
    });

    test("2-c GET request to /api/issues/{project} with multiple filters", (done) => {
      chai
        .request(server)
        .get("/api/issues/apitest")
        .query({
          open: false,
          created_by: "me",
        })
        .set("content-type", "application/json")
        .end((err, res) => {
          assert.equal(res.status, 200);
          for (let i = 0; i < res.body.length; i++) {
            assert.equal(res.body[i].open, false);
            assert.equal(res.body[i].created_by, "me");
          }
          if (err) {
            return done(err);
          } else {
            return done();
          }
        });
    });
  });

  suite("3) Update an issue", () => {
    test("3-a Update one field on an issue", (done) => {
      chai
        .request(server)
        .put("/api/issues/apitest")
        .set("content-type", "application/json")
        .send({
          _id: id_test,
          assigned_to: "you",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, {
            result: "successfully updated",
            _id: id_test,
          });
          if (err) {
            return done(err);
          } else {
            return done();
          }
        });
    });

    test("3-b Update multiple fields on an issue", (done) => {
      chai
        .request(server)
        .put("/api/issues/apitest")
        .set("content-type", "application/json")
        .send({
          _id: id_test,
          created_by: "The creator",
          assigned_to: "The assigned",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, {
            result: "successfully updated",
            _id: id_test,
          });
          if (err) {
            return done(err);
          } else {
            return done();
          }
        });
    });

    test("3-c Update an issue with missing _id", (done) => {
      chai
        .request(server)
        .put("/api/issues/apitest")
        .set("content-type", "application/json")
        .send({
          issue_text: "new issue text",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: "missing _id" });
          if (err) {
            return done(err);
          } else {
            return done();
          }
        });
    });

    test("3-d Update an issue with no field to update", (done) => {
      chai
        .request(server)
        .put("/api/issues/apitest")
        .set("content-type", "application/json")
        .send({
          _id: id_test,
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, {
            error: "no update field(s) sent",
            _id: id_test,
          });
          if (err) {
            return done(err);
          } else {
            return done();
          }
        });
    });

    test("3-e Update an issue with an invalid _id", (done) => {
      chai
        .request(server)
        .put("/api/issues/apitest")
        .set("content-type", "application/json")
        .send({
          _id: "bonjour",
          issue_status: "new status",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, {
            error: "could not update",
            _id: "bonjour",
          });
          if (err) {
            return done(err);
          } else {
            done();
          }
        });
    });
  });

  suite("4) Delete an issue", () => {
    test("4-a DELETE request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .delete("/api/issues/apitest")
        .set("content-type", "application/json")
        .send({
          _id: id_test,
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, {
            result: "successfully deleted",
            _id: id_test,
          });
          if (err) {
            return done(err);
          } else {
            return done();
          }
        });
    });

    test("4-b Delete an issue with an invalid _id", (done) => {
      chai
        .request(server)
        .delete("/api/issues/apitest")
        .set("content-type", "application/json")
        .send({
          _id: "salut",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, {
            error: "could not delete",
            _id: "salut",
          });
          if (err) {
            return done(err);
          } else {
            return done();
          }
        });
    });

    test("4-c Delete an issue with missing _id", (done) => {
      chai
        .request(server)
        .delete("/api/issues/apitest")
        .set("content-type", "application/json")
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: "missing _id" });
          if (err) {
            return done(err);
          } else {
            return done();
          }
        });
    });
  });
});
