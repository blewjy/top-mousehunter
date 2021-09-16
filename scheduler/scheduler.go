package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"

	"github.com/go-co-op/gocron"
)

func getCurrentTime() (string, error) {
	t := time.Now()
	loc, err := time.LoadLocation("Asia/Singapore")

	if err != nil {
		fmt.Println("Oops: ", err)
		return "", err
	}

	return fmt.Sprintf("[%s]", t.In(loc).Format("02/01/2006, 03:04:05 PM")), nil
}

func post() {
	postBody, _ := json.Marshal(map[string]string{
		"name":     "blewjy",
		"password": "password123",
	})

	reqBody := bytes.NewBuffer(postBody)

	resp, err := http.Post("http://bot/run", "application/json", reqBody)

	if err != nil {
		fmt.Printf("An Error Occured %v\n", err)
		return
	}

	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println(err)
		return
	}

	sb := string(body)
	fmt.Println(sb)
}

func run() {
	curr_time, err := getCurrentTime()
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println(curr_time, "Sending POST request to bot!")
	post()
}

func main() {
	s := gocron.NewScheduler(time.UTC)

	s.Every(17).Minutes().Do(run)

	s.StartBlocking()
}
