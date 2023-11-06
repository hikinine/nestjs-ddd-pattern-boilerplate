import {
  ApplicationLevelError,
  DomainError,
  RepositoryError,
} from '@hiki9/rich-domain';
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private static isPrismaError(
    err: unknown,
  ): err is Prisma.PrismaClientKnownRequestError {
    return err instanceof Prisma.PrismaClientKnownRequestError;
  }

  catch(exception: any, host: ArgumentsHost) {
    console.log(exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let status: number;
    const err = exception;
    const message: string = exception?.message;

    if (HttpExceptionFilter.isPrismaError(err)) {
      const meta = JSON.stringify(err?.meta || {}, null, 2);
      status = 490;
      switch (err.code) {
        case 'P2025':
          exception = new RepositoryError.InvalidInput(
            err?.meta?.target,
            err?.meta?.expected,
          );
          break;

        case 'P2002':
          exception = new RepositoryError.DuplicateEntry(err?.meta?.target);
          break;

        case 'P2003':
          exception = new RepositoryError.ForeignConstraintKey(
            err?.meta?.table,
            err?.meta?.constraint,
          );
          break;

        case 'P2023':
          exception = new RepositoryError.NullConstraintViolation(
            err?.meta?.target,
          );
          break;

        case 'P2022':
          exception = new RepositoryError.WriteRepositoryError(
            `A coluna não existe no banco de dados.` + meta,
          );
          break;

        case 'P2020':
          exception = new RepositoryError.NumericConstraintViolation(
            err?.meta?.target,
            err?.meta?.min,
            err?.meta?.max,
          );
          break;
        case 'P2011':
          exception = new RepositoryError.UniqueConstraintViolation(
            err?.meta?.target,
          );
          break;
        case 'P2014':
          exception = new RepositoryError.UnknownConstraintViolation(
            err?.meta?.constraint,
          );
          break;
        default:
          exception = new RepositoryError.PrismaError(
            `PR001 | Erro interno não esperado!`,
          );
      }
    } else if (exception instanceof ForbiddenException) {
      exception = {
        name: exception.name,
        message: exception.message,
        meta: exception.getResponse(),
      };
      status = 403;
    } else if (exception instanceof UnauthorizedException) {
      status = 401;
      exception = {
        message: exception.message,
      };
    } else if (exception instanceof ApplicationLevelError) {
      status = 490;
    } else if (exception instanceof ConflictException) {
      status = 409;
    } else if (exception instanceof DomainError) {
      status = 422;
    } else if (exception instanceof RepositoryError.WriteRepositoryError) {
      status = 409;
    } else if (exception instanceof RepositoryError.ReadRepositoryError) {
      status = 452;
    } else if (exception instanceof BadRequestException) {
      status = 456;
    } else if (exception instanceof TypeError) {
      status = 498;
      exception = {
        message: exception.message,
      } as any;
    } else if (exception instanceof Error) {
      status = 499;
      exception = {
        message: exception.message,
      } as any;
    }

    response.status(status).json(new OutputError(status, request.url, message));
  }
}

class OutputError {
  public readonly statusCode: number;
  public readonly path: string;
  public readonly timestamp: string;
  public readonly message: string;
  public readonly extra: any;

  constructor(statusCode: number, path: string, message: string, extra?: any) {
    this.statusCode = statusCode || 500;
    this.path = path;
    this.message = message || 'Ocorreu um erro inesperado.';
    this.extra = extra;
    this.timestamp = new Date().toISOString();
  }
}
