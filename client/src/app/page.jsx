import React from 'react'
import { SocketProvider } from './context/socket'

const page = () => {
  return (
    <SocketProvider>
      <div>Main Page</div>
    </SocketProvider>
  )
}

export default page