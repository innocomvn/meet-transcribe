import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('recordings')
export class Recording {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  meetingId: string;

  @Column({ type: 'varchar', length: 500 })
  filePath: string;

  @Column({ type: 'varchar', length: 200 })
  fileName: string;

  @Column({ type: 'integer' })
  fileSize: number;

  @Column({ type: 'float', nullable: true })
  duration: number;

  @Column({ type: 'varchar', length: 20 })
  format: string; // webm, mp4, etc.

  @Column({ type: 'varchar', length: 20 })
  type: string; // screen, audio, video

  @CreateDateColumn()
  createdAt: Date;
}
