import { DataSource } from 'typeorm'

export const turncateTables = async (connection: DataSource) => {
    const entities = connection.entityMetadatas

    for (const entity of entities) {
        const repository = connection.getRepository(entity.name)
        await repository.clear()
    }
}
