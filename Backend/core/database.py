from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Database connection string from environment variable
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://stict_M3:stict2025@localhost/stict_web")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
