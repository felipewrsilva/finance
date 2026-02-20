import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const month = Number(searchParams.get("month")) || new Date().getMonth() + 1;
  const year = Number(searchParams.get("year")) || new Date().getFullYear();

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      date: { gte: start, lt: end },
    },
    include: { category: true, account: true },
    orderBy: { date: "desc" },
  });

  const rows = [
    ["Date", "Type", "Status", "Description", "Category", "Account", "Amount", "Currency"],
    ...transactions.map((t) => [
      new Date(t.date).toISOString().split("T")[0],
      t.type,
      t.status,
      t.description ?? "",
      t.category?.name ?? "",
      t.account.name,
      Number(t.amount).toFixed(2),
      t.currency,
    ]),
  ];

  const csv = rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const filename = `transactions-${year}-${String(month).padStart(2, "0")}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
