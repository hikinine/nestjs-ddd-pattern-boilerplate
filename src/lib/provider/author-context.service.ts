import { Author, AuthorUserContext } from '@lib/common';
import { AsyncLocalStorage } from 'async_hooks';

export class AuthorContextService extends AsyncLocalStorage<AuthorUserContext> {
  constructor() {
    super();
  }

  public getAuthor(): Author {
    return this.getStore()?.author;
  }
}
