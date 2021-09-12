from fastapi.testclient import TestClient

import sys
sys.path.insert(0, '..')
from app.main import app

import requests_mock
from PIL import Image
import io

client = TestClient(app)

def test_version_main():
  response = client.get("/version")
  assert response.status_code == 200
  assert response.json() == {"version": "1.0"}

def test_main():
  with requests_mock.Mocker(real_http=True) as m:
    
    captcha_answers = [
      "x4pjs",
      "dyxc8",
      "r6znt"
    ]

    for i, c in enumerate(captcha_answers):
      im_bytes = io.BytesIO()
      im = Image.open(f"resources/{c}.png")
      im.save(im_bytes, format='png')
      m.get(f'mock://top-mousehunter.com/{i}', content=im_bytes.getvalue())

    for i, c in enumerate(captcha_answers):
      response = client.get(f"/?url=mock%3A%2F%2Ftop-mousehunter.com%2F{i}")
      assert response.status_code == 200
      assert response.text.lower() == c