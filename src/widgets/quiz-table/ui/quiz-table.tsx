import { Link } from "@tanstack/react-router";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo } from "react";

import type { Quiz } from "@entities/quiz";
import { statusLabel } from "@entities/session";
import { formatDateTime } from "@shared/lib/format";
import { Badge, Button } from "@shared/ui";

const columnHelper = createColumnHelper<Quiz>();

export function QuizTable({
  quizzes,
  canEdit,
  onDelete,
}: {
  quizzes: Quiz[];
  canEdit: boolean;
  onDelete: (quiz: Quiz) => void;
}) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: "Название",
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor("status", {
        header: "Статус",
        cell: (info) => <Badge tone={info.getValue()}>{statusLabel[info.getValue()]}</Badge>,
      }),
      columnHelper.accessor("updated_at", {
        header: "Обновлена",
        cell: (info) => formatDateTime(info.getValue()),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: (info) => (
          <div className="flex justify-end gap-2">
            <Link
              to="/quizzes/$quizId"
              params={{ quizId: info.row.original.id }}
              className="rounded-full px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-100"
            >
              Открыть
            </Link>
            {canEdit ? (
              <Button tone="ghost" onClick={() => onDelete(info.row.original)}>
                Удалить
              </Button>
            ) : null}
          </div>
        ),
      }),
    ],
    [canEdit, onDelete],
  );

  const table = useReactTable({ data: quizzes, columns, getCoreRowModel: getCoreRowModel() });

  if (quizzes.length === 0) {
    return <p className="text-sm text-stone-500">Пока нет викторин.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-stone-500">
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => (
                <th key={header.id} className="px-2 py-2 font-medium">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-t border-stone-100">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-2 py-3 align-middle">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
