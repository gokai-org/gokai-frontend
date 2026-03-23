"use client";

import type { AdminSupportTicket } from "../types/tickets";
import { AdminSupportTicketRow } from "./AdminSupportTicketRow";

interface AdminSupportTicketTableProps {
  tickets: AdminSupportTicket[];
  totalTickets: number;
}

export function AdminSupportTicketTable({
  tickets,
  totalTickets,
}: AdminSupportTicketTableProps) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900">Todos los tickets de soporte</h3>
          <p className="text-xs text-gray-500">
            Ultimos tickets ({tickets.length} de {totalTickets} tickets)
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="min-w-[980px] w-full bg-white">
          <thead className="bg-[#F8F6F4] text-left">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold tracking-wide text-gray-500">ID</th>
              <th className="px-4 py-3 text-xs font-semibold tracking-wide text-gray-500">Solicitante</th>
              <th className="px-4 py-3 text-xs font-semibold tracking-wide text-gray-500">Asunto</th>
              <th className="px-4 py-3 text-xs font-semibold tracking-wide text-gray-500">Estado</th>
              <th className="px-4 py-3 text-xs font-semibold tracking-wide text-gray-500">Prioridad</th>
              <th className="px-4 py-3 text-xs font-semibold tracking-wide text-gray-500">Asignado a</th>
              <th className="px-4 py-3 text-xs font-semibold tracking-wide text-gray-500">Fecha de creacion</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <AdminSupportTicketRow key={ticket.id} ticket={ticket} />
            ))}
          </tbody>
        </table>
      </div>

      {tickets.length === 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-[#FCFAF9] p-6 text-center">
          <p className="text-sm font-medium text-gray-600">
            No hay tickets con los filtros seleccionados.
          </p>
        </div>
      )}
    </section>
  );
}
