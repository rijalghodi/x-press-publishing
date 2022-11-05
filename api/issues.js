const express = require("express");
const issuesRouter = express.Router({ mergeParams: true });
const sqlite3 = require("sqlite3");

// check if process.env.TEST_DATABASE has been set, and if so load that database
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);

/* ---------------------------------------------------------------------------*/
// GET issue throught issueId param
issuesRouter.param("issueId", (req, res, next, issueId) => {
  db.get(
    "SELECT * FROM Issue WHERE Issue.id = $issueId", // $issueId is placeholder
    { $issueId: issueId },
    (error, issue) => {
      if (error) {
        next(error);
      } else if (issue) {
        next();
      } else {
        res.sendStatus(404);
      }
    }
  );
});
// End GET issue

/* ---------------------------------------------------------------------------*/
// Get all issues
issuesRouter.get("/", (req, res, next) => {
  db.all(
    "SELECT * FROM Issue WHERE Issue.series_id = $seriesId",
    { $seriesId: req.params.seriesId },
    (err, issues) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({ issues: issues });
      }
    }
  );
});
// End GET all issues

/* ---------------------------------------------------------------------------*/
// POST new issues
issuesRouter.post("/", (req, res, next) => {
  const name = req.body.issue.name,
    issueNumber = req.body.issue.issueNumber,
    publicationDate = req.body.issue.publicationDate,
    artistId = req.body.issue.artistId;

  if (!name || !issueNumber || !publicationDate || !artistId) {
    return res.sendStatus(400);
  }

  // Check is there artistId in the database
  db.get(
    "SELECT * FROM Artist WHERE Artist.id = $artistId",
    { $artistId: artistId },
    (error, artist) => {
      if (error) {
        next(error);
      } else {
        // then insert the request body into the Issue table
        const sql =
          "INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id)" +
          "VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId)";
        const values = {
          $name: name,
          $issueNumber: issueNumber,
          $publicationDate: publicationDate,
          $artistId: artistId,
          $seriesId: req.params.seriesId, //seriesId is the parameter in series.js
        };

        db.run(sql, values, function (error) {
          if (error) {
            next(error);
          } else {
            db.get(
              `SELECT * FROM Issue WHERE Issue.id = ${this.lastID}`,
              (error, issue) => {
                res.status(201).json({ issue: issue });
              }
            );
          }
        });
      }
    }
  );
});
// End POST new issues

/* ---------------------------------------------------------------------------*/
// PUT (Update) issue
issuesRouter.put("/:issueId", (req, res, next) => {
  const name = req.body.issue.name,
    issueNumber = req.body.issue.issueNumber,
    publicationDate = req.body.issue.publicationDate,
    artistId = req.body.issue.artistId;

  // Check whether the artistId is exist?
  db.get(
    "SELECT * FROM Artist WHERE Artist.id = $artistId",
    { $artistId: artistId },
    (error, artist) => {
      if (error) {
        next(error);
      } else {
        if (!name || !issueNumber || !publicationDate || !artist) {
          return res.sendStatus(400);
        }

        // then update the issue
        const sql =
          "UPDATE Issue SET name = $name, issue_number = $issueNumber, " + // be carefull! space in SQL is important!
          "publication_date = $publicationDate, artist_id = $artistId " +
          "WHERE Issue.id = $issueId";
        const values = {
          $name: name,
          $issueNumber: issueNumber,
          $publicationDate: publicationDate,
          $artistId: artistId,
          $issueId: req.params.issueId,
        };

        db.run(sql, values, function (error) {
          if (error) {
            next(error);
          } else {
            db.get(
              `SELECT * FROM Issue WHERE Issue.id = ${req.params.issueId}`,
              (error, issue) => {
                res.status(200).json({ issue: issue });
              }
            );
          }
        });
      }
    }
  );
});
// End PUT (Update) issue

/* ---------------------------------------------------------------------------*/
// DELETE issue
issuesRouter.delete("/:issueId", (req, res, next) => {
  const sql = "DELETE FROM Issue WHERE Issue.id = $issueId";
  const values = { $issueId: req.params.issueId };

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(204);
    }
  });
});
// End DELETE issue

module.exports = issuesRouter;
