import { PermissionEnum } from '@iam/domain/entities';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export abstract class ChangeGroupPermissionInput {
  @ApiProperty()
  @IsString()
  groupId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isDepartment?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  permissions?: {
    entity: string;
    read: PermissionEnum;
    manage: PermissionEnum;
    create: PermissionEnum;
    update: PermissionEnum;
    delete: PermissionEnum;
    automation: PermissionEnum;
    export: PermissionEnum;
    import: PermissionEnum;
  }[];
}
