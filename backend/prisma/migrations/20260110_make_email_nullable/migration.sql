-- AlterTable
-- Make email nullable to support LDAP users without email addresses
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;
