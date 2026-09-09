const MEBIBYTE = 1024 * 1024;

export const IMAGE_UPLOAD_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/x-icon',
  'image/vnd.microsoft.icon'
];

export const VIDEO_UPLOAD_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg'
];

export const ALLOWED_UPLOAD_TYPES = [...IMAGE_UPLOAD_TYPES, ...VIDEO_UPLOAD_TYPES];

const typeMatchesAccept = (file, accept) => {
  const rules = String(accept || '')
    .split(',')
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean);

  if (rules.length === 0) return true;

  const mime = String(file.type || '').toLowerCase();
  const extension = `.${String(file.name || '').split('.').pop().toLowerCase()}`;

  return rules.some((rule) => {
    if (rule.endsWith('/*')) return mime.startsWith(rule.slice(0, -1));
    if (rule.startsWith('.')) return extension === rule;
    return mime === rule;
  });
};

export const validateUploadFile = (file, { accept, maxImageMB = 10, maxVideoMB = 25 } = {}) => {
  if (!file || typeof file.size !== 'number') {
    throw new Error('Please choose a valid file.');
  }

  const mime = String(file.type || '').toLowerCase();
  if (!ALLOWED_UPLOAD_TYPES.includes(mime) || !typeMatchesAccept(file, accept)) {
    throw new Error('This file type is not allowed. Use JPG, PNG, WebP, GIF, AVIF, ICO, MP4, WebM, or OGG.');
  }

  const maximumMB = mime.startsWith('video/') ? maxVideoMB : maxImageMB;
  if (file.size <= 0 || file.size > maximumMB * MEBIBYTE) {
    throw new Error(`The file must be smaller than ${maximumMB} MB.`);
  }

  return true;
};

const sanitizePathSegment = (segment) => String(segment)
  .normalize('NFKD')
  .replace(/[^a-zA-Z0-9._-]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 120);

export const sanitizeStoragePath = (path) => {
  const segments = String(path || '')
    .replace(/\\/g, '/')
    .split('/')
    .filter(Boolean)
    .map(sanitizePathSegment)
    .filter((segment) => segment && segment !== '.' && segment !== '..');

  if (segments.length === 0) throw new Error('Invalid upload path.');
  return segments.join('/');
};
