-- +goose Up

ALTER TABLE users ADD COLUMN role VARCHAR(255) NOT NULL DEFAULT 'user';


-- +goose Down

ALTER TABLE users DROP COLUMN role;
