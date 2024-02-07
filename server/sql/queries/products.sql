-- name: CreateProduct :one

INSERT INTO products (
  id,
  title,
  price,
  description,
  category,
  image,
  rate,
  count
)

VALUES (
  $1,
  $2,
  $3,
  $4,
  $5,
  $6,
  $7,
  $8
)

RETURNING (
  id,
  title,
  price,
  description,
  category,
  image,
  rate,
  count
);

-- name: GetProductById :one
SELECT
  id,
  title,
  price,
  description,
  category,
  image,
  rate,
  count
FROM products
WHERE id = $1;

-- name: GetProducts :many
SELECT
  id,
  title,
  price,
  description,
  category,
  image,
  rate,
  count
FROM products
ORDER BY id
LIMIT $1;

-- name: BatchAddProducts :many
INSERT INTO products (
  id,
  title,
  price,
  description,
  category,
  image,
  rate,
  count
)
VALUES
  (UNNEST($1::UUID[]), UNNEST($2::TEXT[]), UNNEST($3::INT[]), UNNEST($4::TEXT[]), UNNEST($5::TEXT[]), UNNEST($6::TEXT[]), UNNEST($7::INT[]), UNNEST($8::INT[]))
RETURNING (
  id,
  title,
  price,
  description,
  category,
  image,
  rate,
  count
);

