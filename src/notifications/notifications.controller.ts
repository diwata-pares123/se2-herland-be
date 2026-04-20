import { Controller, Get, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Make sure this path is correct based on your folder structure

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ==========================================
  // --- NEW ROUTES FOR SETTINGS ---
  // ==========================================
  // Protected by JwtAuthGuard so only logged-in users can access their settings
  
  @UseGuards(JwtAuthGuard)
  @Get('settings')
  getSettings(@Request() req) {
    // req.user.sub is the logged-in user's ID from the JWT token
    return this.notificationsService.getSettings(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('settings')
  updateSettings(@Request() req, @Body() body: any) {
    return this.notificationsService.updateSettings(req.user.sub, body);
  }

  // ==========================================
  // --- EXISTING ROUTES (Untouched) ---
  // ==========================================

  @Get()
  findAll() {
    return this.notificationsService.findAll();
  }

  @Patch('mark-all-read')
  markAllAsRead() {
    return this.notificationsService.markAllAsRead();
  }

  @Delete('clear-all')
  clearAll() {
    return this.notificationsService.clearAll();
  }

  // Note: Parameterized routes (:id) must always be at the bottom!
  @Patch(':id')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }
}