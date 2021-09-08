#!/usr/bin/python3

from datetime import datetime
import pytz
import schedule
import time
import subprocess

tz = pytz.timezone("Asia/Singapore")

def job():
    print("", flush=True)
    print(f"[{datetime.now(tz).strftime('%d/%m/%Y, %-I:%M:%S %P')}] Running bot.js...", flush=True)
    subprocess.run(["node", "bot.js"])
    print(f"[{datetime.now(tz).strftime('%d/%m/%Y, %-I:%M:%S %P')}] Returned from bot.js!", flush=True)

schedule.every(17).minutes.do(job)

print(f"[{datetime.now(tz).strftime('%d/%m/%Y, %-I:%M:%S %P')}] Starting scheduler...", flush=True)

while 1:
    schedule.run_pending()
    time.sleep(1)
