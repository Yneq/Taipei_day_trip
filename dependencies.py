from fastapi.security import OAuth2PasswordBearer
import mysql.connector
from mysql.connector import pooling
import datetime
import jwt
from fastapi import HTTPException, Depends
from dotenv import load_dotenv
import os

load_dotenv() 

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")


rds_db_config = {
	"user": os.getenv("DB_USER"),
	"host": os.getenv("RDS_HOST"),
	"password": os.getenv("RDS_PASSWORD"),
	"database": os.getenv("DB_NAME")
}

# 建立 MySQL 連接池
pool = pooling.MySQLConnectionPool(
	pool_name = "mypool",
	pool_size = 10,
	**rds_db_config
)

def get_db():
	return pool.get_connection()
	

async def create_access_token(data: dict, expires_delta: datetime.timedelta = datetime.timedelta(days=7)):
	to_encode = data.copy()
	expire = datetime.datetime.utcnow() + expires_delta
	to_encode.update({"exp":expire})
	encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
	return encoded_jwt

async def decode_access_token(token: str):
	try:
		decoded_token = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
	#	print(decoded_token)
		return decoded_token if decoded_token["exp"] >= datetime.datetime.utcnow().timestamp() else None
	except jwt.PyJWTError:
		return None

async def get_current_user(token: str = Depends(oauth2_scheme)):
	payload = await decode_access_token(token)
	if payload is None:
		raise HTTPException(status_code=401, detail="Invalid or expired token")
#	print(payload)
	return payload

