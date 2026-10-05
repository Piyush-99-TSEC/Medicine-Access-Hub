// Converts a medicine from the backend API into the shape the UI components already use.
export function toUiMedicine(m) {
  return {
    id: m.id,
    brand: m.brandName,
    generic: m.saltComposition,
    salt: m.saltComposition,
    strength: m.strength,
    form: m.dosageForm,
    manufacturer: m.manufacturer,
    packSize: m.packSize,
    mrp: Number(m.mrp),
    rxRequired: m.rxRequired
  };
}