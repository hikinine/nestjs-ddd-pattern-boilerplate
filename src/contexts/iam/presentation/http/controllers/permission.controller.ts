import { PermissionService } from '@iam/application/service';
import { HttpExceptionFilter } from '@lib/common';
import { Controller, Get, UseFilters } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('permissions')
@Controller('/iam/permissions')
@UseFilters(HttpExceptionFilter)
export class PermissionController {
  constructor(private readonly service: PermissionService) {}

  @Get('/list')
  async getPermissionsList() {
    const permissions = await this.service.getPermissionList();
    return {
      permissions,
    };
  }
}
