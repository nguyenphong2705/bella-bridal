import { Body, Controller, Get, MessageEvent, Post, Query, Sse } from '@nestjs/common';
import { Observable, filter, map, startWith } from 'rxjs';
import { AppointmentsService } from './appointments.service';

@Controller('api/v1/appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get('availability')
  availability(@Query('date') date?: string) {
    const targetDate = date || new Date().toISOString().slice(0, 10);
    return {
      date: targetDate,
      slots: this.appointmentsService.getAvailability(targetDate),
    };
  }

  @Sse('availability/stream')
  availabilityStream(@Query('date') date?: string): Observable<MessageEvent> {
    const targetDate = date || new Date().toISOString().slice(0, 10);
    const initial = {
      date: targetDate,
      slots: this.appointmentsService.getAvailability(targetDate),
    };
    return this.appointmentsService.availabilityEvents$.pipe(
      filter((ev) => ev.date === targetDate),
      startWith(initial),
      map((payload) => ({ data: payload }) as MessageEvent)
    );
  }

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.appointmentsService.createBooking(body);
  }
}
