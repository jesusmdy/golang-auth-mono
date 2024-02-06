-- name: CreateUser :one

INSERT INTO users (
  id,
  created_at,
  updated_at,
  fullName,
  username,
  email,
  password,
  role,
  disabled
)

VALUES (
  $1,
  $2,
  $3,
  $4,
  $5,
  $6,
  $7,
  $8,
  $9
)

RETURNING (
  id,
  created_at,
  updated_at,
  fullName,
  username,
  email,
  role,
  disabled
);

-- name: GetUserByUsername :one
SELECT
  id,
  created_at,
  updated_at,
  fullName,
  username,
  email,
  password,
  role,
  disabled
FROM users
WHERE username = $1;


-- name: GetUserByEmail :one
SELECT
  id,
  created_at,
  updated_at,
  fullName,
  username,
  email,
  password,
  role,
  disabled
FROM users
WHERE email = $1;

-- name: GetUserById :one
SELECT
  id,
  created_at,
  updated_at,
  fullName,
  username,
  email,
  password,
  role,
  disabled
FROM users
WHERE id = $1;

-- name: UpdateUser :one
UPDATE users
SET
  updated_at = $2,
  fullName = $3,
  username = $4
WHERE id = $1

RETURNING (
  id,
  created_at,
  updated_at,
  fullName,
  username,
  email,
  role,
  disabled
);

-- name: UpdateUserPassword :one

UPDATE users
SET
  updated_at = $2,
  password = $3
WHERE id = $1

RETURNING (
  id,
  created_at,
  updated_at,
  fullName,
  username,
  email,
  role,
  disabled
);

-- name: UpdateUserEmail :one

UPDATE users
SET
  updated_at = $2,
  email = $3
WHERE id = $1

RETURNING (
  id,
  created_at,
  updated_at,
  fullName,
  username,
  email,
  role,
  disabled
);

-- name: UpdateUserAvailability :one

UPDATE users
SET
  updated_at = $2,
  disabled = $3
WHERE id = $1

RETURNING (
  id,
  created_at,
  updated_at,
  fullName,
  username,
  email,
  role,
  disabled
);

-- name: UpdateUserDetails :one

UPDATE users
SET
  updated_at = $2,
  fullName = $3,
  username = $4,
  email = $5
WHERE id = $1

RETURNING (
  id,
  created_at,
  updated_at,
  fullName,
  username,
  email,
  role,
  disabled
);
