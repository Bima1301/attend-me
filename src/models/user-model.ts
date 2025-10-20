import { User, Role } from "../generated/prisma"

export type ApplicationVariables = {
    user: User
}

export interface UserResponse {
    id: string
    name: string
    email: string
    role: Role
    token?: string
}