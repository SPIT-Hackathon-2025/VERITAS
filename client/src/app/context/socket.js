"use client"
import io from 'socket.io-client'
import {useEffect, createContext, useContext, useRef, Children, useState} from 'react'

const socketContext = createContext(null)

export const useSocket=()=>{
    return useContext(socketContext)
}

export const SocketProvider=({children})=>{
    
    const socket=useRef()
    const [isSocketConnected, setIsSocketConnected] = useState(false);
        useEffect(()=>{
            const userid='id'
                socket.current= io(process.env.NEXT_PUBLIC_SERVER_URL,{
                    withCredentials:true,
                    query:{userid},
                    reconnection:true
                })
                //connection
                socket.current.on("connect",()=>{
                    console.log("Connected to server");   
                    setIsSocketConnected(true);      
                })
                // clear function
                return ()=>{
                    socket.current.disconnect()
                    console.log("Socket disconnected");            
                }
        },[])
    if (!isSocketConnected) {
        return <div>Loading socket connection...</div>;
    }
    return(
        <socketContext.Provider value={socket.current}>
            {children}
        </socketContext.Provider>
    )
}
