import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepo: Repository<User>,
    ) { }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepo.findOne({ where: { email } });
    }

    async findById(id: string): Promise<User | null> {
        return this.usersRepo.findOne({ where: { id } });
    }

    async create(data: Partial<User>): Promise<User> {
        if (data.email) {
            const exists = await this.findByEmail(data.email);
            if (exists) throw new ConflictException('El email ya está registrado');
        }
        const user = this.usersRepo.create(data);
        return this.usersRepo.save(user);
    }
}