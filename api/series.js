const express = require("express");
const seriesRouter = express.Router();

const sqlite3 = require("sqlite3");

// check if process.env.TEST_DATABASE has been set, and if so load that database
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);

const issuesRouter = require("./issues");

/* ---------------------------------------------------------------------------*/
// Middleware to GET a series by seriesId param
seriesRouter.param("seriesId", (req, res, next, seriesId) => {
  db.get(
    "SELECT * FROM Series WHERE id = $seriesId", // $seriesId is placeholder
    { $seriesId: seriesId },
    (error, series) => {
      if (error) {
        next(error);
      } else if (series) {
        req.series = series;
        next();
      } else {
        res.sendStatus(404);
      }
    }
  );
});
// End Middleware to GET series

/* ---------------------------------------------------------------------------*/
// Import issues router
seriesRouter.use("/:seriesId/issues", issuesRouter);

/* ---------------------------------------------------------------------------*/
// Get all series
seriesRouter.get("/", (req, res, next) => {
  db.all("SELECT * FROM Series", (err, series) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({ series: series });
    }
  });
});
// End GET all series

/* ---------------------------------------------------------------------------*/
// GET series
seriesRouter.get("/:seriesId", (req, res, next) => {
  res.status(200).json({ series: req.series });
});
// End GET series

/* ---------------------------------------------------------------------------*/
// POST new series
seriesRouter.post("/", (req, res, next) => {
  const name = req.body.series.name,
    description = req.body.series.description;

  if (!name || !description) {
    return res.sendStatus(400);
  }

  const sql =
    "INSERT INTO Series (name, description) VALUES ($name, $description)";
  const values = {
    $name: name,
    $description: description,
  };

  db.run(sql, values, function (error) {
    if (error) {
      next(error);
    } else {
      db.get(
        `SELECT * FROM Series WHERE Series.id = ${this.lastID}`,
        (error, series) => {
          res.status(201).json({ series: series });
        }
      );
    }
  });
});
// End POST new series

/* ---------------------------------------------------------------------------*/
// PUT (Update) series
seriesRouter.put("/:seriesId", (req, res, next) => {
  const name = req.body.series.name,
    description = req.body.series.description;
  if (!name || !description) {
    return res.sendStatus(400);
  }

  const sql =
    "UPDATE Series SET name = $name, description = $description " +
    "WHERE Series.id = $seriesId";
  const values = {
    $name: name,
    $description: description,
    $seriesId: req.params.seriesId,
  };

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(
        `SELECT * FROM series WHERE Series.id = ${req.params.seriesId}`,
        (error, series) => {
          res.status(200).json({ series: series });
        }
      );
    }
  });
});
// End PUT (Update) series

/* ---------------------------------------------------------------------------*/
// DELETE series
seriesRouter.delete("/:seriesId", (req, res, next) => {
  const issueSql = "SELECT * FROM Issue WHERE Issue.series_id = $seriesId";
  const issueValues = { $seriesId: req.params.seriesId };
  db.get(issueSql, issueValues, (error, issue) => {
    if (error) {
      next(error);
    } else if (issue) {
      res.sendStatus(400);
    } else {
      const deleteSql = "DELETE FROM Series WHERE Series.id = $seriesId";
      const deleteValues = { $seriesId: req.params.seriesId };

      db.run(deleteSql, deleteValues, (error) => {
        if (error) {
          next(error);
        } else {
          res.sendStatus(204);
        }
      });
    }
  });
});
// End DELETE series

module.exports = seriesRouter;
