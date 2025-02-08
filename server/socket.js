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

  const getSocketIdsInRepo = (repo) => {
    return Array.from(userMap.values())
      .filter(user => user.currentRepo === repo)
      .map(user => user.socketId);
  };

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

      console.log(name, " joined the repo ",repo);

      // Get online users for the repo
      const onlineUsers = Array.from(userMap.values())
        .filter(user => user.currentRepo === repo)
        .map(user => ({
          userId: user.userId,
          name: user.name,
          email: user.email
        }));

      console.log("Online users with ",name," ",onlineUsers);
      
      // Get socket IDs for the repo
      const repoSocketIds = getSocketIdsInRepo(repo);
      
      // Emit to all sockets in the repo
      repoSocketIds.forEach(socketId => {
        io.to(socketId).emit('getAllOnlineUsers', {
          users: onlineUsers,
          repo
        });
      });

      // Handle file updates
      socket.on('updateFile', ({ filePath, newCode }) => {
        const repoSocketIds = getSocketIdsInRepo(repo);
        repoSocketIds.forEach(socketId => {
          io.to(socketId).emit('fileUpdated', { 
            filePath, 
            newCode, 
            repo 
          });
        });
      });

      // Track file changes
      socket.on('fileChange', ({ filePath }) => {
        const userInfo = userMap.get(userid);
        const oldRepoFilePath = `${repo}:${userInfo.currentFile}`;
        const newRepoFilePath = `${repo}:${filePath}`;
        
        if (userInfo.currentFile && repoFileMap.has(oldRepoFilePath)) {
          const currentFileUsers = repoFileMap.get(oldRepoFilePath);
          
          // Get socket IDs for users in the same file and repo
          const oldFileSockets = Array.from(currentFileUsers)
            .map(uid => userMap.get(uid))
            .filter(user => user && user.currentRepo === repo)
            .map(user => user.socketId);
          
          oldFileSockets.forEach(socketId => {
            io.to(socketId).emit('removeCursor', { userId: userid });
          });

          currentFileUsers.delete(userid);
          if (currentFileUsers.size === 0) {
            repoFileMap.delete(oldRepoFilePath);
          }
        }

        userInfo.currentFile = filePath;
        userMap.set(userid, userInfo);

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
        
        // Get socket IDs for users in the same file and repo
        const socketsInFile = Array.from(fileUsers)
          .map(uid => userMap.get(uid))
          .filter(user => user && user.currentRepo === repo)
          .map(user => user.socketId);
        
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
          
          if (userInfo.currentFile && repoFileMap.has(repoFilePath)) {
            const fileUsers = repoFileMap.get(repoFilePath);
            fileUsers.delete(userid);
            if (fileUsers.size === 0) {
              repoFileMap.delete(repoFilePath);
            }
          }

          userMap.delete(userid);

          // Get remaining users and socket IDs for the repo
          const remainingUsers = Array.from(userMap.values())
            .filter(user => user.currentRepo === repo)
            .map(user => ({
              userId: user.userId,
              name: user.name,
              email: user.email
            }));

          const repoSocketIds = getSocketIdsInRepo(repo);
          repoSocketIds.forEach(socketId => {
            io.to(socketId).emit('getAllOnlineUsers', {
              users: remainingUsers,
              repo
            });
          });
        }
      });
    }
  });
};