export const ALLOWED_MIME_TYPES = [
    'image/jpeg', 
    'image/png', 
    'image/webp', 
    'application/pdf'
];

export const COMPANY_DOC_TYPES = [
    {
        id: 'cc',
        label: 'Cédula de Ciudadanía',
        subtitle: 'Del representante legal de la empresa',
        accept: 'image/jpeg,image/png,image/webp,application/pdf',
        icon: '🪪',
        required: true
    },
    {
        id: 'rut_nit',
        label: 'RUT o NIT',
        subtitle: 'Documento tributario de la empresa',
        accept: 'image/jpeg,image/png,image/webp,application/pdf',
        icon: '📄',
        required: true
    }
];

export const WORKER_DOC_TYPES = [
    {
        id: 'cc',
        label: 'Cédula de Ciudadanía / Extranjería',
        subtitle: 'Tu documento de identidad oficial',
        accept: 'image/jpeg,image/png,image/webp,application/pdf',
        icon: '🪪',
        required: true
    },
    {
        id: 'selfie',
        label: 'Selfie con el Documento',
        subtitle: 'Sostén tu documento cerca de tu rostro',
        accept: 'image/jpeg,image/png,image/webp', // No PDF for selfies
        icon: '📸',
        required: true
    }
];
