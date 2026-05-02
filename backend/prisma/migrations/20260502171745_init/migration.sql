-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "department" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CashFlowEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "observation" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "Receivable" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "client" TEXT NOT NULL,
    "origin" TEXT NOT NULL DEFAULT '',
    "totalValue" REAL NOT NULL,
    "paidValue" REAL NOT NULL DEFAULT 0,
    "issueDate" TEXT NOT NULL,
    "dueDate" TEXT NOT NULL,
    "observation" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "ReceivablePayment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "receivableId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "method" TEXT NOT NULL,
    CONSTRAINT "ReceivablePayment_receivableId_fkey" FOREIGN KEY ("receivableId") REFERENCES "Receivable" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payable" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "supplier" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "totalValue" REAL NOT NULL,
    "paidValue" REAL NOT NULL DEFAULT 0,
    "issueDate" TEXT NOT NULL,
    "dueDate" TEXT NOT NULL,
    "observation" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "PayablePayment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "payableId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "method" TEXT NOT NULL,
    CONSTRAINT "PayablePayment_payableId_fkey" FOREIGN KEY ("payableId") REFERENCES "Payable" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CostCenter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "budget" REAL NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "categories" TEXT NOT NULL DEFAULT '[]'
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CostCenter_name_key" ON "CostCenter"("name");
