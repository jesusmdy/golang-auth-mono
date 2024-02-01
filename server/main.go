package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/jesusmdy/goauth-server/internal/database"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

const (
	Port = ":3001"
)

type apiConfig struct {
	DB *database.Queries
}

func main() {
	godotenv.Load(".env")

	dbURL := os.Getenv("DB_URL")
	if dbURL == "" {
		log.Fatal("error: $DB_URL must be set")
	}

	conn, err := sql.Open("postgres", dbURL)

	if err != nil {
		log.Fatal("error: cannot connect to database: ", err)
	}

	db := database.New(conn)

	apiCfg := apiConfig{
		DB: db,
	}

	router := chi.NewRouter()

	router.Use(middleware.Logger)

	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	v1Router := chi.NewRouter()

	v1Router.Put("/users", apiCfg.handleCreateUser)
	v1Router.Post("/users/login", apiCfg.handleAuthenticateUser)
	v1Router.Get("/users/me", apiCfg.middlewareAuth(apiCfg.handleGetAuthenticatedUser))

	router.Mount("/v1", v1Router)

	srv := &http.Server{
		Handler: router,
		Addr:    Port,
	}

	log.Println("status: server is running on port", Port)

	err = srv.ListenAndServe()

	if err != nil {
		log.Fatal("error: server failed to start: ", err)
	}
}
