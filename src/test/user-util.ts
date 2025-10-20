import { prismaClient } from "../application/database";

export class UserTest {

    static async create() {
        await prismaClient.user.create({
            data: {
                name: "John Doe",
                email: "john@doe.com",
                password: await Bun.password.hash('password', {
                    cost: 10,
                    algorithm: 'bcrypt'
                }),
                token: 'test'
            }
        })
    }

    static async delete() {
        await prismaClient.user.deleteMany()
    }
}