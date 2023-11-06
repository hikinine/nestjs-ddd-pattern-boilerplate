export interface SendEmailCommandProps {
  to: string;
  subject: string;
  body: string;
  from: string;
}
export class SendEmailCommand {
  constructor(public readonly props: SendEmailCommandProps) {}
}
