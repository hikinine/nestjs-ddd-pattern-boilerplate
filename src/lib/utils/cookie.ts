export class Cookies {
  constructor(private readonly cookies: Record<string, string>) {}

  public get(key: string): string | undefined {
    return this.cookies[key];
  }

  static parseFromString(cookies: string): Cookies {
    const cookiesSplited = cookies.split('; ');
    const c = cookiesSplited.reduce((acc, cookie) => {
      const [key, value] = cookie.split('=');
      acc[key] = value;
      return acc;
    }, {});

    return new Cookies(c);
  }
}
