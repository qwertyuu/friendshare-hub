/*
  Warnings:

  - You are about to drop the column `auth_provider` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password_hash` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `rejection_reason` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "auth_provider",
DROP COLUMN "password_hash",
DROP COLUMN "rejection_reason",
DROP COLUMN "status";

-- DropEnum
DROP TYPE "AuthProvider";

-- DropEnum
DROP TYPE "UserStatus";
