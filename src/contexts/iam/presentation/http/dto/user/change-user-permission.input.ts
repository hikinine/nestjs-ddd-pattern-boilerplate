import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { IamDocs } from '../../swagger';
import { PermissionDto } from './permission.dto';

export abstract class ChangeUserPermissionsInput {
  @ApiProperty(IamDocs.User.ChangeUserPermissionsInput.userId)
  @IsString()
  userId: string;

  @ApiProperty(IamDocs.User.ChangeUserPermissionsInput.permissions)
  @IsArray()
  @ValidateNested()
  @Type(() => PermissionDto)
  permissions: PermissionDto[];
}
