from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

FAKE_ITEMS = [
    {"id": 1, "name": "burger", "category": "Food", "price": 100},
    {"id": 2, "name": "Aachari Tikka", "category": "Food", "price": 170},
    {"id": 3, "name": "Coke", "category": "Beverage", "price": 50},
    {"id": 4, "name": "Boating", "category": "Activities", "price": 200},
]

@app.get("/")
def home():
    return {"status": "ok - no sqlalchemy needed"}

@app.get("/games")
def get_games():
    return {"items": FAKE_ITEMS}

@app.get("/items")
def get_items():
    return FAKE_ITEMS

@app.get("/api/items")
def get_api_items():
    return {"items": FAKE_ITEMS}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
