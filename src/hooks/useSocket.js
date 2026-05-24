import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const useSocket = (user) => {
    const socketRef = useRef(null)
    const [connected, setConnected] = useState(false)

    useEffect(() => {
        if (!user) return

        const socket = io(
            import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000',
            {
                auth: { token: sessionStorage.getItem('accessToken') },
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            }
        )

        socketRef.current = socket
        socket.on('connect', () => setConnected(true))
        socket.on('disconnect', () => setConnected(false))
        socket.on('connect_error', () => setConnected(false))

        return () => socket.disconnect()
    }, [user])

    return { socketRef, connected }
}

export default useSocket