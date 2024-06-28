-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "hobbies" TEXT[],
    "cuisines" TEXT[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
