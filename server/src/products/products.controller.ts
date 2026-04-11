import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { SetPromotionDto } from './dto/set-promotion.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
import { PaginationQueryDto, PaginatedResponseDto } from '../shared/dto/pagination.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('admin/list')
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  async listPaginated(
    @Query() paginationQuery: PaginationQueryDto,
    @Query('category') category?: string,
  ): Promise<PaginatedResponseDto<any>> {
    const limit = paginationQuery.limit || 10;
    const skip = paginationQuery.skip || 0;
    return this.productsService.findAllPaginated(category, limit, skip);
  }

  @Get()
  findAll(@Query('category') category?: string) {
    return this.productsService.findAll(category);
  }

  @Get('search')
  search(@Query('q') query: string, @Query('limit') limit?: string, @Query('skip') skip?: string) {
    const limitNum = limit ? Math.min(parseInt(limit, 10) || 50, 100) : 50;
    const skipNum = skip ? Math.max(parseInt(skip, 10) || 0, 0) : 0;
    return this.productsService.search(query, limitNum, skipNum);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Post(':id/promotion')
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  setPromotion(@Param('id') id: string, @Body() dto: SetPromotionDto) {
    return this.productsService.setPromotion(id, dto);
  }

  @Delete(':id/promotion')
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  clearPromotion(@Param('id') id: string) {
    return this.productsService.clearPromotion(id);
  }
}
