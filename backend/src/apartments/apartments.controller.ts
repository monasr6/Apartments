import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
  HttpStatus,
  HttpException,
  Delete,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { ApartmentsService } from './apartments.service';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { SearchApartmentDto } from './dto/search-apartment.dto';
import { UpdateApartmentDto } from './dto/update-apartment.dto';
import { PaginationDto } from './dto/pagination.dto';
import { PaginatedApartmentsDto } from './dto/paginated-apartments.dto';
import { ApartmentStatsDto } from './dto/apartment-stats.dto';

@ApiTags('Apartments')
@Controller('apartments')
export class ApartmentsController {
  constructor(private readonly apartmentsService: ApartmentsService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get apartments with pagination and filters',
    description: 'Retrieve a paginated list of apartments with optional search and filtering capabilities. Supports full-text search, price range filters, room filters, and more.'
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: Number, 
    description: 'Page number (starting from 1)', 
    example: 1 
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Number of items per page (max 100)', 
    example: 10 
  })
  @ApiQuery({ 
    name: 'search', 
    required: false, 
    type: String, 
    description: 'Search in unit name, unit number, project, or description', 
    example: 'luxury marina' 
  })
  @ApiQuery({ 
    name: 'project', 
    required: false, 
    type: String, 
    description: 'Filter by project name', 
    example: 'Marina Heights' 
  })
  @ApiQuery({ 
    name: 'minPrice', 
    required: false, 
    type: Number, 
    description: 'Minimum price filter', 
    example: 1000 
  })
  @ApiQuery({ 
    name: 'maxPrice', 
    required: false, 
    type: Number, 
    description: 'Maximum price filter', 
    example: 5000 
  })
  @ApiQuery({ 
    name: 'bedrooms', 
    required: false, 
    type: Number, 
    description: 'Number of bedrooms', 
    example: 2 
  })
  @ApiQuery({ 
    name: 'bathrooms', 
    required: false, 
    type: Number, 
    description: 'Number of bathrooms', 
    example: 1 
  })
  @ApiQuery({ 
    name: 'sortBy', 
    required: false, 
    enum: ['price', 'createdAt', 'area', 'bedrooms'], 
    description: 'Sort by field', 
    example: 'price' 
  })
  @ApiQuery({ 
    name: 'sortOrder', 
    required: false, 
    enum: ['ASC', 'DESC'], 
    description: 'Sort order', 
    example: 'ASC' 
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved apartments',
    type: PaginatedApartmentsDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async findAll(
    @Query(ValidationPipe) searchDto: SearchApartmentDto,
    @Query(ValidationPipe) paginationDto: PaginationDto,
  ): Promise<PaginatedApartmentsDto> {
    try {
      const result = await this.apartmentsService.findAllPaginated(
        searchDto,
        paginationDto,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        {
          message: 'Failed to fetch apartments',
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get apartment statistics',
    description: 'Retrieve analytics and statistics about apartments including price distribution, availability counts, and project summaries.'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved apartment statistics',
    type: ApartmentStatsDto,
  })
  async getStats(): Promise<ApartmentStatsDto> {
    try {
      return await this.apartmentsService.getStatistics();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch apartment statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('filters')
  @ApiOperation({
    summary: 'Get filter options',
    description: 'Retrieve unique values for filter dropdowns including projects, locations, and price ranges.'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved filter options',
    schema: {
      type: 'object',
      properties: {
        projects: { type: 'array', items: { type: 'string' } },
        locations: { type: 'array', items: { type: 'string' } },
        priceRange: { 
          type: 'object',
          properties: {
            min: { type: 'number' },
            max: { type: 'number' }
          }
        },
        bedroomOptions: { type: 'array', items: { type: 'number' } },
        bathroomOptions: { type: 'array', items: { type: 'number' } }
      }
    }
  })
  async getFilterOptions() {
    try {
      return await this.apartmentsService.getFilterOptions();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch filter options',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get apartment by ID',
    description: 'Retrieve detailed information about a specific apartment including all amenities, images, and related data.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Apartment ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved apartment',
  })
  @ApiResponse({
    status: 404,
    description: 'Apartment not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid apartment ID',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const apartment = await this.apartmentsService.findOneWithDetails(id);
      if (!apartment) {
        throw new HttpException(
          {
            message: 'Apartment not found',
            error: 'NOT_FOUND',
            timestamp: new Date().toISOString(),
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Increment view count for analytics
      await this.apartmentsService.incrementViewCount(id);

      return {
        ...apartment,
        viewCount: apartment.viewCount || 0,
        similarApartments: await this.apartmentsService.findSimilar(id, 3),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          message: 'Failed to fetch apartment',
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Create new apartment',
    description: 'Add a new apartment listing to the database with full validation and automatic slug generation.'
  })
  @ApiBody({
    type: CreateApartmentDto,
    description: 'Apartment data',
    examples: {
      luxury_studio: {
        summary: 'Luxury Studio Example',
        value: {
          unitName: 'Luxury Studio A1',
          unitNumber: 'A1-001',
          project: 'Marina Heights',
          description: 'Modern studio apartment with stunning marina views and high-end finishes',
          price: 1200.00,
          bedrooms: 1,
          bathrooms: 1,
          area: 45.5,
          location: 'Downtown Marina District',
          images: [
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
            'https://images.unsplash.com/photo-1560185007-5f0bb1866cab'
          ],
          amenities: ['Pool', 'Gym', 'Parking', 'Security', '24/7 Concierge'],
          isAvailable: true
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Apartment created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 409,
    description: 'Apartment with unit number already exists',
  })
  async create(
    @Body(ValidationPipe) createApartmentDto: CreateApartmentDto,
  ){
    try {
      const apartment = await this.apartmentsService.create(createApartmentDto);
      return {
        ...apartment,
        message: 'Apartment created successfully',
      };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY' || error.code === '23000') {
        throw new HttpException(
          {
            message: 'Apartment with this unit number already exists',
            error: 'DUPLICATE_UNIT_NUMBER',
            timestamp: new Date().toISOString(),
          },
          HttpStatus.CONFLICT,
        );
      }
      throw new HttpException(
        {
          message: 'Failed to create apartment',
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update an existing apartment
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Update apartment',
    description: 'Update an existing apartment listing with partial data.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Apartment ID',
    example: 1,
  })
  @ApiBody({
    type: UpdateApartmentDto,
    description: 'Partial apartment data to update',
  })
  @ApiResponse({
    status: 200,
    description: 'Apartment updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Apartment not found',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateApartmentDto: UpdateApartmentDto,
  ){
    try {
      const apartment = await this.apartmentsService.update(id, updateApartmentDto);
      if (!apartment) {
        throw new HttpException('Apartment not found', HttpStatus.NOT_FOUND);
      }
      return {
        ...apartment,
        message: 'Apartment updated successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update apartment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  @Delete(':id')
  @ApiOperation({
    summary: 'Delete apartment',
    description: 'Soft delete an apartment by marking it as unavailable.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Apartment ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Apartment deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        deletedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Apartment not found',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      const result = await this.apartmentsService.softDelete(id);
      if (!result) {
        throw new HttpException('Apartment not found', HttpStatus.NOT_FOUND);
      }
      return {
        message: 'Apartment deleted successfully',
        deletedAt: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete apartment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get apartments by project
   */
  @Get('project/:projectName')
  @ApiOperation({
    summary: 'Get apartments by project',
    description: 'Retrieve all apartments belonging to a specific project.'
  })
  @ApiParam({
    name: 'projectName',
    type: 'string',
    description: 'Project name',
    example: 'Marina Heights',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved apartments for project',
  })
  async findByProject(@Param('projectName') projectName: string) {
    try {
      return await this.apartmentsService.findByProject(projectName);
    } catch (error) {
      throw new HttpException(
        'Failed to fetch apartments for project',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get featured/recommended apartments
   */
  @Get('featured/recommendations')
  @ApiOperation({
    summary: 'Get featured apartments',
    description: 'Retrieve a curated list of featured apartments based on popularity, ratings, and availability.'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of featured apartments to return',
    example: 6,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved featured apartments',
  })
  async getFeatured(@Query('limit', new ParseIntPipe({ optional: true })) limit = 6) {
    try {
      return await this.apartmentsService.getFeaturedApartments(limit);
    } catch (error) {
      throw new HttpException(
        'Failed to fetch featured apartments',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Health check endpoint for monitoring
   */
  @Get('health/status')
  @ApiExcludeEndpoint() // Exclude from Swagger docs
  async healthCheck() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'apartments-api',
      version: '1.0.0',
    };
  }
}