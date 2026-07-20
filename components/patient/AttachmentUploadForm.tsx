"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadAttachment } from "@/app/pacientes/[id]/records-actions";

const CATEGORIES = ["Exame", "Radiografia", "Documento", "Imagem", "Outro"];

export default function AttachmentUploadForm({ patientId }: { patientId: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const file = fd.get("file");
    if (!(file instanceof File) || file.size === 0) {
      setError("Selecione um arquivo.");
      return;
    }
    setUploading(true);
    try {
      await uploadAttachment(patientId, fd);
      formRef.current?.reset();
      router.refresh();
    } catch {
      setError("Não foi possível enviar o arquivo. Tente novamente.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-gray-300 p-4">
      <div className="flex-1 min-w-[200px]">
        <label className="mb-1 block text-xs font-medium text-gray-600">Arquivo</label>
        <input
          type="file"
          name="file"
          required
          className="w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Categoria</label>
        <select name="category" defaultValue="Exame" className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={uploading}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
      >
        {uploading ? "Enviando…" : "Enviar arquivo"}
      </button>
      {error && <p className="w-full text-xs text-red-600">{error}</p>}
    </form>
  );
}
