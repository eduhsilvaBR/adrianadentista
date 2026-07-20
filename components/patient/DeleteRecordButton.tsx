"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteRecordButton({
  confirmMessage,
  action,
}: {
  confirmMessage: string;
  action: () => Promise<void>;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        if (!confirm(confirmMessage)) return;
        setPending(true);
        await action();
        router.refresh();
        setPending(false);
      }}
      className="text-xs font-medium text-gray-400 hover:text-red-600 disabled:opacity-50"
    >
      Excluir
    </button>
  );
}
