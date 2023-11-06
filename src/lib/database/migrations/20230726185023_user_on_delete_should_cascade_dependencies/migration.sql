-- DropForeignKey
ALTER TABLE "authentication" DROP CONSTRAINT "authentication_userId_fkey";

-- DropForeignKey
ALTER TABLE "entitiesAccessControl" DROP CONSTRAINT "entitiesAccessControl_userId_fkey";

-- DropForeignKey
ALTER TABLE "recoveryPassword" DROP CONSTRAINT "recoveryPassword_authenticationUserId_fkey";

-- DropForeignKey
ALTER TABLE "refreshToken" DROP CONSTRAINT "refreshToken_authenticationUserId_fkey";

-- DropForeignKey
ALTER TABLE "userPermission" DROP CONSTRAINT "userPermission_permissionId_fkey";

-- AddForeignKey
ALTER TABLE "authentication" ADD CONSTRAINT "authentication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recoveryPassword" ADD CONSTRAINT "recoveryPassword_authenticationUserId_fkey" FOREIGN KEY ("authenticationUserId") REFERENCES "authentication"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refreshToken" ADD CONSTRAINT "refreshToken_authenticationUserId_fkey" FOREIGN KEY ("authenticationUserId") REFERENCES "authentication"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userPermission" ADD CONSTRAINT "userPermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entitiesAccessControl" ADD CONSTRAINT "entitiesAccessControl_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
