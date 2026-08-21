import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uuid
from datetime import datetime, timedelta
import jwt

# --- CONFIG ---
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "funland")
JWT_SECRET = os.getenv("JWT_SECRET", "funland-super-secret-key-2024")
JWT_ALGO = "HS256"

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Funland CRM")
security = HTTPBearer(auto_error=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def new_id():
    return str(uuid.uuid4())[:8]

def now_iso():
    return datetime.utcnow().isoformat()

# --- AUTH ---
def create_token(data: dict):
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode = {**data, "exp": expire}
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGO)

async def get_current_user_optional(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGO])
        return payload
    except:
        return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGO])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

async def require_admin(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user

class LoginIn(BaseModel):
    username: str
    password: str

class GameIn(BaseModel):
    name: str
    price: float = 0
    duration: Optional[int] = 60
    category: Optional[str] = "general"
    description: Optional[str] = ""
    active: Optional[bool] = True

# --- AUTH ROUTES ---
@app.post("/api/login")
async def login(data: LoginIn):
    # Simple default admin - change in production
    if data.username == "admin" and data.password == "admin123":
        token = create_token({"id": "admin", "username": "admin", "role": "admin"})
        return {"token": token, "user": {"username": "admin", "role": "admin"}}
    # Check DB users
    user = await db.users.find_one({"username": data.username, "password": data.password}, {"_id":0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token({"id": user["id"], "username": user["username"], "role": user.get("role","staff")})
    return {"token": token, "user": user}

@app.get("/api/me")
async def me(user: dict = Depends(get_current_user)):
    return user

# --- GAMES CRUD (Admin) ---
@app.post("/api/games")
async def create_game(data: GameIn, _: dict = Depends(require_admin)):
    doc = {"id": new_id(), **data.model_dump(), "created_at": now_iso()}
    await db.games.insert_one(doc)
    doc.pop("_id", None)
    return doc

@app.patch("/api/games/{gid}")
async def update_game(gid: str, data: GameIn, _: dict = Depends(require_admin)):
    await db.games.update_one({"id": gid}, {"$set": data.model_dump()})
    updated = await db.games.find_one({"id": gid}, {"_id":0})
    return updated

@app.delete("/api/games/{gid}")
async def delete_game(gid: str, _: dict = Depends(require_admin)):
    await db.games.delete_one({"id": gid})
    return {"ok": True}

@app.get("/api/games")
async def list_games(_: dict = Depends(require_admin)):
    return await db.games.find({}, {"_id":0}).sort("name", 1).to_list(1000)

# --- PUBLIC ENDPOINTS - YEHI FIX HAI - NO AUTH ---
@app.get("/api/items")
async def list_items_alias():
    """For New Bill page - public"""
    return await db.games.find({"active": {"$ne": False}}, {"_id": 0}).sort("name", 1).to_list(1000)

@app.get("/items")
async def list_items_root():
    return await db.games.find({"active": {"$ne": False}}, {"_id": 0}).sort("name", 1).to_list(1000)

@app.get("/api/customers")
async def list_customers_alias():
    return await db.customers.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)

@app.get("/api/customers/{cid}")
async def get_customer(cid: str):
    c = await db.customers.find_one({"id": cid}, {"_id":0})
    if not c:
        raise HTTPException(404, "Customer not found")
    return c

@app.post("/api/customers")
async def create_customers_alias(data: dict):
    data["id"] = data.get("id") or new_id()
    data["created_at"] = now_iso()
    await db.customers.insert_one(data)
    data.pop("_id", None)
    return data

# --- BILLS ---
@app.get("/api/bills")
async def list_bills():
    return await db.bills.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)

@app.post("/api/bills")
async def create_bill(data: dict):
    data["id"] = data.get("id") or new_id()
    data["created_at"] = now_iso()
    # auto calculate total if items present
    if "items" in data:
        total = sum([i.get("price",0)*i.get("qty",1) for i in data["items"]])
        data["total"] = total
    await db.bills.insert_one(data)
    data.pop("_id", None)
    return data

@app.get("/api/bills/{bid}")
async def get_bill(bid: str):
    b = await db.bills.find_one({"id": bid}, {"_id":0})
    if not b:
        raise HTTPException(404, "Bill not found")
    return b

# --- VISITS / DASHBOARD ---
@app.get("/api/visits")
async def list_visits():
    return await db.bills.find({}, {"_id":0}).sort("created_at", -1).to_list(1000)

@app.get("/api/dashboard/stats")
async def dashboard_stats():
    total_games = await db.games.count_documents({})
    total_customers = await db.customers.count_documents({})
    total_bills = await db.bills.count_documents({})
    # sum total revenue
    pipeline = [{"$group": {"_id": None, "total": {"$sum": "$total"}}}]
    agg = await db.bills.aggregate(pipeline).to_list(1)
    revenue = agg[0]["total"] if agg else 0
    return {
        "games": total_games,
        "customers": total_customers,
        "bills": total_bills,
        "revenue": revenue
    }

@app.get("/")
async def root():
    return {"status": "Funland CRM running", "version": "fixed-public-items"}

@app.get("/health")
async def health():
    return {"ok": True, "time": now_iso()}