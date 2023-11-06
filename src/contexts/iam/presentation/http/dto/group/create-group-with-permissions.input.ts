import { PermissionDto } from '@iam/presentation/http/dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsString, ValidateNested } from 'class-validator';

export abstract class CreateGroupWithPermissionsInput {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsBoolean()
  isDepartment: boolean;

  @ApiProperty()
  @IsArray()
  @ValidateNested()
  @Type(() => PermissionDto)
  permissions: PermissionDto[];
}
