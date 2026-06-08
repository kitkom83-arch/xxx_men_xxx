CREATE TABLE "AdminUser" (
  "id" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");

CREATE TABLE "AppSetting" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "value" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AppSetting_key_key" ON "AppSetting"("key");

CREATE TABLE "CredentialVault" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "mode" TEXT NOT NULL DEFAULT 'mock',
  "encryptedPayload" JSONB NOT NULL,
  "maskedLabel" TEXT NOT NULL,
  "lastUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CredentialVault_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CredentialVault_name_key" ON "CredentialVault"("name");

CREATE TABLE "SearchHistory" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "query" TEXT NOT NULL,
  "resultSummary" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SearchHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PostDraft" (
  "id" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "dryRun" BOOLEAN NOT NULL DEFAULT true,
  "safetyStatus" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PostDraft_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RateLimitSnapshot" (
  "id" TEXT NOT NULL,
  "endpoint" TEXT NOT NULL,
  "limit" INTEGER,
  "remaining" INTEGER,
  "resetAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RateLimitSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UsageSnapshot" (
  "id" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "postsRead" INTEGER NOT NULL DEFAULT 0,
  "cap" INTEGER,
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UsageSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditEvent" (
  "id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "metadata" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);
