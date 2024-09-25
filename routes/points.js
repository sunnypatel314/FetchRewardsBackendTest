const express = require("express");
const { body, validationResult } = require("express-validator");

const router = express.Router();

let transactions = []; // transactions list sorted from oldest to newest
let totalPoints = 0; // total points for user
let payerPoints = {}; // points available for each payer

// server-side validation for the '/add' endpoint
// makes sure we dont have missing/extra parameters, and that the data types match correctly.
const addEndpointExpressValidator = [
  body().custom((body) => {
    if (
      Object.keys(body).length !== 3 ||
      !Object.keys(body).every((field) => ["payer", "points", "timestamp"].includes(field))
    ) {
      throw new Error("Invalid parameters. Parameters are restricted to: payer<str>, timestamp<ISO8601>, points<int>.");
    }
    return true;
  }),
  body("payer").isString().toUpperCase().withMessage("Field 'payer' must be a string."),
  body("points").isInt().toInt().withMessage("Field 'points' must be an integer."),
  body("timestamp").isISO8601().withMessage("Field 'timestamp' must be a timestamp value in ISO8601 format."),
];

// server-side validation for the '/spend' endpoint
// makes sure we dont have missing/extra parameters, and that the data types match correctly.
const spendEndpointExpressValidator = [
  body().custom((body) => {
    if (Object.keys(body).length !== 1 || !body.hasOwnProperty("points")) {
      throw new Error("Invalid parameters. Parameters are restricted to: points<int>.");
    } 
    return true;
  }),
  body("points").isInt().toInt().withMessage("Field 'points' must be an integer greater than 0."),
];

// GET "/balance"
router.get("/balance", (req, res) => {
  res.status(200).json(payerPoints); // returns payer balances
});

// POST "/add"
router.post(
  "/add",
  addEndpointExpressValidator,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = errors.array()[0];
      return res.status(400).send(error.msg); // bad request, 400 error
    }
    next();
  },
  (req, res) => {
    const { payer, points, timestamp } = req.body;
    
    // point values cannot be 0 or a negative value that would cause the payer balance to go negative
    if (points == 0)
      return res.status(422).send("Error: Cannot process 0 points."); // unprocessable entity, 422 error
    if (points < 0 && points * -1 > (payerPoints[payer] || 0)) {
      return res.status(422).send("Error: This transactions will make the payers points negative."); // unprocessable entity, 422 error 
    }

    totalPoints += points;

    // if points are negative, we reduce that payers balance by the negative points.
    // we can be sure the new payer balance wont go negative because it already passed the condition we set above.
    // we take the oldest transaction from that same payer and subtract it by the negative points.
    // if the transaction value reaches 0, we can remove it.
    // we just pull the oldest transaction with the same payer and repeat the process until the negative balance is settled.
    if (points < 0) {
      let transOldestIndex = 0;
      let pointsToReduce = points * -1;
      payerPoints[payer] -= pointsToReduce;
      while (pointsToReduce > 0) {
        if (transactions[transOldestIndex]["payer"] !== payer) {
          transOldestIndex += 1;
          continue;
        }
        if (transactions[transOldestIndex]["points"] > pointsToReduce) {
          transactions[transOldestIndex]["points"] -= pointsToReduce;
          pointsToReduce -= pointsToReduce; // sets to 0
        } else if (transactions[transOldestIndex]["points"] <= pointsToReduce) {
          pointsToReduce -= transactions[transOldestIndex]["points"];
          transactions.splice(transOldestIndex, 1);
          continue;
        }
      }
    // if the transaction value is positive, we insert it to the transaction list and update 'totalPoints' and 'payers'.
    // we need to insert the transaction into the correct position in the transactions list based on timestamp.
    // the first element should be the oldest, while the last is the newest.
    // doing it this way will allow us to avoid sorting every time, making this more efficient (which will be useful if the list becomes very large).
    } else if (points > 0) {
      payerPoints[payer] = (payerPoints[payer] || 0) + points;
      const transactionObject = { payer, points, timestamp };
      for (let i = 0; i < transactions.length; i += 1) {
        const dateInQuestion = new Date(transactions[i]["timestamp"]);
        const transactionToAddDate = new Date(timestamp);
        if (transactionToAddDate < dateInQuestion) {
          transactions.splice(i, 0, transactionObject);
          break;
        }
        if (i == transactions.length - 1) {
          transactions.push(transactionObject);
          break;
        }
      }
      if (transactions.length == 0) {
        transactions.push(transactionObject);
      }
    }
    return res.sendStatus(200);
  }
);

// POST "/spend"
router.post(
  "/spend",
  spendEndpointExpressValidator,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = errors.array()[0];
      return res.status(400).send(error.msg); // bad request, 400 error
    }
    next();
  },
  (req, res) => {
    const { points } = req.body;

    // points value cannot be below or equal to 0, and it cannot be more than the current totalPoints balance
    if (points > totalPoints) {
      return res.status(400).send("Error: Insufficient points available"); // bad request, 400 error
    }
    if (points <= 0) {
      return res.status(422).send("Cannot process 0 or less points"); // unprocessable entity, 422 error
    }

    payersUpdate = []; // list of objects containing payer name and how many points were subtracted from them
    let pointsToSpend = points;
    while (pointsToSpend > 0) {
      // this while loop takes the first transaction in the transaction list and subtracts the points value from it.
      // if the transaction values turns to 0, it is removed from the list, otherwise, it is kept.
      // we can reliably do this because the first transaction in the transaction list is always the oldest timestamp.
      // the payersUpdate array is updated with every iteration.
      let t = transactions[0];
      let pointsSubtracted = 0;
      if (t["points"] > pointsToSpend) {
        pointsSubtracted += pointsToSpend;
        totalPoints -= pointsToSpend;
        transactions[0]["points"] -= pointsToSpend;
        payerPoints[t["payer"]] -= pointsToSpend;
        pointsToSpend -= pointsToSpend;
      } else {
        pointsToSpend -= t["points"];
        pointsSubtracted += t["points"];
        totalPoints -= t["points"];
        payerPoints[t["payer"]] -= t["points"];
        transactions = transactions.slice(1, transactions.length);
      }
      const index = payersUpdate.findIndex((obj) => obj["payer"] === t["payer"]);

      // updates the payersUpdate array so we can return number of points subtracted from each payer.
      if (index !== -1) {
        payersUpdate[index]["points"] += pointsSubtracted * -1;
      } else {
        const newObj = {};
        newObj["payer"] = t["payer"];
        newObj["points"] = pointsSubtracted * -1;
        payersUpdate.push(newObj);
      }
    }
    return res.status(200).json(payersUpdate);
  }
);

module.exports = router;
