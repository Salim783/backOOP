const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../db/models/userModel');
const { jwtSecret, jwtExpiresIn } = require('../../config/jwt');

const registerUser = async ({ mail, mdp }) => {
  const existing = await User.findOne({ where: { mail } });
  if (existing) {
    const err = new Error('Ce mail est deja utilise.');
    err.status = 409;
    throw err;
  }

  const mdpHash = await bcrypt.hash(mdp, 12);
  const user = await User.create({ mail, mdp: mdpHash });

  return { id: user.id, mail: user.mail };
};

const loginUser = async ({ mail, mdp }) => {
  const user = await User.findOne({ where: { mail } });
  if (!user) {
    const err = new Error('Identifiants invalides.');
    err.status = 401;
    throw err;
  }

  const ok = await bcrypt.compare(mdp, user.mdp);
  if (!ok) {
    const err = new Error('Identifiants invalides.');
    err.status = 401;
    throw err;
  }

  const accessToken = jwt.sign(
    { sub: user.id, mail: user.mail },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );

  return { accessToken, user: { id: user.id, mail: user.mail } };
};

module.exports = { registerUser, loginUser };