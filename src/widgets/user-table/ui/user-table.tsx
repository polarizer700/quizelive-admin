import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo } from "react";

import { roleLabel } from "@entities/session";
import type { User, UserRole } from "@entities/user";
import { formatDateTime } from "@shared/lib/format";
import { Badge, Button, Select } from "@shared/ui";

const columnHelper = createColumnHelper<User>();
const roles: UserRole[] = ["admin", "editor", "host"];

export function UserTable({
  users,
  currentUserId,
  onRole,
  onDelete,
}: {
  users: User[];
  currentUserId: string;
  onRole: (userId: string, role: UserRole) => void;
  onDelete: (user: User) => void;
}) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("email", { header: "Почта" }),
      columnHelper.accessor("role", {
        header: "Роль",
        cell: (info) => {
          const user = info.row.original;
          const self = user.id === currentUserId;
          if (self) return <Badge tone={user.role}>{roleLabel[user.role]}</Badge>;
          return (
            <Select
              value={user.role}
              aria-label={`Роль ${user.email}`}
              onChange={(event) => onRole(user.id, event.target.value as UserRole)}
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {roleLabel[role]}
                </option>
              ))}
            </Select>
          );
        },
      }),
      columnHelper.accessor("created_at", {
        header: "Создан",
        cell: (info) => formatDateTime(info.getValue()),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: (info) => (
          <div className="text-right">
            <Button
              tone="ghost"
              disabled={info.row.original.id === currentUserId}
              onClick={() => onDelete(info.row.original)}
            >
              Удалить
            </Button>
          </div>
        ),
      }),
    ],
    [currentUserId, onDelete, onRole],
  );

  const table = useReactTable({ data: users, columns, getCoreRowModel: getCoreRowModel() });

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
