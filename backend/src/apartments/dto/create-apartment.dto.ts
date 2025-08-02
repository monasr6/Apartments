import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsBoolean,
  Min,
  Max,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateApartmentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  unitName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  unitNumber: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  project: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  price: number;

  @IsNumber()
  @Min(0)
  @Max(10)
  @Transform(({ value }) => parseInt(value))
  bedrooms: number;

  @IsNumber()
  @Min(0)
  @Max(10)
  @Transform(({ value }) => parseInt(value))
  bathrooms: number;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  area: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  location?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isAvailable?: boolean = true;
}