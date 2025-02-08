import { Server } from "socket.io";
import dotenv from 'dotenv';
dotenv.config();

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [process.env.FRONTEND_URL, 'http://192.168.56.1/3000','http://192.168.252.104/3001','http://192.168.252.153/3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Store user details with their current file and repo
  const userMap = new Map();
  // Store repo+file to users mapping using composite key "repo:filePath"
  const repoFileMap = new Map();

  io.on('connection', (socket) => {
    const user = JSON.parse(socket.handshake.query.user);
    const repo = socket.handshake.query.repo;

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
        repo,
        currentFile: 'main.jsx',
        currentRepo: repo
      });

      // Convert map to array of user objects for frontend, filtered by repo
      const onlineUsers = Array.from(userMap.values())
        .filter(user => user.currentRepo === repo)
        .map(user => ({
          userId: user.userId,
          name: user.name,
          email: user.email
        }));

      // Emit to all clients in the same repo when a new user connects
      io.emit('getAllOnlineUsers', {
        users: onlineUsers,
        repo
      });

      console.log(`User connected ${name} (${userid}) with socket: ${socket.id} in repo: ${repo}`);

      // Handle file updates
      socket.on('updateFile', ({ filePath, newCode }) => {
        const repoFilePath = `${repo}:${filePath}`;
        io.emit('fileUpdated', { filePath, newCode, repo });
      });

      // Track file changes
      socket.on('fileChange', ({ filePath }) => {
        const userInfo = userMap.get(userid);
        const oldRepoFilePath = `${repo}:${userInfo.currentFile}`;
        const newRepoFilePath = `${repo}:${filePath}`;
        
        // Notify users in the old file about cursor removal
        if (userInfo.currentFile && repoFileMap.has(oldRepoFilePath)) {
          const currentFileUsers = repoFileMap.get(oldRepoFilePath);
          
          const oldFileSockets = Array.from(currentFileUsers)
            .map(uid => userMap.get(uid)?.socketId)
            .filter(Boolean);
          
          oldFileSockets.forEach(socketId => {
            io.to(socketId).emit('removeCursor', { userId: userid });
          });

          currentFileUsers.delete(userid);
          if (currentFileUsers.size === 0) {
            repoFileMap.delete(oldRepoFilePath);
          }
        }

        // Update user's current file
        userInfo.currentFile = filePath;
        userMap.set(userid, userInfo);

        // Add user to new file's user list with repo context
        if (!repoFileMap.has(newRepoFilePath)) {
          repoFileMap.set(newRepoFilePath, new Set());
        }
        repoFileMap.get(newRepoFilePath).add(userid);
      });

      // Handle cursor movements
      socket.on('cursorMove', ({ position, filePath }) => {
        const repoFilePath = `${repo}:${filePath}`;
        
        if (!filePath || !repoFileMap.has(repoFilePath)) return;

        const fileUsers = repoFileMap.get(repoFilePath);
        
        const socketsInFile = Array.from(fileUsers)
          .map(uid => userMap.get(uid)?.socketId)
          .filter(Boolean);
        
        socketsInFile.forEach(socketId => {
          io.to(socketId).emit('cursorMove', {
            userId: userid,
            position,
            name: name,
            filePath
          });
        });
      });

      socket.on('disconnect', () => {
        if (userid) {
          const userInfo = userMap.get(userid);
          const repoFilePath = `${repo}:${userInfo.currentFile}`;
          
          // Remove user from file mapping
          if (userInfo.currentFile && repoFileMap.has(repoFilePath)) {
            const fileUsers = repoFileMap.get(repoFilePath);
            fileUsers.delete(userid);
            if (fileUsers.size === 0) {
              repoFileMap.delete(repoFilePath);
            }
          }

          // Remove user from user mapping
          userMap.delete(userid);

          // Send updated user list after disconnect, filtered by repo
          const remainingUsers = Array.from(userMap.values())
            .filter(user => user.currentRepo === repo)
            .map(user => ({
              userId: user.userId,
              name: user.name,
              email: user.email
            }));

          io.emit('getAllOnlineUsers', {
            users: remainingUsers,
            repo
          });
        }
      });
    }
  });
};