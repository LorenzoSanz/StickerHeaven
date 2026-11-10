import Link from "next/link";
import { getCurrentUser, getUserOrders } from "../actions";
import type { OrderApiDTO } from "../actions";
import { formatCurrency, formatDateISO } from "@/lib/utils";
import { DashboardShell } from "../_components/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getOrderStatusMeta } from "../_components/orderStatusMeta";

export default async function OrdersPage() {
  const [user, orders] = await Promise.all([getCurrentUser("/dashboard/orders"), getUserOrders()]);

  return (
    <DashboardShell
      title="Pedidos"
      description={`Has iniciado sesión como ${user.name} (${user.email})`}
      action={
        <div className="flex items-center gap-2">
          <Link href="/dashboard/stickers/new">
            <Button size="sm">Nuevo sticker</Button>
          </Link>
          <Link href="/dashboard/profile">
            <Button size="sm" variant="outline">
              Cuenta
            </Button>
          </Link>
        </div>
      }
    >
      {orders.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-white/70 mb-4">Aún no has realizado pedidos.</p>
          <Link href="/stickers">
            <Button>Empezar a comprar</Button>
          </Link>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/60">
                  Pedido
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/60">
                  Fecha
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/60">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/60">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white/60">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {orders.map((order: OrderApiDTO) => (
                <tr key={order.id} className="hover:bg-white/5">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-foreground">#{order.id.substring(0, 8)}…</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">{formatDateISO(order.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      const meta = getOrderStatusMeta(order.status);
                      return <Badge variant={meta.variant}>{meta.label}</Badge>;
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">{formatCurrency(order.totalAmount, order.currency)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/dashboard/orders/${order.id}`}>
                      <Button size="sm" variant="outline">
                        Ver
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </DashboardShell>
  );
}
