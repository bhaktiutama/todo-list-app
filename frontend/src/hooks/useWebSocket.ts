import { useEffect, useRef, useState } from 'react';
import { TodoList, WebSocketMessage } from '../types/todo';

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';

interface UseWebSocketProps {
    todoId: string;
    onUpdate?: (todoList: TodoList) => void;
}

interface UseWebSocketResult {
    isConnected: boolean;
    error: string | null;
    clientId: string | null;
}

export function useWebSocket({ todoId, onUpdate }: UseWebSocketProps): UseWebSocketResult {
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const clientIdRef = useRef<string | null>(null);
    const isWebSocketEnabled = process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET === 'true';

    useEffect(() => {
        // Early return if WebSocket is disabled
        if (!isWebSocketEnabled) {
            console.log('WebSocket is disabled by configuration');
            // Clean up any existing connection
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
            setIsConnected(false);
            return;
        }

        const connect = () => {
            // Double check WebSocket is still enabled
            if (process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET !== 'true') {
                return;
            }

            try {
                // Clean up any existing connection before creating a new one
                if (wsRef.current) {
                    wsRef.current.close();
                    wsRef.current = null;
                }

                console.log('Attempting WebSocket connection...');
                const ws = new WebSocket(`${WS_BASE_URL}/ws/todos/${todoId}`);
                wsRef.current = ws;

                ws.onopen = () => {
                    console.log('WebSocket connected successfully');
                    setIsConnected(true);
                    setError(null);
                };

                ws.onclose = () => {
                    console.log('WebSocket disconnected');
                    setIsConnected(false);
                    wsRef.current = null;
                    
                    // Only attempt reconnect if WebSocket is still enabled
                    if (process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET === 'true') {
                        console.log('Attempting to reconnect in 2 seconds...');
                        setTimeout(connect, 2000);
                    }
                };

                ws.onerror = (event) => {
                    console.error('WebSocket error:', event);
                    setError('WebSocket connection error');
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.close();
                    }
                };

                ws.onmessage = (event) => {
                    try {
                        const message: WebSocketMessage = JSON.parse(event.data);
                        
                        if (message.type === 'connected') {
                            console.log('Received client ID:', message.client_id);
                            clientIdRef.current = message.client_id;
                        } else if (message.type === 'update' && onUpdate && 'items' in message.data) {
                            onUpdate(message.data as TodoList);
                        }
                    } catch (err) {
                        console.error('Failed to parse WebSocket message:', err);
                    }
                };
            } catch (err) {
                console.error('Failed to establish WebSocket connection:', err);
                setError('Failed to establish WebSocket connection');
                
                // Only attempt reconnect if WebSocket is still enabled
                if (process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET === 'true') {
                    console.log('Attempting to reconnect in 2 seconds...');
                    setTimeout(connect, 2000);
                }
            }
        };

        connect();

        return () => {
            console.log('Cleaning up WebSocket connection');
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [todoId, onUpdate, isWebSocketEnabled]);

    return {
        isConnected,
        error,
        clientId: clientIdRef.current,
    };
} 