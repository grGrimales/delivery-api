import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateOrderDto {
    @IsString()
    addressFrom: string;

    @IsString()
    addressTo: string;

    @IsUUID()
    @IsOptional()
    driverId?: string;
}