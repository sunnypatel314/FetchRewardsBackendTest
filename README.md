# Fetch Rewards Backend Engineering Assessment

REST API for managing a single user's points and transactions. 
For reporting purposes, the points per payer will also be tracked so the correct payers can be billed when a user spends their points.

## Assumptions (Please read before evaluating)
- Negative transactions are allowed, but they are handled differently. If a transaction has a negative  'points' value, we will not add that transaction to the transactions list.
  Instead, we will subtract that many points from that payer's other transactions starting with that payer's OLDEST transaction. Since the PDF did not specify what to do
  in odd cases like this, I think this is a fair assumption.

## Tech Stack

- **Node.js**: JavaScript runtime for building fast, scalable server-side applications.
- **Express.js**: Web framework for building REST APIs.

## Getting Started

### Prerequisites
Ensure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/) (Any version v10.0.0 or higher should work)

### Running Locally
1) **Verify Node version**
    ```
    node --version
    ```
2) **Verify NPM installion**
    ```
    npm --version
    ```
3) **Clone GitHub Repository**
   ```
   git clone https://github.com/sunnypatel314/FetchRewardsBackendTest.git
   ```
4) **Open cloned repository and enter the working directory**
   ```
   cd FetchRewardsBackendTest
   ```
5) **Install dependencies**
   - If you are on Windows, do this:
   ```
   npm install
   ```
   - If you are on Mac, do this:
   ```
   sudo npm install
   ```
7) **Start server**
   ```
   npm start
   ```
8) **Verify you terminal reads the following:**
   ```
   Server running on port: http://localhost:8000
   ```

## API Endpoints

**KEEP IN MIND** that the data in this application is not durable. 
Every time you start the server, the total points will be 0 and the transactions list & payer points object will be empty. 

I recommend using Postman to test the API calls; that is what I will be showing in the documentation.
Make sure you have selected the 'raw' radio button under the 'Body' tab and the data type for the requests is JSON.
![image](https://github.com/user-attachments/assets/e6cc3d81-2adf-430b-9996-d3af63a8387d)

Please keep your Postman data clean. Do not leave comments in the request body when sending requests. In my experience, this leads to weird behavior and errors.
In other words, do not do this:
![image](https://github.com/user-attachments/assets/2cc6f425-d86b-43a3-90b7-8e8e60f45216)

#### POST "/add" - Add payer transaction
- Request: 
  ```
  {
    "payer<str>" : "DANNON", // case insensitive
    "points<int>" : 5000, // cannot be 0
    "timestamp<ISO8601>" : "2020-11-02T14:00:00Z" // must be ISO8601 format
  }
  ```
- Response:
   - Successful:
       - **Status Code 200 (OK)** if transaction went through without problems; no response body included.
   - Unsuccessful:
       - **Status Code 400 (Bad request)** if extra or missing parameters or invalid data types; response body should be a string indicating error.
       - **Status Code 422 (Unprocessable entity)** if request includes 0 points or negative points that could make a payer's balance go negative;
         response body should be a string indicating the violation of business logic.
- **Notes (IMPORTANT)**:
   - If a transaction has a negative 'points' value, we will not add that transaction to the transactions list.
     Instead, we will subtract that many points from that payer's other transactions starting with that payer's OLDEST transaction.
     If that payer does not have enough points to cover the negative amount, the request cannot be processed.
   - Also, remember that the payers name are case INSENSITIVE. ```Dannon```, ```DANNON```, and ```dannon``` are all the same payer in this application.
     
#### POST "/spend" - Spend points
- Request: 
  ```
  {
    points<int>: 5000 // cannot be 0 or less
  }
  ```
- Response:
   - Successful:
       - **Status Code 200 (OK)** if transaction went through without problems; response body should be a list of objects revealing how many points were subtracted per payer:
            ```
            [
              { "payer": "DANNON", "points": -100 },
              { "payer": "UNILEVER", "points": -200 },
              { "payer": "MILLER COORS", "points": -4,700 }
            ]
            ```
   - Unsuccessful:
       - **Status Code 400 (Bad request)** if extra or missing parameters or invalid data types; response body should be a string indicating error.
       - **Status Code 422 (Unprocessable entity)** if request includes 0 points or negative points that could make a payer's balance go negative;
         response body should be string indicating the violation of business logic.

#### GET "/balance" - Reveal point balance per payer
- Request:
   - None
- Response:
   - Successful:
       - **Status Code 200 (OK)**; response body should be an object revealing the current point balances for each payer (including the payers with 0 points):
            ```
            {
              "DANNON": 1000,
              "UNILEVER" : 0,
              "MILLER COORS": 5300
            }
            ```

## Testing (Optional)

Mocha and Chai were used to develop test scripts. 
I have included 3 testing files in the code:
  1) Tests the application end to end using the examples provided in the PDF.
  2) Tests the potential errors that could appear due to bad requests (invalid data types, missing or extra parameters, etc).
  3) Tests how the API handles calls that violate business logic (overspending points, payer balance going negative, etc).

To run the 18 test cases available:
```
npm test
```
![image](https://github.com/user-attachments/assets/d78bd3e9-7f70-4b5b-8008-06ea9ae142c4)


## Thank you!
- I just wanted to say thank you for evaluating my assessment.
