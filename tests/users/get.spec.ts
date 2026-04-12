import createJWKSMock from 'mock-jwks'
import { DataSource } from 'typeorm'
import request from 'supertest'
import { AppDataSource } from '../../src/config/data-source'
import { Roles } from '../../src/constants'
import { User } from '../../src/entity/User'
import { Tenant } from '../../src/entity/Tenant'
import app from '../../src/app'
import { createTenant } from '../utils'

describe('GET /users', () => {
    let connection: DataSource
    let jwks: ReturnType<typeof createJWKSMock>
    let adminToken: string

    beforeAll(async () => {
        connection = await AppDataSource.initialize()
        jwks = createJWKSMock('http://localhost:5501')
    })

    beforeEach(async () => {
        await connection.dropDatabase()
        await connection.synchronize()
        jwks.start()

        adminToken = jwks.token({
            sub: '1',
            role: Roles.ADMIN,
        })
    })

    afterAll(async () => {
        await connection.destroy()
    })

    afterEach(() => {
        jwks.stop()
    })

    describe('Get user by ID', () => {
        it('should return user by ID with status code 200', async () => {
            const tenant = await createTenant(connection.getRepository(Tenant))
            const userRepository = connection.getRepository(User)

            const userData = {
                firstName: 'Raju',
                lastName: 'Lamsal',
                email: 'rajulamsal@gmail.com',
                password: 'password123',
                role: Roles.MANAGER,
            }

            const savedUser = await userRepository.save({
                ...userData,
                tenant: { id: tenant.id },
            })

            const response = await request(app)
                .get(`/users/${savedUser.id}`)
                .set('Cookie', [`accessToken=${adminToken}`])

            expect(response.statusCode).toBe(200)
            expect(response.body.id).toBe(savedUser.id)
            expect(response.body.firstName).toBe(userData.firstName)
            expect(response.body.lastName).toBe(userData.lastName)
            expect(response.body.email).toBe(userData.email)
            expect(response.body).not.toHaveProperty('password')
        })

        it('should return 404 if user does not exist', async () => {
            const response = await request(app)
                .get('/users/9999')
                .set('Cookie', [`accessToken=${adminToken}`])

            expect(response.statusCode).toBe(404)
        })
    })

    describe('Get users list', () => {
        it('should return a list of all users', async () => {
            const tenant = await createTenant(connection.getRepository(Tenant))
            const userRepository = connection.getRepository(User)

            await userRepository.save([
                {
                    firstName: 'Raju',
                    lastName: 'Lamsal',
                    email: 'rajulamsal@gmail.com',
                    password: 'password123',
                    role: Roles.MANAGER,
                    tenant: { id: tenant.id },
                },
                {
                    firstName: 'Prashamsa',
                    lastName: 'Gyawali',
                    email: 'Pgyawali@gmail.com',
                    password: 'password12',
                    role: Roles.CUSTOMER,
                    tenant: { id: tenant.id },
                },
            ])

            const response = await request(app)
                .get('/users')
                .set('Cookie', [`accessToken=${adminToken}`])

            expect(response.statusCode).toBe(200)
            expect(response.body.users).toHaveLength(2)
            expect(response.body.total).toBe(2)
        })

        it('should filter users by role', async () => {
            const tenant = await createTenant(connection.getRepository(Tenant))
            const userRepository = connection.getRepository(User)

            await userRepository.save([
                {
                    firstName: 'Raju',
                    lastName: 'Lamsal',
                    email: 'rajulamsal@gmail.com',
                    password: 'password123',
                    role: Roles.MANAGER,
                    tenant: { id: tenant.id },
                },
                {
                    firstName: 'Prashamsa',
                    lastName: 'Gyawali',
                    email: 'Pgyawali@gmail.com',
                    password: 'password12',
                    role: Roles.CUSTOMER,
                    tenant: { id: tenant.id },
                },
            ])

            const response = await request(app)
                .get(`/users?role=${Roles.MANAGER}`)
                .set('Cookie', [`accessToken=${adminToken}`])

            expect(response.statusCode).toBe(200)
            expect(response.body.users).toHaveLength(1)
            expect(response.body.users[0].role).toBe(Roles.MANAGER)
        })

        it('should search users by name or email', async () => {
            const tenant = await createTenant(connection.getRepository(Tenant))
            const userRepository = connection.getRepository(User)

            await userRepository.save([
                {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john@example.com',
                    password: 'password123',
                    role: Roles.MANAGER,
                    tenant: { id: tenant.id },
                },
                {
                    firstName: 'Jane',
                    lastName: 'Smith',
                    email: 'jane@example.com',
                    password: 'password123',
                    role: Roles.CUSTOMER,
                    tenant: { id: tenant.id },
                },
            ])

            const response = await request(app)
                .get('/users?q=John')
                .set('Cookie', [`accessToken=${adminToken}`])

            expect(response.statusCode).toBe(200)
            expect(response.body.users).toHaveLength(1)
            expect(response.body.users[0].firstName).toBe('John')
        })

        it('should paginate users', async () => {
            const tenant = await createTenant(connection.getRepository(Tenant))
            const userRepository = connection.getRepository(User)

            const users = Array.from({ length: 5 }, (_, i) => ({
                firstName: `User${i}`,
                lastName: 'Test',
                email: `user${i}@example.com`,
                password: 'password123',
                role: Roles.CUSTOMER,
                tenant: { id: tenant.id },
            }))

            await userRepository.save(users)

            const response = await request(app)
                .get('/users?perPage=2&currentPage=1')
                .set('Cookie', [`accessToken=${adminToken}`])

            expect(response.statusCode).toBe(200)
            expect(response.body.users).toHaveLength(2)
            expect(response.body.total).toBe(5)
        })

        it('should return 403 if non-admin tries to get users', async () => {
            const managerToken = jwks.token({
                sub: '1',
                role: Roles.MANAGER,
            })

            const response = await request(app)
                .get('/users')
                .set('Cookie', [`accessToken=${managerToken}`])

            expect(response.statusCode).toBe(403)
        })
    })
})
