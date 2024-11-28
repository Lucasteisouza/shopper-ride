import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Driver {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column('text', { nullable: true })
    description: string;

    @Column()
    vehicle: string;

    @Column('decimal', { precision: 10, scale: 2 })
    ratePerKm: number;

    @Column('int')
    minDistance: number;

    @Column('decimal', { precision: 3, scale: 1, nullable: true })
    rating: number;

    @Column('text', { nullable: true })
    reviewComment: string;
}
