import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RatepayerType } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { CreateRatepayerDto, UpdateRatepayerDto } from './dto';
import { RatepayersService } from './ratepayers.service';

@Controller('ratepayers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RatepayersController {
  constructor(private readonly service: RatepayersService) {}

  @Get()
  findAll(@Query('type') type?: RatepayerType, @Query('zoneId') zoneId?: string, @Query('search') search?: string) {
    return this.service.findAll({ type, zoneId, search });
  }

  @Post()
  create(@Body() dto: CreateRatepayerDto, @Req() req: { user?: { userId?: string } }) {
    return this.service.create(dto, req.user?.userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRatepayerDto, @Req() req: { user?: { userId?: string } }) {
    return this.service.update(id, dto, req.user?.userId);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: { user?: { userId?: string } }) {
    return this.service.delete(id, req.user?.userId);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(@UploadedFile() file: { buffer: Buffer }, @Req() req: { user?: { userId?: string } }) {
    const rows = parse(file.buffer.toString('utf8'), { columns: true, skip_empty_lines: true }) as Array<Record<string, string>>;
    return this.service.importRows(
      rows.map((r) => ({
        uniqueRef: r.uniqueRef,
        type: (r.type || 'PROPERTY') as RatepayerType,
        fullName: r.fullName,
        phone: r.phone,
        email: r.email,
        address: r.address,
      })),
      req.user?.userId,
    );
  }

  @Get('export')
  async exportCsv(@Res() res: Response) {
    const data = await this.service.findAll({});
    const csv = stringify(data, { header: true });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="ratepayers.csv"');
    res.send(csv);
  }
}
