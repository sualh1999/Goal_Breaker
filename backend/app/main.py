from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import goals, tasks

app = FastAPI(
    title="Smart Goal Breaker API",
    description="Breaks down vague goals into actionable steps using AI.",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for simplicity. For production, restrict this.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(goals.router)
app.include_router(tasks.router)

@app.get("/", tags=["Health Check"])
async def root():
    return {"message": "Welcome to the Smart Goal Breaker API!"}
