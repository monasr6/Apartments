import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  Index,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('apartments')
@Index(['project', 'isAvailable']) // Composite index for better query performance
@Index(['price', 'bedrooms', 'isAvailable']) // Index for price and bedroom filters
@Index(['unitNumber'], { unique: true }) // Unique index for unit numbers
export class Apartment {
  @ApiProperty({ 
    description: 'Unique identifier for the apartment',
    example: 1 
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ 
    description: 'Display name of the apartment unit',
    example: 'Luxury Studio A1',
    maxLength: 255 
  })
  @Column({ length: 255 })
  @Index() // Index for search functionality
  unitName: string;

  @ApiProperty({ 
    description: 'Unique unit number within the project',
    example: 'A1-001',
    maxLength: 100 
  })
  @Column({ length: 100, unique: true })
  unitNumber: string;

  @ApiProperty({ 
    description: 'Project or building name',
    example: 'Marina Heights',
    maxLength: 255 
  })
  @Column({ length: 255 })
  @Index() // Index for project filtering
  project: string;

  @ApiProperty({ 
    description: 'Detailed description of the apartment',
    example: 'Modern studio apartment with stunning marina views',
    required: false 
  })
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty({ 
    description: 'Monthly rent price in USD',
    example: 1200.00,
    type: 'number',
    format: 'decimal' 
  })
  @Column('decimal', { precision: 10, scale: 2 })
  @Index() // Index for price filtering
  price: number;

  @ApiProperty({ 
    description: 'Number of bedrooms',
    example: 1,
    minimum: 0,
    maximum: 10 
  })
  @Column('int')
  @Index() // Index for bedroom filtering
  bedrooms: number;

  @ApiProperty({ 
    description: 'Number of bathrooms',
    example: 1,
    minimum: 0,
    maximum: 10 
  })
  @Column('int')
  @Index() // Index for bathroom filtering
  bathrooms: number;

  @ApiProperty({ 
    description: 'Total area in square meters',
    example: 45.5,
    type: 'number',
    format: 'decimal' 
  })
  @Column('decimal', { precision: 8, scale: 2 })
  area: number;

  @ApiProperty({ 
    description: 'Location or neighborhood',
    example: 'Downtown Marina District',
    required: false,
    maxLength: 255 
  })
  @Column({ length: 255, nullable: true })
  location: string;

  @ApiProperty({ 
    description: 'Array of image URLs',
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    type: [String],
    required: false 
  })
  @Column('json', { nullable: true })
  images: string[];

  @ApiProperty({ 
    description: 'List of apartment amenities',
    example: ['Pool', 'Gym', 'Parking', 'Security'],
    type: [String],
    required: false 
  })
  @Column('json', { nullable: true })
  amenities: string[];

  @ApiProperty({ 
    description: 'Whether the apartment is available for rent',
    example: true,
    default: true 
  })
  @Column({ default: true })
  @Index() // Index for availability filtering
  isAvailable: boolean;

  @ApiProperty({ 
    description: 'URL-friendly slug for SEO',
    example: 'luxury-studio-a1-a1-001',
    required: false 
  })
  @Column({ length: 300, nullable: true })
  @Index() // Index for slug-based lookups
  slug: string;

  @ApiProperty({ 
    description: 'Number of times this apartment has been viewed',
    example: 45,
    default: 0 
  })
  @Column('int', { default: 0 })
  viewCount: number;

  @ApiProperty({ 
    description: 'Featured status for highlighting special apartments',
    example: false,
    default: false 
  })
  @Column({ default: false })
  @Index() // Index for featured apartments
  isFeatured: boolean;

  @ApiProperty({ 
    description: 'Contact phone number for inquiries',
    example: '+1-555-0123',
    required: false 
  })
  @Column({ length: 20, nullable: true })
  contactPhone: string;

  @ApiProperty({ 
    description: 'Contact email for inquiries',
    example: 'contact@marinaheights.com',
    required: false 
  })
  @Column({ length: 255, nullable: true })
  contactEmail: string;

  @ApiProperty({ 
    description: 'Available from date',
    example: '2024-01-15',
    required: false 
  })
  @Column('date', { nullable: true })
  availableFrom: Date;

  @ApiProperty({ 
    description: 'Lease duration in months',
    example: 12,
    required: false 
  })
  @Column('int', { nullable: true })
  leaseDuration: number;

  @ApiProperty({ 
    description: 'Security deposit amount',
    example: 2400.00,
    required: false 
  })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  securityDeposit: number;

  @ApiProperty({ 
    description: 'When the apartment was created',
    example: '2024-01-01T00:00:00Z' 
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ 
    description: 'When the apartment was last updated',
    example: '2024-01-15T10:30:00Z' 
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ 
    description: 'When the apartment was deleted (soft delete)',
    example: null,
    required: false 
  })
  @Column('timestamp', { nullable: true })
  @Index() // Index for soft delete queries
  deletedAt: Date;

  // Hooks for automatic data processing
  @BeforeInsert()
  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }

  @BeforeInsert()
  setDefaults() {
    if (!this.viewCount) this.viewCount = 0;
    if (this.isFeatured === undefined) this.isFeatured = false;
    if (this.isAvailable === undefined) this.isAvailable = true;
  }

}