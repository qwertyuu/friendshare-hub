-- CreateEnum
CREATE TYPE "GeneralRequestStatus" AS ENUM ('OPEN', 'FULFILLED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "RequestStatus" ADD VALUE 'CANCELLED';

-- CreateTable
CREATE TABLE "general_requests" (
    "id" TEXT NOT NULL,
    "requester_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "status" "GeneralRequestStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "general_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "general_request_responses" (
    "id" TEXT NOT NULL,
    "general_request_id" TEXT NOT NULL,
    "responder_id" TEXT NOT NULL,
    "item_id" TEXT,
    "message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "general_request_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "general_requests_requester_id_idx" ON "general_requests"("requester_id");

-- CreateIndex
CREATE INDEX "general_requests_status_idx" ON "general_requests"("status");

-- CreateIndex
CREATE INDEX "general_requests_created_at_idx" ON "general_requests"("created_at");

-- CreateIndex
CREATE INDEX "general_request_responses_general_request_id_idx" ON "general_request_responses"("general_request_id");

-- CreateIndex
CREATE INDEX "general_request_responses_responder_id_idx" ON "general_request_responses"("responder_id");

-- CreateIndex
CREATE INDEX "general_request_responses_item_id_idx" ON "general_request_responses"("item_id");

-- AddForeignKey
ALTER TABLE "general_requests" ADD CONSTRAINT "general_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "general_request_responses" ADD CONSTRAINT "general_request_responses_general_request_id_fkey" FOREIGN KEY ("general_request_id") REFERENCES "general_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "general_request_responses" ADD CONSTRAINT "general_request_responses_responder_id_fkey" FOREIGN KEY ("responder_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "general_request_responses" ADD CONSTRAINT "general_request_responses_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
