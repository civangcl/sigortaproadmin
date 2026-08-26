# API Pagination Standard

SigortaPro Backend API'sinde tüm listeleme uç noktaları (GET endpoints) varsayılan olarak sayfalanmış (paginated) veri döner.

## Request Parameters (Query)
Tüm listeleme istekleri aşağıdaki query parametrelerini kabul eder:

| Parametre | Tip     | Varsayılan | Açıklama | Limitler |
| --------- | ------- | ---------- | -------- | -------- |
| `page`    | integer | 1          | Sayfa Numarası | min: 1 |
| `limit`   | integer | 25         | Sayfa Başına Kayıt | min: 1, max: 100 |

Örnek İstek:
`GET /api/clients?page=2&limit=50`

## Response Format
API, listeleme isteklerinde standart olarak aşağıdaki JSON yapısını döner:

```json
{
  "items": [
    { "id": "1", "name": "..." },
    { "id": "2", "name": "..." }
  ],
  "pagination": {
    "page": 2,
    "limit": 50,
    "total": 120,
    "totalPages": 3,
    "hasNext": true,
    "hasPrevious": true
  }
}
```

> **Not:** Toplam kayıt (`total`), isteği yapan kullanıcının bağlı olduğu şirkete (Tenant) göre otomatik olarak kısıtlanır.

## Desteklenen Uç Noktalar
- `GET /api/clients`
- `GET /api/leads`
- `GET /api/financials`
- `GET /api/messages`
- `GET /api/system/companies`
