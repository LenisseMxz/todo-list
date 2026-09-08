import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://beryufvagchftufseqan.supabase.co'
const supabaseKey = 'sb_publishable_tQfAVN7-ohTAnrkpRVB1Fg_jMlh25N9'

export const supabase = createClient(supabaseUrl, supabaseKey)