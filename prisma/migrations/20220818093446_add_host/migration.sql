-- CreateTable
CREATE TABLE "Host" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,

    CONSTRAINT "Host_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Host_domain_key" ON "Host"("domain");
