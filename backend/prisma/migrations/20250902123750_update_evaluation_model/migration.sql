/*
  Warnings:

  - You are about to drop the column `availability` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `certifications_notes` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `commitment_score` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `executionTimeframe_score` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `experienceTime_notes` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `performance` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `proactivity_score` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `problemSolvingInitiative_score` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `quality` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `serviceQuality_score` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `teamwork_score` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `technicalKnowledge_notes` on the `Evaluation` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Evaluation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "quick_score" INTEGER,
    "standard_score" INTEGER,
    "qtdGeralManutencao_score" INTEGER,
    "quebraMaior30minTurno_score" INTEGER,
    "mttrTurno_score" INTEGER,
    "qualidadeExecucaoEWO_score" INTEGER,
    "tempoAberturaEWO_score" INTEGER,
    "opeGeral_score" INTEGER,
    "nonOpeBreak_score" INTEGER,
    "absenteismo_score" INTEGER,
    "saturacaoTrabalho_score" INTEGER,
    "sugestoesSeguranca_score" INTEGER,
    "cartoesRecebidos_score" INTEGER,
    "zeroAcidenteTurno_score" INTEGER,
    "condicoesAbertasArea_score" INTEGER,
    "atendimentoUTE_score" INTEGER,
    "avaliacaoTecnica_score" INTEGER,
    "backlogManutencao_score" INTEGER,
    "avaliacaoComportamental_score" INTEGER,
    "qualidadeLancamentosSAP_score" INTEGER,
    "finalScore" REAL,
    CONSTRAINT "Evaluation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Evaluation" ("createdAt", "id", "updatedAt", "userId") SELECT "createdAt", "id", "updatedAt", "userId" FROM "Evaluation";
DROP TABLE "Evaluation";
ALTER TABLE "new_Evaluation" RENAME TO "Evaluation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
