const sanitizeHtml = require('sanitize-html');

const sanitizePlainText = (value, maxLength = 500) => {
  if (typeof value !== 'string') return null;
  const plainText = sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
    nonTextTags: ['script', 'style', 'textarea', 'option'],
  })
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim();

  if (plainText.length === 0 || plainText.length > maxLength) return null;
  return plainText;
};

module.exports = { sanitizePlainText };
