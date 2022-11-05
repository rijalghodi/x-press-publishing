const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./database.sqlite");

let artistId, seriesId;

db.get(
  "SELECT name FROM sqlite_master WHERE type='table' AND name='Artist'",
  (error, table) => {
    if (error) {
      throw new Error(error);
    }

    if (table) {
      db.serialize(function () {
        db.run(
          "INSERT INTO Artist (name, date_of_birth, biography) VALUES ('Mashashi Kishimoto', 'November 08, 1974', 'Masashi Kishimoto is a Japanese manga artist, best known for creating the popular manga series Naruto. Naruto has gone down in history as one of the most-loved manga in the world')"
        );
        db.run(
          "INSERT INTO Artist (name, date_of_birth, biography) VALUES ('Eichiro Oda', 'January 01, 1975', 'Eiichirō Oda is a Japanese manga artist and the creator of the series One Piece. One Piece is both the best-selling manga in history, in turn making Oda one of the best-selling fiction authors')",
          function (error) {
            if (error) {
              throw new Error(error);
            }

            artistId = this.lastID;
          }
        );

        db.get(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='Series'",
          (error, table) => {
            if (error) {
              throw new Error(error);
            }

            if (table) {
              db.serialize(function () {
                db.run(
                  "INSERT INTO Series (name, description) VALUES ('Naruto', 'A journey of a little orphan ninja, named Naruto, to become Hokage (a leader of the ninja village)')"
                );
                db.run(
                  "INSERT INTO Series (name, description) VALUES ('One Piece', 'A journey of a funny, energic, and inspirable teen, named Monkey D. Luffy, to find the most mysterious and precious treasure of the sea, One Piece')",
                  function (error) {
                    if (error) {
                      throw new Error(error);
                    }

                    seriesId = this.lastID;
                  }
                );
                db.get(
                  "SELECT name FROM sqlite_master WHERE type='table' AND name='Issue'",
                  (error, table) => {
                    if (error) {
                      throw new Error(error);
                    }

                    if (table) {
                      db.serialize(function () {
                        db.run(
                          `INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) VALUES ('The Customizable BashMan', 1, 'January 1, 1990', ${artistId}, ${seriesId})`
                        );
                        db.run(
                          `INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) VALUES ('BashMan Meets ScareCurl', 2, 'January 8, 1990', ${artistId}, ${seriesId})`
                        );
                      });
                    }
                  }
                );
              });
            }
          }
        );
      });
    }
  }
);
