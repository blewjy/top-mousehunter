from fastapi import FastAPI, Response
from captcha_solver import solve_captcha
from image_utils import download_image
from datetime import datetime
import pytz
import os

tz = pytz.timezone("Asia/Singapore")

app = FastAPI()

@app.get('/')
def main(url: str):
    # solve captcha
    answer = solve_captcha(url)
 
    # save img to bind point for docker volume (if not testing)
    if "mock" not in url:
        img = download_image(url)
        if not os.path.isdir("/data"):
            os.mkdir("/data")
        img.save(f"/data/{datetime.now(tz).strftime('%d%m%Y-%H%M%S')}-{answer}.png", "PNG")

    # return response
    return Response(content=answer, media_type='text/plain')

@app.get("/version")
def version():
    return {"version": "1.0"}

@app.get("/hello")
def version():
    return {"ok": True}

