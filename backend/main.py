from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from models.models import Message, Question
from gpt_response.gpt_response import evvahealt_query

app = FastAPI()

origins = ["http://localhost", "http://127.0.0.1", "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: dict, sender_websocket: WebSocket):
        for connection in self.active_connections:
            if connection == sender_websocket:
                await connection.send_json(message)

    async def broadcast(self, message: dict, sender_websocket: WebSocket):
        for connection in self.active_connections:
            if connection != sender_websocket:
                await connection.send_json(message)

manager = ConnectionManager()

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            person_data = {**data, 'client_id': client_id}
            remote_data = {**data, 'client_id': client_id}

            # print(person_data)
            # print(remote_data)
            
            await manager.send_personal_message(person_data, websocket)
            await manager.broadcast(remote_data, websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast({"message": f"Client #{client_id} left the chat", "client_id": client_id}, websocket)

@app.post("/bot")
def bot_endpoint(question: Question):
    print(question)
    if question.question=="user":
        return {"message": "Thanks you will be connected to our customer care agent shortly",'client_id': "chat_bot"}
    question=question.model_dump()
    bot_message=evvahealt_query(question)
    return {"message": bot_message,'client_id': "chat_bot"}
