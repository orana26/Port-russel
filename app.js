require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const app = express();
const isAuthenticated = require('./middleware/authMiddleware');
const catwayRoutes = require('./routes/catwayRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const userRoutes = require('./routes/userRoutes');
const PORT = process.env.PORT || 3000;

// Lecture des requêtes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Mise à disposition des fichiers publics
app.use(express.static('public'));

console.log(
  "SESSION_SECRET présente :",
  Boolean(process.env.SESSION_SECRET)
);
// Configuration des sessions
app.use(
  session({
    name: "port-russell.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions"
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60
    }
  })
);

// Page d'accueil
app.get("/", (req, res) => {
  res.sendFile(require("path").join(__dirname, "public", "index.html"));
});
// Tableau de bord réservé aux utilisateurs connectés
app.get('/dashboard', isAuthenticated, (req, res) => {
  res.sendFile(require('path').join(__dirname, 'public', 'dashboard.html'));
});

// Routes d'authentification
const authRoutes = require("./routes/authRoutes");
app.use("/", authRoutes);
// Routes des catways
app.use('/catways', catwayRoutes);
app.use('/catways', reservationRoutes);
app.use('/users', userRoutes);
// Vérification de la session
app.get('/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({
      message: 'Vous devez être connecté.'
    });
  }

  res.json({
    message: 'Session active.',
    userId: req.session.userId
  });
});

// Route protégée de test
app.get('/protected', isAuthenticated, (req, res) => {
  res.json({
    message: 'Accès autorisé.',
    username: req.user.username
  });
});
// Connexion MongoDB et démarrage
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connecté");

  app.listen(PORT, () => {
    console.log("Serveur démarré sur http://localhost:" + PORT);
});
  })
  .catch((error) => {
    console.error("Erreur MongoDB :", error);
    process.exitCode = 1;
  });

module.exports = app;