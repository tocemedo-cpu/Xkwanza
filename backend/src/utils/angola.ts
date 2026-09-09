// Lista de referência das províncias de Angola, usada na validação de registo e endereços.
export const ANGOLA_PROVINCES = [
  'Bengo',
  'Benguela',
  'Bié',
  'Cabinda',
  'Cuando Cubango',
  'Cuanza Norte',
  'Cuanza Sul',
  'Cunene',
  'Huambo',
  'Huíla',
  'Luanda',
  'Lunda Norte',
  'Lunda Sul',
  'Malanje',
  'Moxico',
  'Namibe',
  'Uíge',
  'Zaire',
] as const;

export type AngolaProvince = (typeof ANGOLA_PROVINCES)[number];

// Telefone angolano: +244 seguido de 9 dígitos.
export const ANGOLA_PHONE_REGEX = /^\+244\d{9}$/;
