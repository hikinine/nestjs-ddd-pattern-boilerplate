import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { PermissionDto } from './permission.dto';

export abstract class ChangeUserPermissionsInput {
  @ApiProperty({ description: 'ID do usuário' })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Lista de permissões a serem modificadas',
    type: [PermissionDto],
  })
  @IsArray()
  @ValidateNested()
  @Type(() => PermissionDto)
  permissions: PermissionDto[];
}
