import createJWKSMock from 'mock-jwks'
import { DataSource } from 'typeorm'
import request from 'supertest'
import { AppDataSource } from '../../src/config/data-source'
import { Roles } from '../../src/constants'
import { Tenant } from '../../src/entity/Tenant'
import app from '../../src/app'

describe('DELETE /tenants', () => {
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
        it('should delete the tenant', async () => {
            const tenantRepository = connection.getRepository(Tenant)
            const tenant = await tenantRepository.save({
                name: 'Tenant Name',
                address: 'Tenant Address',
            })

            const response = await request(app)
                .delete(`/tenants/${tenant.id}`)
                .set('Cookie', [`accessToken=${adminToken}`])

            expect(response.statusCode).toBe(200)

            const deletedTenant = await tenantRepository.findOneBy({
                id: tenant.id,
            })
            expect(deletedTenant).toBeNull()
        })

        it('should return 403 if a non-admin tries to delete', async () => {
            const managerToken = jwks.token({
                sub: '1',
                role: Roles.MANAGER,
            })

            const response = await request(app)
                .delete('/tenants/9999')
                .set('Cookie', [`accessToken=${managerToken}`])
            expect(response.statusCode).toBe(403)
        })
    })
})
