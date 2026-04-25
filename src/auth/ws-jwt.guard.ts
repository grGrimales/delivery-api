import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private config: ConfigService,
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const client: Socket = context.switchToWs().getClient();

        // El token viene en handshake.auth.token
        const token = client.handshake?.auth?.token;
        if (!token) throw new UnauthorizedException('Token no encontrado');

        try {
            const payload = this.jwtService.verify(token, {
                secret: this.config.get('JWT_SECRET'),
            });
            // Adjuntamos el user al socket para usarlo en el gateway
            (client as any).user = payload;
            return true;
        } catch {
            throw new UnauthorizedException('Token inválido');
        }
    }
}