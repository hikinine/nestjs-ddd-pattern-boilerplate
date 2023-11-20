import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { IamDocs } from '../../swagger';
import { PermissionDto } from '../user';

export abstract class ChangeGroupPermissionInput {
  @ApiProperty(IamDocs.Group.ChangeGroupPermissionInput.groupId)
  @IsString()
  groupId: string;

  @ApiProperty(IamDocs.Group.ChangeGroupPermissionInput.name)
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty(IamDocs.Group.ChangeGroupPermissionInput.isDepartment)
  @IsOptional()
  @IsBoolean()
  isDepartment?: boolean;

  @ApiProperty(IamDocs.Group.ChangeGroupPermissionInput.permissions)
  @IsArray()
  @ValidateNested()
  @Type(() => PermissionDto)
  permissions: PermissionDto[];
}
