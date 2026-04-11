import { error } from 'node:console'
import { DataSource, Repository } from 'typeorm'
import { Tenant } from '../../src/entity/Tenant'

export const truncateTables = async (connection: DataSource) => {
    const queryRunner = connection.createQueryRunner()
    await queryRunner.connect()

    try {
        await queryRunner.query('SET session_replication_role = replica')

        const entities = connection.entityMetadatas.filter(
            (entity) => entity.name !== 'migrations',
        )

        for (const entity of entities) {
            try {
                await queryRunner.query(
                    `TRUNCATE TABLE "${entity.tableName}" RESTART IDENTITY CASCADE`,
                )
            } catch (err) {
                console.log('Error truncating tables:', error)
                throw err
            }
        }

        await queryRunner.query('SET session_replication_role = DEFAULT')
    } finally {
        await queryRunner.release()
    }
}

export const turncateTables = async (connection: DataSource) => {
    const entities = connection.entityMetadatas

    for (const entity of entities) {
        const repository = connection.getRepository(entity.name)
        await repository.clear()
    }
}

export const isJwt = (token: string | null): boolean => {
    if (token === null) return false
    const parts = token.split('.')
    if (parts.length !== 3) {
        return false
    }

    try {
        parts.forEach((part) => {
            Buffer.from(part, 'base64').toString('utf-8')
        })
        return true
    } catch {
        return false
    }
}

export const createTenant = async (repository: Repository<Tenant>) => {
    const tenant = await repository.save({
        name: 'Test tenant',
        address: 'Test address',
    })
    return tenant
}
