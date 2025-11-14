import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('meetings')
export class Meeting {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  hostName: string;

  @Column({ type: 'varchar', length: 20, default: 'scheduled' })
  status: string; // scheduled, active, ended

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  startTime: Date;

  @Column({ type: 'datetime', nullable: true })
  endTime: Date;

  @Column({ type: 'json', nullable: true })
  participants: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  settings: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
