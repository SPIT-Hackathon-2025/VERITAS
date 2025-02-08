import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import 'colors'
import { dbConnect } from './database/dbConnect.js'
import { Server } from 'socket.io';
import http from 'http'
import { setupSocket } from './socket.js'
import repoRouter from './routes/repoRoutes.js'
import userRouter from './routes/userRoutes.js'
import fileRouter from './routes/fileRoutes.js'

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

app.use('/api/v1/user', userRouter)
app.use('/api/v1/repo', repoRouter)
app.use('/api/v1/file', fileRouter)

//socket io
const server = http.createServer(app);

setupSocket(server)

server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`.bgBlue.bold);
});