-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'LEAVE', 'DAY_OFF', 'SICK', 'ABSENT', 'PERMISSION');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'EMPLOYEE',
    "token" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "departmentId" TEXT,
    "officeId" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shifts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clockIn" TEXT NOT NULL,
    "clockOut" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_zones" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameCode" TEXT NOT NULL,
    "timeCode" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offices" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "website" TEXT,
    "logo" TEXT,
    "description" TEXT,
    "polygonArea" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "timeZoneId" TEXT NOT NULL,

    CONSTRAINT "offices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_allocations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shiftId" TEXT,
    "date" DATE NOT NULL,
    "scheduledClockIn" TEXT NOT NULL,
    "scheduledClockOut" TEXT NOT NULL,
    "actualClockIn" TIMESTAMP(3),
    "actualClockOut" TIMESTAMP(3),
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shift_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE INDEX "users_departmentId_idx" ON "users"("departmentId");

-- CreateIndex
CREATE INDEX "users_officeId_idx" ON "users"("officeId");

-- CreateIndex
CREATE INDEX "users_officeId_departmentId_idx" ON "users"("officeId", "departmentId");

-- CreateIndex
CREATE INDEX "shifts_isActive_idx" ON "shifts"("isActive");

-- CreateIndex
CREATE INDEX "shifts_name_idx" ON "shifts"("name");

-- CreateIndex
CREATE UNIQUE INDEX "time_zones_nameCode_key" ON "time_zones"("nameCode");

-- CreateIndex
CREATE UNIQUE INDEX "time_zones_timeCode_key" ON "time_zones"("timeCode");

-- CreateIndex
CREATE INDEX "time_zones_nameCode_idx" ON "time_zones"("nameCode");

-- CreateIndex
CREATE INDEX "time_zones_timeCode_idx" ON "time_zones"("timeCode");

-- CreateIndex
CREATE INDEX "time_zones_timezone_idx" ON "time_zones"("timezone");

-- CreateIndex
CREATE INDEX "departments_name_idx" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "offices_code_key" ON "offices"("code");

-- CreateIndex
CREATE UNIQUE INDEX "offices_email_key" ON "offices"("email");

-- CreateIndex
CREATE INDEX "offices_code_idx" ON "offices"("code");

-- CreateIndex
CREATE INDEX "offices_email_idx" ON "offices"("email");

-- CreateIndex
CREATE INDEX "offices_isActive_idx" ON "offices"("isActive");

-- CreateIndex
CREATE INDEX "offices_timeZoneId_idx" ON "offices"("timeZoneId");

-- CreateIndex
CREATE INDEX "offices_name_idx" ON "offices"("name");

-- CreateIndex
CREATE INDEX "shift_allocations_userId_idx" ON "shift_allocations"("userId");

-- CreateIndex
CREATE INDEX "shift_allocations_date_idx" ON "shift_allocations"("date");

-- CreateIndex
CREATE INDEX "shift_allocations_status_idx" ON "shift_allocations"("status");

-- CreateIndex
CREATE INDEX "shift_allocations_shiftId_idx" ON "shift_allocations"("shiftId");

-- CreateIndex
CREATE INDEX "shift_allocations_userId_date_status_idx" ON "shift_allocations"("userId", "date", "status");

-- CreateIndex
CREATE INDEX "shift_allocations_date_status_idx" ON "shift_allocations"("date", "status");

-- CreateIndex
CREATE UNIQUE INDEX "shift_allocations_userId_date_key" ON "shift_allocations"("userId", "date");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "offices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offices" ADD CONSTRAINT "offices_timeZoneId_fkey" FOREIGN KEY ("timeZoneId") REFERENCES "time_zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_allocations" ADD CONSTRAINT "shift_allocations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
