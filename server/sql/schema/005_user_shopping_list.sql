-- +goose Up

CREATE TABLE user_shopping_list (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    product_id UUID NOT NULL REFERENCES products(id),
    date_added TIMESTAMP NOT NULL
);

-- +goose Down

DROP TABLE user_shopping_list;