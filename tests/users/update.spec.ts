import createJWKSMock from 'mock-jwks'
import { DataSource } from 'typeorm'
import request from 'supertest'
import { AppDataSource } from '../../src/config/data-source'
import { Roles } from '../../src/constants'
import { User } from '../../src/entity/User'
import { Tenant } from '../../src/entity/Tenant'
import app from '../../src/app'
import { createTenant } from '../utils'

describe('PUT /users', () => {
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

    describe('Given all fields', () => {
        it('should update the user', async () => {
            const tenant = await createTenant(connection.getRepository(Tenant))
            const userRepository = connection.getRepository(User)

            const user = await userRepository.save({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                password: 'password123',
                role: Roles.MANAGER,
                tenant: { id: tenant.id },
            })

            const updatedData = {
                firstName: 'Johnny',
                lastName: 'Doe',
                email: 'johnny@example.com',
                role: Roles.CUSTOMER,
                tenantId: tenant.id,
            }

            const response = await request(app)
                .put(`/users/${user.id}`)
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(updatedData)

            expect(response.statusCode).toBe(200)

            const updatedUser = await userRepository.findOneBy({ id: user.id })
            expect(updatedUser?.firstName).toBe(updatedData.firstName)
            expect(updatedUser?.lastName).toBe(updatedData.lastName)
            expect(updatedUser?.role).toBe(updatedData.role)
        })

        it('should return 404 if user does not exist', async () => {
            const response = await request(app)
                .put('/users/9999')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send({
                    firstName: 'Test',
                    lastName: 'User',
                    email: 'test@example.com',
                    role: Roles.CUSTOMER,
                    tenantId: 1,
                })

            expect(response.statusCode).toBe(404)
        })

        it('should return 403 if non-admin tries to update user', async () => {
            const tenant = await createTenant(connection.getRepository(Tenant))
            const userRepository = connection.getRepository(User)

            const user = await userRepository.save({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                password: 'password123',
                role: Roles.MANAGER,
                tenant: { id: tenant.id },
            })

            const managerToken = jwks.token({
                sub: '1',
                role: Roles.MANAGER,
            })

            const response = await request(app)
                .put(`/users/${user.id}`)
                .set('Cookie', [`accessToken=${managerToken}`])
                .send({
                    firstName: 'Updated',
                    lastName: 'User',
                    email: 'updated@example.com',
                    role: Roles.CUSTOMER,
                    tenantId: tenant.id,
                })

            expect(response.statusCode).toBe(403)
        })
    })
})
