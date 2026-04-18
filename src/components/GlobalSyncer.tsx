import React from 'react'
import { MACHINES } from '../supabase.js'
import { useMachineStream } from '../hooks/useMachineStream'
import { useSupabaseSync } from '../hooks/useSupabaseSync'

function MachineSyncer({ machineId }: { machineId: string }) {
  const { latestReading } = useMachineStream(machineId)
  useSupabaseSync(latestReading)
  return null
}

export default function GlobalSyncer() {
  return (
    <>
      {MACHINES.map(m => <MachineSyncer key={m} machineId={m} />)}
    </>
  )
}
