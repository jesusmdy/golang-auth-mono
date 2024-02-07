package main

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/jesusmdy/goauth-server/internal/database"
)

func (apiCfg apiConfig) handlerBatchAddProducts(
	w http.ResponseWriter,
	r *http.Request,
	user database.User,
) {
	type rawProduct struct {
		Title       string  `json:"title"`
		Price       float64 `json:"price"`
		Description string  `json:"description"`
		Category    string  `json:"category"`
		Image       string  `json:"image"`
		Rate        float64 `json:"rate"`
		Count       int     `json:"count"`
	}
	type parameters struct {
		Products []rawProduct `json:"products"`
	}

	decoder := json.NewDecoder(r.Body)

	params := parameters{}
	err := decoder.Decode(&params)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	products := make([]database.Product, len(params.Products))
	for i, p := range params.Products {
		products[i] = database.Product{
			ID:          uuid.New(),
			Title:       p.Title,
			Price:       int32(p.Price),
			Description: p.Description,
			Category:    p.Category,
			Image:       p.Image,
			Rate:        int32(p.Rate),
			Count:       int32(p.Count),
		}
	}

	for _, p := range products {
		_, err := apiCfg.DB.CreateProduct(r.Context(), database.CreateProductParams{
			ID:          p.ID,
			Title:       p.Title,
			Price:       p.Price,
			Description: p.Description,
			Category:    p.Category,
			Image:       p.Image,
			Rate:        p.Rate,
		})
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
	}

	respondWithJSON(w, http.StatusCreated, products)

}

func (apiCfg apiConfig) handlerListProducts(
	w http.ResponseWriter,
	r *http.Request,
) {

	products, err := apiCfg.DB.GetProducts(
		r.Context(),
		100,
	)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, products)
}
