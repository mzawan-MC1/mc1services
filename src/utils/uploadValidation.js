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

const loadImageMetadata = (file) => new Promise((resolve, reject) => {
  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    URL.revokeObjectURL(objectUrl);
    resolve({
      media_type: 'image',
      width: image.naturalWidth || image.width,
      height: image.naturalHeight || image.height,
      duration_seconds: null,
      mime_type: file.type
    });
  };
  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    reject(new Error('The selected image could not be read.'));
  };
  image.src = objectUrl;
});

const loadVideoMetadata = (file) => new Promise((resolve, reject) => {
  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.preload = 'metadata';
  video.onloadedmetadata = () => {
    URL.revokeObjectURL(objectUrl);
    resolve({
      media_type: 'video',
      width: video.videoWidth,
      height: video.videoHeight,
      duration_seconds: Number.isFinite(video.duration) ? Number(video.duration.toFixed(2)) : null,
      mime_type: file.type
    });
  };
  video.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    reject(new Error('The selected video could not be read.'));
  };
  video.src = objectUrl;
});

export const inspectMediaFile = async (file) => {
  const mime = String(file?.type || '').toLowerCase();
  if (mime.startsWith('video/')) return loadVideoMetadata(file);
  return loadImageMetadata(file);
};

export const validateMediaRequirements = (metadata, requirements = {}) => {
  if (!metadata) return true;

  const {
    width,
    height,
    minWidth,
    minHeight,
    aspectRatio,
    tolerance = 0.1,
    maxDurationSeconds
  } = requirements;

  if (minWidth && metadata.width < minWidth) {
    throw new Error(`Minimum width is ${minWidth}px; this file is ${metadata.width}px wide.`);
  }
  if (minHeight && metadata.height < minHeight) {
    throw new Error(`Minimum height is ${minHeight}px; this file is ${metadata.height}px high.`);
  }
  if (width && Math.abs(metadata.width - width) > width * tolerance) {
    throw new Error(`Recommended width is ${width}px (±${Math.round(tolerance * 100)}%); this file is ${metadata.width}px.`);
  }
  if (height && Math.abs(metadata.height - height) > height * tolerance) {
    throw new Error(`Recommended height is ${height}px (±${Math.round(tolerance * 100)}%); this file is ${metadata.height}px.`);
  }
  if (aspectRatio && metadata.height > 0) {
    const actualRatio = metadata.width / metadata.height;
    if (Math.abs(actualRatio - aspectRatio) > aspectRatio * tolerance) {
      throw new Error(`The file must use the recommended aspect ratio; received ${metadata.width}×${metadata.height}px.`);
    }
  }
  if (maxDurationSeconds && metadata.media_type === 'video' && metadata.duration_seconds > maxDurationSeconds) {
    throw new Error(`Video duration must not exceed ${maxDurationSeconds} seconds.`);
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
