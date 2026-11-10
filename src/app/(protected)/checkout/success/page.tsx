
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { SuccessToasts } from "./SuccessToasts";

export default function SuccessPage() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center p-4 text-center">
      <SuccessToasts />
      <div className="rounded-full bg-green-100 p-3 mb-6">
        <CheckCircle2 className="h-12 w-12 text-green-600" />
      </div>
      
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
        ¡Pago realizado!
      </h1>
      
      <p className="text-gray-600 max-w-md mb-8">
        Gracias por tu compra. Tu pedido ha sido confirmado y se está procesando.
      </p>
      
      <div className="flex gap-4">
        <Link 
          href="/dashboard" 
          className="bg-gray-900 text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
        >
          Ver pedidos
        </Link>
        <Link 
          href="/stickers" 
          className="border border-gray-300 bg-white text-gray-700 px-6 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
