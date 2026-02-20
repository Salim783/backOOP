const getCategoriesStats = async (_req, res) => {
  // Dummy data (có thể thay bằng DB sau)
  return res.status(200).json({
    message: 'Stats categories (public).',
    categories: [
      { categorie: 'Test', count: 1 },
      { categorie: 'Non classe', count: 0 },
    ],
  });
};

module.exports = { getCategoriesStats };