import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUserInput {
  @ApiProperty({ description: 'Primeiro nome' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Último nome' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Cargo do usuário' })
  @IsString()
  office: string;

  @ApiProperty({ description: 'Email do usuário' })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({ description: 'Telefone do usuário' })
  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  gender?: 'M' | 'F' | 'O';

  @IsDate()
  @IsOptional()
  birthday?: Date;
}
