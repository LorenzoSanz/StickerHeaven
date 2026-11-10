import { getOrderDetails } from "../../actions";
import type { OrderApiDTO } from "../../actions";
import { formatCurrency, formatDateISO } from "@/lib/utils";
import Link from "next/link";
import { CancelOrderButton } from "./CancelOrderButton";
import Image from "next/image";
import { DashboardShell } from "../../_components/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getOrderStatusMeta } from "../../_components/orderStatusMeta";

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderDetails(id);

  if (!order) {
    return (
      <DashboardShell title="Pedido no encontrado">
        <Card className="p-10 text-center">
          <p className="text-white/70">No hemos podido encontrar este pedido.</p>
          <div className="mt-4">
            <Link href="/dashboard/orders">
              <Button variant="outline">Volver a pedidos</Button>
            </Link>
          </div>
        </Card>
      </DashboardShell>
    );
  }

  const meta = getOrderStatusMeta(order.status);
  const steps = ["Pendiente de pago", "Pagado", "Enviado", "Entregado"];

  return (
    <DashboardShell
      title={`Pedido #${order.id.substring(0, 8)}…`}
      description={`Realizado el ${formatDateISO(order.createdAt)}`}
      action={
        <>
          <Link href="/dashboard/orders">
            <Button variant="outline" size="sm">
              Volver a pedidos
            </Button>
          </Link>
        </>
      }
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <Badge variant={meta.variant}>{meta.label}</Badge>
        <CancelOrderButton orderId={order.id} status={order.status} />
      </div>

      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">Estado</h2>
        {typeof meta.step === "number"
          ? (() => {
              const step = meta.step;
              return (
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    {steps.map((label, idx) => (
                      <div key={label} className="text-center">
                        <div
                          className={`h-2 rounded-full ${
                            idx <= step ? "bg-primary shadow-[0_0_18px_rgba(139,92,246,0.35)]" : "bg-white/10"
                          }`}
                        />
                        <div className={`mt-2 text-xs ${idx <= step ? "text-white/80" : "text-white/40"}`}>{label}</div>
                      </div>
                    ))}
                  </div>
                  {meta.hint ? <p className="text-sm text-white/60">{meta.hint}</p> : null}
                </div>
              );
            })()
          : <p className="text-sm text-white/60">{meta.hint ?? "Estado actualizado."}</p>}
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Productos</h2>
            <ul className="divide-y divide-white/10">
              {order.items.map((item: OrderApiDTO["items"][number]) => (
                <li key={item.stickerId} className="py-4 flex items-center">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-white/10 relative bg-white/5">
                    {item.stickerImageUrl ? (
                      <Image
                        src={item.stickerImageUrl}
                        alt={item.stickerName}
                        fill
                        sizes="64px"
                        className="object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-white/50">Sin imagen</div>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-semibold text-foreground">{item.stickerName}</h3>
                    <p className="text-sm text-white/60">Cantidad: {item.quantity}</p>
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {formatCurrency(item.unitPrice * item.quantity, item.currency)}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Resumen</h2>
            <dl className="divide-y divide-white/10 text-sm">
              <div className="py-3 flex items-center justify-between">
                <dt className="text-white/60">Subtotal</dt>
                <dd className="font-semibold text-foreground">{formatCurrency(order.totalAmount, order.currency)}</dd>
              </div>
              <div className="py-3 flex items-center justify-between">
                <dt className="text-white/60">Envío</dt>
                <dd className="font-semibold text-foreground">Gratis</dd>
              </div>
              <div className="py-3 flex items-center justify-between">
                <dt className="text-base font-bold text-foreground">Total</dt>
                <dd className="text-base font-bold text-foreground">
                  {formatCurrency(order.totalAmount, order.currency)}
                </dd>
              </div>
            </dl>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Entrega</h2>
            <p className="text-sm text-white/60">(Entrega digital / dirección aún no recopilada)</p>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
