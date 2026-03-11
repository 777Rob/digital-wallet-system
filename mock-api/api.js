const express = require("express");
const { faker } = require("@faker-js/faker");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();
const port = 3000;

app.use(express.json());

const players = [];

app.post("/register", (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  const id = faker.string.uuid();

  if (players.find((player) => player.email === email))
    return res.status(400).json({ message: "Email already registered" });

  if (password !== confirmPassword)
    return res.status(400).json({ message: "Passwords do not match" });

  players.push({
    id,
    name,
    email,
    password,
    confirmPassword,
    balance: 1000,
    currency: "EUR",
    accessToken: null,
    bets: [],
    transactions: [],
  });

  res.json({
    id,
    name,
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const player = players.find(
    (player) => player.email === email && player.password === password
  );

  if (!player)
    return res.status(400).json({ message: "Invalid email or password" });

  const accessToken = faker.string.uuid();

  player.accessToken = accessToken;

  res.json({
    id: player.id,
    name: player.name,
    balance: player.balance,
    currency: player.currency,
    accessToken,
  });
});

app.post("/bet", (req, res) => {
  const { amount } = req.body;
  const authorization = req.headers.authorization;

  if (!authorization)
    return res.status(401).json({ message: "Invalid token" });

  const player = players.find(
    (player) => player.accessToken === authorization.replace("Bearer ", "")
  );

  if (!player) return res.status(401).json({ message: "Invalid token" });

  if (player.balance < amount)
    return res.status(400).json({ message: "Insufficient balance" });

  if (amount < 1)
    return res.status(400).json({ message: "Minimum bet amount is 1" });

  const isWin = Math.random() < 0.3;
  const betTransactionId = faker.string.uuid();

  player.balance = player.balance - amount;

  if (isWin) player.balance = player.balance + amount * 2;

  player.transactions.push({
    id: betTransactionId,
    amount,
    type: "bet",
    createdAt: new Date(),
  });

  if (isWin)
    player.transactions.push({
      id: faker.string.uuid(),
      amount: amount * 2,
      type: "win",
      createdAt: new Date(),
    });

  player.bets.push({
    id: betTransactionId,
    amount,
    status: isWin ? "win" : "lost",
    createdAt: new Date(),
    winAmount: isWin ? amount * 2 : null,
  });

  res.json({
    transactionId: betTransactionId,
    currency: "EUR",
    balance: player.balance,
    winAmount: isWin ? amount * 2 : null,
  });
});

app.get("/my-bets", (req, res) => {
  const { id, status, page, limit } = req.query;
  const authorization = req.headers.authorization;

  if (!authorization)
    return res.status(401).json({ message: "Invalid token" });

  if (!page || !limit)
    return res.status(400).json({ message: "Invalid parameters" });

  const player = players.find(
    (player) => player.accessToken === authorization.replace("Bearer ", "")
  );

  if (!player) return res.status(401).json({ message: "Invalid token" });

  const bets = player.bets
    .filter(
      (bet) =>
        (!id || bet.id === id) && (!status || bet.status === status) && bet
    )
    .sort((a, b) => b.createdAt - a.createdAt);

  const total = bets.length;
  const data = bets.slice((page - 1) * limit, page * limit);

  res.json({
    data,
    total,
    page: Number(page),
    limit: Number(limit),
  });
});

app.delete("/my-bet/:id", (req, res) => {
  const { id } = req.params;
  const authorization = req.headers.authorization;

  if (!authorization)
    return res.status(401).json({ message: "Invalid token" });

  const player = players.find(
    (player) => player.accessToken === authorization.replace("Bearer ", "")
  );

  if (!player) return res.status(401).json({ message: "Invalid token" });

  const bet = player.bets.find((bet) => bet.id === id);

  if (!bet) return res.status(404).json({ message: "Bet not found" });

  if (bet.status === "canceled")
    return res.status(400).json({ message: "Bet already canceled" });

  if (bet.status === "win" && player.balance < bet.amount)
    return res.status(400).json({ message: "Bet already completed" });

  player.balance += bet.amount;
  bet.status = "canceled";

  player.transactions.push({
    id: faker.string.uuid(),
    amount: bet.amount,
    type: "cancel",
    createdAt: new Date(),
  });

  res.json({
    transactionId: id,
    balance: player.balance,
    currency: player.currency,
  });
});

app.get("/my-transactions", (req, res) => {
  const { id, type, page, limit } = req.query;
  const authorization = req.headers.authorization;

  if (!authorization)
    return res.status(401).json({ message: "Invalid token" });

  if (!page || !limit)
    return res.status(400).json({ message: "Invalid parameters" });

  const player = players.find(
    (player) => player.accessToken === authorization.replace("Bearer ", "")
  );

  if (!player) return res.status(401).json({ message: "Invalid token" });

  const transactions = player.transactions
    .filter(
      (transaction) =>
        (!id || transaction.id === id) &&
        (!type || transaction.type === type) &&
        transaction
    )
    .sort((a, b) => b.createdAt - a.createdAt);

  const total = transactions.length;
  const data = transactions.slice((page - 1) * limit, page * limit);

  res.json({
    data,
    total,
    page: Number(page),
    limit: Number(limit),
  });
});

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(
    swaggerJsdoc({
      swaggerDefinition: {
        openapi: "3.0.0",
        info: {
          title: "Wallet Mock API",
          version: "1.0.0",
        },
      },
      apis: ["api.js"],
    })
  )
);

app.listen(port, () =>
  console.log(`Listening: http://localhost:${port}! ✨👋🌍`)
);

/**
 * @swagger
 * components:
 *   securitySchemes:
 *    bearerAuth:
 *     type: http
 *     scheme: bearer
 *     bearerFormat: JWT
 *   schemas:
 *     RegisterPlayerDto:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - confirmPassword
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         confirmPassword:
 *           type: string
 *     RegisterPlayerResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *     LoginDto:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *     LoginResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         balance:
 *           type: integer
 *         currency:
 *           type: string
 *         accessToken:
 *           type: string
 *     BetDto:
 *       type: object
 *       required:
 *         - amount
 *       properties:
 *         amount:
 *           type: number
 *           description: Bet amount
 *     BetResponseDto:
 *       type: object
 *       properties:
 *         transactionId:
 *           type: string
 *         currency:
 *           type: string
 *         balance:
 *           type: number
 *         winAmount:
 *           type: number
 *     MyBetsResponseDto:
 *        type: object
 *        properties:
 *         id:
 *           type: string
 *         createdAt:
 *           type: string
 *         amount:
 *           type: number
 *         winAmount:
 *           type: number
 *         status:
 *           type: string
 *     MyTransactionResponseDto:
 *        type: object
 *        properties:
 *         id:
 *           type: string
 *         createdAt:
 *           type: string
 *         amount:
 *           type: number
 *         type:
 *           type: string
 *     PaginateTransactionResponseDto:
 *        type: object
 *        properties:
 *         data:
 *           type: array
 *           items:
 *            $ref: '#/components/schemas/MyTransactionResponseDto'
 *         total:
 *           type: number
 *         page:
 *           type: number
 *         limit:
 *           type: number
 *     PaginateResponseDto:
 *        type: object
 *        properties:
 *         data:
 *           type: array
 *           items:
 *            $ref: '#/components/schemas/MyBetsResponseDto'
 *         total:
 *           type: number
 *         page:
 *           type: number
 *         limit:
 *           type: number
 *     CancelBetResponseDto:
 *        type: object
 *        properties:
 *         transactionId:
 *           type: string
 *         balance:
 *           type: number
 *         currency:
 *           type: string
 *
 * /register:
 *   post:
 *     summary: Creates a new player
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterPlayerDto'
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterPlayerResponseDto'
 * /login:
 *   post:
 *     summary: Logs in the player
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginDto'
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponseDto'
 *
 * /bet:
 *   post:
 *     summary: Places a bet
 *     tags: [Bet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BetDto'
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BetResponseDto'
 * /my-bet/{id}:
 *   delete:
 *     summary: Cancels a bet
 *     tags: [Bet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CancelBetResponseDto'
 * /my-bets:
 *   get:
 *     summary: Retrieves the player's bets
 *     tags: [Bet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: query
 *        name: id
 *        schema:
 *          type: string
 *        required: false
 *      - in: query
 *        name: status
 *        schema:
 *          type: string
 *        required: false
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *        required: true
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *        required: true
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/PaginateResponseDto'
 *
 * /my-transactions:
 *   get:
 *     summary: Retrieves the player's transactions
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: query
 *        name: id
 *        schema:
 *          type: string
 *        required: false
 *      - in: query
 *        name: type
 *        schema:
 *          type: string
 *        required: false
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *        required: true
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *        required: true
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/PaginateTransactionResponseDto'
 */