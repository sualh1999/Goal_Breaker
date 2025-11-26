from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import joinedload, Session
from sqlalchemy import select
from starlette.concurrency import run_in_threadpool
from app.services.db import get_db
from app.services.ai import generate_goal_steps
from app.schemas.goal import GoalCreate, GoalResponse, TaskSchema
from app.models.goal import Goal
from app.models.task import Task
import uuid

router = APIRouter(
    prefix="/goals",
    tags=["goals"]
)

@router.post("/", response_model=GoalResponse)
async def create_goal(
    goal_in: GoalCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new goal and generate tasks for it using AI.
    """
    try:
        ai_response = await run_in_threadpool(generate_goal_steps, goal_in.goal)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate goal steps from AI: {e}")

    new_goal = Goal(
        goal_text=goal_in.goal,
        complexity=ai_response.complexity
    )
    await run_in_threadpool(db.add, new_goal)
    await run_in_threadpool(db.flush)

    new_tasks = [
        Task(goal_id=new_goal.id, title=task_data.title, order_index=i)
        for i, task_data in enumerate(ai_response.tasks)
    ]
    await run_in_threadpool(db.add_all, new_tasks)
    await run_in_threadpool(db.commit)
    await run_in_threadpool(db.refresh, new_goal)

    response_tasks = [TaskSchema(id=str(t.id), title=t.title, status=t.status) for t in sorted(new_goal.tasks, key=lambda x: x.order_index)]
    
    return GoalResponse(
        id=str(new_goal.id),
        goal_text=new_goal.goal_text,
        complexity=new_goal.complexity,
        regenerated_count=new_goal.regenerated_count,
        tasks=response_tasks
    )

@router.get("/{goal_id}", response_model=GoalResponse)
async def get_goal(goal_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Retrieve a goal and its associated tasks.
    """
    stmt = select(Goal).where(Goal.id == goal_id).options(joinedload(Goal.tasks))
    result = await run_in_threadpool(db.execute, stmt)
    goal = await run_in_threadpool(result.unique().scalar_one_or_none)

    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    response_tasks = [TaskSchema(id=str(t.id), title=t.title, status=t.status) for t in sorted(goal.tasks, key=lambda x: x.order_index)]

    return GoalResponse(
        id=str(goal.id),
        goal_text=goal.goal_text,
        complexity=goal.complexity,
        regenerated_count=goal.regenerated_count,
        tasks=response_tasks
    )

@router.post("/{goal_id}/regenerate", response_model=GoalResponse)
async def regenerate_goal_tasks(goal_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Regenerate tasks for an existing goal.
    """
    stmt = select(Goal).where(Goal.id == goal_id).options(joinedload(Goal.tasks))
    result = await run_in_threadpool(db.execute, stmt)
    goal = await run_in_threadpool(result.unique().scalar_one_or_none)

    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    # Delete old tasks
    for task in goal.tasks:
        await run_in_threadpool(db.delete, task)
    
    try:
        ai_response = await run_in_threadpool(generate_goal_steps, goal.goal_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate new goal steps from AI: {e}")

    # Create new tasks
    new_tasks = [
        Task(goal_id=goal.id, title=task_data.title, order_index=i)
        for i, task_data in enumerate(ai_response.tasks)
    ]
    await run_in_threadpool(db.add_all, new_tasks)

    # Update goal
    goal.complexity = ai_response.complexity
    goal.regenerated_count += 1
    
    await run_in_threadpool(db.commit)
    await run_in_threadpool(db.refresh, goal)
    
    response_tasks = [TaskSchema(id=str(t.id), title=t.title, status=t.status) for t in sorted(goal.tasks, key=lambda x: x.order_index)]

    return GoalResponse(
        id=str(goal.id),
        goal_text=goal.goal_text,
        complexity=goal.complexity,
        regenerated_count=goal.regenerated_count,
        tasks=response_tasks
    )
