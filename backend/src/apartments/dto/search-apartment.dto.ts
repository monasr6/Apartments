import { IsString, IsOptional, IsNumber, Min, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchApartmentDto {
  @ApiPropertyOptional({
    description: 'Search text for unit name, unit number, project, or description',
    example: 'luxury marina',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by project name',
    example: 'Marina Heights',
  })
  @IsString()
  @IsOptional()
  project?: string;

  @ApiPropertyOptional({
    description: 'Filter by location',
    example: 'Downtown',
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({
    description: 'Minimum price filter',
    minimum: 0,
    example: 1000,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum price filter',
    minimum: 0,
    example: 5000,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Number of bedrooms',
    minimum: 0,
    example: 2,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  bedrooms?: number;

  @ApiPropertyOptional({
    description: 'Number of bathrooms',
    minimum: 0,
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  bathrooms?: number;

  @ApiPropertyOptional({
    description: 'Minimum area in square meters',
    minimum: 0,
    example: 50,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  minArea?: number;

  @ApiPropertyOptional({
    description: 'Maximum area in square meters',
    minimum: 0,
    example: 200,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  maxArea?: number;

  @ApiPropertyOptional({
    description: 'Apartment type filter',
    enum: ['Studio', 'Apartment', 'Penthouse', 'Duplex', 'Loft'],
    example: 'Studio',
  })
  @IsOptional()
  @IsEnum(['Studio', 'Apartment', 'Penthouse', 'Duplex', 'Loft'])
  type?: string;

  @ApiPropertyOptional({
    description: 'Furnishing status filter',
    enum: ['Unfurnished', 'Semi-Furnished', 'Fully Furnished'],
    example: 'Fully Furnished',
  })
  @IsOptional()
  @IsEnum(['Unfurnished', 'Semi-Furnished', 'Fully Furnished'])
  furnishing?: string;

  @ApiPropertyOptional({
    description: 'Pet-friendly filter',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  petFriendly?: boolean;

}
