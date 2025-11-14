import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('transcripts')
export class Transcript {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  meetingId: string;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  speaker: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @Column({ type: 'float', nullable: true })
  confidence: number;

  @Column({ type: 'varchar', length: 10, default: 'vi' })
  language: string;

  @CreateDateColumn()
  createdAt: Date;
}
