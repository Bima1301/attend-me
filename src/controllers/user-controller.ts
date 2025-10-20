import { Hono } from "hono"
import { UserService } from "../services/user-service"
import { formatResponse } from "../utils/response-formatter"
import { MutationUserValue, MutationLoginValue, MutationUpdateUserValue, Validation } from "../validations/user-validation"
import { ApplicationVariables } from "../models/user-model"
import { authMiddleware } from "../middlware/auth-middleware"

export const userController = new Hono<{ Variables: ApplicationVariables }>()

userController.post('/api/users', async (c) => {
    const req = await c.req.json() as MutationUserValue
    const user = await UserService.register(req)
    return c.json(formatResponse(user, "Successfully registered user"), 200)
})

userController.post('/api/users/login', async (c) => {
    const req = await c.req.json() as MutationLoginValue
    const user = await UserService.login(req)
    return c.json(formatResponse(user, "Successfully logged in"), 200)
})

userController.use(authMiddleware)

userController.get('/api/users/current', async (c) => {
    const user = c.get('user')
    const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }
    return c.json(formatResponse(userResponse, "Successfully got user"), 200)
})

userController.patch('/api/users', async (c) => {
    const user = c.get('user')
    const req = await c.req.json() as MutationUpdateUserValue
    const updatedUser = await UserService.update(user, req)
    return c.json(formatResponse(updatedUser, "Successfully updated user"), 200)
})

userController.delete('/api/users/logout', async (c) => {
    const user = c.get('user')
    await UserService.logout(user)
    return c.json(formatResponse(null, "Successfully logged out"), 200)
})