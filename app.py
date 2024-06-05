from fastapi import *
from fastapi.responses import FileResponse, JSONResponse
import mysql.connector
from mysql.connector import Error
import json


app=FastAPI()

=======
from fastapi.staticfiles import StaticFiles

app=FastAPI()

# from fastapi.middleware.cors import CORSMiddleware
# origins = [
#     "http://localhost",
#     "http://localhost:8000",
#     "http://13.236.156.145"
# ]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins, 
#     allow_credentials=True,
#     allow_methods=["*"],  
#     allow_headers=["*"],  
# )
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