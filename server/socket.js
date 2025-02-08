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

  // Store user details with their current file
  const userMap = new Map();
  // Store file to users mapping
  const fileMap = new Map();

  io.on('connection', (socket) => {
    const user = JSON.parse(socket.handshake.query.user);
    console.log("Socket log: ", user);

    const userid = user.uid;
    const name = user.displayName;
    const email = user.email;

    if (userid) {
      // Store user details in the map
      userMap.set(userid, {
        socketId: socket.id,
        name: name,
        email: email,
        userId: userid,
        currentFile: null // Initialize with no file
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

      // Track file changes
      socket.on('fileChange', ({ filePath }) => {
        const userInfo = userMap.get(userid);
        
        // Remove user from old file's user list
        if (userInfo.currentFile && fileMap.has(userInfo.currentFile)) {
          const currentFileUsers = fileMap.get(userInfo.currentFile);
          currentFileUsers.delete(userid);
          if (currentFileUsers.size === 0) {
            fileMap.delete(userInfo.currentFile);
          }
        }

        // Update user's current file
        userInfo.currentFile = filePath;
        userMap.set(userid, userInfo);

        // Add user to new file's user list
        if (!fileMap.has(filePath)) {
          fileMap.set(filePath, new Set());
        }
        fileMap.get(filePath).add(userid);

        // Log for debugging
        console.log(`User ${name} switched to file: ${filePath}`);
        console.log(`Users in file ${filePath}:`, Array.from(fileMap.get(filePath)));
      });

      // Handle cursor movements
      socket.on('cursorMove', ({ position, filePath }) => {
        console.log("Cursor moved to : ", position, "in file:", filePath);
        
        if (!filePath || !fileMap.has(filePath)) return;

        // Get all socket IDs for users in the same file
        const fileUsers = fileMap.get(filePath);        
        
        const socketsInFile = Array.from(fileUsers)
          .map(uid => userMap.get(uid)?.socketId)
           // Exclude sender
        
        // Emit cursor position only to users in the same file
        socketsInFile.forEach(socketId => {
          io.to(socketId).emit('cursorMove', {
            userId: userid,
            position,
            name: name,
            filePath
          });
        });
      });

      socket.on('removeCursor', ({ filePath }) => {
        console.log();
        
        if (!filePath || !fileMap.has(filePath)) return;
      
        // Get all users in the current file
        const fileUsers = fileMap.get(filePath);

        console.log(fileUsers);        
        
        // Get socket IDs for all users in the file
        const socketsInFile = Array.from(fileUsers)
          .map(uid => userMap.get(uid)?.socketId)
          .filter(Boolean); // Remove any undefined socket IDs

        console.log("Sockets: ",socketsInFile);
      
        // Emit removeCursor event to all users in the file
        socketsInFile.forEach(socketId => {
          io.to(socketId).emit('removeCursor', {
            userId: userid,
            filePath
          });
        });
      
        console.log(`Cursor removed for user ${name} in file ${filePath}`);
      });
      

    } else {
      console.log("User id not provided");
    }

    socket.on('disconnect', () => {
      if (userid) {
        const userInfo = userMap.get(userid);
        
        // Remove user from file mapping
        if (userInfo.currentFile && fileMap.has(userInfo.currentFile)) {
          const fileUsers = fileMap.get(userInfo.currentFile);
          fileUsers.delete(userid);
          if (fileUsers.size === 0) {
            fileMap.delete(userInfo.currentFile);
          }
        }

        // Remove user from user mapping
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