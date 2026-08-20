/**
 * Pure React Native CLI Document & File Picker Utility
 * Uses react-native-document-picker / @react-native-documents/picker
 */
import DocumentPicker from 'react-native-document-picker';

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
export const MAX_FILE_SIZE_LABEL = '5 MB';
export const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];
export const ALLOWED_LABEL = 'PDF, JPG, JPEG, PNG';

export const FILE_TYPES = {
  images: DocumentPicker.types.images,
  pdf: DocumentPicker.types.pdf,
  allFiles: DocumentPicker.types.allFiles,
};

/**
 * Universal pickFile method for React Native Bare CLI
 * @returns {Promise<{uri: string, name: string, mimeType: string, size?: number}|null>}
 */
export async function pickFile({
  fileTypes = [DocumentPicker.types.images, DocumentPicker.types.pdf],
  fallbackName = 'document',
} = {}) {
  try {
    const results = await DocumentPicker.pick({
      type: fileTypes,
      allowMultiSelection: false,
    });

    if (!results || results.length === 0) {
      return null;
    }

    const picked = results[0];
    return {
      uri: picked.uri,
      name: picked.name || fallbackName,
      mimeType: picked.type || (picked.name?.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
      size: picked.size ?? null,
    };
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      return null;
    }
    console.warn('Document picker error:', err);
    return null;
  }
}

export const pickPhoto = (fallbackName = 'photo') =>
  pickFile({ fileTypes: [DocumentPicker.types.images], fallbackName });

/* ============================ helpers ============================ */

export const fileExtension = (file) =>
  String(file?.name || '').split('.').pop()?.toLowerCase() || '';

export const isImageFile = (file) => {
  if (file?.mimeType?.startsWith('image/')) return true;
  return ['jpg', 'jpeg', 'png'].includes(fileExtension(file));
};

export const isPdfFile = (file) =>
  file?.mimeType === 'application/pdf' || fileExtension(file) === 'pdf';

export function formatFileSize(bytes) {
  if (bytes === null || bytes === undefined || Number.isNaN(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function validatePickedFile(file) {
  if (!file) return null;

  const ext = fileExtension(file);
  if (ext && !ALLOWED_EXTENSIONS.includes(ext)) {
    return `Sirf ${ALLOWED_LABEL} allowed hain`;
  }

  if (file.size !== null && file.size !== undefined && file.size > MAX_FILE_SIZE) {
    return `File ${MAX_FILE_SIZE_LABEL} se badi hai (${formatFileSize(file.size)})`;
  }

  return null;
}
