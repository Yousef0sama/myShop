module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ status: 'ok', configured: Boolean(process.env.OPENROUTER_API_KEY) });
};
