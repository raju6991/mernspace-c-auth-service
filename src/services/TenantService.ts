import { Repository } from 'typeorm'
import { ITenant, TenantQueryParams } from '../types'
import { Tenant } from '../entity/Tenant'

export class TenantService {
    constructor(private readonly tenantRepository: Repository<Tenant>) {}
    async create(tenantData: ITenant) {
        return await this.tenantRepository.save(tenantData)
    }

    async getAll(validatedQuery: TenantQueryParams) {
        const result = await this.tenantRepository.find({
            skip: (validatedQuery.currentPage - 1) * validatedQuery.perPage,
            take: validatedQuery.perPage,
            order: { id: 'ASC' },
        })
        const count = await this.tenantRepository.count()
        return [result, count]
    }

    async getById(tenantId: number) {
        return await this.tenantRepository.findOne({ where: { id: tenantId } })
    }

    async update(tenantId: number, tenantData: Partial<ITenant>) {
        return await this.tenantRepository.update(tenantId, tenantData)
    }

    async delete(tenantId: number) {
        return await this.tenantRepository.delete(tenantId)
    }
}
