FROM tiangolo/uvicorn-gunicorn-fastapi:python3.7

RUN apt-get update \
    && apt-get install -y --no-install-recommends tesseract-ocr libtesseract-dev python3-opencv \
    && rm -rf /var/lib/apt/lists/*
RUN apt-get install -y curl

COPY ./app /app
COPY ./test /test
COPY ./requirements.txt /tmp/requirements.txt

RUN pip3 install --user -r /tmp/requirements.txt

WORKDIR /test
RUN python3 -m pytest

# docker build image command:
# > docker build . -t captcha

# docker run command:
# > docker run -d -p 8080:80 -v captcha_images:/data captcha