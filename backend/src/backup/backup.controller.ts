import { Controller, Post } from '@nestjs/common';

@Controller('backup')
export class BackupController {
  @Post('trigger')
  trigger() {
    return { status: 'queued', message: 'Database backup trigger accepted.' };
  }
}
