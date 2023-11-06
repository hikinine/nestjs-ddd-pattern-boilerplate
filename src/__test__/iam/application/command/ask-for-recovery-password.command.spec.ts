import { createTestingModule } from '@app/__test__/__mock__/create-testing-module';
import { CreateDefaultUserFactory } from '@app/__test__/__mock__/user-factory';
import { AskForRecoveryPasswordCommandHandler } from '@iam/application/command';
import { AskForRecoveryPasswordCommand } from '@iam/domain/command';
import { RecoveryPassword, User } from '@iam/domain/entities';
import { UserAskOrRenewRecoveryPasswordEvent } from '@iam/domain/events';
import { UserRepository } from '@iam/domain/repositories';
import { IamModule } from '@iam/iam.module';
import { ForbiddenException, INestApplication } from '@nestjs/common';

describe('ask-for-recovery-password.command.spec', () => {
  let app: INestApplication;
  let handler: AskForRecoveryPasswordCommandHandler;
  let user: User;
  let command: AskForRecoveryPasswordCommand;
  let userRepository: UserRepository;

  beforeAll(async () => {
    app = await createTestingModule({
      imports: [IamModule],
      override: [],
    });
    handler = app.get(AskForRecoveryPasswordCommandHandler);
    userRepository = app.get(UserRepository);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const factory = new CreateDefaultUserFactory(userRepository);
    user = await factory.execute();
    command = new AskForRecoveryPasswordCommand(user);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should generate an recovery password', async () => {
    expect(user.auth.activeRecoveryPassword.length).toEqual(0);
    const recoveryPassword = await handler.execute(command);
    expect(recoveryPassword).toBeInstanceOf(RecoveryPassword);
    expect(user.auth.activeRecoveryPassword.length).toEqual(1);
  });

  it('should not generate an new request, instead use already exists one', async () => {
    const originalRecoveryPassword = user.registerAnRequestToRecoveryPassword();
    expect(user.auth.activeRecoveryPassword.length).toEqual(1);
    const recoveryPassword = await handler.execute(command);
    expect(user.auth.activeRecoveryPassword.length).toEqual(1);
    expect(recoveryPassword).toBeInstanceOf(RecoveryPassword);
    expect(recoveryPassword.isEqual(originalRecoveryPassword)).toBeTruthy();
  });

  it('should add event to aggregate queue', async () => {
    function userRecoveryEvent(event: any) {
      return event instanceof UserAskOrRenewRecoveryPasswordEvent;
    }
    expect(user.getEvents().some(userRecoveryEvent)).toBeFalsy();
    const command = new AskForRecoveryPasswordCommand(user);
    await handler.execute(command);
    expect(user.getEvents().some(userRecoveryEvent)).toBeTruthy();
  });

  it('should execute getOnGoingRecoveryPasswordIfExists if no previous recovery registered', async () => {
    const methodSpy = jest.spyOn(user, 'getOnGoingRecoveryPasswordIfExists');

    expect(user.auth.activeRecoveryPassword.length).toEqual(0);
    await handler.execute(command);
    expect(user.auth.activeRecoveryPassword.length).toEqual(1);
    expect(methodSpy).toBeCalled();
  });
  it('should execute registerAnRequestToRecoveryPassword if previous recovery registered', async () => {
    const methodSpy = jest.spyOn(user, 'getOnGoingRecoveryPasswordIfExists');
    expect(user.auth.activeRecoveryPassword.length).toEqual(0);
    await handler.execute(command);
    expect(user.auth.activeRecoveryPassword.length).toEqual(1);
    expect(methodSpy).toBeCalled();
  });

  it('should return recovery password', async () => {
    const recoveryPassword = await handler.execute(command);
    expect(recoveryPassword).toBeDefined();
    expect(recoveryPassword).toBeInstanceOf(RecoveryPassword);
  });

  it('should throw an error when user is not active', async () => {
    user.revokeUserAccess();
    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('should userRepository update be called once', async () => {
    const repoSpyOn = jest.spyOn(handler['userRepository'], 'update');
    expect(repoSpyOn).toBeCalledTimes(0);
    await handler.execute(command);
    expect(repoSpyOn).toBeCalledTimes(1);
  });

  it('should return an error when user is not provided', async () => {
    const command = new AskForRecoveryPasswordCommand(null);
    await expect(handler.execute(command)).rejects.toThrowError();
  });
});
