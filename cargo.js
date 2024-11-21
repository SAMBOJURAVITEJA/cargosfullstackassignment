import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import crypto from "crypto";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.listen(process.env.port, () => {
  console.log(`server is running on the port ${process.env.port}`);
});

mongoose
  .connect(process.env.url)
  .then(() => {
    console.log("database is connected properly");
  })
  .catch((err) => {
    console.log(`err in connecting the database: ${err}`);
  });

const eventLogSchema = new mongoose.Schema({
  eventType: String, //Type of the event
  timestamp: { type: Date, default: Date.now }, //Time the event was logged
  sourceAppId: String, //ID of the application that generated the log.

  dataPayload: mongoose.Schema.Types.Mixed, //The actual event data (in JSON format)
  hash: String, //Cryptographic hash of the event data, ensuring integrity
  prevHash: String, // This stores the hash of the previous log for tamper-proofing
});

const EventLog = mongoose.model("EventLog", eventLogSchema);

const calculateHash = (data) => {
  console.log(
    "claculateHash:",
    crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex")
  );
  return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
};

app.post("/events", async (req, res) => {
  const { eventType, sourceAppId, dataPayload } = req.body;

  if (!eventType || !sourceAppId || !dataPayload) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Get the latest event log for the previous hash
    const lastLog = await EventLog.findOne().sort({ timestamp: -1 });

    const prevHash = lastLog ? lastLog.hash : null;
    const newLogData = { eventType, sourceAppId, dataPayload, prevHash };

    // Calculate hash for the new event
    const hash = calculateHash(newLogData);

    // Create the new event log document
    const newEventLog = new EventLog({
      ...newLogData,
      hash,
    });

    // Save the new event log to the database
    const result = await newEventLog.save();

    console.log(newEventLog === result);

    res.status(200).json(newEventLog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create event log" });
  }
});

// GET  to retrieve event logs
app.get("/getEvents", async (req, res) => {
  try {
    const logs = await EventLog.find().sort({ timestamp: -1 }).limit(50);
    res.status(200).json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve event logs" });
  }
});



// Real-time updates using Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("Client connected for real-time updates");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Emit events in real-time whenever a new log is created
eventLogSchema.post("save", (doc) => {
  io.emit("newEventLog", doc);
});

// Route for a simple event log dashboard
app.get("/dashboard", (req, res) => {
    res.send(`
      <html>
        <head>
          <title>Event Log Dashboard</title>
          <script src="https://cdn.socket.io/4.5.1/socket.io.min.js"></script>
        </head>
        <body>
          <h1 style="color: blue;">Event Log Dashboard</h1>
          <h3>Real-time Events</h3>
          <ul id="logs" style="list-style-type: none; padding: 0;"></ul>
          <script>
            const socket = io("http://localhost:${process.env.serverPort}");
            
            socket.on("connect", () => console.log("Connected to WebSocket server"));
            socket.on("connect_error", (error) => console.error("WebSocket connection error:", error));
  
            const logList = document.getElementById("logs");
  
            socket.on("newEventLog", (log) => {
              console.log("Received new event log:", log); 
              const listItem = document.createElement("li");
              listItem.textContent = JSON.stringify(log, null, 2); 
              logList.appendChild(listItem);
            });
          </script>
        </body>
      </html>
    `);
  });
  

// Decentralization simulation (placeholder)
app.post("/syncLogs", (req, res) => {
  res.status(200).json({ message: "Logs synced across servers" });
});

// Start the server with WebSocket
const SOCKET_PORT = process.env.serverPort;
server.listen(SOCKET_PORT, () =>
  console.log(`Server with WebSocket running on port ${SOCKET_PORT}`)
);