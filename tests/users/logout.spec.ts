import request from 'supertest'
import bcrypt from 'bcryptjs'
import createJWKSMock from 'mock-jwks'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import app from '../../src/app'
import { User } from '../../src/entity/User'
import { Roles } from '../../src/constants'
import { RefreshToken } from '../../src/entity/RefreshToken'
import { truncateTables } from '../utils'

describe('POST /auth/logout', () => {
    let connection: DataSource
    let jwks: ReturnType<typeof createJWKSMock>

    beforeAll(async () => {
        jwks = createJWKSMock('http://localhost:5501')
        connection = await AppDataSource.initialize()
    })

    beforeEach(async () => {
        jwks.start()
        await truncateTables(connection)
    })

    afterEach(() => {
        jwks.stop()
    })
    afterAll(async () => {
        await AppDataSource.destroy()
    })

    describe('Given valid authentication', () => {
        it('should return 200 status code', async () => {
            const hashedPassword = await bcrypt.hash('password', 10)
            const userRepository = connection.getRepository(User)
            const user = await userRepository.save({
                firstName: 'Raju',
                lastName: 'Lamsal',
                email: 'rajulamsal@gmail.com',
                password: hashedPassword,
                role: Roles.CUSTOMER,
            })

            const loginResponse = await request(app)
                .post('/auth/login')
                .send({ email: 'rajulamsal@gmail.com', password: 'password' })

            const cookies =
                (loginResponse.headers['set-cookie'] as unknown as string[]) ||
                []
            const refreshTokenCookie =
                cookies.find((cookie) => cookie.includes('refreshToken=')) || ''

            const accessToken = jwks.token({
                sub: String(user.id),
                role: user.role,
            })

            const response = await request(app)
                .post('/auth/logout')
                .set('Cookie', [
                    `accessToken=${accessToken}`,
                    refreshTokenCookie,
                ])

            expect(response.statusCode).toBe(200)
        })

        it('should return empty object in response body', async () => {
            const hashedPassword = await bcrypt.hash('password', 10)
            const userRepository = connection.getRepository(User)
            const user = await userRepository.save({
                firstName: 'Raju',
                lastName: 'Lamsal',
                email: 'rajulamsal@gmail.com',
                password: hashedPassword,
                role: Roles.CUSTOMER,
            })

            const loginResponse = await request(app)
                .post('/auth/login')
                .send({ email: 'rajulamsal@gmail.com', password: 'password' })

            const cookies =
                (loginResponse.headers['set-cookie'] as unknown as string[]) ||
                []
            const refreshTokenCookie =
                cookies.find((cookie) => cookie.includes('refreshToken=')) || ''

            const accessToken = jwks.token({
                sub: String(user.id),
                role: user.role,
            })

            const response = await request(app)
                .post('/auth/logout')
                .set('Cookie', [
                    `accessToken=${accessToken}`,
                    refreshTokenCookie,
                ])

            expect(response.body).toEqual({})
        })

        it('should delete refresh token from database', async () => {
            const hashedPassword = await bcrypt.hash('password', 10)
            const userRepository = connection.getRepository(User)
            const user = await userRepository.save({
                firstName: 'Raju',
                lastName: 'Lamsal',
                email: 'rajulamsal@gmail.com',
                password: hashedPassword,
                role: Roles.CUSTOMER,
            })

            const loginResponse = await request(app)
                .post('/auth/login')
                .send({ email: 'rajulamsal@gmail.com', password: 'password' })

            const cookies =
                (loginResponse.headers['set-cookie'] as unknown as string[]) ||
                []
            const refreshTokenCookie =
                cookies.find((cookie) => cookie.includes('refreshToken=')) || ''

            const accessToken = jwks.token({
                sub: String(user.id),
                role: user.role,
            })

            const refreshTokenRepo = connection.getRepository(RefreshToken)
            const tokensBeforeLogout = await refreshTokenRepo.find({
                where: { user: { id: user.id } },
            })
            expect(tokensBeforeLogout).toHaveLength(1)

            await request(app)
                .post('/auth/logout')
                .set('Cookie', [
                    `accessToken=${accessToken}`,
                    refreshTokenCookie,
                ])

            const tokensAfterLogout = await refreshTokenRepo.find({
                where: { user: { id: user.id } },
            })
            expect(tokensAfterLogout).toHaveLength(0)
        })
    })

    describe('Given invalid authentication', () => {
        it('should return 401 when no cookies are provided', async () => {
            const response = await request(app).post('/auth/logout')

            expect(response.statusCode).toBe(401)
        })
    })
})
