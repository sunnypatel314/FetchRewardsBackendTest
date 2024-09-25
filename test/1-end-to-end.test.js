const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../index"); // Assuming your server file is named index.js
const { expect } = chai;

chai.should();
chai.use(chaiHTTP);

// This is just testing the examples that were on the PDF.

describe("End-to-end testing using given examples", () => {
  // POST "/add" endpoint
  describe("POST /add", () => {
    it("Should successfully add DANNON transaction and return 200", (done) => {
      const transaction = {
        payer: "DANNON",
        points: 300,
        timestamp: "2022-10-31T10:00:00Z",
      };

      chai
        .request(server)
        .post("/add")
        .send(transaction)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body).to.be.empty;
          done();
        });
    });

    it("Should successfully add UNILEVER transaction and return 200", (done) => {
      const transaction = {
        payer: "UNILEVER",
        points: 200,
        timestamp: "2022-10-31T11:00:00Z",
      };

      chai
        .request(server)
        .post("/add")
        .send(transaction)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body).to.be.empty;
          done();
        });
    });

    it("Should successfully add negative DANNON transaction and return 200", (done) => {
      const transaction = {
        payer: "DANNON",
        points: -200,
        timestamp: "2022-10-31T15:00:00Z",
      };

      chai
        .request(server)
        .post("/add")
        .send(transaction)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body).to.be.empty;
          done();
        });
    });

    it("Should successfully add MILLER COORS transaction and return 200", (done) => {
      const transaction = {
        payer: "MILLER COORS",
        points: 10000,
        timestamp: "2022-11-01T14:00:00Z",
      };

      chai
        .request(server)
        .post("/add")
        .send(transaction)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body).to.be.empty;
          done();
        });
    });

    it("Should successfully add another DANNON transaction and return 200", (done) => {
      const transaction = {
        payer: "DANNON",
        points: 1000,
        timestamp: "2022-11-02T14:00:00Z",
      };

      chai
        .request(server)
        .post("/add")
        .send(transaction)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body).to.be.empty;
          done();
        });
    });
  });

  // POST "/spend" endpoint
  describe("POST /spend", () => {
    it("Should spend 5000 points and return correct transactions", (done) => {
      const spend = {
        points: 5000,
      };
      const expectedResponse = [
        { payer: "DANNON", points: -100 },
        { payer: "UNILEVER", points: -200 },
        { payer: "MILLER COORS", points: -4700 },
      ];
      chai
        .request(server)
        .post("/spend")
        .send(spend)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body).to.deep.equal(expectedResponse);
          done();
        });
    });
  });

  // GET "/balance" endpoint
  describe("GET /balance", () => {
    it("Should return the current balance for each payer", (done) => {
      const expectedBalance = {
        DANNON: 1000,
        UNILEVER: 0,
        "MILLER COORS": 5300,
      };
      chai
        .request(server)
        .get("/balance")
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body).to.deep.equal(expectedBalance);
          done();
        });
    });
  });
});
