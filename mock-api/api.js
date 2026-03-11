const express = require("express");
const { faker } = require("@faker-js/faker");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "DELETE"]
  }
});

io.on("connection", (socket) => {
  console.log("WebSocket connected:", socket.id);
});

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
    redeemedCodes: [],
    availableSpins: 1,
    lastFreeSpinClaimDate: null,
    betAmountTowardsSpin: 0,
  });

  res.json({
    id,
    name,
  });
});

const PROMO_CODES = {
  HELLO: { amount: 1000, description: "Welcome bonus" },
};

app.post("/top-up", (req, res) => {
  const { amount } = req.body;
  const authorization = req.headers.authorization;

  if (!authorization)
    return res.status(401).json({ message: "Invalid token" });

  const player = players.find(
    (player) => player.accessToken === authorization.replace("Bearer ", "")
  );

  if (!player) return res.status(401).json({ message: "Invalid token" });

  if (!amount || amount < 1)
    return res.status(400).json({ message: "Minimum top-up amount is €1.00" });

  if (amount > 10000)
    return res.status(400).json({ message: "Maximum top-up amount is €10,000" });

  player.balance += amount;

  const transactionId = faker.string.uuid();
  player.transactions.push({
    id: transactionId,
    amount,
    type: "deposit",
    createdAt: new Date(),
  });

  io.emit("balance_update", {
    userId: player.id,
    balance: player.balance,
  });

  res.json({
    transactionId,
    balance: player.balance,
    currency: player.currency,
  });
});

app.post("/promo-code", (req, res) => {
  const { code } = req.body;
  const authorization = req.headers.authorization;

  if (!authorization)
    return res.status(401).json({ message: "Invalid token" });

  const player = players.find(
    (player) => player.accessToken === authorization.replace("Bearer ", "")
  );

  if (!player) return res.status(401).json({ message: "Invalid token" });

  if (!code || !code.trim())
    return res.status(400).json({ message: "Please enter a promo code" });

  const promo = PROMO_CODES[code.trim().toUpperCase()];
  if (!promo)
    return res.status(400).json({ message: "Invalid promotional code" });

  if (player.redeemedCodes.includes(code.trim().toUpperCase()))
    return res.status(400).json({ message: "This code has already been redeemed" });

  player.redeemedCodes.push(code.trim().toUpperCase());
  player.balance += promo.amount;

  const transactionId = faker.string.uuid();
  player.transactions.push({
    id: transactionId,
    amount: promo.amount,
    type: "promo",
    createdAt: new Date(),
  });

  io.emit("balance_update", {
    userId: player.id,
    balance: player.balance,
  });

  res.json({
    transactionId,
    balance: player.balance,
    currency: player.currency,
    amount: promo.amount,
    description: promo.description,
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

  player.betAmountTowardsSpin += amount;
  if (player.betAmountTowardsSpin >= 1000) {
    const extraSpins = Math.floor(player.betAmountTowardsSpin / 1000);
    player.availableSpins += extraSpins;
    player.betAmountTowardsSpin %= 1000;
  }

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

  io.emit("balance_update", {
    userId: player.id,
    balance: player.balance
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

  io.emit("balance_update", {
    userId: player.id,
    balance: player.balance
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

app.get("/wheel-status", (req, res) => {
  const authorization = req.headers.authorization;
  if (!authorization) return res.status(401).json({ message: "Invalid token" });
  
  const player = players.find(p => p.accessToken === authorization.replace("Bearer ", ""));
  if (!player) return res.status(401).json({ message: "Invalid token" });

  res.json({
    availableSpins: player.availableSpins,
    lastFreeSpinClaimDate: player.lastFreeSpinClaimDate,
    betAmountTowardsSpin: player.betAmountTowardsSpin,
  });
});

app.post("/wheel/claim-free", (req, res) => {
  const authorization = req.headers.authorization;
  if (!authorization) return res.status(401).json({ message: "Invalid token" });
  
  const player = players.find(p => p.accessToken === authorization.replace("Bearer ", ""));
  if (!player) return res.status(401).json({ message: "Invalid token" });

  const now = new Date();
  if (player.lastFreeSpinClaimDate) {
    const lastClaim = new Date(player.lastFreeSpinClaimDate);
    const diffHours = (now - lastClaim) / (1000 * 60 * 60);
    if (diffHours < 24) {
      return res.status(400).json({ message: "You can only claim a free spin once every 24 hours" });
    }
  }

  player.availableSpins += 1;
  player.lastFreeSpinClaimDate = now;

  res.json({
    availableSpins: player.availableSpins,
    lastFreeSpinClaimDate: player.lastFreeSpinClaimDate,
  });
});

app.post("/wheel/spin", (req, res) => {
  const authorization = req.headers.authorization;
  if (!authorization) return res.status(401).json({ message: "Invalid token" });
  
  const player = players.find(p => p.accessToken === authorization.replace("Bearer ", ""));
  if (!player) return res.status(401).json({ message: "Invalid token" });

  if (player.availableSpins <= 0) {
    return res.status(400).json({ message: "No spins available" });
  }

  player.availableSpins -= 1;

  // Define prizes and probabilities
  const prizes = [
    { amount: 0, prob: 0.2 },
    { amount: 10, prob: 0.4 },
    { amount: 50, prob: 0.25 },
    { amount: 100, prob: 0.1 },
    { amount: 500, prob: 0.04 },
    { amount: 1000, prob: 0.01 },
  ];

  const rand = Math.random();
  let cumulativeProb = 0;
  let wonAmount = 0;

  for (const prize of prizes) {
    cumulativeProb += prize.prob;
    if (rand <= cumulativeProb) {
      wonAmount = prize.amount;
      break;
    }
  }

  if (wonAmount > 0) {
    player.balance += wonAmount;
    
    const transactionId = faker.string.uuid();
    player.transactions.push({
      id: transactionId,
      amount: wonAmount,
      type: "wheel_win",
      createdAt: new Date(),
    });

    io.emit("balance_update", {
      userId: player.id,
      balance: player.balance
    });
  }

  res.json({
    wonAmount,
    balance: player.balance,
    availableSpins: player.availableSpins,
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

// Serve the built frontend in production
const frontendPath = path.join(__dirname, "..", "app", "dist");
app.use(express.static(frontendPath));
app.get("*", (req, res, next) => {
  // Only serve index.html for non-API routes
  if (req.path.startsWith("/register") && req.method === "POST") return next();
  res.sendFile(path.join(frontendPath, "index.html"), (err) => {
    if (err) next();
  });
});

server.listen(port, () =>
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