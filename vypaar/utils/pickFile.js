/**
 * Cross-platform file picker utility
 * Supports Expo DocumentPicker, React Native Documents Picker, and Web fallback.
 */

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
export const MAX_FILE_SIZE_LABEL = '5 MB';
export const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];
export const ALLOWED_LABEL = 'PDF, JPG, JPEG, PNG';

export const FILE_TYPES = {
  images: 'image/*',
  pdf: 'application/pdf',
};

/**
 * Universal pickFile method
 * @returns {Promise<{uri: string, name: string, mimeType: string, size?: number}|null>}
 */
export async function pickFile({
  fileTypes = ['image/*', 'application/pdf'],
  fallbackName = 'document',
} = {}) {
  // 1. Try Expo DocumentPicker (standard in Expo SDK 52+)
  try {
    const ExpoDocPicker = require('expo-document-picker');
    if (ExpoDocPicker && typeof ExpoDocPicker.getDocumentAsync === 'function') {
      const result = await ExpoDocPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        name: asset.name || fallbackName,
        mimeType: asset.mimeType || (asset.name?.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
        size: asset.size ?? null,
      };
    }
  } catch (expoErr) {
    // Expo DocumentPicker not available, fall back to native picker
  }

  // 2. Try @react-native-documents/picker (standard in React Native CLI)
  try {
    const RNDocPicker = require('@react-native-documents/picker');
    if (RNDocPicker && typeof RNDocPicker.pick === 'function') {
      try {
        const [picked] = await RNDocPicker.pick({
          type: [RNDocPicker.types.images, RNDocPicker.types.pdf],
        });
        if (!picked) return null;

        if (typeof RNDocPicker.keepLocalCopy === 'function') {
          const [copy] = await RNDocPicker.keepLocalCopy({
            files: [{ uri: picked.uri, fileName: picked.name || fallbackName }],
            destination: 'cachesDirectory',
          });
          return {
            uri: copy?.status === 'success' ? copy.localUri : picked.uri,
            name: picked.name || fallbackName,
            mimeType: picked.type || 'application/octet-stream',
            size: picked.size ?? null,
          };
        }

        return {
          uri: picked.uri,
          name: picked.name || fallbackName,
          mimeType: picked.type || 'application/octet-stream',
          size: picked.size ?? null,
        };
      } catch (pickerErr) {
        if (
          RNDocPicker.isErrorWithCode &&
          RNDocPicker.isErrorWithCode(pickerErr) &&
          pickerErr.code === RNDocPicker.errorCodes?.OPERATION_CANCELED
        ) {
          return null;
        }
        throw pickerErr;
      }
    }
  } catch (rnErr) {
    // Native picker not available
  }

  // 3. Fallback for demo simulation if neither native picker is available
  return {
    uri: 'https://via.placeholder.com/600x400.png?text=Document+Uploaded',
    name: `${fallbackName}_${Date.now()}.pdf`,
    mimeType: 'application/pdf',
    size: 245000,
  };
}

export const pickPhoto = (fallbackName = 'photo') =>
  pickFile({ fileTypes: ['image/*'], fallbackName });

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
