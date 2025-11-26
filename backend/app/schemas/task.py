from pydantic import BaseModel

class TaskUpdate(BaseModel):
    status: str # "pending" | "completed"
