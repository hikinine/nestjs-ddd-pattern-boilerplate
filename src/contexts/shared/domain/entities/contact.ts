import { Domain } from '@hiki9/rich-domain';
import { Email, Phone } from '@shared/domain';
import { ContactName } from '@shared/domain/value-object';

export interface ContactProps extends Domain.EntityProps {
  main?: boolean;
  name: ContactName;
  email?: Email;
  role?: string;
  phone?: Phone;
}

export class Contact extends Domain.Entity<ContactProps> {
  public setAsNotMain(): void {
    this.props.main = false;
  }
  public setAsMain(): void {
    this.props.main = true;
  }
  public changeName(name: ContactName): void {
    this.props.name = name;
  }

  public changeEmail(email: Email): void {
    this.props.email = email;
  }

  public changeRole(role: string): void {
    this.props.role = role;
  }

  public changePhone(phone: Phone): void {
    this.props.phone = phone;
  }

  public changeIsMain(main: boolean): void {
    this.props.main = main;
  }

  public isMain(): boolean {
    return this.props.main;
  }

  get name(): ContactName {
    return this.props.name;
  }

  get email(): Email {
    return this.props.email;
  }

  get role(): string {
    return this.props.role;
  }

  get phone(): Phone {
    return this.props.phone;
  }

  get main(): boolean {
    return this.props.main;
  }
}
