from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

# CORS - live ke liye sab allow
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FAKE_ITEMS = [
    {"id": 1, "name": "Veg Burger", "price": 80, "category": "Food", "type": "Food"},
    {"id": 2, "name": "Cheese Pizza", "price": 150, "category": "Food", "type": "Food"},
    {"id": 3, "name": "Cold Drink", "price": 40, "category": "Beverage", "type": "Beverage"},
    {"id": 4, "name": "Coffee", "price": 60, "category": "Beverage", "type": "Beverage"},
    {"id": 5, "name": "Trampoline Park", "price": 150, "category": "Activities", "type": "Activities"},
    {"id": 6, "name": "Go Kart", "price": 200, "category": "Activities", "type": "Activities"},
    {"id": 7, "name": "Bowling", "price": 120, "category": "Activities", "type": "Activities"},
]

@app.get("/")
def root():
    return {"status": "Funland CRM LIVE"}

@app.get("/api/items")
@app.get("/items")
def get_items():
    return FAKE_ITEMS

@app.get("/api/categories")
def get_categories():
    return ["All", "Food", "Beverage", "Activities"]

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)