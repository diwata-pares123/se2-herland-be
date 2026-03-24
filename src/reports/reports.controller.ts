import { Controller, Post, Body } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AddEntryDto } from './dto/add-entry.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // The frontend will send a POST request to: http://localhost:3000/reports/entry
  @Post('entry')
  createEntry(@Body() addEntryDto: AddEntryDto) {
    return this.reportsService.createEntry(addEntryDto);
  }
}