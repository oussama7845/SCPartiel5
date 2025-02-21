const PrescriptionValidator = require('./exo2');

describe('PrescriptionValidator', () => {
  let validator;
  beforeEach(() => {
    validator = new PrescriptionValidator({ X: 10, Y: 5, Z: 5, W: 10 });
  });

  test('Règle 801 - Patient avec globules blancs insuffisants sans exception', () => {
    const patient = { whiteBloodCellCount: 1800, protocol: '', relapseYear: 2018, geneticMarkers: [] };
    expect(validator.validateRule801(patient, 'X')).toBe(false);
  });

  test('Règle 801 - Patient sous protocole Gamma avec 1600 globules blancs', () => {
    const patient = { whiteBloodCellCount: 1600, protocol: 'Gamma', relapseYear: 2020, geneticMarkers: [] };
    expect(validator.validateRule801(patient, 'X')).toBe(true);
  });

  test('Règle 327 - Médicaments Y et Z sans BRCA1 ni IRM le mercredi', () => {
    const patient = { geneticMarkers: [] };
    expect(validator.validateRule327(patient, ['Y', 'Z'], 'Monday', false)).toBe(false);
  });

  test('Règle 666 - Vérification du stock de médicament W en semaine', () => {
    expect(validator.validateRule666('W', 2, 'Tuesday')).toBe(true);
  });

  test('Prescription validée avec toutes les règles respectées', () => {
    const patient = { whiteBloodCellCount: 2500, protocol: '', relapseYear: 2018, geneticMarkers: ['BRCA1'] };
    expect(validator.validatePrescription(patient, ['X', 'Y'], 'Monday')).toBe('Prescription validée');
  });
});
