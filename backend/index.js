// backend/index.js

require('dotenv').config();

const express = require('express');
const cors = require('cors');

// O resto das importações vem DEPOIS
const authRoutes = require('./routes/authRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const selfAssessmentRoutes = require('./routes/selfAssessmentRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const goalRoutes = require('./routes/goalRoutes');
const reportRoutes = require('./routes/reportRoutes');
// const testRoutes = require('./routes/testRoutes'); // <--- COMENTE ESTA LINHA
// const { startScheduler } = require('./services/schedulerService') // <--- COMENTE ESTA LINHA
const oeeRoutes = require('./routes/oeeRoutes');
const productionLineRoutes = require('./routes/productionLineRoutes')
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Registro de todas as rotas
app.use('/api/auth', authRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/self-assessment', selfAssessmentRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/reports', reportRoutes);
// app.use('/api/test', testRoutes); // <--- COMENTE ESTA LINHA
app.use('/api/oee', oeeRoutes);
app.use('/api/production-lines', productionLineRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  // startScheduler(); // <--- COMENTE ESTA LINHA
});