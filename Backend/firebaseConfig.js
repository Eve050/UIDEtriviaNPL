const admin = require("firebase-admin");
const serviceAccount = require("./path/to/tu-service-account.json"); // Descargado de Firebase

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = { db };