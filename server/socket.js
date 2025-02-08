import { Server } from "socket.io"
import dotenv from 'dotenv'
dotenv.config()

export const setupSocket=(server)=>{
    const io = new Server(server, {
        cors: {
          origin: process.env.FRONTEND_URL,
          methods: ['GET', 'POST'],
          credentials: true,
        },
      });

      const userMap = new Map()
      
      // Listen for connections
      io.on('connection', (socket) => {

        const userid=socket.handshake.query.userid

        if(userid){
            userMap.set(userid,socket.id)
            io.emit('getAllOnlineUsers', { users:['Vedant','Ritvik']});
            console.log(`User connected ${userid} with socket : ${socket.id}`);                              
        }
        else{
            console.log("User id not provided");        
        }
      
        // Disconnect handler
        socket.on('disconnect', () => {
          console.log('A user disconnected');
        });
      });
}