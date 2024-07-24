from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from views import static_pages
from controllers import user_controller, attraction_controller, booking_controller, order_controller, pic_controller
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 靜態頁面
app.mount("/static", StaticFiles(directory="static"), name="static")
app.include_router(static_pages.router)

# API 路由
app.include_router(user_controller.router)
app.include_router(attraction_controller.router)
app.include_router(booking_controller.router)
app.include_router(order_controller.router)
app.include_router(pic_controller.router)
