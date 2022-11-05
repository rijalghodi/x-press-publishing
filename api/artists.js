const express = require("express");
const artistsRouter = express.Router();
const sqlite3 = require("sqlite3");

// check if process.env.TEST_DATABASE has been set, and if so load that database
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);

/* ---------------------------------------------------------------------------*/
// Get all artists
artistsRouter.get("/", (req, res, next) => {
  db.all(
    "SELECT * FROM Artist WHERE is_currently_employed = 1",
    (error, artists) => {
      if (error) {
        next(error);
      } else {
        res.status(200).json({ artists: artists });
      }
    }
  );
});
// End GET all artists

/* ---------------------------------------------------------------------------*/
// Middleware to GET artist by artisId
artistsRouter.param("artistId", (req, res, next, artistId) => {
  db.get(
    "SELECT * FROM Artist WHERE id = $artistId", // $artistId is placeholder
    { $artistId: artistId },
    (error, artist) => {
      if (error) {
        next(error);
      } else if (artist) {
        req.artist = artist;
        next();
      } else {
        res.sendStatus(404);
      }
    }
  );
});
// End Middleware to GET artist

/* ---------------------------------------------------------------------------*/
// GET artist
artistsRouter.get("/:artistId", (req, res, next) => {
  res.status(200).json({ artist: req.artist });
});
// End GET artist

/* ---------------------------------------------------------------------------*/
// POST new artist
artistsRouter.post("/", (req, res, next) => {
  const name = req.body.artist.name,
    dateOfBirth = req.body.artist.dateOfBirth,
    biography = req.body.artist.biography,
    isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;
  if (!name || !dateOfBirth || !biography) {
    return res.sendStatus(400);
  }

  const sql =
    "INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed)" +
    "VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)";
  const values = {
    $name: name,
    $dateOfBirth: dateOfBirth,
    $biography: biography,
    $isCurrentlyEmployed: isCurrentlyEmployed,
  };

  db.run(sql, values, function (error) {
    if (error) {
      next(error);
    } else {
      db.get(
        `SELECT * FROM Artist WHERE Artist.id = ${this.lastID}`,
        (error, artist) => {
          res.status(201).json({ artist: artist });
        }
      );
    }
  });
});
// End POST new artist

/* ---------------------------------------------------------------------------*/
// PUT (Update) artist
artistsRouter.put("/:artistId", (req, res, next) => {
  const name = req.body.artist.name,
    dateOfBirth = req.body.artist.dateOfBirth,
    biography = req.body.artist.biography,
    isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;
  if (!name || !dateOfBirth || !biography) {
    return res.sendStatus(400);
  }

  const sql =
    "UPDATE Artist SET name = $name, date_of_birth = $dateOfBirth, " +
    "biography = $biography, is_currently_employed = $isCurrentlyEmployed " +
    "WHERE Artist.id = $artistId";
  const values = {
    $name: name,
    $dateOfBirth: dateOfBirth,
    $biography: biography,
    $isCurrentlyEmployed: isCurrentlyEmployed,
    $artistId: req.params.artistId,
  };

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(
        `SELECT * FROM Artist WHERE Artist.id = ${req.params.artistId}`,
        (error, artist) => {
          res.status(200).json({ artist: artist });
        }
      );
    }
  });
});
// End PUT (Update artist)

/* ---------------------------------------------------------------------------*/
// DELETE artist
artistsRouter.delete("/:artistId", (req, res, next) => {
  const sql =
    "UPDATE Artist SET is_currently_employed = $isCurrentlyEmployed WHERE id = $artistId";
  const values = {
    $isCurrentlyEmployed: 0,
    $artistId: req.params.artistId,
  };
  db.run(sql, values, (error, artist) => {
    if (error) {
      next(error);
    }
    db.get(
      `SELECT * FROM Artist WHERE Artist.id = ${req.params.artistId}`,
      (error, artist) => {
        res.status(200).json({ artist: artist });
      }
    );
  });
});
// End DELETE artist

module.exports = artistsRouter;
