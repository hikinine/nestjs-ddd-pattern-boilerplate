import { Pagination, PaginationCriteria } from '@hiki9/rich-domain/dist';
import { GroupService } from '@iam/application/service/group.service';
import {
  ChangeGroupPermissionInput,
  CreateGroupWithPermissionsInput,
  GroupSummaryOutput,
} from '@iam/presentation/http/dto';
import { HttpExceptionFilter } from '@lib/common';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseFilters,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('groups')
@Controller('/iam/groups')
@UseFilters(HttpExceptionFilter)
export class GroupsController {
  constructor(private readonly groupService: GroupService) {}

  @Post('/create-group')
  async createGroupWithPermissions(
    @Body() dto: CreateGroupWithPermissionsInput,
  ): Promise<void> {
    await this.groupService.createGroupWithPermissions(dto);
    return void 0;
  }

  @Put('/update-group/')
  async changeGroupPermission(
    @Body() dto: ChangeGroupPermissionInput,
  ): Promise<void> {
    await this.groupService.updateGroupWithPermissions(dto);
    return void 0;
  }

  @Get('/')
  async getGroups(
    @Query() query: object,
  ): Promise<Pagination<GroupSummaryOutput>> {
    const criteria = new PaginationCriteria(query);
    const pagination = await this.groupService.overview(criteria);
    return pagination.convertTo(GroupSummaryOutput);
  }

  @Get('/id/:id')
  async getGroup(@Param('id') id: string): Promise<GroupSummaryOutput> {
    const group = await this.groupService.findById(id);
    return new GroupSummaryOutput(group);
  }

  @Get('/name/:name')
  async getGroupByName(
    @Param('name') name: string,
  ): Promise<GroupSummaryOutput> {
    const group = await this.groupService.findByName(name);
    return new GroupSummaryOutput(group);
  }
  @Delete('/:id')
  async removeGroup(@Param('id') id: string): Promise<void> {
    await this.groupService.delete(id);
    return void 0;
  }
}
