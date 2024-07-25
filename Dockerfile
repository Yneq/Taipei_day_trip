# 使用官方的Python運行時作為父鏡像
FROM --platform=linux/amd64 python:3.12-slim

# 設置工作目錄
WORKDIR /app

# 將當前目錄的內容複製到容器中的/app
COPY . /app

# 安裝任何需要的包
RUN pip3 install --no-cache-dir -r requirements.txt

# 使容器在運行時監聽在80端口
EXPOSE 8080

# 定義環境變量
ENV NAME=World

# 運行app.py，當容器啟動時
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]