-- CreateTable
CREATE TABLE "HostUser" (
    "userEmail" TEXT NOT NULL,
    "hostDomain" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HostUser_pkey" PRIMARY KEY ("userEmail","hostDomain")
);

-- AddForeignKey
ALTER TABLE "HostUser" ADD CONSTRAINT "HostUser_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostUser" ADD CONSTRAINT "HostUser_hostDomain_fkey" FOREIGN KEY ("hostDomain") REFERENCES "Host"("domain") ON DELETE RESTRICT ON UPDATE CASCADE;
