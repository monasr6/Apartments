import { ApiProperty } from '@nestjs/swagger';
import { Apartment } from '../entities/apartment.entity';

export class PaginationMetaDto {
  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total number of items', example: 150 })
  total: number;

  @ApiProperty({ description: 'Total number of pages', example: 15 })
  totalPages: number;

  @ApiProperty({ description: 'Has next page', example: true })
  hasNext: boolean;

  @ApiProperty({ description: 'Has previous page', example: false })
  hasPrev: boolean;
}

export class FiltersAppliedDto {
  @ApiProperty({ description: 'Search term used', required: false })
  search?: string;

  @ApiProperty({ description: 'Project filter applied', required: false })
  project?: string;

  @ApiProperty({ description: 'Minimum price filter', required: false })
  minPrice?: number;

  @ApiProperty({ description: 'Maximum price filter', required: false })
  maxPrice?: number;

  @ApiProperty({ description: 'Bedrooms filter', required: false })
  bedrooms?: number;

  @ApiProperty({ description: 'Bathrooms filter', required: false })
  bathrooms?: number;
}

export class PaginatedApartmentsDto {
  @ApiProperty({ 
    description: 'Array of apartments',
    type: [Apartment],
  })
  data: Apartment[];

  @ApiProperty({ 
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  pagination: PaginationMetaDto;

  @ApiProperty({ 
    description: 'Applied filters',
    type: FiltersAppliedDto,
  })
  filters: FiltersAppliedDto;
}
