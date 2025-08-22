const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ExcelJS = require('exceljs');
const prisma = new PrismaClient();

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
    });
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Este e-mail já está em uso.' });
    }
    res.status(500).json({ message: 'Erro interno ao registrar usuário.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      'SEU_SEGREDO_SUPER_SECRETO',
      { expiresIn: '8h' }
    );
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno ao fazer login.' });
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        evaluations: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          select: {
            createdAt: true,
          },
        },
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuários.' });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuário.' });
  }
};
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    // Transação para deletar o usuário e todos os seus registros relacionados
    const deleteTransactions = [
      prisma.feedback.deleteMany({ where: { OR: [{ recipientId: id }, { authorId: id }] } }),
      prisma.selfAssessment.deleteMany({ where: { userId: id } }),
      prisma.evaluation.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id: id } }),
    ];

    await prisma.$transaction(deleteTransactions);

    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    res.status(500).json({ message: 'Erro ao excluir usuário.', error: error.message });
  }
};
// ATUALIZAR O PERFIL DO PRÓPRIO USUÁRIO
exports.updateUserProfile = async (req, res) => {
  const { userId } = req.user; // Pega o ID do usuário logado a partir do token
  const { name, technicalSkills, certifications } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        technicalSkills,
        certifications,
      },
    });
    // Remove a senha do objeto de resposta
    const { password, ...userWithoutPassword } = updatedUser;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar o perfil.', error: error.message });
  }
};

// Adicionar ao final de backend/controllers/authController.js

exports.getUserStatsByRole = async (req, res) => {
  try {
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true,
      },
    });

    // Formata os dados para o gráfico
    const formattedData = usersByRole.map(item => ({
      name: item.role,
      value: item._count.id,
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar estatísticas de usuários por perfil.', error: error.message });
  }
};
exports.exportUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' },
      select: { name: true, email: true, role: true, createdAt: true },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Usuários');

    worksheet.columns = [
      { header: 'Nome do Usuário', key: 'name', width: 40 },
      { header: 'Email', key: 'email', width: 40 },
      { header: 'Perfil', key: 'role', width: 20 },
      { header: 'Data de Cadastro', key: 'createdAt', width: 20 },
    ];

    users.forEach(user => {
      worksheet.addRow({
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: new Date(user.createdAt).toLocaleDateString('pt-BR'),
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'Relatorio_Usuarios.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    res.status(500).json({ message: 'Erro ao exportar relatório de usuários.', error: error.message });
  }
};