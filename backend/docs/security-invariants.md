# SigortaPro Güvenlik ve Mimari Prensipleri (Security Invariants)

Bu doküman SigortaPro backend projesinin çekirdek güvenlik ve mimari sözleşmelerini tanımlar. Bu projeye eklenecek her yeni özellik ve her değişiklik buradaki kurallara **uymak zorundadır**.

## 1. Tenant Data Access Kuralları
- **Hiçbir zaman** tenant-owned (ör. Client, Lead, Financial, Message) veriler yalnızca `id` (primary key) ile sorgulanmamalıdır. Her zaman `companyId` (Tenant ID) ile birlikte sorgulanmalıdır.
- Veri erişimi `effectiveCompanyId` ile scope edilmelidir. Bu değer güvenilir `req.context` içinden gelir, asla doğrudan kullanıcı isteğinden alınmaz.

## 2. Company ID'nin Kaynağı
- **Client (Frontend) tarafından gönderilen `companyId` (req.body.companyId) ASLA güven kaynağı olarak kullanılmaz.** 
- Güvenlik kontrolü her zaman `req.context.effectiveCompanyId` üzerinden yapılmalıdır.
- Kullanıcı bir kayıt (POST) oluştururken backend `companyId` değerini zorunlu olarak `effectiveCompanyId` ile ezer.

## 3. Doğrudan Prisma Kullanımı Yasaktır
- Tenant-owned (müşteriye ait verilerle çalışan) servisler (Örn: `clients.service.js`) **doğrudan global Prisma instance'ını import edemez**.
- Tüm veritabanı işlemleri kendi Repository katmanı (Örn: `clients.repository.js`) üzerinden geçmek zorundadır.
- *(İstisna: Kapsamlı analiz ve raporlama yapan System modülü veya Superadmin rotaları gerekli olduğunda doğrudan raw Prisma kullanabilir, ancak bu çok sıkı denetlenir).*

## 4. Başka Şirket (Foreign Tenant) Verisi Sızdırılamaz
- Bir şirket (Tenant A), başka bir şirkete (Tenant B) ait veri ID'sini (IDOR) vererek işlem yapmaya çalışırsa sistem **hiçbir şekilde verinin var olduğunu ifşa etmemelidir**. (Örn: 403 Forbidden yerine güvenli 404 dönülmeli ya da "Kayıt bulunamadı" mesajı verilmelidir).

## 5. System Route'ları İzole Edilmiştir
- `/api/system/*` altında barınan tüm rotalar sadece `SUPERADMIN` rolüne açıktır.
- Normal acentelerin (`ADMIN`) bu route'lara hiçbir şart altında erişimi olamaz.

## 6. Etkin Şirket (Effective Company) Seçimi
- `effectiveCompanyId` değeri hiçbir zaman client-controlled header'lardan (`x-impersonate-tenant`, `x-company-id` vb.) körü körüne alınamaz. 
- Eğer ileride God Mode (Impersonation) eklenirse, bu durum özel bir Supabase JWT Claim'i veya güvenilir veritabanı tablosu (`ImpersonationSession`) ile doğrulanacaktır.

## 7. Public API (Website Integrations)
- Kimlik doğrulama olmadan çalışan Public Integrations (`POST /api/leads`) rotaları mutlaka çok sıkı bir şekilde (Zod ile "strict mode" vb.) doğrulanmalıdır. 
- Bu rotalar, rastgele obje injection veya prototype pollution saldırılarına karşı korunmak zorundadır. Kullanıcının gönderdiği payload olduğu gibi veritabanına yazılamaz.
