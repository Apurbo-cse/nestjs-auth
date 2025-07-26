import { Inject, Injectable } from '@nestjs/common';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { FindOptionsWhere, ObjectLiteral, Repository } from 'typeorm';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { Paginated } from './paginate.interface';

@Injectable()
export class PaginationProvider {
    constructor(@Inject(REQUEST) private readonly request: Request) { }

    async paginateQuery<T extends ObjectLiteral>(
        paginationQueryDto: PaginationQueryDto,
        repository: Repository<T>,
        where?: FindOptionsWhere<T>,
        relations?: string[]
    ): Promise<Paginated<T>> {
        const page = paginationQueryDto.page ?? 1;
        const limit = paginationQueryDto.limit ?? 10;

        const [data, totalItems] = await repository.findAndCount({
            where,
            relations,
            skip: (page - 1) * limit,
            take: limit,
        });

        const totalPages = Math.ceil(totalItems / limit);
        const baseUrl = `${this.request.protocol}://${this.request.get('host')}${this.request.path}`;

        return {
            data,
            meta: {
                itemsPerPage: limit,
                totalItems,
                currentPage: page,
                totalPages,
            },
            links: {
                first: `${baseUrl}?page=1&limit=${limit}`,
                last: `${baseUrl}?page=${totalPages}&limit=${limit}`,
                current: `${baseUrl}?page=${page}&limit=${limit}`,
                next: page < totalPages ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null,
                previous: page > 1 ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null,
            },
        };
    }
}
