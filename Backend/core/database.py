from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from pathlib import Path

# NOTE:
# main.py で load_dotenv() を呼んでも、database.py が先に import されると
# DATABASE_URL を読み込む時点で .env が反映されないため、ここで先に読み込みます。
backend_env_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=backend_env_path, override=True)

# Database connection string from environment variable
# 例: postgresql://postgres:<PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres?sslmode=require
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://stict_M3:stict2025@localhost/stict_web")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
