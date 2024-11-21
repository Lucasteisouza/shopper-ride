import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Driver {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column('text')
    description: string;

    @Column()
    vehicle: string;

    @Column('decimal')
    ratePerKm: number;

    @Column('int')
    minDistance: number;

    @Column('decimal')
    rating: number;

    @Column('text')
    reviewComment: string;
}
