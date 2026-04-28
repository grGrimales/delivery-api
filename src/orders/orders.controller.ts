import {
    Controller, Get, Post, Patch, Param, Body,
    UseGuards, Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { User } from 'src/users/user.entity';

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
    constructor(private ordersService: OrdersService) { }

    @Post()
    create(@Body() dto: CreateOrderDto, @Request() req: any) {
        return this.ordersService.create(dto, req.user);
    }

    @Get()
    findAll() {
        return this.ordersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ordersService.findOne(id);
    }

    @Get('driver/my-orders')
    myOrders(@Request() req: any) {
        return this.ordersService.findByDriver(req.user.id);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
        return this.ordersService.updateStatus(id, dto);
    }


    @Patch(':id/assign')
    @UseGuards(AuthGuard('jwt'))
    async assignDriver(
        @Param('id') orderId: string,
        @Body('driverId') driverId: string
    ) {
        const driverPartial = { id: driverId } as User;

        return this.ordersService.assignDriver(orderId, driverPartial);
    }
}