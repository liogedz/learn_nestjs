import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Property } from './property.entity';
import * as bcrypt from 'bcrypt';
import { SALT_ROUNDS } from 'src/utils/constants';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  avatarUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  password: string;

  @OneToMany(() => Property, (property) => property.user)
  properties: Property[];

  @ManyToMany(() => Property, (property) => property.likedBy)
  @JoinTable({ name: 'user_liked_properties' })
  likedProperties: Property[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  }
}
