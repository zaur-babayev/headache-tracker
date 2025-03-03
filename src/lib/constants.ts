// Medication definitions
export const MEDICATIONS = [
  { id: 'ibuprofen', name: 'Ibuprofen' },
  { id: 'paracetamol', name: 'Paracetamol' },
  { id: 'aspirin', name: 'Aspirin' },
  { id: 'zolmitriptan', name: 'Zolmitriptan' },
];

// Medication names mapping
export const MEDICATION_NAMES: Record<string, string> = {
  'ibuprofen': 'Ibuprofen',
  'paracetamol': 'Paracetamol',
  'aspirin': 'Aspirin',
  'zolmitriptan': 'Zolmitriptan',
};

// Trigger definitions
export const TRIGGERS = [
  { id: 'lack-of-sleep', label: 'Lack of sleep' },
  { id: 'too-much-sleep', label: 'Too much sleep' },
  { id: 'stress', label: 'Stress' },
  { id: 'hunger', label: 'Hunger' },
];

// Trigger names mapping
export const TRIGGER_NAMES: Record<string, string> = {
  'lack-of-sleep': 'Lack of sleep',
  'too-much-sleep': 'Too much sleep',
  'stress': 'Stress',
  'hunger': 'Hunger',
};
