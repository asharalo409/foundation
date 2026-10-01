import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function App() {
  const [name, setName] = useState('লোড হচ্ছে...')

  useEffect(() => {
    supabase
      .from('settings')
      .select('org_name')
      .eq('id', 1)
      .single()
      .then(({ data, error }) =>
        setName(error ? 'সংযোগ ব্যর্থ: ' + error.message : data!.org_name)
      )
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold text-green-700">{name}</h1>
    </div>
  )
}
