from fastapi import *
from fastapi.responses import FileResponse, JSONResponse
import mysql.connector
from mysql.connector import Error
import json
from pydantic import BaseModel, EmailStr, validator
from fastapi.security import OAuth2PasswordBearer
import datetime
import jwt
from fastapi import HTTPException, status


app=FastAPI()

from fastapi.staticfiles import StaticFiles

app=FastAPI()


app.mount("/static", StaticFiles(directory="static"), name="static")

# Static Pages (Never Modify Code in this Block)
@app.get("/", include_in_schema=False)
async def index(request: Request):
	return FileResponse("./static/index.html", media_type="text/html")
@app.get("/attraction/{id}", include_in_schema=False)
async def attraction(request: Request, id: int):
	return FileResponse("./static/attraction.html", media_type="text/html")
@app.get("/booking", include_in_schema=False)
async def booking(request: Request):
	return FileResponse("./static/booking.html", media_type="text/html")
@app.get("/thankyou", include_in_schema=False)
async def thankyou(request: Request):
	return FileResponse("./static/thankyou.html", media_type="text/html")



def get_db():
	return mysql.connector.connect(
		user="root",
		host="localhost",
		password="244466666",
		database="tdt"
	)



class User(BaseModel):
	name: str
	email: EmailStr
	password: str        

class Token(BaseModel):
	access_token: str
	token_type: str

class UserResponse(BaseModel):
	id: int
	name: str
	email: EmailStr

class UserCheckin(BaseModel):
	email: EmailStr
	password: str


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

SECRET_KEY = "vance"
ALGORITHM = "HS256"

async def create_access_token(data: dict, expires_delta: datetime.timedelta = datetime.timedelta(days=7)):
	to_encode = data.copy()
	expire = datetime.datetime.utcnow() + expires_delta
	to_encode.update({"exp":expire})
	encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
	return encoded_jwt

async def decode_access_token(token: str):
	try:
		decoded_token = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
		return decoded_token if decoded_token["exp"] >= datetime.datetime.utcnow().timestamp() else None
	except jwt.PyJWTError:
		return None

async def get_current_user(token: str = Depends(oauth2_scheme)):
	payload = await decode_access_token(token)
	if payload is None:
		raise HTTPException(status_code=401, detail="Invalid or expired token")
	return payload



@app.post("/api/user")
async def create_user(user: User):
	try:
		db = get_db()
		cursor = db.cursor()
		cursor.execute("SELECT * FROM users WHERE email=%s", (user.email,))
		existing_user = cursor.fetchone()
		if existing_user:
			return JSONResponse(status_code=400, content = {
				"error": True,
				"message": "註冊失敗，重複的 Email 或其他原因"
			})
		cursor.execute("INSERT INTO users(name, email, password) VALUES (%s, %s, %s)", (user.name, user.email, user.password))
		db.commit()
		cursor.close()
		db.close()
		return {"ok": True}
	except Exception as e:
		print(f"Database error: {str(e)}") 
		return JSONResponse(status_code=500, content={
			"error": True,
			"message": "伺服器內部錯誤"
		})
	
@app.get("/api/user/auth", response_model=UserResponse)
async def read_user(current_user: dict = Depends(get_current_user)):
	try:
		if not current_user:
			raise HTTPException(status_code=401, detail="Unauthorized")

		db = get_db()
		cursor = db.cursor()
		cursor.execute("SELECT id, name, email FROM users WHERE id=%s", (current_user["id"], ))
		user = cursor.fetchone()
		cursor.close()
		db.close()

		if not user:
			raise HTTPException(status_code=404, detail="User not found")
		return UserResponse(id=user[0], name=user[1], email=user[2])
	except Exception as e:
		print(f"Database error: {str(e)}")
		raise HTTPException(status_code=500, detail="伺服器內部錯誤")
		
@app.put("/api/user/auth")
async def check_user(user: UserCheckin):
	try:
		db = get_db()
		cursor = db.cursor(dictionary=True)
		cursor.execute("SELECT * FROM users WHERE email=%s AND password=%s", (user.email, user.password))
		user_data = cursor.fetchone()
		cursor.close()
		db.close()
		
		if not user_data:
			return JSONResponse(status_code=400,content={
				"error": True,
				"message": "登入失敗，帳號或密碼錯誤或其他原因"
			})
		access_token = await create_access_token(data={
			"id": user_data["id"],
			"name": user_data["name"],
			"email": user_data["email"],
		})
		return {"token": access_token}
		
	except HTTPException as http_exc:
		print(f"HTTP Exception: {str(http_exc)}")  # Add logging for debugging
		return JSONResponse(status_code=http_exc.status_code, content={"error": True, "message": http_exc.detail})
	except Exception as e:
		print(f"General Exception: {str(e)}")  # Add logging for debugging
		return JSONResponse(status_code=500, content={
			"error": True,
			"message": f"伺服器內部錯誤: {str(e)}"  # Add detailed error message
		})


@app.get("/api/attractions")
def attractions(page: int=Query(0, ge=0), keyword: str=None):

#	error_test = 1 / 0   code500 test
	try:
		db = get_db()
		cursor = db.cursor(dictionary=True)

		if keyword:
			sql = """
            SELECT * FROM attractions 
            WHERE 
                name LIKE %s OR 
                mrt LIKE %s 
            LIMIT %s, 12
            """
			count_sql = """
            SELECT COUNT(*) as total FROM attractions 
            WHERE 
                name LIKE %s OR 
                mrt LIKE %s
            """
			
			like_keyword = '%' + keyword + '%'
			cursor.execute(count_sql, (like_keyword, like_keyword))
			total_records = cursor.fetchone()["total"]
			
			cursor.execute(sql, (like_keyword, like_keyword, page * 12))
		else:
			sql = "SELECT * FROM attractions LIMIT %s, 12"
			count_sql = "SELECT COUNT(*) as total FROM attractions"
			
			cursor.execute(count_sql)
			total_records = cursor.fetchone()["total"]
		
			cursor.execute(sql, (page * 12,))

		attractions = cursor.fetchall()
		cursor.close()
		db.close()

		if not attractions:
			return {
			"nextPage": None,
			"data": []
			}
		for attraction in attractions:
			attraction['images'] = json.loads(attraction['images'])
			
		next_page = page + 1 if (page + 1) * 12 < total_records else None
		return {
			"nextPage":next_page,
			"data":attractions
			}
	except Exception as e:
		return JSONResponse	(
				status_code=500,
				content={"error": True, "message": f"伺服器內部錯誤"}
				)


@app.get("/api/attraction/{attractionId}")
def get_attractionId(attractionId: int):
	try:
		db = get_db()
		cursor = db.cursor(dictionary=True)
		
		sql = "SELECT * FROM attractions WHERE id = %s"
		cursor.execute(sql, (attractionId,))
		attraction = cursor.fetchone()

		cursor.close()
		db.close()

		if not attraction:
			return JSONResponse(
				status_code=400,
		    	content={"error":True, "message": f"景點編號不正確"}
			)
		attraction['images'] = json.loads(attraction['images'])
		return {"data": attraction}
	
	except Error as e:
		print(f"Database error: {str(e)}")  # 添加這行進行調試
		return JSONResponse(
			status_code=500,
			content={"error":True, "message": f"伺服器內部錯誤息"}
		)
	
@app.get("/api/mrts")
def get_mrts():

	db = get_db()
	cursor = db.cursor()

	sql="SELECT mrt FROM attractions WHERE mrt IS NOT NULL GROUP by mrt ORDER BY COUNT(*) DESC"
	cursor.execute(sql)

	mrts = cursor.fetchall()
	cursor.close()
	db.close()

	if not mrts:
		return JSONResponse(
			status_code=500,
			content={"error": True, "message": f"伺服器內部錯誤"}
			)
	mrts_names = [mrt[0] for mrt in mrts]
	return {"data": mrts_names}