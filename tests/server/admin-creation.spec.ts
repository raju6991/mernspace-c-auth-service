import { DataSource } from 'typeorm'

import { AppDataSource } from '../../src/config/data-source'
import { Roles } from '../../src/constants'
import { User } from '../../src/entity/User'

describe('Admin User Creation', () => {
    let connection: DataSource

    beforeAll(async () => {
        connection = await AppDataSource.initialize()
    })

    beforeEach(async () => {
        await connection.dropDatabase()
        await connection.synchronize()
    })

    afterAll(async () => {
        await connection.destroy()
    })

    describe('createAdminUser', () => {
        it('should create an admin user if none exists', async () => {
            const userRepository = connection.getRepository(User)

            const adminExists = await userRepository.findOne({
                where: { role: Roles.ADMIN },
            })

            expect(adminExists).toBeNull()
        })

        it('should not create admin if admin already exists', async () => {
            const userRepository = connection.getRepository(User)

            await userRepository.save({
                firstName: 'Existing',
                lastName: 'Admin',
                email: 'admin@test.com',
                password: 'hashedpassword',
                role: Roles.ADMIN,
            })

            const adminCount = await userRepository.count({
                where: { role: Roles.ADMIN },
            })

            expect(adminCount).toBe(1)
        })
    })
})
