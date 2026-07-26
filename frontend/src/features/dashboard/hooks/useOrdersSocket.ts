import { useEffect, useRef, useState } from "react";

export function useOrdersSocket(restaurantId: number, onEvent: (data: any) => void) {
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = (import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1")
      .replace("http://", "ws://")
      .replace("https://", "wss://")
      .replace("/api/v1", "");

    const socket = new WebSocket(`${wsUrl}/ws/orders/${restaurantId}`);
    wsRef.current = socket;

    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socket.onmessage = (event) => {
      try {
        onEvent(JSON.parse(event.data));
      } catch {
        // ignore parse errors
      }
    };

    return () => socket.close();
  }, [restaurantId]);

  return { connected };
}