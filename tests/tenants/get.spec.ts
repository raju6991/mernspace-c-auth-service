import createJWKSMock from 'mock-jwks'
import { DataSource } from 'typeorm'
import request from 'supertest'
import { AppDataSource } from '../../src/config/data-source'
import { Roles } from '../../src/constants'
import { Tenant } from '../../src/entity/Tenant'
import app from '../../src/app'

describe('GET /tenants', () => {
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
        it('should return tenant by ID with status code 200', async () => {
            //Arrange
            const tenantRepository = connection.getRepository(Tenant)
            const tenantData = {
                name: 'Tenant Name',
                address: 'Tenant Address',
            }
            const savedTenant = await tenantRepository.save(tenantData)

            //Act
            const response = await request(app)
                .get(`/tenants/${savedTenant.id}`)
                .set('Cookie', [`accessToken=${adminToken}`])
            //Assert
            expect(response.statusCode).toBe(200)
            expect(response.body.id).toBe(savedTenant.id)
            expect(response.body.name).toBe(savedTenant.name)
            expect(response.body.address).toBe(savedTenant.address)
        })

        it('should return a list of all tenants', async () => {
            //Arrange
            const tenantRepository = connection.getRepository(Tenant)
            const tenanaData = [
                {
                    name: 'Tenant one',
                    address: 'Address One',
                },
                {
                    name: 'Tenant Two',
                    address: 'Address two',
                },
            ]

            await tenantRepository.save(tenanaData)
            //Act
            const response = await request(app)
                .get('/tenants')
                .set('Cookie', [`accessToken=${adminToken}`])
            //Assert
            expect(response.statusCode).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)
            expect(response.body).toHaveLength(2)
            expect(response.body[0].name).toBe(tenanaData[0].name)
            expect(response.body[0].address).toBe(tenanaData[0].address)
        })
    })
})
