import { User, Role } from "../generated/prisma"
import { UserResponse } from "../models/user-model"
import { MutationUserValue, MutationLoginValue, MutationUpdateUserValue, Validation } from "../validations/user-validation"
import { HTTPException } from "hono/http-exception"
import { prismaClient } from "../application/database"

export class UserService {
    static async register(request: MutationUserValue): Promise<UserResponse> {
        const validatedRequest = Validation.USER_REGISTER.parse(request) as MutationUserValue

        const existingUser = await prismaClient.user.findUnique({
            where: { email: validatedRequest.email }
        })

        if (existingUser) {
            throw new HTTPException(400, { message: 'Email already exists' })
        }

        const hashedPassword = await Bun.password.hash(validatedRequest.password, {
            algorithm: 'bcrypt',
            cost: 10
        })

        const user = await prismaClient.user.create({
            data: {
                ...validatedRequest,
                password: hashedPassword
            }
        })

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    }

    static async login(request: MutationLoginValue): Promise<UserResponse> {
        const validatedRequest = Validation.USER_LOGIN.parse(request) as MutationLoginValue

        const user = await prismaClient.user.findUnique({
            where: { email: validatedRequest.email }
        })

        if (!user) {
            throw new HTTPException(401, { message: 'Email or password is incorrect' })
        }

        const isPasswordValid = await Bun.password.verify(validatedRequest.password, user.password, 'bcrypt')
        if (!isPasswordValid) {
            throw new HTTPException(401, { message: 'Email or password is incorrect' })
        }

        const token = crypto.randomUUID()
        const updatedUser = await prismaClient.user.update({
            where: { id: user.id },
            data: { token }
        })

        return {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            token: updatedUser.token!
        }
    }

    static async get(token: string | undefined | null): Promise<User> {
        const result = Validation.TOKEN.safeParse(token)
        if (result.error) {
            throw new HTTPException(401, { message: 'Unauthorized' })
        }

        token = result.data as string

        if (token.startsWith('Bearer ')) {
            token = token.substring(7)
        }

        const user = await prismaClient.user.findFirst({
            where: { token: token }
        })

        if (!user) {
            throw new HTTPException(401, { message: 'Unauthorized' })
        }

        return user
    }

    static async update(user: User, request: MutationUpdateUserValue): Promise<UserResponse> {
        const validatedRequest = Validation.USER_UPDATE.parse(request) as MutationUpdateUserValue

        if (validatedRequest.password) {
            validatedRequest.password = await Bun.password.hash(validatedRequest.password, {
                algorithm: 'bcrypt',
                cost: 10
            })
        }

        const updatedUser = await prismaClient.user.update({
            where: { id: user.id },
            data: validatedRequest
        })

        return {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role
        }
    }

    static async logout(user: User): Promise<void> {
        await prismaClient.user.update({
            where: { id: user.id },
            data: { token: null }
        })
    }
}