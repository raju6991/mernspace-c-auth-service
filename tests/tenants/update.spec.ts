import createJWKSMock from 'mock-jwks'
import { DataSource } from 'typeorm'
import request from 'supertest'
import { AppDataSource } from '../../src/config/data-source'
import { Roles } from '../../src/constants'
import { Tenant } from '../../src/entity/Tenant'
import app from '../../src/app'

describe('PATCH /tenants', () => {
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
        it('should update the tenant name and address', async () => {
            //Arrange
            const tenantRepository = connection.getRepository(Tenant)
            const tenant = await tenantRepository.save({
                name: 'Old Tenant Name',
                address: 'Old Tenant Address',
            })
            const updatedData = {
                name: 'New Tenant Name',
                address: 'New Tenant Address',
            }

            //Act
            const response = await request(app)
                .patch(`/tenants/${tenant.id}`)
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(updatedData)
            //Assert
            expect(response.statusCode).toBe(200)
            const updatedTenant = await tenantRepository.findOneBy({
                id: tenant.id,
            })
            expect(updatedTenant?.name).toBe(updatedData.name)
            expect(updatedTenant?.address).toBe(updatedData.address)
        })

        it('should return 403 if a non-admin tries to update', async () => {
            const managerToken = jwks.token({
                sub: '1',
                role: Roles.MANAGER,
            })

            const response = await request(app)
                .patch('/tenants/9999')
                .set('Cookie', [`accessToken=${managerToken}`])
                .send({ name: 'Tenant Name' })
            expect(response.statusCode).toBe(403)
        })
    })
})
