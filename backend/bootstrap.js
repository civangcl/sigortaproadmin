const { createClient } = require('@supabase/supabase-js')
const { PrismaClient } = require('@prisma/client')
require('dotenv').config({ path: './.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dkxuuztfgjtljjmdfdxn.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRreHV1enRmZ2p0bGpqbWRmZHhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMzE4OTYsImV4cCI6MjEwMTcwNzg5Nn0.ii6iqiS7o2cAOh_FnNQpb8rqJa8X8SIxEGSawu7AuWg'

const supabase = createClient(supabaseUrl, supabaseKey)
const prisma = new PrismaClient()

async function bootstrap() {
  const email = 'civangcl@gmail.com'
  const password = '123456' // Supabase requires minimum 6 characters

  console.log(`1. Supabase Auth üzerinde SuperAdmin (${email}) hesabı oluşturuluyor...`)
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError && authError.message !== 'User already registered') {
    console.error('Hata:', authError.message)
    return
  }

  // Attempt login to get the ID if already registered
  const { data: loginData } = await supabase.auth.signInWithPassword({ email, password })
  const user = authData?.user || loginData?.user

  if (!user) {
    console.error('Kullanıcı alınamadı (Şifreniz çok basit olabilir veya daha önce farklı şifreyle kayıt olunmuş olabilir).')
    return
  }

  console.log('2. Veritabanına Şirket ve SUPERADMIN rolü ekleniyor...')
  let company = await prisma.company.findFirst({ where: { name: 'SigortaPanel (Sistem)' } })
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: 'SigortaPanel (Sistem)',
        domain: 'sigortapanel.com',
        ownerName: 'Sistem Yöneticisi',
      }
    })
  }

  const existingUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!existingUser) {
    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        fullName: 'Civan',
        role: 'SUPERADMIN',
        companyId: company.id
      }
    })
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'SUPERADMIN', companyId: company.id }
    })
  }

  console.log('✅ İşlem Tamamlandı!')
  console.log('----------------------------------------------------')
  console.log(`Giriş E-postası: ${email}`)
  console.log(`Şifre: ${password}`)
  console.log('Bu şifreyle /system-admin sayfasına giriş yapabilirsiniz.')
}

bootstrap().catch(console.error).finally(() => prisma.$disconnect())
