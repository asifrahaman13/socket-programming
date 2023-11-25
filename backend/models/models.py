from pydantic import BaseModel

class Message(BaseModel):
    client_id: int
    data: str

class Question(BaseModel):
    question: str
    