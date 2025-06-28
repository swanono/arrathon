export class GetUserByEmailQueryError extends Error {
  constructor(email: string) {
    super(`Failed to get user using email: ${email}`);
  }
}

export class GetUserByIdQueryError extends Error {
  constructor(id: number) {
    super(`Failed to get user using id: ${id}`);
  }
}

export class CreateUserQueryError extends Error {
  constructor() {
    super(`Failed to create user`);
  }
}

export class UpdateUserQueryError extends Error {
  constructor() {
    super(`Failed to update user`);
  }
}
