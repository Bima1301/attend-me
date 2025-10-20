import { describe, it, expect, afterEach, beforeEach } from "bun:test"
import app from ".."
import { logger } from "../application/logging";
import { UserTest } from "./user-util";

describe('POST /api/users', () => {

    afterEach(async () => {
        await UserTest.delete()
    })

    it('should reject register if request is invalid', async () => {
        const res = await app.request('/api/users', {
            method: 'post',
            body: JSON.stringify({
                name: '',
                email: '',
                password: ''
            })
        })

        const body = await res.json()
        logger.debug(body)

        expect(res.status).toBe(400)
        expect(body.errors).toBeDefined()
    });

    it('should reject register if email already exists', async () => {
        await UserTest.create()

        const res = await app.request('/api/users', {
            method: 'post',
            body: JSON.stringify({
                name: 'John Doe',
                email: 'john@doe.com',
                password: 'password'
            })
        })

        const body = await res.json()
        logger.debug(body)

        expect(res.status).toBe(400)
        expect(body.errors).toBeDefined()
    });

    it('should register new user success', async () => {
        const res = await app.request('/api/users', {
            method: 'post',
            body: JSON.stringify({
                name: 'John Doe',
                email: 'john@doe.com',
                password: 'password'
            })
        })

        const body = await res.json()
        logger.debug(body)

        expect(res.status).toBe(200)
        expect(body.content.name).toBe('John Doe')
        expect(body.content.email).toBe('john@doe.com')
    });
})

describe('POST /api/users/login', () => {

    beforeEach(async () => {
        await UserTest.create()
    })

    afterEach(async () => {
        await UserTest.delete()
    })

    it('should be able to login', async () => {
        const res = await app.request('/api/users/login', {
            method: 'post',
            body: JSON.stringify({
                email: 'john@doe.com',
                password: 'password'
            })
        })

        expect(res.status).toBe(200)
        const body = await res.json()
        expect(body.content.token).toBeDefined()
    })

    it('should be rejected if email is incorrect', async () => {
        const res = await app.request('/api/users/login', {
            method: 'post',
            body: JSON.stringify({
                email: 'someone@mail.com',
                password: 'password'
            })
        })

        expect(res.status).toBe(401)
        const body = await res.json()
        expect(body.errors).toBeDefined()
    })

    it('should be rejected if password is incorrect', async () => {
        const res = await app.request('/api/users/login', {
            method: 'post',
            body: JSON.stringify({
                email: 'john@doe.com',
                password: 'wrongPassword'
            })
        })

        expect(res.status).toBe(401)
        const body = await res.json()
        expect(body.errors).toBeDefined()
    })
})

describe('GET /api/users/current', () => {

    beforeEach(async () => {
        await UserTest.create()
    })


    afterEach(async () => {
        await UserTest.delete()
    })

    it('should be able to get current user', async () => {
        const res = await app.request('/api/users/current', {
            method: 'get',
            headers: {
                'Authorization': `test`
            }
        })

        expect(res.status).toBe(200)
        const body = await res.json()

        expect(body.content).toBeDefined()
        expect(body.content.name).toBe('John Doe')
        expect(body.content.email).toBe('john@doe.com')
    })

    it('should not be able to get current user if token is invalid', async () => {
        const res = await app.request('/api/users/current', {
            method: 'get',
            headers: {
                'Authorization': `wrong`
            }
        })

        expect(res.status).toBe(401)
        const body = await res.json()

        expect(body.errors).toBeDefined()
    })
})