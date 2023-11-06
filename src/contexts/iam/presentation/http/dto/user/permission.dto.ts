import { PermissionEnum } from '@iam/domain/entities';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export class PermissionDto {
  @ApiProperty({ description: 'Identificador da permissão', default: '@iam' })
  @IsString()
  entity: string;

  @ApiProperty({ enum: PermissionEnum, default: 3 })
  @IsEnum(PermissionEnum)
  read: PermissionEnum;
  @ApiProperty({ enum: PermissionEnum, default: 4 })
  @IsEnum(PermissionEnum)
  create: PermissionEnum;
  @ApiProperty({ enum: PermissionEnum })
  @IsEnum(PermissionEnum)
  manage: PermissionEnum;
  @ApiProperty({ enum: PermissionEnum })
  @IsEnum(PermissionEnum)
  update: PermissionEnum;
  @ApiProperty({ enum: PermissionEnum })
  @IsEnum(PermissionEnum)
  delete: PermissionEnum;
  @ApiProperty({ enum: PermissionEnum })
  @IsEnum(PermissionEnum)
  automation: PermissionEnum;
  @ApiProperty({ enum: PermissionEnum })
  @IsEnum(PermissionEnum)
  _export: PermissionEnum;
  @ApiProperty({ enum: PermissionEnum })
  @IsEnum(PermissionEnum)
  import: PermissionEnum;
}
