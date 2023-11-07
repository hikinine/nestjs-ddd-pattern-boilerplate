import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateUserProfileInput {
  @ApiProperty({ description: 'Id do usuário' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Nome do usuário' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ description: 'Nome do usuário' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ description: 'Cargo do usuário' })
  @IsString()
  @IsOptional()
  office?: string;

  @ApiProperty({ description: 'Telefone do usuário' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Avatar do usuário' })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({ description: 'Data de nascimento do usuário' })
  @IsDate()
  @IsOptional()
  birthday?: Date;

  @ApiProperty({ description: 'Gênero do usuário' })
  @IsOptional()
  @IsString()
  gender: 'M' | 'F' | 'O';

  @IsOptional()
  @IsObject()
  address: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    extra?: string;
    zipCode?: string;
  };
}
