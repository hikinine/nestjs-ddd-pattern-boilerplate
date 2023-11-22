/*
  Warnings:

  - You are about to drop the column `phone` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `_UserGroups` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "GroupRequestStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- CreateEnum
CREATE TYPE "GroupRequestType" AS ENUM ('Invite', 'Apply');

-- CreateEnum
CREATE TYPE "PersonType" AS ENUM ('Fisica', 'Juridica');

-- DropForeignKey
ALTER TABLE "_UserGroups" DROP CONSTRAINT "_UserGroups_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserGroups" DROP CONSTRAINT "_UserGroups_B_fkey";

-- DropIndex
DROP INDEX "user_username_key";

-- AlterTable
ALTER TABLE "group" ADD COLUMN     "description" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "oauth" ALTER COLUMN "provider" DROP DEFAULT;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "phone",
DROP COLUMN "username";

-- DropTable
DROP TABLE "_UserGroups";

-- CreateTable
CREATE TABLE "profile" (
    "userId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "avatar" TEXT,
    "birthday" TIMESTAMP(3),
    "gender" TEXT,
    "phone" TEXT,
    "office" TEXT,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "groupRequest" (
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "status" "GroupRequestStatus" NOT NULL DEFAULT 'Pending',
    "type" "GroupRequestType" NOT NULL,
    "appliedAt" TIMESTAMP(3),
    "invitedAt" TIMESTAMP(3),
    "invitedBy" TEXT,
    "acceptedOrRejectedAt" TIMESTAMP(3),
    "notificationSentAt" TIMESTAMP(3),

    CONSTRAINT "groupRequest_pkey" PRIMARY KEY ("userId","groupId")
);

-- CreateTable
CREATE TABLE "groupParticipants" (
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "groupParticipants_pkey" PRIMARY KEY ("userId","groupId")
);

-- CreateTable
CREATE TABLE "recentActivies" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recentActivies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "address" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "unitId" TEXT,
    "street" TEXT,
    "number" TEXT,
    "complement" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "zipCode" TEXT,
    "extra" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_userId_key" ON "profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "address_companyId_key" ON "address"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "address_unitId_key" ON "address"("unitId");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groupRequest" ADD CONSTRAINT "groupRequest_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groupRequest" ADD CONSTRAINT "groupRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groupParticipants" ADD CONSTRAINT "groupParticipants_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groupParticipants" ADD CONSTRAINT "groupParticipants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recentActivies" ADD CONSTRAINT "recentActivies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
