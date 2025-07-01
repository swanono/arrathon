export const getUserByEmailQuery = `
    SELECT id, name, family_name, email, google_id, avatar_url
    FROM users
    WHERE email = $1
    LIMIT 1
`;

export const getUserByIdQuery = `
    SELECT id, name, family_name, email, google_id, avatar_url
    FROM users
    WHERE id = $1
    LIMIT 1
`;

export const updateUserByIdQuery = (newValues: string) => `
    UPDATE users
    SET ${newValues}
    WHERE id = $1
    RETURNING *
`;

export const createUserQuery = `
    INSERT INTO users (name, family_name, email, google_id, avatar_url)
    VALUES ( $1, $2, $3, $4, $5)
    RETURNING *
`;
