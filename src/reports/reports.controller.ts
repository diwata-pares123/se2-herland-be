import { Controller, Get } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // This creates a GET endpoint at http://localhost:3000/reports/summary
  @Get('summary')
  getDashboardSummary() {
    return this.reportsService.getDashboardSummary();
  }
}