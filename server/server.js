import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import 'colors'
import { dbConnect } from './database/dbConnect.js'
import { Server } from 'socket.io';
import http from 'http'
import { setupSocket } from './socket.js'

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

setupSocket(server)

server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`.bgBlue.bold);
});