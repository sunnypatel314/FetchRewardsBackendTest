const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../index"); // Assuming your server file is named index.js
const { expect } = chai;

chai.should();
chai.use(chaiHTTP);

// These cases test how the API handles bad requests (missing or extra parameters, invalid data types, etc)

describe("Handling invalid requests and errors", () => {
  // POST "/add" endpoint error handling
  describe("POST /add", () => {
    it("Should return 400 for extra parameters in the request body", (done) => {
      const transaction = {
        payer: "DANNON",
        points: 300,
        timestamp: "2022-10-31T10:00:00Z",
        extra: "Extra parameter that is not suppose to be here",
      };
      chai
        .request(server)
        .post("/add")
        .send(transaction)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it("Should return 400 for missing parameters in the request body", (done) => {
      const transaction = {
        payer: "DANNON",
        points: 1000,
        // missing timestamp parameter
      };
      chai
        .request(server)
        .post("/add")
        .send(transaction)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it("Should return 400 for invalid data types", (done) => {
      const transaction = {
        payer: "DANNON",
        points: 100,
        timestamp: "10-31-2022 14:30:00", // invalid timestamp format, should be ISO 8601
      };
      chai
        .request(server)
        .post("/add")
        .send(transaction)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });

  // POST "/spend" endpoint error handling
  describe("POST /spend", () => {
    it("Should return 400 for extra parameters in the request body", (done) => {
      const points = {
        points: 250,
        extra: "Extra parameter that is not suppose to be here",
      };
      chai
        .request(server)
        .post("/spend")
        .send(points)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it("Should return 400 for invalid data types", (done) => {
      const points = {};
      chai
        .request(server)
        .post("/spend")
        .send(points)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it("Should return 400 for missing parameters in the request body", (done) => {
      const points = {
        points: "abc", // should be an integer or string of an integer
      };
      chai
        .request(server)
        .post("/spend")
        .send(points)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });
});
