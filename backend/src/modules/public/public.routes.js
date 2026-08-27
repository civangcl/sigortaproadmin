const express = require('express');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

// Strict but simple validation schemas for the exact payload sent by the frontend
const leadSchema = z.object({
  insuranceType: z.string().optional().nullable(),
  fullName: z.string().min(1, 'Ad soyad zorunludur'),
  tcIdentity: z.string().optional().nullable(),
  phone: z.string().min(1, 'Telefon zorunludur'),
  email: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  licensePlate: z.string().optional().nullable(),
  documentNo: z.string().optional().nullable()
});

const contactSchema = z.object({
  fullName: z.string().min(1, 'Ad soyad zorunludur'),
  phoneNumber: z.string().optional().nullable(),
  email: z.string().min(1, 'E-posta zorunludur'),
  subject: z.string().optional().nullable(),
  content: z.string().min(1, 'Mesaj zorunludur')
});

// Generic validation middleware
const validate = (schema) => (req, res, next) => {
  try {
    req.validatedBody = schema.parse(req.body);
    next();
  } catch (error) {
    if (error.name === 'ZodError') {
      const issues = error.issues ?? error.errors ?? [];
      const details = issues.map(issue => ({
        field: issue.path?.join('.') || 'unknown',
        message: issue.message
      }));
      return res.status(400).json({
        success: false,
        error: 'Gönderilen bilgiler geçersiz.',
        code: 'VALIDATION_ERROR',
        details
      });
    }
    next(error);
  }
};

// POST /api/public/firat-ece/lead
router.post('/firat-ece/lead', validate(leadSchema), async (req, res) => {
  try {
    const companyId = process.env.FIRAT_ECE_COMPANY_ID || 'f74c889c-1887-40fc-8710-3630bccff59d';
    const data = req.validatedBody;

    const inputType = (data.insuranceType || '').toLowerCase();
    const insuranceType = inputType === 'dask' || inputType === 'konut' ? 'dask' : 'arac';

    const lead = await prisma.lead.create({
      data: {
        companyId,
        insuranceType,
        fullName: data.fullName,
        tcKimlikNo: data.tcIdentity,
        phoneNumber: data.phone,
        email: data.email,
        dateOfBirth: data.dateOfBirth,
        city: data.city,
        address: data.address,
        licensePlate: data.licensePlate,
        belgeNo: data.documentNo,
        status: 'yeni'
      }
    });

    try {
      const NotificationService = require('../../services/notification.service');
      await NotificationService.notifyNewLead(lead, companyId);
    } catch (pushErr) {
      console.error('Non-fatal error notifying lead:', pushErr);
    }

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Error creating public lead:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/public/firat-ece/contact
router.post('/firat-ece/contact', validate(contactSchema), async (req, res) => {
  try {
    const companyId = process.env.FIRAT_ECE_COMPANY_ID || 'f74c889c-1887-40fc-8710-3630bccff59d';
    const data = req.validatedBody;

    let finalMessage = data.content;
    if (data.subject || data.phoneNumber) {
      finalMessage = `Konu: ${data.subject || '-'}\nTelefon: ${data.phoneNumber || '-'}\n\n${data.content}`;
    }

    await prisma.message.create({
      data: {
        companyId,
        fullName: data.fullName,
        email: data.email,
        message: finalMessage,
        status: 'yeni'
      }
    });

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Error creating public contact:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
