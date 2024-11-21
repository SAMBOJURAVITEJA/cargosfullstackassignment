# Event Log System with Real-Time Updates

This is a simple event logging system built with Express, MongoDB, and Socket.IO. It allows you to create event logs, store them in MongoDB, and retrieve them. The system also provides real-time updates using WebSockets so that any new event logs are pushed to all connected clients.

## Features

- **Create Event Logs**: Allows clients to log events with a payload, source, and event type.
- **Retrieve Event Logs**: Fetch the most recent event logs from the database.
- **Real-Time Event Updates**: Using Socket.IO, the system pushes new event logs to all connected clients in real-time.
- **Event Integrity**: Each event log is hashed to ensure the integrity of the data, with a cryptographic hash linking to the previous event log (like a simple blockchain).

## Technologies Used

- **Node.js**: Backend framework
- **Express.js**: Web server framework
- **MongoDB**: Database for storing event logs
- **Socket.IO**: Real-time communication for event updates
- **Crypto**: For hashing event data
- **Body-Parser**: Middleware for parsing incoming request bodies
- **CORS**: Middleware for handling cross-origin requests
- **dotenv**: For managing environment variables

## Setup

### Prerequisites

1. **Node.js** and **npm** (Node Package Manager) installed on your machine. You can download and install Node.js from [nodejs.org](https://nodejs.org/).
2. **MongoDB** running locally or through a cloud service like MongoDB Atlas.

### Steps to Set Up

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/your-repository-name.git
   cd your-repository-name
