import { PermissionDto } from '@iam/presentation/http/dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsString, ValidateNested } from 'class-validator';
import { IamDocs } from '../../swagger';

export abstract class CreateGroupWithPermissionsInput {
  @ApiProperty(IamDocs.Group.CreateGroupWithPermissionsInput.name)
  @IsString()
  name: string;

  @ApiProperty(IamDocs.Group.CreateGroupWithPermissionsInput.isDepartment)
  @IsBoolean()
  isDepartment: boolean;

  @ApiProperty(IamDocs.Group.CreateGroupWithPermissionsInput.permissions)
  @IsArray()
  @ValidateNested()
  @Type(() => PermissionDto)
  permissions: PermissionDto[];
}
