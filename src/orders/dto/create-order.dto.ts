import { IsString, IsUUID, IsOptional, IsNumber } from 'class-validator';

export class CreateOrderDto {
    @IsString()
    addressFrom: string;

    @IsString()
    addressTo: string;

    @IsUUID()
    @IsOptional()
    driverId?: string;

    @IsNumber()
    @IsOptional()
    lat?: number;

    @IsNumber()
    @IsOptional()
    lng?: number;
}