-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ResumeVersionStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "AnalysisFindingCategory" AS ENUM ('STRENGTH', 'WEAKNESS', 'GRAMMAR', 'FORMATTING', 'RECOMMENDATION');

-- CreateEnum
CREATE TYPE "AnalysisSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "ChatRole" AS ENUM ('USER', 'ASSISTANT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeVersion" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "checksum" TEXT,
    "extractedText" TEXT,
    "status" "ResumeVersionStatus" NOT NULL DEFAULT 'UPLOADED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeAnalysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resumeVersionId" TEXT NOT NULL,
    "status" "AnalysisStatus" NOT NULL DEFAULT 'PROCESSING',
    "atsScore" INTEGER,
    "overallScore" INTEGER,
    "summary" TEXT,
    "model" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisFinding" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "category" "AnalysisFindingCategory" NOT NULL,
    "severity" "AnalysisSeverity",
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "beforeText" TEXT,
    "afterText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalysisFinding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissingSkill" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "importance" "AnalysisSeverity" NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MissingSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatThread" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "role" "ChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "model" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "Resume_userId_idx" ON "Resume"("userId");

-- CreateIndex
CREATE INDEX "Resume_userId_createdAt_idx" ON "Resume"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Resume_userId_deletedAt_idx" ON "Resume"("userId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeVersion_fileKey_key" ON "ResumeVersion"("fileKey");

-- CreateIndex
CREATE INDEX "ResumeVersion_resumeId_idx" ON "ResumeVersion"("resumeId");

-- CreateIndex
CREATE INDEX "ResumeVersion_status_idx" ON "ResumeVersion"("status");

-- CreateIndex
CREATE INDEX "ResumeVersion_createdAt_idx" ON "ResumeVersion"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeVersion_resumeId_versionNumber_key" ON "ResumeVersion"("resumeId", "versionNumber");

-- CreateIndex
CREATE INDEX "ResumeAnalysis_userId_idx" ON "ResumeAnalysis"("userId");

-- CreateIndex
CREATE INDEX "ResumeAnalysis_userId_createdAt_idx" ON "ResumeAnalysis"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ResumeAnalysis_resumeVersionId_idx" ON "ResumeAnalysis"("resumeVersionId");

-- CreateIndex
CREATE INDEX "ResumeAnalysis_status_idx" ON "ResumeAnalysis"("status");

-- CreateIndex
CREATE INDEX "AnalysisFinding_analysisId_idx" ON "AnalysisFinding"("analysisId");

-- CreateIndex
CREATE INDEX "AnalysisFinding_analysisId_category_idx" ON "AnalysisFinding"("analysisId", "category");

-- CreateIndex
CREATE INDEX "AnalysisFinding_analysisId_sortOrder_idx" ON "AnalysisFinding"("analysisId", "sortOrder");

-- CreateIndex
CREATE INDEX "MissingSkill_analysisId_idx" ON "MissingSkill"("analysisId");

-- CreateIndex
CREATE INDEX "MissingSkill_skill_idx" ON "MissingSkill"("skill");

-- CreateIndex
CREATE INDEX "ChatThread_userId_idx" ON "ChatThread"("userId");

-- CreateIndex
CREATE INDEX "ChatThread_userId_updatedAt_idx" ON "ChatThread"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "ChatThread_userId_resumeId_idx" ON "ChatThread"("userId", "resumeId");

-- CreateIndex
CREATE INDEX "ChatThread_resumeId_idx" ON "ChatThread"("resumeId");

-- CreateIndex
CREATE INDEX "ChatMessage_threadId_idx" ON "ChatMessage"("threadId");

-- CreateIndex
CREATE INDEX "ChatMessage_threadId_createdAt_idx" ON "ChatMessage"("threadId", "createdAt");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeVersion" ADD CONSTRAINT "ResumeVersion_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeAnalysis" ADD CONSTRAINT "ResumeAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeAnalysis" ADD CONSTRAINT "ResumeAnalysis_resumeVersionId_fkey" FOREIGN KEY ("resumeVersionId") REFERENCES "ResumeVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisFinding" ADD CONSTRAINT "AnalysisFinding_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "ResumeAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissingSkill" ADD CONSTRAINT "MissingSkill_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "ResumeAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatThread" ADD CONSTRAINT "ChatThread_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatThread" ADD CONSTRAINT "ChatThread_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ChatThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
