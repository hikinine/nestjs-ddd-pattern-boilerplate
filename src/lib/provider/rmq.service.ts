import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RmqService {
  constructor(private readonly configService: ConfigService) {}
}
