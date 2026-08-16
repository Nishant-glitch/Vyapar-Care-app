import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getRequiredTMDocuments,
  calculateTMFees,
  NICE_CLASSES,
} from '../config/trademarkConfig';
import { submitTMApplication } from '../lib/database';

const TMFormContext = createContext(null);

export const INITIAL_TM_FORM_STATE = {
  // Step 1: Applicant Type & Concession
  applicantType: 'individual',
  isStartupClaimed: false,
  isMSMEClaimed: false,

  // Step 2: Applicant Details
  applicantDetails: {
    applicantLegalName: '',
    tradingName: '',
    pan: '',
    mobile: '',
    email: '',
    principalPlaceOfBusiness: '',
    address1: '',
    address2: '',
    city: '',
    district: '',
    state: '',
    country: 'India',
    pinCode: '',
    // Type specific
    dob: '',
    fatherMotherName: '',
    proprietorName: '',
    partners: [
      { fullName: '', pan: '', email: '', mobile: '', address: '' },
      { fullName: '', pan: '', email: '', mobile: '', address: '' },
    ],
    llpin: '',
    cin: '',
    registrationNumber: '',
    authorizedPersonName: '',
    authorizedPersonDesignation: 'Director / Authorized Signatory',
  },

  // Step 3: Trademark Details
  markDetails: {
    markType: 'word',
    trademarkName: '',
    exactSpelling: '',
    casingPreference: 'as_entered',
    isColourClaimed: false,
    colourDescription: '',
    isOtherLanguage: false,
    languageName: '',
    transliteration: '',
    translation: '',
    description: '',
    meaning: '',
    disclaimer: '',
    logoFile: null,
    soundFile: null,
  },

  // Step 4: Goods / Services & Nice Classes
  goodsServicesType: 'services',
  selectedClasses: [35],
  classDescriptions: {
    35: 'Advertising, business management, online retail store services and trading activities.',
  },

  // Step 5: Usage Details
  usageDetails: {
    usageStatus: 'proposed',
    firstUseDate: '',
    firstUsePlace: '',
    goodsServicesUsed: '',
    natureOfUse: 'Commercial sales and marketing under the mark',
  },

  // Step 7: Agent Details
  agentDetails: {
    isFiledThroughAgent: true,
    agentName: 'VyaparCare Legal / Registered TM Attorney',
    agentAddress: 'Legal Operations Hub, New Delhi - 110001',
    agentMobile: '9876543210',
    agentEmail: 'ipr@vyaparcare.com',
    agentRegNumber: 'IN/PA/2026/001',
  },

  // Metadata & Status
  submittedApplicationId: null,
  paymentStatus: 'pending',
};

export function TMFormProvider({ children }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formState, setFormState] = useState(INITIAL_TM_FORM_STATE);
  const [documents, setDocuments] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize dynamic documents checklist whenever state triggers changes
  useEffect(() => {
    const requiredList = getRequiredTMDocuments({
      applicantType: formState.applicantType,
      isStartupClaimed: formState.isStartupClaimed,
      isMSMEClaimed: formState.isMSMEClaimed,
      markType: formState.markDetails?.markType,
      usageStatus: formState.usageDetails?.usageStatus,
      isFiledThroughAgent: formState.agentDetails?.isFiledThroughAgent,
      isOtherLanguage: formState.markDetails?.isOtherLanguage,
    });

    setDocuments((prevDocs) => {
      const prevMap = new Map((prevDocs || []).map((d) => [d.id, d]));
      return requiredList.map((req) => {
        const existing = prevMap.get(req.id);
        if (existing && (existing.file || existing.fileUrl)) {
          return {
            ...req,
            file: existing.file,
            fileUrl: existing.fileUrl,
            status: existing.status || 'uploaded',
          };
        }
        return {
          ...req,
          file: null,
          fileUrl: null,
          status: req.required ? 'required' : 'optional',
        };
      });
    });
  }, [
    formState.applicantType,
    formState.isStartupClaimed,
    formState.isMSMEClaimed,
    formState.markDetails?.markType,
    formState.markDetails?.isOtherLanguage,
    formState.usageDetails?.usageStatus,
    formState.agentDetails?.isFiledThroughAgent,
  ]);

  // ---------------------------------------------------------------------------
  // Updaters
  // ---------------------------------------------------------------------------

  const updateApplicantType = (applicantType, isStartup = false, isMSME = false) => {
    setFormState((prev) => ({
      ...prev,
      applicantType,
      isStartupClaimed: isStartup,
      isMSMEClaimed: isMSME,
    }));
  };

  const updateApplicantDetails = (fields) => {
    setFormState((prev) => ({
      ...prev,
      applicantDetails: {
        ...prev.applicantDetails,
        ...fields,
      },
    }));
  };

  const addPartner = () => {
    setFormState((prev) => ({
      ...prev,
      applicantDetails: {
        ...prev.applicantDetails,
        partners: [
          ...(prev.applicantDetails.partners || []),
          { fullName: '', pan: '', email: '', mobile: '', address: '' },
        ],
      },
    }));
  };

  const removePartner = (index) => {
    setFormState((prev) => {
      const current = prev.applicantDetails.partners || [];
      if (current.length <= 2) return prev;
      const next = current.filter((_, i) => i !== index);
      return {
        ...prev,
        applicantDetails: {
          ...prev.applicantDetails,
          partners: next,
        },
      };
    });
  };

  const updatePartner = (index, field, value) => {
    setFormState((prev) => {
      const current = [...(prev.applicantDetails.partners || [])];
      if (current[index]) {
        current[index] = { ...current[index], [field]: value };
      }
      return {
        ...prev,
        applicantDetails: {
          ...prev.applicantDetails,
          partners: current,
        },
      };
    });
  };

  const updateMarkDetails = (fields) => {
    setFormState((prev) => ({
      ...prev,
      markDetails: {
        ...prev.markDetails,
        ...fields,
      },
    }));
  };

  const toggleClass = (classNumber) => {
    setFormState((prev) => {
      const current = prev.selectedClasses || [];
      let nextClasses;
      let nextDescs = { ...(prev.classDescriptions || {}) };

      if (current.includes(classNumber)) {
        if (current.length === 1) return prev;
        nextClasses = current.filter((c) => c !== classNumber);
        delete nextDescs[classNumber];
      } else {
        nextClasses = [...current, classNumber].sort((a, b) => a - b);
        const niceItem = NICE_CLASSES.find((n) => n.classNumber === classNumber);
        nextDescs[classNumber] = niceItem ? niceItem.shortDescription : '';
      }

      return {
        ...prev,
        selectedClasses: nextClasses,
        classDescriptions: nextDescs,
      };
    });
  };

  const updateClassDescription = (classNumber, description) => {
    setFormState((prev) => ({
      ...prev,
      classDescriptions: {
        ...prev.classDescriptions,
        [classNumber]: description,
      },
    }));
  };

  const updateUsageDetails = (fields) => {
    setFormState((prev) => ({
      ...prev,
      usageDetails: {
        ...prev.usageDetails,
        ...fields,
      },
    }));
  };

  const updateAgentDetails = (fields) => {
    setFormState((prev) => ({
      ...prev,
      agentDetails: {
        ...prev.agentDetails,
        ...fields,
      },
    }));
  };

  const uploadDocument = (docId, file) => {
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id === docId) {
          return {
            ...d,
            file,
            fileUrl: file?.uri || file?.url || null,
            status: 'uploaded',
          };
        }
        return d;
      })
    );
  };

  const removeDocument = (docId) => {
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id === docId) {
          return {
            ...d,
            file: null,
            fileUrl: null,
            status: d.required ? 'required' : 'optional',
          };
        }
        return d;
      })
    );
  };

  const getFees = () => {
    return calculateTMFees({
      applicantType: formState.applicantType,
      isStartupClaimed: formState.isStartupClaimed,
      isMSMEClaimed: formState.isMSMEClaimed,
      selectedClasses: formState.selectedClasses,
    });
  };

  const submitApplication = async (user = null) => {
    setIsSubmitting(true);
    try {
      const fees = getFees();
      const payload = {
        applicantType: formState.applicantType,
        isStartupClaimed: formState.isStartupClaimed,
        isMSMEClaimed: formState.isMSMEClaimed,
        applicantDetails: formState.applicantDetails,
        markDetails: formState.markDetails,
        selectedClasses: formState.selectedClasses,
        classDescriptions: formState.classDescriptions,
        usageDetails: formState.usageDetails,
        agentDetails: formState.agentDetails,
        calculatedFees: fees,
        documents: documents.map((d) => ({
          id: d.id,
          label: d.label,
          category: d.category,
          required: d.required,
          status: d.status,
          file: d.file ? { name: d.file.name, size: d.file.size } : null,
        })),
      };

      const res = await submitTMApplication(payload, user?.id);
      if (res && res.application_id) {
        setFormState((prev) => ({
          ...prev,
          submittedApplicationId: res.application_id,
        }));
      }
      setIsSubmitting(false);
      return res;
    } catch (err) {
      setIsSubmitting(false);
      console.error('Error submitting TM application:', err);
      throw err;
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormState(INITIAL_TM_FORM_STATE);
    setErrors({});
  };

  return (
    <TMFormContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        formState,
        setFormState,
        documents,
        errors,
        setErrors,
        isSubmitting,
        updateApplicantType,
        updateApplicantDetails,
        addPartner,
        removePartner,
        updatePartner,
        updateMarkDetails,
        toggleClass,
        updateClassDescription,
        updateUsageDetails,
        updateAgentDetails,
        uploadDocument,
        removeDocument,
        getFees,
        submitApplication,
        resetForm,
      }}
    >
      {children}
    </TMFormContext.Provider>
  );
}

export function useTMForm() {
  const context = useContext(TMFormContext);
  if (!context) {
    throw new Error('useTMForm must be used within a TMFormProvider');
  }
  return context;
}
