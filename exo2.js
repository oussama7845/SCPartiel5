const readline = require('readline');

class PrescriptionValidator {
  constructor(stock) {
    this.stock = stock; 
  }

  validateRule801(patient, medication) {
    if (medication !== 'X') return true;
    const { whiteBloodCellCount, protocol, relapseYear } = patient;
    return (
      whiteBloodCellCount > 2000 ||
      (protocol === 'Gamma' && (whiteBloodCellCount > 1500 || relapseYear > 2019))
    );
  }

  validateRule327(patient, medications, day, underIRM) {
    if (!medications.includes('Y') || !medications.includes('Z')) return true;
    return patient.geneticMarkers.includes('BRCA1') || (day === 'Wednesday' && underIRM);
  }

  validateRule666(medication, quantity, day) {
    const emergencyReserve = 3;
    let requiredStock = quantity + emergencyReserve;
    if (day === 'Saturday' || day === 'Sunday') {
      requiredStock *= 1.2; // Ajout de 20% pour le week-end
    }
    return this.stock[medication] >= requiredStock;
  }

  validatePrescription(patient, medications, day, underIRM = false) {
    for (const med of medications) {
      if (!this.validateRule801(patient, med)) {
        return `Prescription refusée: Règle 801 non respectée pour ${med}`;
      }
    }
    if (!this.validateRule327(patient, medications, day, underIRM)) {
      return 'Prescription refusée: Règle 327 non respectée';
    }
    for (const med of medications) {
      if (!this.validateRule666(med, 1, day)) {
        return `Prescription refusée: Stock insuffisant pour ${med}`;
      }
    }
    return 'Prescription validée';
  }
}

const stock = { X: 10, Y: 5, Z: 5, W: 10 };
const validator = new PrescriptionValidator(stock);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const patient = {};

function askQuestion(question, callback) {
  rl.question(question, (answer) => {
    if (!answer.trim()) {
      console.log('⚠️ Valeur obligatoire. Veuillez entrer une réponse.');
      askQuestion(question, callback);
    } else {
      callback(answer.trim());
    }
  });
}

askQuestion('Entrez le taux de globules blancs : ', (wbc) => {
  patient.whiteBloodCellCount = parseInt(wbc);
  askQuestion('Entrez le protocole (Gamma, Alpha, Beta, etc.) : ', (protocol) => {
    patient.protocol = protocol;
    askQuestion("Entrez l'année de la dernière rechute : ", (relapseYear) => {
      patient.relapseYear = parseInt(relapseYear);
      askQuestion('Entrez les marqueurs génétiques séparés par un espace (ex: BRCA1 BRCA2) : ', (geneticMarkers) => {
        patient.geneticMarkers = geneticMarkers.split(' ');
        askQuestion('Entrez les médicaments séparés par une virgule : ', (medicationsInput) => {
          const medications = medicationsInput.split(',').map(med => med.trim());
          askQuestion('Entrez le jour de la prescription : ', (day) => {
            askQuestion('Sous surveillance IRM ? (oui/non) : ', (underIRMInput) => {
              const underIRM = underIRMInput.toLowerCase() === 'oui';
              console.log(validator.validatePrescription(patient, medications, day, underIRM));
              rl.close();
            });
          });
        });
      });
    });
  });
});


module.exports = PrescriptionValidator;
