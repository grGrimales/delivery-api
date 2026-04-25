import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('DATABASE_URL'),
        ssl: { rejectUnauthorized: false }, // requerido por Neon
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // solo en desarrollo, en prod usar migraciones
        logging: false,
      }),
    }),
  ],
})
export class AppModule { }