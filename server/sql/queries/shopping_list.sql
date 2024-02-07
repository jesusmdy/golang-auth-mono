-- name: CreateShoppingList :one

INSERT INTO user_shopping_list (
  id,
  user_id,
  product_id,
  date_added
)

VALUES (
  $1,
  $2,
  $3,
  $4
)

RETURNING (
  id,
  user_id,
  product_id,
  date_added
);

-- name: GetShoppingListByUserId :many
SELECT
  id,
  user_id,
  product_id,
  date_added
FROM user_shopping_list
WHERE user_id = $1
ORDER BY id;
