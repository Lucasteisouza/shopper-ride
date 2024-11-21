import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Driver } from './Driver';

@Entity()
export class Ride {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    customerId: string;

    @Column()
    origin: string;

    @Column()
    destination: string;

    @Column('decimal')
    distance: number;

    @Column()
    duration: string;

    @Column('decimal')
    value: number;

    @ManyToOne(() => Driver)
    driver: Driver;

    @CreateDateColumn()
    createdAt: Date;

    @Column('decimal')
    originLat: number;

    @Column('decimal')
    originLng: number;

    @Column('decimal')
    destinationLat: number;

    @Column('decimal')
    destinationLng: number;

    @Column({ default: 'active' })
    status: string;
}
