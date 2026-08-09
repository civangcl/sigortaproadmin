'use server'

import prisma from '@/lib/prisma'
import { getCompanyProfile } from './admin'

export async function getInvoices() {
  try {
    const company = await getCompanyProfile()
    if (!company) return []

    const invoices = await prisma.invoice.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: 'desc' },
      include: {
        client: true,
        items: true,
      }
    })

    return invoices
  } catch (error) {
    console.error('Failed to fetch invoices:', error)
    return []
  }
}

export async function createInvoice(data: {
  invoiceNo: string
  date: string
  taxRate: number
  subtotal: number
  taxAmount: number
  total: number
  clientId: string
  items: Array<{ description: string; quantity: number; price: number }>
}) {
  try {
    const company = await getCompanyProfile()
    if (!company) return { success: false, error: 'Company not found' }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNo: data.invoiceNo,
        date: new Date(data.date),
        taxRate: data.taxRate,
        subtotal: data.subtotal,
        taxAmount: data.taxAmount,
        total: data.total,
        clientId: data.clientId,
        companyId: company.id,
        items: {
          create: data.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    })

    // Also add to financial history as income if not already there, 
    // but usually invoices might just be records. Let's just return success.
    return { success: true, invoice }
  } catch (error) {
    console.error('Failed to create invoice:', error)
    return { success: false, error: 'Fatura kaydedilemedi.' }
  }
}

export async function deleteInvoice(id: string) {
  try {
    await prisma.invoice.delete({
      where: { id },
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to delete invoice:', error)
    return { success: false, error: 'Fatura silinemedi.' }
  }
}
