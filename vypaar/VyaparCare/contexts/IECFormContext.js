import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  calculateIECFees,
  getRequiredIECDocuments,
} from '../config/iecConfig';
import { submitIECApplication } from '../lib/database';

const IECFormContext = createContext(null);

export const INITIAL_IEC_STATE = {
  // Step 1: Applicant / Entity Constitution Type
  entityType: 'proprietorship',

  // Step 2: PAN & Entity Details
  panDetails: {
    panNumber: '',
    legalName: '',
    tradeName: '',
    incorporationDate: '2024-01-15',
    cinNumber: '',
    llpinNumber: '',
    registrationNumber: '',
    isPANVerified: false,
    partners: [
      { id: 1, name: '', pan: '', mobile: '', email: '', isManagingPartner: true },
    ],
    directors: [
      { id: 1, name: '', pan: '', din: '', mobile: '', email: '' },
    ],
    karta: { name: '', pan: '', mobile: '', email: '' },
  },

  // Step 3: Business & Trade Activities
  businessDetails: {
    businessName: '',
    natureOfBusiness: 'Merchant / Manufacturer Exporter',
    businessActivities: ['trader_importer', 'trader_exporter'],
    startDate: '2024-01-15',
    website: '',
    businessEmail: '',
    businessMobile: '',
    hasExistingIEC: false,
    existingIECNumber: '',
  },

  // Trade Details & GST
  tradeDetails: {
    selectedTradeActivities: ['import_goods', 'export_goods'],
    hasGSTIN: false,
    gstinNumber: '',
    udyamNumber: '',
    fssaiNumber: '',
    rcmcNumber: '',
  },

  // Step 4: Registered Office / Business Address
  addressDetails: {
    line1: '',
    line2: '',
    building: '',
    street: '',
    locality: '',
    city: '',
    district: '',
    state: '07', // Delhi
    country: 'India',
    pinCode: '',
    premisesType: 'owned', // 'owned', 'rented', 'leased', 'shared'
    proofInEntityName: true,
  },

  // Step 5: Bank Account & Verification
  bankDetails: {
    hasActiveAccount: true,
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifsc: '',
    accountType: 'current',
    branch: '',
    bankProofType: 'cancelled_cheque', // 'cancelled_cheque' | 'bank_certificate'
    verificationStatus: 'verified', // 'pending', 'verifying', 'verified', 'failed'
  },

  // Step 6: Authorized Signatory Details
  signatoryDetails: {
    fullName: '',
    fatherMotherName: '',
    dob: '1990-01-01',
    pan: '',
    aadhaar: '',
    mobile: '',
    email: '',
    designation: 'proprietor',
    address: '',
    authMethod: 'aadhaar_otp', // 'aadhaar_otp' | 'dsc'
  },

  // Step 7: Products & Target Countries
  products: [
    {
      id: 1,
      name: 'Textiles & Garments',
      description: 'Cotton readymade garments and apparel',
      hsnCode: '6204',
      category: 'Textiles',
      tradeType: 'Both',
      countries: ['United States (USA)', 'United Arab Emirates (UAE)'],
    },
  ],
  countries: ['United States (USA)', 'United Arab Emirates (UAE)'],

  // Step 8: Uploaded Supporting Documents
  documents: {},

  // Step 9: Declarations
  declarations: {
    infoTrue: false,
    dgftAcknowledged: false,
  },

  paymentStatus: 'pending',

  // Step 12: Certificate Data (populated after approval)
  iecCertificateDetails: {
    iecNumber: 'ABCDE1234F',
    issueDate: new Date().toISOString(),
    status: 'Active',
    dgftJurisdiction: 'Regional Authority - New Delhi',
  },
};

export function IECFormProvider({ children }) {
  const [formData, setFormData] = useState(INITIAL_IEC_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const updateFormData = (fields) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const updatePANDetails = (fields) => {
    setFormData((prev) => ({
      ...prev,
      panDetails: { ...prev.panDetails, ...fields },
    }));
  };

  const updateBusinessDetails = (fields) => {
    setFormData((prev) => ({
      ...prev,
      businessDetails: { ...prev.businessDetails, ...fields },
    }));
  };

  const updateTradeDetails = (fields) => {
    setFormData((prev) => ({
      ...prev,
      tradeDetails: { ...prev.tradeDetails, ...fields },
    }));
  };

  const updateAddressDetails = (fields) => {
    setFormData((prev) => ({
      ...prev,
      addressDetails: { ...prev.addressDetails, ...fields },
    }));
  };

  const updateBankDetails = (fields) => {
    setFormData((prev) => ({
      ...prev,
      bankDetails: { ...prev.bankDetails, ...fields },
    }));
  };

  const updateSignatoryDetails = (fields) => {
    setFormData((prev) => ({
      ...prev,
      signatoryDetails: { ...prev.signatoryDetails, ...fields },
    }));
  };

  // Dynamic Partner management
  const addPartner = () => {
    setFormData((prev) => ({
      ...prev,
      panDetails: {
        ...prev.panDetails,
        partners: [
          ...(prev.panDetails.partners || []),
          {
            id: Date.now(),
            name: '',
            pan: '',
            mobile: '',
            email: '',
            isManagingPartner: false,
          },
        ],
      },
    }));
  };

  const removePartner = (idx) => {
    setFormData((prev) => {
      const updated = [...(prev.panDetails.partners || [])];
      updated.splice(idx, 1);
      return {
        ...prev,
        panDetails: { ...prev.panDetails, partners: updated },
      };
    });
  };

  const updatePartner = (idx, fields) => {
    setFormData((prev) => {
      const updated = [...(prev.panDetails.partners || [])];
      updated[idx] = { ...updated[idx], ...fields };
      return {
        ...prev,
        panDetails: { ...prev.panDetails, partners: updated },
      };
    });
  };

  // Dynamic Director management
  const addDirector = () => {
    setFormData((prev) => ({
      ...prev,
      panDetails: {
        ...prev.panDetails,
        directors: [
          ...(prev.panDetails.directors || []),
          {
            id: Date.now(),
            name: '',
            pan: '',
            din: '',
            mobile: '',
            email: '',
          },
        ],
      },
    }));
  };

  const removeDirector = (idx) => {
    setFormData((prev) => {
      const updated = [...(prev.panDetails.directors || [])];
      updated.splice(idx, 1);
      return {
        ...prev,
        panDetails: { ...prev.panDetails, directors: updated },
      };
    });
  };

  const updateDirector = (idx, fields) => {
    setFormData((prev) => {
      const updated = [...(prev.panDetails.directors || [])];
      updated[idx] = { ...updated[idx], ...fields };
      return {
        ...prev,
        panDetails: { ...prev.panDetails, directors: updated },
      };
    });
  };

  // Dynamic Products management
  const addProduct = (productItem) => {
    setFormData((prev) => ({
      ...prev,
      products: [...(prev.products || []), { ...productItem, id: Date.now() }],
    }));
  };

  const removeProduct = (idx) => {
    setFormData((prev) => {
      const updated = [...(prev.products || [])];
      updated.splice(idx, 1);
      return { ...prev, products: updated };
    });
  };

  // Documents
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

  const resetForm = () => {
    setFormData(INITIAL_IEC_STATE);
  };

  // Dynamic Document Checklist
  const requiredDocuments = useMemo(() => {
    return getRequiredIECDocuments(formData);
  }, [formData.entityType, formData.addressDetails]);

  // Fees calculation
  const fees = useMemo(() => {
    return calculateIECFees();
  }, []);

  // Submit action
  const submit = async (user) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        ...formData,
        userId: user?.id || 'guest_user',
        applicantName:
          formData.panDetails?.legalName ||
          formData.signatoryDetails?.fullName ||
          user?.name ||
          'IEC Applicant',
        applicantMobile:
          formData.signatoryDetails?.mobile ||
          formData.businessDetails?.businessMobile ||
          user?.mobile ||
          '',
        applicantEmail:
          formData.signatoryDetails?.email ||
          formData.businessDetails?.businessEmail ||
          user?.email ||
          '',
        calculatedFees: fees,
        amountPaid: fees.totalPayable,
        submittedAt: new Date().toISOString(),
      };

      const result = await submitIECApplication(payload);
      setSubmitting(false);
      return result;
    } catch (err) {
      setSubmitting(false);
      setSubmitError(err.message || 'Failed to submit IEC application');
      throw err;
    }
  };

  const value = {
    formData,
    updateFormData,
    updatePANDetails,
    updateBusinessDetails,
    updateTradeDetails,
    updateAddressDetails,
    updateBankDetails,
    updateSignatoryDetails,
    addPartner,
    removePartner,
    updatePartner,
    addDirector,
    removeDirector,
    updateDirector,
    addProduct,
    removeProduct,
    setDocument,
    removeDocument,
    requiredDocuments,
    fees,
    submitting,
    submitError,
    submit,
    resetForm,
  };

  return (
    <IECFormContext.Provider value={value}>
      {children}
    </IECFormContext.Provider>
  );
}

export function useIECForm() {
  const context = useContext(IECFormContext);
  if (!context) {
    throw new Error('useIECForm must be used within an IECFormProvider');
  }
  return context;
}
