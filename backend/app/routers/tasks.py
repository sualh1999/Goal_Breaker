from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from starlette.concurrency import run_in_threadpool
from app.services.db import get_db
from app.models.task import Task
from app.schemas.task import TaskUpdate
from app.schemas.goal import TaskSchema # Import TaskSchema
import uuid

router = APIRouter(
    prefix="/tasks",
    tags=["tasks"]
)

@router.patch("/{task_id}", response_model=TaskSchema) # Set response_model
async def update_task_status(
    task_id: uuid.UUID,
    task_in: TaskUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a task's status.
    """
    if task_in.status not in ["pending", "completed"]:
        raise HTTPException(status_code=400, detail="Invalid status. Must be 'pending' or 'completed'.")

    stmt = select(Task).where(Task.id == task_id)
    result = await run_in_threadpool(db.execute, stmt)
    task = await run_in_threadpool(result.scalar_one_or_none)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.status = task_in.status
    await run_in_threadpool(db.commit)
    await run_in_threadpool(db.refresh, task)

    return TaskSchema(id=str(task.id), title=task.title, status=task.status) # Return TaskSchema with status
