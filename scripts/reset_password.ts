
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase Service Key')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function resetPassword() {
    const email = 'surajstoic@gmail.com'
    const newPassword = 'password123'

    const { data: { users }, error } = await supabase.auth.admin.listUsers()
    const user = users?.find(u => u.email === email)

    if (!user) {
        console.error('User not found')
        return
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { password: newPassword }
    )

    if (updateError) {
        console.error('Error updating password:', updateError)
    } else {
        console.log(`Password for ${email} reset to ${newPassword}`)
    }
}

resetPassword()
