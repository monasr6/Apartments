import { ApiProperty } from '@nestjs/swagger';

export class ProjectStatsDto {
  @ApiProperty({ description: 'Project name', example: 'Marina Heights' })
  project: string;

  @ApiProperty({ description: 'Number of apartments in project', example: 25 })
  count: number;

  @ApiProperty({ description: 'Average price in project', example: 1850.50 })
  averagePrice: number;
}

export class BedroomDistributionDto {
  @ApiProperty({ description: 'Number of bedrooms', example: 2 })
  bedrooms: number;

  @ApiProperty({ description: 'Count of apartments with this bedroom count', example: 45 })
  count: number;
}

export class PriceRangeDto {
  @ApiProperty({ description: 'Minimum price', example: 850 })
  min: number;

  @ApiProperty({ description: 'Maximum price', example: 8500 })
  max: number;
}

export class ApartmentStatsDto {
  @ApiProperty({ description: 'Total number of apartments', example: 150 })
  totalApartments: number;

  @ApiProperty({ description: 'Number of available apartments', example: 120 })
  availableApartments: number;

  @ApiProperty({ description: 'Number of unavailable apartments', example: 30 })
  unavailableApartments: number;

  @ApiProperty({ description: 'Average apartment price', example: 2150.75 })
  averagePrice: number;

  @ApiProperty({ 
    description: 'Price range across all apartments',
    type: PriceRangeDto,
  })
  priceRange: PriceRangeDto;

  @ApiProperty({ 
    description: 'Statistics by project',
    type: [ProjectStatsDto],
  })
  projectStats: ProjectStatsDto[];

  @ApiProperty({ 
    description: 'Distribution of apartments by bedroom count',
    type: [BedroomDistributionDto],
  })
  bedroomDistribution: BedroomDistributionDto[];

  @ApiProperty({ description: 'Last statistics update timestamp' })
  lastUpdated: string;
}