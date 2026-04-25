import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto) {
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const user = await this.usersService.create({
            name: dto.name,
            email: dto.email,
            passwordHash,
            role: dto.role,
        });

        const token = this.generateToken(user.id, user.email, user.role);
        return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token };
    }

    async login(dto: LoginDto) {
        const user = await this.usersService.findByEmail(dto.email);
        if (!user) throw new UnauthorizedException('Credenciales inválidas');

        const valid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!valid) throw new UnauthorizedException('Credenciales inválidas');

        const token = this.generateToken(user.id, user.email, user.role);
        return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token };
    }

    private generateToken(sub: string, email: string, role: string) {
        return this.jwtService.sign({ sub, email, role });
    }
}