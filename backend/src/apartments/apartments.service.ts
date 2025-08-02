import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { 
  Repository, 
  Like, 
  FindManyOptions, 
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
  Not,
  IsNull 
} from 'typeorm';
import { Apartment } from './entities/apartment.entity';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { UpdateApartmentDto } from './dto/update-apartment.dto';
import { SearchApartmentDto } from './dto/search-apartment.dto';
import { PaginationDto } from './dto/pagination.dto';
import { PaginatedApartmentsDto } from './dto/paginated-apartments.dto';
import { ApartmentStatsDto } from './dto/apartment-stats.dto';

@Injectable()
export class ApartmentsService {
  private readonly logger = new Logger(ApartmentsService.name);

  constructor(
    @InjectRepository(Apartment)
    private apartmentRepository: Repository<Apartment>,
  ) {}

  /**
   * Find all apartments with pagination, search, and filtering
   */
  async findAllPaginated(
    searchDto: SearchApartmentDto,
    paginationDto: PaginationDto,
  ): Promise<PaginatedApartmentsDto> {
    const { page = 1, limit = 10 } = paginationDto;
    const { 
      search, 
      project, 
      minPrice, 
      maxPrice, 
      bedrooms, 
      bathrooms, 
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = searchDto;

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build where conditions
    const whereConditions: any = { 
      isAvailable: true,
      deletedAt: IsNull() // Only get non-deleted apartments
    };

    // Advanced search across multiple fields
    if (search) {
      whereConditions.unitName = Like(`%${search}%`);
      // For more complex search, you could use raw queries with OR conditions
    }

    if (project) {
      whereConditions.project = Like(`%${project}%`);
    }

    // Price range filtering
    if (minPrice !== undefined && maxPrice !== undefined) {
      whereConditions.price = Between(minPrice, maxPrice);
    } else if (minPrice !== undefined) {
      whereConditions.price = MoreThanOrEqual(minPrice);
    } else if (maxPrice !== undefined) {
      whereConditions.price = LessThanOrEqual(maxPrice);
    }

    if (bedrooms !== undefined) {
      whereConditions.bedrooms = bedrooms;
    }

    if (bathrooms !== undefined) {
      whereConditions.bathrooms = bathrooms;
    }

    // Build order options
    const orderOptions: any = {};
    orderOptions[sortBy] = sortOrder;

    // Execute query with pagination
    const [apartments, total] = await this.apartmentRepository.findAndCount({
      where: whereConditions,
      order: orderOptions,
      skip,
      take: limit,
      relations: ['reviews'], // If you add reviews later
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    this.logger.log(`Retrieved ${apartments.length} apartments (page ${page}/${totalPages})`);

    return {
      data: apartments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
      filters: {
        search,
        project,
        minPrice,
        maxPrice,
        bedrooms,
        bathrooms,
        sortBy,
        sortOrder,
      },
    };
  }

  /**
   * Find apartment by ID with additional details
   */
  async findOneWithDetails(id: number): Promise<Apartment | null> {
    return this.apartmentRepository.findOne({
      where: { 
        id, 
        isAvailable: true,
        deletedAt: IsNull()
      },
    });
  }

  /**
   * Legacy method for backward compatibility
   */
  async findOne(id: number): Promise<Apartment | null> {
    return this.findOneWithDetails(id);
  }

  /**
   * Create a new apartment with auto-generated slug
   */
  async create(createApartmentDto: CreateApartmentDto): Promise<Apartment> {
    const apartment = this.apartmentRepository.create({
      ...createApartmentDto,
      slug: this.generateSlug(createApartmentDto.unitName, createApartmentDto.unitNumber),
      viewCount: 0,
    });
    
    const savedApartment = await this.apartmentRepository.save(apartment);
    this.logger.log(`Created new apartment: ${savedApartment.unitName} (ID: ${savedApartment.id})`);
    
    return savedApartment;
  }

  /**
   * Update an existing apartment
   */
  async update(id: number, updateApartmentDto: UpdateApartmentDto): Promise<Apartment | null> {
    await this.apartmentRepository.update(id, {
      ...updateApartmentDto,
      updatedAt: new Date(),
    });
    
    const updatedApartment = await this.findOneWithDetails(id);
    if (updatedApartment) {
      this.logger.log(`Updated apartment: ${updatedApartment.unitName} (ID: ${id})`);
    }
    
    return updatedApartment;
  }

  /**
   * Soft delete an apartment
   */
  async softDelete(id: number): Promise<boolean> {
    const apartment = await this.findOneWithDetails(id);
    if (!apartment) {
      return false;
    }

    await this.apartmentRepository.update(id, {
      isAvailable: false,
      deletedAt: new Date(),
    });

    this.logger.log(`Soft deleted apartment: ${apartment.unitName} (ID: ${id})`);
    return true;
  }

  /**
   * Find apartments by project
   */
  async findByProject(projectName: string): Promise<Apartment[]> {
    return this.apartmentRepository.find({
      where: { 
        project: Like(`%${projectName}%`),
        isAvailable: true,
        deletedAt: IsNull()
      },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get featured apartments based on view count and recency
   */
  async getFeaturedApartments(limit: number = 6): Promise<Apartment[]> {
    return this.apartmentRepository.find({
      where: { 
        isAvailable: true,
        deletedAt: IsNull()
      },
      order: { 
        viewCount: 'DESC',
        createdAt: 'DESC' 
      },
      take: limit,
    });
  }

  /**
   * Find similar apartments based on price range and bedrooms
   */
  async findSimilar(apartmentId: number, limit: number = 3): Promise<Apartment[]> {
    const apartment = await this.findOneWithDetails(apartmentId);
    if (!apartment) return [];

    const priceRange = apartment.price * 0.2; // 20% price range
    
    return this.apartmentRepository.find({
      where: {
        id: Not(apartmentId),
        bedrooms: apartment.bedrooms,
        price: Between(apartment.price - priceRange, apartment.price + priceRange),
        isAvailable: true,
        deletedAt: IsNull()
      },
      order: { viewCount: 'DESC' },
      take: limit,
    });
  }

  /**
   * Increment view count for analytics
   */
  async incrementViewCount(id: number): Promise<void> {
    await this.apartmentRepository.increment({ id }, 'viewCount', 1);
  }

  /**
   * Get apartment statistics and analytics
   */
  async getStatistics(): Promise<ApartmentStatsDto> {
    const [
      totalApartments,
      availableApartments,
      averagePrice,
      priceRange,
      projectStats,
      bedroomStats
    ] = await Promise.all([
      this.apartmentRepository.count({ where: { deletedAt: IsNull() } }),
      this.apartmentRepository.count({ where: { isAvailable: true, deletedAt: IsNull() } }),
      this.apartmentRepository
        .createQueryBuilder('apartment')
        .select('AVG(apartment.price)', 'avg')
        .where('apartment.isAvailable = :available', { available: true })
        .andWhere('apartment.deletedAt IS NULL')
        .getRawOne(),
      this.apartmentRepository
        .createQueryBuilder('apartment')
        .select('MIN(apartment.price)', 'min')
        .addSelect('MAX(apartment.price)', 'max')
        .where('apartment.isAvailable = :available', { available: true })
        .andWhere('apartment.deletedAt IS NULL')
        .getRawOne(),
      this.apartmentRepository
        .createQueryBuilder('apartment')
        .select('apartment.project', 'project')
        .addSelect('COUNT(*)', 'count')
        .addSelect('AVG(apartment.price)', 'avgPrice')
        .where('apartment.isAvailable = :available', { available: true })
        .andWhere('apartment.deletedAt IS NULL')
        .groupBy('apartment.project')
        .orderBy('count', 'DESC')
        .getRawMany(),
      this.apartmentRepository
        .createQueryBuilder('apartment')
        .select('apartment.bedrooms', 'bedrooms')
        .addSelect('COUNT(*)', 'count')
        .where('apartment.isAvailable = :available', { available: true })
        .andWhere('apartment.deletedAt IS NULL')
        .groupBy('apartment.bedrooms')
        .orderBy('apartment.bedrooms', 'ASC')
        .getRawMany(),
    ]);

    return {
      totalApartments,
      availableApartments,
      unavailableApartments: totalApartments - availableApartments,
      averagePrice: parseFloat(averagePrice?.avg || '0'),
      priceRange: {
        min: parseFloat(priceRange?.min || '0'),
        max: parseFloat(priceRange?.max || '0'),
      },
      projectStats: projectStats.map(stat => ({
        project: stat.project,
        count: parseInt(stat.count),
        averagePrice: parseFloat(stat.avgPrice),
      })),
      bedroomDistribution: bedroomStats.map(stat => ({
        bedrooms: parseInt(stat.bedrooms),
        count: parseInt(stat.count),
      })),
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Get filter options for frontend dropdowns
   */
  async getFilterOptions() {
    const [projects, locations, priceRange, bedroomOptions, bathroomOptions] = await Promise.all([
      this.apartmentRepository
        .createQueryBuilder('apartment')
        .select('DISTINCT apartment.project', 'project')
        .where('apartment.isAvailable = :available', { available: true })
        .andWhere('apartment.deletedAt IS NULL')
        .andWhere('apartment.project IS NOT NULL')
        .orderBy('apartment.project', 'ASC')
        .getRawMany(),
      this.apartmentRepository
        .createQueryBuilder('apartment')
        .select('DISTINCT apartment.location', 'location')
        .where('apartment.isAvailable = :available', { available: true })
        .andWhere('apartment.deletedAt IS NULL')
        .andWhere('apartment.location IS NOT NULL')
        .orderBy('apartment.location', 'ASC')
        .getRawMany(),
      this.apartmentRepository
        .createQueryBuilder('apartment')
        .select('MIN(apartment.price)', 'min')
        .addSelect('MAX(apartment.price)', 'max')
        .where('apartment.isAvailable = :available', { available: true })
        .andWhere('apartment.deletedAt IS NULL')
        .getRawOne(),
      this.apartmentRepository
        .createQueryBuilder('apartment')
        .select('DISTINCT apartment.bedrooms', 'bedrooms')
        .where('apartment.isAvailable = :available', { available: true })
        .andWhere('apartment.deletedAt IS NULL')
        .orderBy('apartment.bedrooms', 'ASC')
        .getRawMany(),
      this.apartmentRepository
        .createQueryBuilder('apartment')
        .select('DISTINCT apartment.bathrooms', 'bathrooms')
        .where('apartment.isAvailable = :available', { available: true })
        .andWhere('apartment.deletedAt IS NULL')
        .orderBy('apartment.bathrooms', 'ASC')
        .getRawMany(),
    ]);

    return {
      projects: projects.map(p => p.project).filter(Boolean),
      locations: locations.map(l => l.location).filter(Boolean),
      priceRange: {
        min: parseFloat(priceRange?.min || '0'),
        max: parseFloat(priceRange?.max || '0'),
      },
      bedroomOptions: bedroomOptions.map(b => parseInt(b.bedrooms)).filter(b => !isNaN(b)),
      bathroomOptions: bathroomOptions.map(b => parseInt(b.bathrooms)).filter(b => !isNaN(b)),
    };
  }

  /**
   * Generate URL-friendly slug from unit name and number
   */
  private generateSlug(unitName: string, unitNumber: string): string {
    const combined = `${unitName}-${unitNumber}`;
    return combined
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  /**
   * Seed database with sample data (enhanced version)
   */
  async seedDatabase(): Promise<void> {
    const existingCount = await this.apartmentRepository.count();
    if (existingCount > 0) {
      this.logger.log('Database already seeded, skipping...');
      return;
    }

    const sampleApartments = [
      {
        unitName: 'Luxury Studio A1',
        unitNumber: 'A1-001',
        project: 'Marina Heights',
        description: 'Modern studio apartment with stunning marina views, floor-to-ceiling windows, and premium finishes throughout.',
        price: 1200.00,
        bedrooms: 1,
        bathrooms: 1,
        area: 45.5,
        location: 'Downtown Marina District',
        images: [
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
          'https://images.unsplash.com/photo-1560185007-5f0bb1866cab?w=800',
          'https://images.unsplash.com/photo-1560185009-5bf9f2849488?w=800'
        ],
        amenities: ['Pool', 'Gym', 'Parking', 'Security', '24/7 Concierge', 'Rooftop Terrace'],
        isAvailable: true,
        viewCount: 45,
      },
      {
        unitName: 'Executive Suite B2',
        unitNumber: 'B2-105',
        project: 'Garden Residences',
        description: 'Spacious family apartment with private garden access, modern kitchen, and luxury amenities.',
        price: 2500.00,
        bedrooms: 3,
        bathrooms: 2,
        area: 120.0,
        location: 'Green Valley',
        images: [
          'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800',
          'https://images.unsplash.com/photo-1556020689-f83fd73b6a0e?w=800',
          'https://images.unsplash.com/photo-1556020700-c4df7b062c2a?w=800'
        ],
        amenities: ['Garden', 'Playground', 'Parking', 'Storage', 'Pet-Friendly', 'Balcony'],
        isAvailable: true,
        viewCount: 32,
      },
      {
        unitName: 'Penthouse Premium',
        unitNumber: 'P1-001',
        project: 'Sky Tower',
        description: 'Luxurious penthouse with panoramic city views, private elevator access, and premium amenities.',
        price: 4500.00,
        bedrooms: 4,
        bathrooms: 3,
        area: 200.0,
        location: 'City Center',
        images: [
          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
          'https://images.unsplash.com/photo-1545324418-5d2d1e1b1e90?w=800'
        ],
        amenities: ['Private Elevator', 'Roof Garden', 'Wine Cellar', 'Home Theater', 'Spa', 'Valet Parking'],
        isAvailable: true,
        viewCount: 78,
      },
      {
        unitName: 'Cozy One Bedroom',
        unitNumber: 'C1-204',
        project: 'Urban Living',
        description: 'Perfect starter apartment with modern amenities and great location near public transportation.',
        price: 950.00,
        bedrooms: 1,
        bathrooms: 1,
        area: 55.0,
        location: 'Midtown',
        images: [
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
          'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800'
        ],
        amenities: ['Laundry', 'Fitness Center', 'Parking', 'High-Speed Internet'],
        isAvailable: true,
        viewCount: 23,
      },
      {
        unitName: 'Family Haven',
        unitNumber: 'F2-301',
        project: 'Sunset Gardens',
        description: 'Spacious two-bedroom apartment perfect for small families, featuring an open floor plan and modern kitchen.',
        price: 1800.00,
        bedrooms: 2,
        bathrooms: 2,
        area: 85.0,
        location: 'Suburban District',
        images: [
          'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
          'https://images.unsplash.com/photo-1493809842364-78817add7ff1?w=800'
        ],
        amenities: ['Playground', 'Pool', 'BBQ Area', 'Parking', 'Storage', 'Pet Park'],
        isAvailable: true,
        viewCount: 19,
      }
    ];

    for (const apartmentData of sampleApartments) {
      const apartment = this.apartmentRepository.create({
        ...apartmentData,
        slug: this.generateSlug(apartmentData.unitName, apartmentData.unitNumber),
      });
      await this.apartmentRepository.save(apartment);
    }

    this.logger.log(`Seeded database with ${sampleApartments.length} sample apartments`);
  }
}