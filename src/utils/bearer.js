function normalizeBearerToken(token) {
  if (!token) return '';
  const trimmed = token.trim();
  if (trimmed.toLowerCase().startsWith('bearer ')) {
    return `Bearer ${trimmed.slice(7)}`;
  }
  return `Bearer ${trimmed}`;
}

module.exports = { normalizeBearerToken };
