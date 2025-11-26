from pydantic import BaseModel, Field
from typing import List

class GoalCreate(BaseModel):
    goal: str = Field(..., min_length=3, max_length=200)

class TaskSchema(BaseModel):
    id: str
    title: str
    status: str

class GoalGenerationResponse(BaseModel):
    complexity: int = Field(..., ge=1, le=10)
    tasks: List[TaskSchema]

class GoalResponse(BaseModel):
    id: str
    goal_text: str
    complexity: int
    regenerated_count: int
    tasks: List[TaskSchema]

    class Config:
        from_attributes = True
