from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import stock


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(stock.router, prefix="/company", tags=["Company"])

@app.get("/")
def root():
    return {"message": "🔥 HOT 주식 백엔드 서버 작동 중!"}
