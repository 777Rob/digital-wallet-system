# Mock API

## Description

This is a RESTful API developed with Express.js that simulates the management of a digital wallet for a betting platform. It allows users to register players, log in, place bets, view bets and transactions, and cancel bets.

## Requirements

- Node.js >= 14.x
- Yarn or npm

## Installation

1. Clone this repository:

   ```bash
   git clone
   cd mock-api
   ```

2. Navigate to the project directory:

   ```bash
   cd /path/mock-api
   ```

3. Install dependencies using npm:

   ```bash
   npm install
   ```

## Running the API

1. To run the API in a local environment:

   ```bash
   npm start
   ```

The server will be available at: http://localhost:3000.

## Swagger Documentation

The API documentation can be accessed at the /docs endpoint:
http://localhost:3000/docs

## Endpoints

1. Player Registration

- **Route**: `/register`
- **Method**: `POST`
- **Description**: Creates a new player.
- **Body**:
  - `name`: Player’s name
  - `email`: Player’s email
  - `password`: Player’s password
  - `confirmPassword`: Password confirmation

2. Player Login

- **Route**: `/login`
- **Method**: `POST`
- **Description**: Logs in a player.
- **Body**:
  - `email`: Player’s email
  - `password`: Player’s password

3. Place a Bet

- **Route**: `/bet`
- **Method**: `POST`
- **Description**: Places a bet.
- **Headers**:
  - `Authorization`: Authentication token (Bearer token)
- **Body**:
  - `amount`: Bet amount

4. View Bets

- **Route**: `/my-bets`
- **Method**: `GET`
- **Description**: Retrieves the player’s bets.
- **Headers**:
  - `Authorization`: Authentication token (Bearer token)
- **Query Params**:
  - `page`: Page number
  - `limit`: Number of results per page
  - `id` (optional): Bet ID
  - `status` (optional): Bet status (win, lost, canceled)

5. Cancel a Bet

- **Route**: `/my-bet/:id`
- **Method**: `DELETE`
- **Description**: Cancels a bet.
- **Headers**:
  - `Authorization`: Authentication token (Bearer token)
- **Params**:
  - `id`: ID of the bet to be canceled

6. View Transactions

- **Route**: `/my-transactions`
- **Method**: `GET`
- **Description**: Retrieves the player’s transactions.
- **Headers**:
  - `Authorization`: Authentication token (Bearer token)
- **Query Params**:
  - `page`: Page number
  - `limit`: Number of results per page
  - `id` (optional): Transaction ID
  - `type` (optional): Transaction type (bet, win, cancel)

## Technologies Used

- Node.js
- Express.js
- Faker.js
- Swagger

## Notes

This API is a mock created specifically to assist and simplify the development of front-end testing. Feel free to make any modifications or improvements as needed.
