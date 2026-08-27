const { z } = require('zod');

// Common fields for all insurance types
const commonLeadFields = {
  fullName: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  phone: z.string().min(5, 'Geçerli bir telefon giriniz'),
  tcIdentity: z.string().optional().nullable().or(z.literal('')),
  email: z.string().email('Geçerli bir email giriniz').optional().nullable().or(z.literal('')),
  dateOfBirth: z.string().optional().nullable().or(z.literal('')),
  city: z.string().optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable().or(z.literal('')),
  licensePlate: z.string().optional().nullable().or(z.literal('')),
  documentNo: z.string().optional().nullable().or(z.literal(''))
};

// Define forms for each type using discriminated union or union
const aracSchema = z.object({
  insuranceType: z.literal('arac'),
  ...commonLeadFields,
  formData: z.object({}).passthrough().optional().nullable()
});

const daskSchema = z.object({
  insuranceType: z.literal('dask'),
  ...commonLeadFields,
  formData: z.object({
    buildingYear: z.coerce.number().optional().nullable(),
    buildingFloorCount: z.coerce.number().optional().nullable(),
    apartmentFloor: z.coerce.number().optional().nullable(),
    grossSquareMeters: z.coerce.number().optional().nullable(),
    buildingType: z.string().optional().nullable()
  }).passthrough().optional().nullable()
});

const kaskoSchema = z.object({
  insuranceType: z.literal('kasko'),
  ...commonLeadFields,
  formData: z.object({
    brand: z.string().optional().nullable(),
    model: z.string().optional().nullable(),
    year: z.coerce.number().optional().nullable(),
    chassisNo: z.string().optional().nullable()
  }).passthrough().optional().nullable()
});

const trafikSchema = z.object({
  insuranceType: z.literal('trafik'),
  ...commonLeadFields,
  formData: z.object({
    brand: z.string().optional().nullable(),
    model: z.string().optional().nullable(),
    year: z.coerce.number().optional().nullable(),
    chassisNo: z.string().optional().nullable()
  }).passthrough().optional().nullable()
});

const konutSchema = z.object({
  insuranceType: z.literal('konut'),
  ...commonLeadFields,
  formData: z.object({
    propertyType: z.string().optional().nullable(),
    grossSquareMeters: z.coerce.number().optional().nullable(),
    buildingAge: z.coerce.number().optional().nullable(),
    floor: z.coerce.number().optional().nullable()
  }).passthrough().optional().nullable()
});

const isYeriSchema = z.object({
  insuranceType: z.literal('is_yeri'),
  ...commonLeadFields,
  formData: z.object({
    businessName: z.string().optional().nullable(),
    businessType: z.string().optional().nullable(),
    grossSquareMeters: z.coerce.number().optional().nullable(),
    taxNumber: z.string().optional().nullable()
  }).passthrough().optional().nullable()
});

const saglikSchema = z.object({
  insuranceType: z.literal('saglik'),
  ...commonLeadFields,
  formData: z.object({
    coverageType: z.string().optional().nullable()
  }).passthrough().optional().nullable()
});

const createPublicLeadSchema = {
  body: z.discriminatedUnion('insuranceType', [
    aracSchema,
    daskSchema,
    kaskoSchema,
    trafikSchema,
    konutSchema,
    isYeriSchema,
    saglikSchema
  ])
};

// CRM internal update validation
const updateLeadStatusSchema = {
  params: z.object({
    id: z.string().uuid("Geçerli bir ID formatı (UUID) giriniz")
  }),
  body: z.object({
    status: z.nativeEnum(require('../../constants/enums').LeadStatus),
    premium: z.number().nonnegative().optional().nullable(),
    commission: z.number().nonnegative().optional().nullable()
  }).strict()
};

const deleteLeadSchema = {
  params: z.object({
    id: z.string().uuid("Geçerli bir ID formatı (UUID) giriniz")
  })
};

module.exports = {
  createPublicLeadSchema,
  updateLeadStatusSchema,
  deleteLeadSchema
};
