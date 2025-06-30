# config.py
import os
from dotenv import load_dotenv

load_dotenv()

NAVER_CLIENT_ID = os.getenv("CLIENT_ID")
NAVER_CLIENT_SECRET = os.getenv("CLIENT_SECRET")