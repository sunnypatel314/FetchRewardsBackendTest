const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../index"); // Assuming your server file is named index.js
const { expect } = chai;

chai.should();
chai.use(chaiHTTP);

// These cases test how the API handles a violation of business logic (overspending points, payers going negative, etc)

describe("Handling edge cases", () => {
  // POST "/add" endpoint error handling
  describe("POST /add", () => {
    it("Should return 422 because the points value is 0", (done) => {
      const transaction = {
        payer: "DANNON",
        points: 0,
        timestamp: "2024-09-15T11:30:00Z",
      };
      chai
        .request(server)
        .post("/add")
        .send(transaction)
        .end((err, res) => {
          res.should.have.status(422);
          done();
        });
    });

    it("Should return 422 because this will make a payer go negative", (done) => {
      const transaction = {
        payer: "DANNON",
        points: -1200,
        timestamp: "2022-09-15T10:00:00Z",
      };
      chai
        .request(server)
        .post("/add")
        .send(transaction)
        .end((err, res) => {
          res.should.have.status(422);
          done();
        });
    });
  });

  describe("POST /spend", () => {
    it("Should return 400 because not enough points are available", (done) => {
      const points = { points: 6400 };
      chai
        .request(server)
        .post("/spend")
        .send(points)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it("Should return 422 because the points value is 0", (done) => {
      const points = { points: 0 };
      chai
        .request(server)
        .post("/spend")
        .send(points)
        .end((err, res) => {
          res.should.have.status(422);
          done();
        });
    });

    it("Should return 422 because the points value is negative", (done) => {
      const points = { points: -300 };
      chai
        .request(server)
        .post("/spend")
        .send(points)
        .end((err, res) => {
          res.should.have.status(422);
          done();
        });
    });
  });
});
