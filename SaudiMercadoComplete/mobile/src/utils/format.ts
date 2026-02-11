export const formatSAR = (value: number) => `${value.toFixed(2)} ر.س`;

export const toArabicDigits = (value: string | number) =>
  String(value).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);
