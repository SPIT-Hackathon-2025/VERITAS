import { Server } from "socket.io";
import dotenv from 'dotenv';
dotenv.config();

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [process.env.FRONTEND_URL, 'http://192.168.56.1/3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Modified to store user objects instead of just socket IDs
  const userMap = new Map();

  io.on('connection', (socket) => {
    const user = JSON.parse(socket.handshake.query.user);

    console.log("Socket log: ",user);   
    
    const userid = user.uid;
    const name = user.displayName;
    const email = user.email;
    
    if (userid) {
      // Store user details in the map
      userMap.set(userid, {
        socketId: socket.id,
        name: name,
        email: email,
        userId: userid
      });

      // Convert map to array of user objects for frontend
      const onlineUsers = Array.from(userMap.values()).map(user => ({
        userId: user.userId,
        name: user.name,
        email: user.email
      }));

      // Emit to all clients when a new user connects
      io.emit('getAllOnlineUsers', {
        users: onlineUsers
      });

      console.log(`User connected ${name} (${userid}) with socket: ${socket.id}`);

      // Handle file updates
      socket.on('updateFile', ({ filePath, newCode }) => {
        console.log("File is updated ", newCode);
        io.emit('fileUpdated', { filePath, newCode });
      });
    } else {
      console.log("User id not provided");
    }

    socket.on('disconnect', () => {
      if (userid) {
        userMap.delete(userid);
        
        // Send updated user list after disconnect
        const remainingUsers = Array.from(userMap.values()).map(user => ({
          userId: user.userId,
          name: user.name,
          email: user.email
        }));

        io.emit('getAllOnlineUsers', {
          users: remainingUsers
        });
      }
      console.log(`User disconnected: ${name} (${userid})`);
    });
  });
};