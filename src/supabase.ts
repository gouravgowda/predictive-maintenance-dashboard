import { createClient } from '@supabase/supabase-js'

// ════════════════════════════════════════════════════════════════
//  🔴 CHANGE THESE TWO VALUES TO YOUR SUPABASE PROJECT DETAILS
//  Go to: supabase.com → your project → Settings → API
// ════════════════════════════════════════════════════════════════
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

// ════════════════════════════════════════════════════════════════
//  🔴 CHANGE THESE if hackathon gives different machine IDs
// ════════════════════════════════════════════════════════════════
export const MACHINES = ['CNC_01', 'CNC_02', 'PUMP_03', 'CONVEYOR_04']

export const MACHINE_META = {
  CNC_01:      { label: 'CNC Machine 1',  criticality: 0.9, icon: '⚙' },
  CNC_02:      { label: 'CNC Machine 2',  criticality: 0.7, icon: '⚙' },
  PUMP_03:     { label: 'Pump Unit 3',    criticality: 0.8, icon: '◎' },
  CONVEYOR_04: { label: 'Conveyor Belt 4',criticality: 0.6, icon: '≡' },
}

// ════════════════════════════════════════════════════════════════
//  🔴 CHANGE THESE if hackathon uses different column names
//  Look at your Supabase table columns and match them here
// ════════════════════════════════════════════════════════════════
export const COLS = {
  machine_id:     'machine_id',
  temperature:    'temperature_c',   // column name in sensor_readings
  vibration:      'vibration_mm_s',
  rpm:            'rpm',
  current:        'current_a',
  status:         'status',
  timestamp:      'timestamp',      // or 'timestamp' — check your table
}

// Alert thresholds
export const THRESH = {
  vibration:   3.5,
  temperature: 88,
  current:     16,
}

// ════════════════════════════════════════════════════════════════
//  🔴 HACKATHON DAY: If they give a live SSE API instead of
//  Supabase, replace these functions in api.js with fetch() calls
//  to their endpoints. The UI stays the same — only the data
//  fetching changes.
// ════════════════════════════════════════════════════════════════