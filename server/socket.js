import { Server } from "socket.io";
import dotenv from 'dotenv';
dotenv.config();

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [process.env.FRONTEND_URL,'http://192.168.56.1/3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  const userMap = new Map();

  io.on('connection', (socket) => {
    const userid = socket.handshake.query.userid;
    
    if (userid) {
      userMap.set(userid, socket.id);
      
      // Emit immediately after connection is established
      socket.emit('getAllOnlineUsers', { 
        users: Array.from(userMap.keys()) // Send actual connected users
      });

      console.log(`User connected ${userid} with socket: ${socket.id}`);
      
      // Handle file updates
      socket.on('updateFile', ({ filePath, newCode }) => {
        console.log("File is updated ",newCode);        
        socket.emit('fileUpdated', { filePath, newCode });
      });
    } else {
      console.log("User id not provided");
    }

    socket.on('disconnect', () => {
      // Remove user from map and broadcast updated user list
      if (userid) {
        userMap.delete(userid);
        io.emit('userConnected', { 
          users: Array.from(userMap.keys())
        });
      }
      console.log('A user disconnected');
    });
  });
};