import request from 'supertest'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'

import app from '../../src/app'
import createJWKSMock from 'mock-jwks'
import { Tenant } from '../../src/entity/Tenant'
import { truncateTables } from '../utils'

describe('POST /tenants', () => {
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

    describe('Given all fields', () => {
        it('should return a 201 status code', async () => {
            const tenantData = {
                name: 'Tenant Name',
                address: 'Tenant Address',
            }

            const response = await request(app)
                .post('/tenants')
                .send(tenantData)
            expect(response.statusCode).toBe(201)
        })

        it('should create a tenant in the database', async () => {
            const tenantData = {
                name: 'Tenant Name',
                address: 'Tenant Address',
            }

            await request(app).post('/tenants').send(tenantData)
            const tenantRepository = connection.getRepository(Tenant)
            const tenants = await tenantRepository.find()
            expect(tenants).toHaveLength(1)
            expect(tenants[0].name).toBe(tenantData.name)
            expect(tenants[0].address).toBe(tenantData.address)
        })
    })
})
