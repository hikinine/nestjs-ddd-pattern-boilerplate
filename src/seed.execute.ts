import { iamModuleSeed } from '@iam/infra/database/prisma/seed';
import { PrismaService } from '@lib/database';

export async function seedExecute() {
  const prismaService = new PrismaService();
  await iamModuleSeed(prismaService);
}

seedExecute()
  .then(() => process.exit(0))
  .catch(console.log);
