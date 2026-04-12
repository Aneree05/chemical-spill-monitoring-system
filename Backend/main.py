from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# Import routes
from src.routes.spillRoute import router as spill_router

app = FastAPI(title="Chemical Spill Monitoring System")

# CORS (allow frontend later)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root route
@app.get("/")
def root():
    return {"message": "API is running"}

# Register routes
app.include_router(spill_router, prefix="/api", tags=["Spills"])