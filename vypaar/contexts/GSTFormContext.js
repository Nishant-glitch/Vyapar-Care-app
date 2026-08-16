import React, { createContext, useContext, useMemo, useState } from 'react';
import { calculateGSTFees, getRequiredGSTDocuments } from '../config/gstConfig';
import { submitGSTApplication } from '../lib/database';

const GSTFormContext = createContext(null);

export const INITIAL_GST_STATE = {
  // Step 1: Constitution & Reason
  constitution: 'proprietorship',
  registrationReason: 'voluntary',
  isComposition: false,

  // Step 2: Business Info
  businessDetails: {
    legalName: '',
    tradeName: '',
    pan: '',
    commencementDate: new Date().toISOString().split('T')[0],
  },

  // Step 3: Promoters / Partners / Directors
  promoters: [
    {
      id: 'promoter_1',
      name: '',
      fatherName: '',
      dob: '1990-01-01',
      mobile: '',
      email: '',
      gender: 'Male',
      pan: '',
      aadhaar: '',
      din: '',
      isDesignatedPartner: true,
      isAuthorizedSignatory: true,
    },
  ],

  // Step 4: Principal Place of Business
  premisesDetails: {
    buildingNumber: '',
    floor: '',
    buildingName: '',
    street: '',
    locality: '',
    city: '',
    state: '07', // Delhi default
    pinCode: '',
    possessionType: 'rented',
    activities: ['retail', 'office'],
  },

  // Step 5: Goods & Services (HSN & SAC)
  goodsServices: [
    {
      id: 'item_1',
      type: 'goods',
      hsnSacCode: '',
      description: '',
    },
  ],

  // Step 6: Bank Account Details
  bankDetails: {
    accountNumber: '',
    accountType: 'Current',
    ifsc: '',
    bankName: '',
    branch: '',
  },

  // Step 7: Documents
  documents: {},
  customDocuments: [],

  // Step 8: Review & Declaration
  declarationAccepted: false,

  // Step 9: Payment
  paymentPlan: 'advance', // 'advance' (50%) or 'full' (100%)
  paymentStatus: 'pending',
  transactionId: null,
  amountPaid: 0,
};

export function GSTFormProvider({ children }) {
  const [formData, setFormData] = useState(INITIAL_GST_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const updateFormData = (fields) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const updateBusinessDetails = (fields) => {
    setFormData((prev) => ({
      ...prev,
      businessDetails: { ...prev.businessDetails, ...fields },
    }));
  };

  const updatePremisesDetails = (fields) => {
    setFormData((prev) => ({
      ...prev,
      premisesDetails: { ...prev.premisesDetails, ...fields },
    }));
  };

  const updateBankDetails = (fields) => {
    setFormData((prev) => ({
      ...prev,
      bankDetails: { ...prev.bankDetails, ...fields },
    }));
  };

  const addPromoter = () => {
    setFormData((prev) => ({
      ...prev,
      promoters: [
        ...prev.promoters,
        {
          id: `promoter_${Date.now()}`,
          name: '',
          fatherName: '',
          dob: '1990-01-01',
          mobile: '',
          email: '',
          gender: 'Male',
          pan: '',
          aadhaar: '',
          din: '',
          isDesignatedPartner: false,
          isAuthorizedSignatory: false,
        },
      ],
    }));
  };

  const updatePromoter = (index, fields) => {
    setFormData((prev) => {
      const updated = [...prev.promoters];
      updated[index] = { ...updated[index], ...fields };
      return { ...prev, promoters: updated };
    });
  };

  const removePromoter = (index) => {
    setFormData((prev) => {
      if (prev.promoters.length <= 1) return prev;
      const updated = prev.promoters.filter((_, idx) => idx !== index);
      return { ...prev, promoters: updated };
    });
  };

  const addGoodsService = () => {
    setFormData((prev) => ({
      ...prev,
      goodsServices: [
        ...prev.goodsServices,
        {
          id: `item_${Date.now()}`,
          type: 'goods',
          hsnSacCode: '',
          description: '',
        },
      ],
    }));
  };

  const updateGoodsService = (index, fields) => {
    setFormData((prev) => {
      const updated = [...prev.goodsServices];
      updated[index] = { ...updated[index], ...fields };
      return { ...prev, goodsServices: updated };
    });
  };

  const removeGoodsService = (index) => {
    setFormData((prev) => {
      if (prev.goodsServices.length <= 1) return prev;
      const updated = prev.goodsServices.filter((_, idx) => idx !== index);
      return { ...prev, goodsServices: updated };
    });
  };

  const setDocument = (docId, file) => {
    setFormData((prev) => ({
      ...prev,
      documents: { ...prev.documents, [docId]: file },
    }));
  };

  const removeDocument = (docId) => {
    setFormData((prev) => {
      const nextDocs = { ...prev.documents };
      delete nextDocs[docId];
      return { ...prev, documents: nextDocs };
    });
  };

  const addCustomDocument = (title, file) => {
    const customDoc = {
      id: `custom_${Date.now()}`,
      title,
      file,
      category: 'additional',
      uploadedAt: new Date().toISOString(),
    };
    setFormData((prev) => ({
      ...prev,
      customDocuments: [...prev.customDocuments, customDoc],
      documents: { ...prev.documents, [customDoc.id]: file },
    }));
  };

  const removeCustomDocument = (customId) => {
    setFormData((prev) => {
      const nextCustom = prev.customDocuments.filter((d) => d.id !== customId);
      const nextDocs = { ...prev.documents };
      delete nextDocs[customId];
      return {
        ...prev,
        customDocuments: nextCustom,
        documents: nextDocs,
      };
    });
  };

  const resetForm = () => {
    setFormData(INITIAL_GST_STATE);
  };

  const requiredDocuments = useMemo(() => {
    return getRequiredGSTDocuments({
      constitution: formData.constitution,
      possessionType: formData.premisesDetails?.possessionType,
    });
  }, [formData.constitution, formData.premisesDetails?.possessionType]);

  const fees = useMemo(() => {
    return calculateGSTFees();
  }, []);

  const submit = async (user) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        ...formData,
        userId: user?.id || 'guest_user',
        applicantName:
          formData.promoters?.[0]?.name ||
          formData.businessDetails?.legalName ||
          user?.name ||
          'GST Applicant',
        applicantMobile:
          formData.promoters?.[0]?.mobile || user?.mobile || '',
        applicantEmail:
          formData.promoters?.[0]?.email || user?.email || '',
        calculatedFees: fees,
        amountPaid:
          formData.paymentPlan === 'full'
            ? fees.totalPayable
            : fees.advanceAmount,
        submittedAt: new Date().toISOString(),
      };

      const result = await submitGSTApplication(payload);
      setSubmitting(false);
      return result;
    } catch (err) {
      setSubmitting(false);
      setSubmitError(err.message || 'Failed to submit GST application');
      throw err;
    }
  };

  const value = {
    formData,
    updateFormData,
    updateBusinessDetails,
    updatePremisesDetails,
    updateBankDetails,
    addPromoter,
    updatePromoter,
    removePromoter,
    addGoodsService,
    updateGoodsService,
    removeGoodsService,
    setDocument,
    removeDocument,
    addCustomDocument,
    removeCustomDocument,
    requiredDocuments,
    fees,
    submitting,
    submitError,
    submit,
    resetForm,
  };

  return (
    <GSTFormContext.Provider value={value}>
      {children}
    </GSTFormContext.Provider>
  );
}

export function useGSTForm() {
  const context = useContext(GSTFormContext);
  if (!context) {
    throw new Error('useGSTForm must be used within a GSTFormProvider');
  }
  return context;
}
