import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "../actions";
import { getStickersAction } from "@/app/(public)/stickers/_actions/get-stickers";
import { DeleteStickerButton } from "./DeleteStickerButton";
import { formatCurrency } from "@/lib/utils";
import { DashboardShell } from "../_components/DashboardShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StickersQueryToasts } from "./_components/StickersQueryToasts";

export default async function MyStickersPage() {
  const user = await getCurrentUser("/dashboard/stickers");
  const result = await getStickersAction({ ownerId: user.id, limit: 50, sortBy: "newest" });
  const stickers = result.data;

  return (
    <DashboardShell
      title="Mis Stickers"
      description="Crea, edita y gestiona tu catálogo."
      action={
        <Link href="/dashboard/stickers/new">
          <Button size="sm">Nuevo sticker</Button>
        </Link>
      }
    >
      <StickersQueryToasts />
      {stickers.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-white/70">Aún no has creado ningún sticker.</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link href="/dashboard/stickers/new">
              <Button>Crea tu primer sticker</Button>
            </Link>
            <Link href="/stickers">
              <Button variant="outline">Ver catálogo público</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/60">
                  Sticker
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/60">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/60">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/60">
                  Tags
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white/60">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {stickers.map((s) => (
                <tr key={s.id} className="hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-md border border-white/10 bg-white/5">
                        <Image src={s.imageUrl} alt={s.name} fill sizes="40px" className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-foreground">{s.name}</div>
                        <div className="truncate text-xs text-white/60">#{s.id.substring(0, 8)}…</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/70">
                    {formatCurrency(s.price.amount, s.price.currency)}
                  </td>
                  <td className="px-6 py-4 text-sm text-white/70">{s.stock}</td>
                  <td className="px-6 py-4 text-sm text-white/70">
                    {s.tags.length > 0 ? s.tags.join(", ") : <span className="text-white/40">—</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/stickers/${s.id}`}>
                        <Button size="sm" variant="outline">
                          Ver
                        </Button>
                      </Link>
                      <Link href={`/dashboard/stickers/${s.id}/edit`}>
                        <Button size="sm">Editar</Button>
                      </Link>
                      <DeleteStickerButton stickerId={s.id} />
                    </div>
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
