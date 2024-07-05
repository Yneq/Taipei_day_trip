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
from typing import Optional
import time
import datetime
import requests


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

class Attraction(BaseModel):
	id: int
	name: str
	address: str
	image: str

class BookingDataGet(BaseModel):
	attraction: Attraction
	date: str
	time: str
	price: int

class BookingDataPost(BaseModel):
	attractionId: int
	date: str
	time: str
	price: int

class ErrorResponse(BaseModel):
	error: bool
	message: str 

class Trip(BaseModel):
	attraction: Attraction
	date: str
	time: str

class Contact(BaseModel):
	name: str
	email: EmailStr
	phone: str

class Order(BaseModel):
	price: int
	trip: Trip
	contact: Contact

class OrderRequest(BaseModel):
	prime: str
	order: Order

class OrderDetail(BaseModel):
	number: str
	price: int
	trip: Trip
	contact: Contact
	status: int




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
		print(decoded_token)
		return decoded_token if decoded_token["exp"] >= datetime.datetime.utcnow().timestamp() else None
	except jwt.PyJWTError:
		return None

async def get_current_user(token: str = Depends(oauth2_scheme)):
	payload = await decode_access_token(token)
	if payload is None:
		raise HTTPException(status_code=401, detail="Invalid or expired token")
	print(payload)
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
		print(f"HTTP Exception: {str(http_exc)}") 
		return JSONResponse(status_code=http_exc.status_code, content={"error": True, "message": http_exc.detail})
	except Exception as e:
		print(f"General Exception: {str(e)}")
		return JSONResponse(status_code=500, content={
			"error": True,
			"message": f"伺服器內部錯誤: {str(e)}"
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

@app.get("/api/booking", response_model=Optional[BookingDataGet], responses={403: {"model": ErrorResponse}})
async def get_booking(current_user: dict = Depends(get_current_user)):
	db = get_db()
	cursor = db.cursor(dictionary=True)
	try:
		cursor.execute("""
				SELECT b.*, a.name, a.address, a.images
				FROM bookings b
				JOIN attractions a ON b.attractionId = a.id
				WHERE b.userId = %s
		""", (current_user["id"],))
		booking_data = cursor.fetchone()

		if booking_data:
			images = json.loads(booking_data["images"])
			first_image_url = images[0] if images else None

			return {
				"attraction": {
					"id": booking_data["attractionId"],
					"name": booking_data["name"],
					"address": booking_data["address"],
					"image": first_image_url
				},
				"date": str(booking_data["date"]),
				"time": booking_data["time"],
				"price": booking_data["price"]
			}
		else:
			return None
	except Exception as e:
		print(f"Database error: {str(e)}")
		raise HTTPException(status_code=500, detail="伺服器內部錯誤")
	finally:
		cursor.close()
		db.close()

@app.post("/api/booking", responses={
	200: {"description": "Booking created successfully"},
    400: {"model": ErrorResponse, "description": "Bad Request"},
    403: {"model": ErrorResponse, "description": "Forbidden"},
    500: {"model": ErrorResponse, "description": "Internal Server Error"}
})
async def create_booking(bookings: BookingDataPost, current_user: dict = Depends(get_current_user)):
	print(f"Received booking data: {bookings}")
	print(f"Current user: {current_user}")
	db = get_db()
	cursor = db.cursor()
	try:
		cursor.execute("DELETE FROM bookings WHERE userId = %s", (current_user["id"],))

		cursor.execute("INSERT INTO bookings (attractionId, date, time, price, userId) VALUES (%s, %s, %s, %s, %s)",
		(bookings.attractionId, bookings.date, bookings.time, bookings.price, current_user["id"]))
		db.commit()
		return {"description": "Booking created successfully"}
	except Exception as e:
		print(f"Database Error: {str(e)}")
		return JSONResponse(status_code=500, content={
			"error": True,
            "message": "伺服器內部錯誤"
		})
	finally:
		cursor.close()
		db.close()

@app.delete("/api/booking", responses={
	200: {"description": "Booking deleted successfully", "content": {"application/json": {"example": {"ok": "true"}}}},
	403: {"model": ErrorResponse}
	})
async def delete_booking(current_user: dict = Depends(get_current_user)):
	db = get_db()
	cursor = db.cursor()
	try:
		cursor.execute("DELETE FROM bookings WHERE userId = %s", (current_user["id"],))
		db.commit()
	except Exception as e:
		print(f"Database Error: {str(e)}")
		return JSONResponse(status_code=500, content={
			"error": True,
            "message": "伺服器內部錯誤"
		})
	finally:
		cursor.close()
		db.close()

@app.post("/api/orders", responses={
	200: {"description": "orders created successfully"},
    400: {"model": ErrorResponse, "description": "訂單建立失敗，輸入不正確或其他原因"},
    403: {"model": ErrorResponse, "description": "未登入系統，拒絕存取"},
    500: {"model": ErrorResponse, "description": "伺服器內部錯誤"}
})
async def create_order(order_request: OrderRequest, current_user: dict = Depends(get_current_user)):
	print(f"Received booking data: {order_request}")
	print(f"Current user: {current_user}")
	db = get_db()
	cursor = db.cursor()
	try:
		prime = order_request.prime
		order = order_request.order
		price = order.price   
		trip = order.trip
		contact = order.contact

		timestamp = int(time.time())
		now = datetime.datetime.now()
		order_number = now.strftime("Y%m%d%H%M%S%f")

		attraction_id = trip.attraction.id
		attraction_name = trip.attraction.name
		attraction_address = trip.attraction.address
		attraction_image = trip.attraction.image
		trip_date = trip.date
		trip_time = trip.time
		contact_name = contact.name
		contact_email = contact.email
		contact_phone = contact.phone
	
		payment_status = 0 
		payment_message = "UNPAID"  

		query = """
			INSERT INTO orders (order_number, prime, price, attraction_id, attraction_name, attraction_address, 
			attraction_image, date, time, contact_name, contact_email, contact_phone, payment_status, 
			payment_message, user_id) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
		"""
		values = (
			order_number,
			prime,
			price,
			attraction_id,
			attraction_name,
			attraction_address,
			attraction_image,
			trip_date,
			trip_time,
			contact_name,
			contact_email,
			contact_phone,
			payment_status,
			payment_message,
			current_user["id"]
		)
		cursor.execute(query, values)
		db.commit()

		pay_by_prime_url = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime"
		headers = {
            "Content-Type": "application/json",
            "x-api-key": "partner_5S6s0EozVToOKwHvzqMJjMXU0IJ05IS7J5DMikxlYJbBmx5poM9jBS1a"
        }
		payment_payload = {
            "prime": prime,
            "partner_key": "partner_5S6s0EozVToOKwHvzqMJjMXU0IJ05IS7J5DMikxlYJbBmx5poM9jBS1a",
            "merchant_id": "yneq_CTBC",
            "details": "TapPay Test",
            "amount": price,
            "cardholder": {
                "phone_number": contact_phone,
                "name": contact_name,
                "email": contact_email,
                "zip_code": "",
                "address": attraction_address,
                "national_id": ""
            },
            "remember": True
        }
		payment_response = requests.post(pay_by_prime_url, json=payment_payload, headers=headers)
		payment_result = payment_response.json()

		print(f"Payment response: {payment_result}")  # 打印支付結果以進行調試

		if payment_response.status_code == 200 and payment_result["status"] == 0:
			payment_status = 1
			payment_message = "PAID"
		else:
			payment_status = 0
			payment_message = "UNPAID"

		update_query = """
			UPDATE orders
			SET payment_status = %s, payment_message = %s
			WHERE order_number = %s
		"""

		cursor.execute(update_query, (payment_status, payment_message, order_number))
		db.commit()

		return {"data": {
			"number": order_number,
			"payment": {
				"status": payment_status,
				"message": payment_message
				}
			}}
	except Exception as e:
		print(f"Error: {str(e)}")
		raise HTTPException(status_code=500, detail="伺服器內部錯誤")
	finally:
		cursor.close()
		db.close()

@app.get("/api/order/{orderNumber}", response_model=OrderDetail, responses={
	200: {"description": "Order Got successfully"},
	403: {"model": ErrorResponse, "description": "未登入系統，拒絕存取"}
})
async def get_order(orderNumber: str, current_user: dict = Depends(get_current_user)):
	db = get_db()
	cursor = db.cursor(dictionary=True)
	try:
		print(f"Fetching order for orderNumber: {orderNumber}, userId: {current_user['id']}")
		cursor.execute("SELECT * FROM orders WHERE order_number = %s AND user_id = %s", (orderNumber, current_user["id"]))
		order = cursor.fetchone()

		if order is None:
			return {"data": None}
		order_detail = OrderDetail(
			number = order["order_number"],
			price = order["price"],
			trip = Trip(
				attraction = Attraction(
					id = order["attraction_id"],
					name = order["attraction_name"],
					address = order["attraction_address"],
					image = order["attraction_image"],
				),
				date = order["date"].strftime('%Y-%m-%d'),
				time = order["time"],
			),
			contact = Contact(
				name = order["contact_name"],
				email = order["contact_email"],
				phone = order["contact_phone"],
			),
			status = order["payment_status"]
		)
		return order_detail		

	except Exception as e:
		print(f"Error: {str(e)}")
		raise HTTPException(status_code=500, detail="伺服器內部錯誤")
	finally:
		cursor.close()
		db.close()
