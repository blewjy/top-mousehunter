package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/jinzhu/gorm"
	"github.com/rs/cors"
	uuid "github.com/satori/go.uuid"

	_ "github.com/jinzhu/gorm/dialects/postgres"
)

type Mouse struct {
	ID           uuid.UUID `gorm:"primaryKey" json:"id"`
	Timestamp    string    `json:"timestamp"`
	Location     string    `json:"location"`
	Success      bool      `json:"success"`
	Attract      bool      `json:"attract"`
	Lucky        bool      `json:"lucky"`
	Loot         bool      `json:"loot"`
	Stale        bool      `json:"stale"`
	Damage       bool      `json:"damage"`
	Trap         string    `json:"trap"`
	Base         string    `json:"base"`
	Cheese       string    `json:"cheese"`
	Charm        string    `json:"charm"`
	Power        string    `json:"power"`
	Type         string    `json:"type"`
	Luck         string    `json:"luck"`
	Attraction   string    `json:"attraction"`
	CheeseEffect string    `json:"cheese_effect"`
	MouseName    string    `json:"mouse_name"`
	MousePoints  string    `json:"mouse_points"`
	MouseGold    string    `json:"mouse_gold"`
	MouseLoot    string    `json:"mouse_loot"`
}

var db *gorm.DB
var err error

func main() {
	router := mux.NewRouter()

	db, err = gorm.Open("postgres", "host=postgres port=5432 user=root dbname=main sslmode=disable password=root")

	if err != nil {
		panic("failed to connect database")
	}

	defer db.Close()

	db.AutoMigrate(&Mouse{})

	router.HandleFunc("/mice", GetMice).Methods("GET")
	router.HandleFunc("/mice", AddMice).Methods("POST")
	router.HandleFunc("/mice/{id}", GetMouse).Methods("GET")

	handler := cors.Default().Handler(router)

	log.Fatal(http.ListenAndServe("0.0.0.0:80", handler))
}

func GetMice(w http.ResponseWriter, r *http.Request) {
	var mice []Mouse
	db.Find(&mice)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(&mice)
}

func AddMice(w http.ResponseWriter, r *http.Request) {
	var mouse Mouse
	json.NewDecoder(r.Body).Decode(&mouse)
	mouse.ID = uuid.NewV4()
	fmt.Printf("%+v\n", mouse)
	db.Create(&mouse)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(mouse)
}

func GetMouse(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	var mouse Mouse
	db.First(&mouse, "id = ?", params["id"])
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(&mouse)
}
