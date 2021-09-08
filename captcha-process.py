from PIL import Image
from io import BytesIO
import numpy as np
import cv2
import requests
import sys

def preprocess_image(image):
    def kernel(*size):
        return np.ones(size, np.uint8)

    image_arr = np.asarray(image)

    _, image_arr = cv2.threshold(image_arr, 200, 255, cv2.THRESH_BINARY)
    image_arr = cv2.bitwise_not(image_arr)
    image_arr = cv2.resize(image_arr, (0, 0), fx=5, fy=5)
    image_arr = cv2.erode(image_arr, kernel(3, 3), iterations=6)
    image_arr = cv2.dilate(image_arr, kernel(3, 3), iterations=5)
    image_arr = cv2.bitwise_not(image_arr)
    image_arr = cv2.resize(image_arr, (0, 0), fx=0.5, fy=0.5)

    _, image_arr = cv2.threshold(image_arr, 250, 255, cv2.THRESH_BINARY)
    image_arr = cv2.dilate(image_arr, kernel(8, 8), iterations=1)

    height, width, _ = image_arr.shape
    for i in range(height):
        for j in range(width):
            if image_arr[i,j].sum() < 750:
                image_arr[i, j] = [0, 0, 0]

    image_arr = cv2.erode(image_arr, kernel(5, 5), iterations=2)

    return Image.fromarray(image_arr)

def download_image(url):
    response = requests.get(url)
    image_bytes = BytesIO(response.content)
    return Image.open(image_bytes)


url = str(sys.argv[-1])
image = download_image(url)
image.save("captcha.png")
image = preprocess_image(image)
image.save("captcha_processed.png")