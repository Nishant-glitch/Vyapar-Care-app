import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useGSTForm } from '../contexts/GSTFormContext';
import { pickFile, validatePickedFile } from '../utils/pickFile';

/**
 * Document upload ka poora flow ek jagah — pick, size/type check, progress,
 * aur context me save. Teeno document screens (address, bank, documents) yahi
 * use karti hain, isliye upload ka behaviour har jagah ek jaisa rehta hai.
 *
 * Progress simulated hai: file abhi sirf local cache me copy hoti hai, asli
 * server upload Review step (Part 3) pe hoga.
 */

const PROGRESS_STEPS = [15, 40, 65, 85, 100];
const PROGRESS_TICK = 220; // ms — total ~1.1s

export function useDocumentUpload() {
  const { uploadDocument, deleteDocument } = useGSTForm();

  // { [documentId]: 0-100 } — sirf upload chalne ke dauraan
  const [progress, setProgress] = useState({});
  const [errors, setErrors] = useState({});
  const timers = useRef([]);

  // unmount pe pending timers clear — warna "setState on unmounted" chalega
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const clearError = useCallback((documentId) => {
    setErrors((prev) => {
      if (!prev[documentId]) return prev;
      const next = { ...prev };
      delete next[documentId];
      return next;
    });
  }, []);

  const runProgress = useCallback(
    (documentId) =>
      new Promise((resolve) => {
        PROGRESS_STEPS.forEach((value, i) => {
          const timer = setTimeout(() => {
            setProgress((prev) => ({ ...prev, [documentId]: value }));
            if (i === PROGRESS_STEPS.length - 1) resolve();
          }, PROGRESS_TICK * (i + 1));
          timers.current.push(timer);
        });
      }),
    []
  );

  /**
   * Picker kholta hai aur file ko context me daal deta hai.
   * @param onDone optional — file save hone ke baad extra kaam (member photo sync)
   */
  const upload = useCallback(
    async (documentId, { fileTypes, fallbackName, onDone } = {}) => {
      clearError(documentId);

      let file;
      try {
        file = await pickFile({ fileTypes, fallbackName: fallbackName || documentId });
      } catch (err) {
        console.log(`Pick failed for ${documentId}:`, err.message);
        Alert.alert('Could not open file', err.message);
        return null;
      }

      if (!file) return null; // user ne cancel kiya

      const problem = validatePickedFile(file);
      if (problem) {
        console.log(`File rejected for ${documentId}: ${problem}`);
        setErrors((prev) => ({ ...prev, [documentId]: problem }));
        return null;
      }

      setProgress((prev) => ({ ...prev, [documentId]: 5 }));
      await runProgress(documentId);

      uploadDocument(documentId, file);
      console.log(`Uploaded ${documentId}: ${file.name}`);

      // progress bar hata dete hain — ab card uploaded state dikhayega
      setProgress((prev) => {
        const next = { ...prev };
        delete next[documentId];
        return next;
      });

      onDone?.(file);
      return file;
    },
    [clearError, runProgress, uploadDocument]
  );

  const remove = useCallback(
    (documentId, { onDone } = {}) => {
      clearError(documentId);
      deleteDocument(documentId);
      console.log(`Removed ${documentId}`);
      onDone?.();
    },
    [clearError, deleteDocument]
  );

  return {
    upload,
    remove,
    progress,
    errors,
    isUploading: (documentId) => progress[documentId] !== undefined,
  };
}
