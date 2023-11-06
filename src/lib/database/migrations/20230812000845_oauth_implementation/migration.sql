-- CreateTable
CREATE TABLE "oauth" (
    "externalUserProviderId" TEXT NOT NULL,
    "authenticationId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'BITRIX',

    CONSTRAINT "oauth_pkey" PRIMARY KEY ("externalUserProviderId")
);

-- CreateIndex
CREATE UNIQUE INDEX "oauth_externalUserProviderId_key" ON "oauth"("externalUserProviderId");

-- AddForeignKey
ALTER TABLE "oauth" ADD CONSTRAINT "oauth_authenticationId_fkey" FOREIGN KEY ("authenticationId") REFERENCES "authentication"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
