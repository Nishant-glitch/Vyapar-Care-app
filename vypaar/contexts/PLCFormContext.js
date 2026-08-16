import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  SATISFIED_STATUSES,
  calculatePLCFees,
  getRequiredPLCDocuments,
} from '../config/plcDocumentConfig';

/**
 * 7-Step Private Limited Company Registration Form Context
 * Manages full multi-step state, dynamic directors, dynamic subscribers,
 * document deduplication / reuse, smart checklists, validation errors,
 * and completion calculations.
 */

export const PLC_STEPS = [
  { key: 'applicant', label: 'Applicant', route: 'PLCApplicant', stepNumber: 1 },
  { key: 'company', label: 'Company', route: 'PLCCompany', stepNumber: 2 },
  { key: 'directors', label: 'Directors', route: 'PLCDirectors', stepNumber: 3 },
  { key: 'office', label: 'Office', route: 'PLCOffice', stepNumber: 4 },
  { key: 'business', label: 'Business', route: 'PLCBusiness', stepNumber: 5 },
  { key: 'documents', label: 'Documents', route: 'PLCDocuments', stepNumber: 6 },
  { key: 'review', label: 'Review', route: 'PLCReview', stepNumber: 7 },
];

export const LAST_STEP = PLC_STEPS.length - 1;

const EMPTY_APPLICANT = {
  fullName: '',
  parentName: '',
  dob: '',
  pan: '',
  aadhaar: '',
  mobile: '',
  email: '',
  address: '',
  state: '',
  district: '',
  city: '',
  pincode: '',
};

const EMPTY_COMPANY = {
  proposedName1: '',
  proposedName2: '',
  mainActivity: 'it_software',
  description: '',
  registeredState: '07', // Default Delhi
  authorizedCapital: 100000,
  paidUpCapital: 100000,
  directorCount: 2,
  subscriberCount: 2,
};

const createEmptyDirector = (index = 0) => ({
  id: `dir_${index}_${Date.now()}`,
  fullName: '',
  parentName: '',
  dob: '',
  pan: '',
  aadhaar: '',
  gender: 'male',
  nationality: 'Indian',
  address: '',
  state: '',
  district: '',
  city: '',
  pincode: '',
  mobile: '',
  email: '',
  hasDIN: false,
  din: '',
});

const createEmptySubscriber = (index = 0) => ({
  id: `sub_${index}_${Date.now()}`,
  fullName: '',
  pan: '',
  aadhaar: '',
  address: '',
  mobile: '',
  email: '',
  sharesCount: 5000,
  shareholdingPercent: 50,
  isDirector: false,
  linkedDirectorIndex: null,
});

const EMPTY_OFFICE = {
  premisesType: 'rented',
  line1: '',
  line2: '',
  locality: '',
  city: '',
  district: '',
  state: '07',
  pincode: '',
  ownerName: '',
  ownerContact: '',
};

const EMPTY_BUSINESS = {
  mainActivity: 'it_software',
  natureOfBusiness: ['it_services', 'software_dev'],
  productsServices: 'Software Development & IT Consultancy Services',
  description: 'Design, development, implementation, and maintenance of modern web and mobile software applications.',
  primaryProduct: 'Cloud Software & Applications',
  hsnSac: '998314',
  turnover: 'under_20l',
  startDate: '',
  website: '',
  isExistingBusiness: false,
  existingBusinessDetails: '',
  additionalFields: {},
};

const EMPTY_FORM = {
  applicant: EMPTY_APPLICANT,
  company: EMPTY_COMPANY,
  directors: [createEmptyDirector(0), createEmptyDirector(1)],
  subscribers: [createEmptySubscriber(0), createEmptySubscriber(1)],
  office: EMPTY_OFFICE,
  business: EMPTY_BUSINESS,
};

const isFilled = (val) => {
  if (Array.isArray(val)) return val.length > 0;
  return val !== null && val !== undefined && String(val).trim() !== '';
};

const PLCFormContext = createContext(null);

export function PLCFormProvider({ children }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [documentState, setDocumentState] = useState({});
  const [errors, setErrors] = useState({});

  /* ========================= Field Updates ========================= */

  const updateField = useCallback((section, key, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));

    setErrors((prev) => {
      if (!prev[key] && !prev[`${section}_${key}`]) return prev;
      const next = { ...prev };
      delete next[key];
      delete next[`${section}_${key}`];
      return next;
    });
  }, []);

  /* ========================= Dynamic Directors ========================= */

  const updateDirector = useCallback((index, key, value) => {
    setFormData((prev) => {
      const updated = prev.directors.map((dir, i) =>
        i === index ? { ...dir, [key]: value } : dir
      );

      // Auto-update linked subscriber if subscriber is linked to this director
      const updatedSubscribers = prev.subscribers.map((sub) => {
        if (sub.isDirector && sub.linkedDirectorIndex === index) {
          const syncKeys = ['fullName', 'pan', 'aadhaar', 'address', 'mobile', 'email'];
          if (syncKeys.includes(key)) {
            return { ...sub, [key]: value };
          }
        }
        return sub;
      });

      return { ...prev, directors: updated, subscribers: updatedSubscribers };
    });

    setErrors((prev) => {
      const errKey = `director_${index}_${key}`;
      if (!prev[errKey]) return prev;
      const next = { ...prev };
      delete next[errKey];
      return next;
    });
  }, []);

  const setDirectorCount = useCallback((count) => {
    const target = Math.max(2, Math.min(count, 15));
    setFormData((prev) => {
      let nextDirs = [...prev.directors];
      if (target > nextDirs.length) {
        for (let i = nextDirs.length; i < target; i++) {
          nextDirs.push(createEmptyDirector(i));
        }
      } else if (target < nextDirs.length) {
        nextDirs = nextDirs.slice(0, target);
      }
      return {
        ...prev,
        company: { ...prev.company, directorCount: target },
        directors: nextDirs,
      };
    });
  }, []);

  /* ========================= Dynamic Subscribers & Deduplication ========================= */

  const updateSubscriber = useCallback((index, key, value) => {
    setFormData((prev) => ({
      ...prev,
      subscribers: prev.subscribers.map((sub, i) =>
        i === index ? { ...sub, [key]: value } : sub
      ),
    }));

    setErrors((prev) => {
      const errKey = `subscriber_${index}_${key}`;
      if (!prev[errKey] && !prev.totalShareholding) return prev;
      const next = { ...prev };
      delete next[errKey];
      delete next.totalShareholding;
      return next;
    });
  }, []);

  const setSubscriberCount = useCallback((count) => {
    const target = Math.max(2, Math.min(count, 200));
    setFormData((prev) => {
      let nextSubs = [...prev.subscribers];
      if (target > nextSubs.length) {
        const remainingPct = Math.max(0, Math.floor(100 / target));
        for (let i = nextSubs.length; i < target; i++) {
          const newSub = createEmptySubscriber(i);
          newSub.shareholdingPercent = remainingPct;
          nextSubs.push(newSub);
        }
      } else if (target < nextSubs.length) {
        nextSubs = nextSubs.slice(0, target);
      }
      return {
        ...prev,
        company: { ...prev.company, subscriberCount: target },
        subscribers: nextSubs,
      };
    });
  }, []);

  /**
   * Links a subscriber to a director instance.
   * Auto-populates data and links documents so duplicate uploads are avoided!
   */
  const linkSubscriberToDirector = useCallback((subscriberIndex, directorIndex) => {
    setFormData((prev) => {
      const director = prev.directors[directorIndex] || {};
      const updatedSubscribers = prev.subscribers.map((sub, i) => {
        if (i === subscriberIndex) {
          return {
            ...sub,
            isDirector: true,
            linkedDirectorIndex: directorIndex,
            fullName: director.fullName || sub.fullName,
            pan: director.pan || sub.pan,
            aadhaar: director.aadhaar || sub.aadhaar,
            address: director.address || sub.address,
            mobile: director.mobile || sub.mobile,
            email: director.email || sub.email,
          };
        }
        return sub;
      });
      return { ...prev, subscribers: updatedSubscribers };
    });
  }, []);

  const unlinkSubscriberFromDirector = useCallback((subscriberIndex) => {
    setFormData((prev) => ({
      ...prev,
      subscribers: prev.subscribers.map((sub, i) =>
        i === subscriberIndex
          ? { ...sub, isDirector: false, linkedDirectorIndex: null }
          : sub
      ),
    }));
  }, []);

  /* ========================= Dynamic Business Activity Fields ========================= */

  const updateBusinessAdditionalField = useCallback((key, value) => {
    setFormData((prev) => ({
      ...prev,
      business: {
        ...prev.business,
        additionalFields: { ...prev.business.additionalFields, [key]: value },
      },
    }));

    setErrors((prev) => {
      const errKey = `additional_${key}`;
      if (!prev[errKey]) return prev;
      const next = { ...prev };
      delete next[errKey];
      return next;
    });
  }, []);

  /* ========================= Document Management & Deduplication ========================= */

  /**
   * Smart derived document list from central config.
   * Automatically resolves deduplication when subscriber is linked to a director.
   */
  const documents = useMemo(() => {
    const list = getRequiredPLCDocuments({
      directorCount: formData.company.directorCount,
      directors: formData.directors,
      subscriberCount: formData.company.subscriberCount,
      subscribers: formData.subscribers,
      premisesType: formData.office.premisesType,
    });

    return list.map((doc) => {
      // Check if subscriber document is reused from a director
      if (doc.isReused && doc.reusedFromDocId) {
        const sourceDoc = documentState[doc.reusedFromDocId];
        const hasSourceFile = !!sourceDoc?.file;
        return {
          ...doc,
          file: sourceDoc?.file || null,
          status: hasSourceFile ? 'reused' : 'required',
          isReused: true,
          reusedFromLabel: doc.reusedFromLabel,
        };
      }

      const current = documentState[doc.id];
      return {
        ...doc,
        file: current?.file || null,
        status: current?.status || (current?.file ? 'uploaded' : doc.required ? 'required' : 'optional'),
      };
    });
  }, [
    formData.company.directorCount,
    formData.directors,
    formData.company.subscriberCount,
    formData.subscribers,
    formData.office.premisesType,
    documentState,
  ]);

  const uploadDocument = useCallback((documentId, file) => {
    setDocumentState((prev) => ({
      ...prev,
      [documentId]: {
        status: 'uploaded',
        file,
        uploadedAt: new Date().toISOString(),
      },
    }));
  }, []);

  const deleteDocument = useCallback((documentId) => {
    setDocumentState((prev) => {
      if (!prev[documentId]) return prev;
      const next = { ...prev };
      delete next[documentId];
      return next;
    });
  }, []);

  const setDocumentStatus = useCallback((documentId, status) => {
    setDocumentState((prev) => ({
      ...prev,
      [documentId]: {
        ...(prev[documentId] || {}),
        status,
      },
    }));
  }, []);

  /* ========================= Document & Form Progress Summary ========================= */

  const documentSummary = useMemo(() => {
    const required = documents.filter((d) => d.required);
    const satisfied = required.filter((d) => SATISFIED_STATUSES.includes(d.status) || !!d.file || d.isReused);
    const uploadedCount = satisfied.length;
    const totalCount = required.length;

    return {
      total: totalCount,
      uploaded: uploadedCount,
      missing: totalCount - uploadedCount,
      percent: totalCount ? Math.round((uploadedCount / totalCount) * 100) : 0,
      allUploaded: totalCount > 0 && uploadedCount === totalCount,
    };
  }, [documents]);

  const completionPercentage = useMemo(() => {
    let total = 0;
    let done = 0;

    // Applicant fields (10)
    ['fullName', 'parentName', 'dob', 'pan', 'aadhaar', 'mobile', 'email', 'address', 'state', 'pincode'].forEach((k) => {
      total += 1;
      if (isFilled(formData.applicant[k])) done += 1;
    });

    // Company fields (6)
    ['proposedName1', 'proposedName2', 'registeredState', 'mainActivity', 'description', 'authorizedCapital'].forEach((k) => {
      total += 1;
      if (isFilled(formData.company[k])) done += 1;
    });

    // Directors fields
    formData.directors.forEach((dir) => {
      ['fullName', 'pan', 'mobile', 'email'].forEach((k) => {
        total += 1;
        if (isFilled(dir[k])) done += 1;
      });
    });

    // Subscribers fields
    formData.subscribers.forEach((sub) => {
      ['fullName', 'pan', 'sharesCount'].forEach((k) => {
        total += 1;
        if (isFilled(sub[k])) done += 1;
      });
    });

    // Office fields (5)
    ['premisesType', 'line1', 'locality', 'city', 'pincode'].forEach((k) => {
      total += 1;
      if (isFilled(formData.office[k])) done += 1;
    });

    // Business fields (3)
    ['mainActivity', 'turnover', 'startDate'].forEach((k) => {
      total += 1;
      if (isFilled(formData.business[k])) done += 1;
    });

    // Mandatory documents
    const reqDocs = documents.filter((d) => d.required);
    reqDocs.forEach((d) => {
      total += 1;
      if (SATISFIED_STATUSES.includes(d.status) || !!d.file || d.isReused) done += 1;
    });

    if (total === 0) return 0;
    return Math.round((done / total) * 100);
  }, [formData, documents]);

  /* ========================= Dynamic Fees Calculation ========================= */

  const calculatedFees = useMemo(() => {
    return calculatePLCFees({
      authorizedCapital: formData.company.authorizedCapital,
      directorCount: formData.company.directorCount,
      registeredState: formData.company.registeredState || '07',
    });
  }, [formData.company.authorizedCapital, formData.company.directorCount, formData.company.registeredState]);

  /* ========================= Wizard Navigation ========================= */

  const goNext = useCallback(() => {
    const next = Math.min(currentStep + 1, LAST_STEP);
    setCurrentStep(next);
    return PLC_STEPS[next];
  }, [currentStep]);

  const goPrev = useCallback(() => {
    const prev = Math.max(currentStep - 1, 0);
    setCurrentStep(prev);
    return PLC_STEPS[prev];
  }, [currentStep]);

  const goToStep = useCallback((index) => {
    const clamped = Math.max(0, Math.min(index, LAST_STEP));
    setCurrentStep(clamped);
    return PLC_STEPS[clamped];
  }, []);

  const resetForm = useCallback(() => {
    setCurrentStep(0);
    setFormData(EMPTY_FORM);
    setDocumentState({});
    setErrors({});
  }, []);

  const value = useMemo(
    () => ({
      // state
      currentStep,
      steps: PLC_STEPS,
      formData,
      documents,
      documentSummary,
      completionPercentage,
      calculatedFees,
      errors,

      // updates
      updateField,
      updateDirector,
      setDirectorCount,
      updateSubscriber,
      setSubscriberCount,
      linkSubscriberToDirector,
      unlinkSubscriberFromDirector,
      updateBusinessAdditionalField,

      // documents
      uploadDocument,
      deleteDocument,
      setDocumentStatus,

      // navigation & error handling
      goNext,
      goPrev,
      goToStep,
      setErrors,
      resetForm,
    }),
    [
      currentStep,
      formData,
      documents,
      documentSummary,
      completionPercentage,
      calculatedFees,
      errors,
      updateField,
      updateDirector,
      setDirectorCount,
      updateSubscriber,
      setSubscriberCount,
      linkSubscriberToDirector,
      unlinkSubscriberFromDirector,
      updateBusinessAdditionalField,
      uploadDocument,
      deleteDocument,
      setDocumentStatus,
      goNext,
      goPrev,
      goToStep,
      resetForm,
    ]
  );

  return <PLCFormContext.Provider value={value}>{children}</PLCFormContext.Provider>;
}

export function usePLCForm() {
  const ctx = useContext(PLCFormContext);
  if (!ctx) throw new Error('usePLCForm must be used within a PLCFormProvider');
  return ctx;
}
