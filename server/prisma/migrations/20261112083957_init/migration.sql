-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "PlanCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RechargePlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "validityDays" INTEGER NOT NULL,
    "dailyDataGB" DOUBLE PRECISION,
    "totalDataGB" DOUBLE PRECISION,
    "voiceAllowance" TEXT NOT NULL,
    "smsAllowance" TEXT NOT NULL,
    "networkType" TEXT NOT NULL,
    "supports5G" BOOLEAN NOT NULL DEFAULT false,
    "promotionalLabel" TEXT,
    "benefits" JSONB NOT NULL,
    "notes" JSONB NOT NULL,
    "terms" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'ILLUSTRATIVE',
    "sourceUrl" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "isDemoData" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RechargePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dailyUsageGB" DOUBLE PRECISION NOT NULL DEFAULT 2,
    "monthlyBudget" INTEGER NOT NULL DEFAULT 500,
    "preferredValidity" INTEGER NOT NULL DEFAULT 28,
    "requires5G" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CustomerPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RechargeTransaction" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "paymentMethod" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RechargeTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PlanCategory_name_key" ON "PlanCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PlanCategory_slug_key" ON "PlanCategory"("slug");

-- CreateIndex
CREATE INDEX "RechargePlan_categoryId_isActive_idx" ON "RechargePlan"("categoryId", "isActive");

-- CreateIndex
CREATE INDEX "RechargePlan_price_validityDays_idx" ON "RechargePlan"("price", "validityDays");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerPreference_userId_key" ON "CustomerPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RechargeTransaction_reference_key" ON "RechargeTransaction"("reference");

-- CreateIndex
CREATE INDEX "RechargeTransaction_userId_createdAt_idx" ON "RechargeTransaction"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "RechargePlan" ADD CONSTRAINT "RechargePlan_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PlanCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPreference" ADD CONSTRAINT "CustomerPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RechargeTransaction" ADD CONSTRAINT "RechargeTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RechargeTransaction" ADD CONSTRAINT "RechargeTransaction_planId_fkey" FOREIGN KEY ("planId") REFERENCES "RechargePlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
