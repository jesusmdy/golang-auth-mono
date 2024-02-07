-- +goose Up

CREATE TABLE products (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    price INT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    image TEXT NOT NULL,
    rate INT NOT NULL,
    count INT NOT NULL
);

-- +goose Down

DROP TABLE products;