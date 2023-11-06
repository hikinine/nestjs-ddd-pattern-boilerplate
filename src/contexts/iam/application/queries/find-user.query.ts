import {
  ApplicationLevelError,
  Pagination,
  PaginationCriteria,
} from '@hiki9/rich-domain/dist';
import { User } from '@iam/domain/entities';
import { FindUserQuery, FindUserQueryProps } from '@iam/domain/queries';
import { UserRepository } from '@iam/domain/repositories';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

@QueryHandler(FindUserQuery)
export class FindUserQueryHandler implements IQueryHandler<FindUserQuery> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute({ props }: FindUserQuery): Promise<User | Pagination<User>> {
    this.ensureSelectorParamsIsDefined(props);
    if (props.criteria instanceof PaginationCriteria) {
      return this.userRepository.find(props.criteria);
    }

    if (props.externalUserProviderId) {
      return this.userRepository.findByOAuthUserId(
        props.externalUserProviderId,
      );
    }

    if (props.recoveryToken) {
      return this.userRepository.findByRecoveryToken(props.recoveryToken);
    }
    if (props.email) {
      return this.userRepository.findByEmail(props.email);
    }
    if (props.refreshToken) {
      return this.userRepository.findByRefreshToken(props.refreshToken);
    }

    if (props.id) {
      return this.userRepository.findById(props.id);
    }

    if (props.username) {
      return this.userRepository.findByUsername(props.username);
    }

    throw new ApplicationLevelError('Internal error. (find-user.query)');
  }

  private ensureSelectorParamsIsDefined(props: FindUserQueryProps) {
    if (
      !props.id &&
      !props.username &&
      !props.criteria &&
      !props.refreshToken &&
      !props.email &&
      !props.recoveryToken &&
      !props.externalUserProviderId
    ) {
      throw new Error('Internal error. (find-user.query)');
    }
  }
}
