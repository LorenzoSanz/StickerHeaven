import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "../../../actions";
import { getStickerByIdAction } from "../../../../../(public)/stickers/_actions/get-sticker-by-id";
import { EditStickerForm } from "./EditStickerForm";
import { DashboardShell } from "../../../_components/DashboardShell";
import { Card } from "@/components/ui/Card";

export default async function EditStickerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser(`/dashboard/stickers/${encodeURIComponent(id)}/edit`);
  const sticker = await getStickerByIdAction(id);

  if (!sticker) notFound();
  if (sticker.ownerId !== user.id) redirect("/dashboard/stickers");

  return (
    <DashboardShell
      title="Editar sticker"
      description="Actualiza detalles y precio."
      action={
        <Link href="/dashboard/stickers" className="text-sm font-semibold text-white/80 hover:text-white">
          Volver a mis stickers
        </Link>
      }
    >
      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <EditStickerForm sticker={sticker} />
        </Card>
      </div>
    </DashboardShell>
  );
}
