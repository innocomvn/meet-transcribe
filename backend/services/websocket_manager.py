"""
WebSocket connection manager for real-time communication
"""

from fastapi import WebSocket
from typing import Dict, List
import json
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections for meetings"""

    def __init__(self):
        # Store active connections per meeting
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, meeting_id: str):
        """Connect a client to a meeting"""
        await websocket.accept()

        if meeting_id not in self.active_connections:
            self.active_connections[meeting_id] = []

        self.active_connections[meeting_id].append(websocket)
        logger.info(f"Client connected to meeting {meeting_id}. Total: {len(self.active_connections[meeting_id])}")

    def disconnect(self, websocket: WebSocket, meeting_id: str):
        """Disconnect a client from a meeting"""
        if meeting_id in self.active_connections:
            if websocket in self.active_connections[meeting_id]:
                self.active_connections[meeting_id].remove(websocket)
                logger.info(f"Client disconnected from meeting {meeting_id}. Remaining: {len(self.active_connections[meeting_id])}")

            # Clean up empty meeting rooms
            if len(self.active_connections[meeting_id]) == 0:
                del self.active_connections[meeting_id]
                logger.info(f"Meeting room {meeting_id} cleaned up")

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send a message to a specific client"""
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Error sending personal message: {str(e)}")

    async def broadcast(self, meeting_id: str, message: dict, exclude: WebSocket = None):
        """
        Broadcast a message to all clients in a meeting

        Args:
            meeting_id: Meeting ID
            message: Message to broadcast
            exclude: WebSocket to exclude from broadcast (e.g., sender)
        """
        if meeting_id not in self.active_connections:
            return

        disconnected = []

        for connection in self.active_connections[meeting_id]:
            if connection == exclude:
                continue

            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error broadcasting to client: {str(e)}")
                disconnected.append(connection)

        # Clean up disconnected clients
        for connection in disconnected:
            self.disconnect(connection, meeting_id)

    def get_connection_count(self, meeting_id: str) -> int:
        """Get number of active connections in a meeting"""
        if meeting_id not in self.active_connections:
            return 0
        return len(self.active_connections[meeting_id])

    def get_all_meetings(self) -> List[str]:
        """Get list of all active meeting IDs"""
        return list(self.active_connections.keys())
