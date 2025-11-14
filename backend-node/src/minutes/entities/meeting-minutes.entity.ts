import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('meeting_minutes')
export class MeetingMinutes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  meetingId: string;

  @Column({ type: 'text' })
  summary: string;

  @Column({ type: 'json', nullable: true })
  keyPoints: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  actionItems: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  decisions: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  participants: Record<string, any>;

  @Column({ type: 'varchar', length: 500, nullable: true })
  filePath: string;

  @Column({ type: 'varchar', length: 20, default: 'pdf' })
  format: string; // pdf, docx, md

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
