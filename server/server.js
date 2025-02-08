import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import 'colors'
import { dbConnect } from './database/dbConnect.js'
import { Server } from 'socket.io';
import http from 'http'

dotenv.config();

dbConnect();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH']
}));

//socket io
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

const fileSystem = {
    "/src/index.js": `export default function App() {
      return <h1>Hello World</h1>;
    }`,
    "/src/components/Button.js": `export default function Button({ children }) {
      return <button className="px-4 py-2 bg-blue-500 rounded">{children}</button>;
    }`,
    "/src/components/button/newButton.js": `export default function Button({ children }) {
      return <button className="px-4 py-2 bg-blue-500 rounded">{children}</button>;
    }`,
    "/src/styles/main.css": `body {
      margin: 0;
      padding: 1rem;
    }`,
  };
  
  // Listen for connections
  io.on('connection', (socket) => {
    console.log(socket,' connected');
  
    // Send initial file system to the connected client
    socket.emit('initialFileSystem', fileSystem);
  
    // Listen for code update events from the frontend
    socket.on('updateFile', ({ filePath, newCode }) => {
      if (fileSystem[filePath]) {
        fileSystem[filePath] = newCode;
        console.log(`File ${filePath} updated`);
        
        // Broadcast the updated file to all other clients
        socket.broadcast.emit('fileUpdated', { filePath, newCode });
      } else {
        console.log('File not found');
      }
    });
  
    // Disconnect handler
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });

server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`.bgBlue.bold);
});