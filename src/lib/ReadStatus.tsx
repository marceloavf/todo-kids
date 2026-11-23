type Read = { isPending: boolean; isError: boolean; refetch: () => Promise<unknown> }

export function ReadStatus({ query, subject }: { query: Read; subject: string }) {
  if (query.isPending) return <p role="status" className="p-3 font-bold">Carregando {subject}…</p>
  if (!query.isError) return null
  return (
    <div role="status" className="rounded-2xl bg-wait-soft p-3 font-bold">
      <p>Não conseguimos atualizar {subject}.</p>
      <button className="min-h-12 underline" onClick={() => void query.refetch()}>Tentar de novo</button>
    </div>
  )
}
