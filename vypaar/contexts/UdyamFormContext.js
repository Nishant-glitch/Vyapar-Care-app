import React, { createContext, useContext, useMemo, useState } from 'react';
import { calculateMSMECategory, calculateUdyamFees } from '../config/udyamConfig';
import { submitUdyamApplication } from '../lib/database';

const UdyamFormContext = createContext(null);

export const INITIAL_UDYAM_STATE = {
  // Step 1: Aadhaar Details
  aadhaarDetails: {
    aadhaarNumber: '',
    nameAsPerAadhaar: '',
    mobile: '',
    email: '',
    aadhaarHolderType: 'Proprietor',
    isAadhaarVerified: false,
    otp: '',
  },

  // Step 2: PAN & GSTIN Verification
  panDetails: {
    hasPAN: true,
    panNumber: '',
    nameAsPerPAN: '',
    isPANVerified: false,
    hasGSTIN: 'no', // 'yes', 'no', 'not_applicable'
    gstin: '',
    isGSTINVerified: false,
    hasPreviousUAM: false,
    uamNumber: '',
    hasExistingUdyam: false,
    existingUdyamNumber: '',
  },

  // Step 3: Business / Enterprise Details
  businessDetails: {
    enterpriseName: '',
    tradeName: '',
    organisationType: 'proprietorship',
    commencementDate: new Date().toISOString().split('T')[0],
    majorActivity: 'services', // 'manufacturing', 'services', 'trading', 'both'
  },

  // Step 4: Organisation Details
  organisationDetails: {
    firmName: '',
    partners: [
      { id: 'p_1', name: '', pan: '', mobile: '', isManaging: true },
    ],
    kartaName: '',
    llpName: '',
    llpin: '',
    companyName: '',
    cin: '',
    authorizedSignatory: '',
  },

  // Step 5: Official Address
  officialAddress: {
    flatDoorBlock: '',
    premisesName: '',
    roadStreet: '',
    locality: '',
    city: '',
    district: '',
    state: '07', // Delhi default
    pinCode: '',
    isPrimaryBusinessAddress: true,
  },

  // Step 6: Plant / Unit Details
  plantUnits: [
    {
      id: 'unit_1',
      unitName: 'Unit 1 / Main Location',
      flatDoorBlock: '',
      roadStreet: '',
      city: '',
      district: '',
      state: '07',
      pinCode: '',
      activity: 'services',
      mainProduct: '',
    },
  ],

  // Step 7: Bank Details
  bankDetails: {
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifsc: '',
    accountType: 'Current',
  },

  // Step 8: NIC Codes & Activities
  selectedNICCodes: [],

  // Step 9: Investment & Turnover
  financialDetails: {
    financialYear: '2024-25',
    investmentAmount: 500000, // In Rupees (e.g. ₹5 Lakh)
    domesticTurnover: 2000000, // In Rupees (e.g. ₹20 Lakh)
    exportTurnover: 0,
    hasITR: true,
  },

  // Step 10: Optional Documents
  optionalDocuments: {},

  // Step 11: Review & Declaration
  declarationAccepted: false,

  // Step 12: Payment
  paymentStatus: 'pending',
  transactionId: null,
  amountPaid: 2000,
};

export function UdyamFormProvider({ children }) {
  const [formData, setFormData] = useState(INITIAL_UDYAM_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const updateAadhaarDetails = (fields) => {
    setFormData((prev) => ({
      ...prev,
      aadhaarDetails: { ...prev.aadhaarDetails, ...fields },
    }));
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

  const updateOrganisationDetails = (fields) => {
    setFormData((prev) => ({
      ...prev,
      organisationDetails: { ...prev.organisationDetails, ...fields },
    }));
  };

  const updateOfficialAddress = (fields) => {
    setFormData((prev) => ({
      ...prev,
      officialAddress: { ...prev.officialAddress, ...fields },
    }));
  };

  const updateBankDetails = (fields) => {
    setFormData((prev) => ({
      ...prev,
      bankDetails: { ...prev.bankDetails, ...fields },
    }));
  };

  const updateFinancialDetails = (fields) => {
    setFormData((prev) => ({
      ...prev,
      financialDetails: { ...prev.financialDetails, ...fields },
    }));
  };

  const updateFormData = (fields) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  // Plant / Unit Handlers
  const addPlantUnit = () => {
    setFormData((prev) => ({
      ...prev,
      plantUnits: [
        ...prev.plantUnits,
        {
          id: `unit_${Date.now()}`,
          unitName: `Unit ${prev.plantUnits.length + 1}`,
          flatDoorBlock: '',
          roadStreet: '',
          city: '',
          district: '',
          state: prev.officialAddress?.state || '07',
          pinCode: prev.officialAddress?.pinCode || '',
          activity: prev.businessDetails?.majorActivity || 'services',
          mainProduct: '',
        },
      ],
    }));
  };

  const updatePlantUnit = (index, fields) => {
    setFormData((prev) => {
      const updated = [...prev.plantUnits];
      updated[index] = { ...updated[index], ...fields };
      return { ...prev, plantUnits: updated };
    });
  };

  const removePlantUnit = (index) => {
    setFormData((prev) => {
      if (prev.plantUnits.length <= 1) return prev;
      const updated = prev.plantUnits.filter((_, idx) => idx !== index);
      return { ...prev, plantUnits: updated };
    });
  };

  // NIC Code Handlers
  const toggleNICCode = (nicItem) => {
    setFormData((prev) => {
      const exists = prev.selectedNICCodes.some((n) => n.nic5 === nicItem.nic5);
      const nextNics = exists
        ? prev.selectedNICCodes.filter((n) => n.nic5 !== nicItem.nic5)
        : [...prev.selectedNICCodes, nicItem];
      return { ...prev, selectedNICCodes: nextNics };
    });
  };

  // Optional Document Handlers
  const setOptionalDocument = (docId, file) => {
    setFormData((prev) => ({
      ...prev,
      optionalDocuments: { ...prev.optionalDocuments, [docId]: file },
    }));
  };

  const removeOptionalDocument = (docId) => {
    setFormData((prev) => {
      const nextDocs = { ...prev.optionalDocuments };
      delete nextDocs[docId];
      return { ...prev, optionalDocuments: nextDocs };
    });
  };

  const resetForm = () => {
    setFormData(INITIAL_UDYAM_STATE);
  };

  const msmeCategory = useMemo(() => {
    return calculateMSMECategory(formData.financialDetails);
  }, [formData.financialDetails]);

  const fees = useMemo(() => {
    return calculateUdyamFees();
  }, []);

  const submit = async (user) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        ...formData,
        userId: user?.id || 'guest_user',
        applicantName:
          formData.aadhaarDetails?.nameAsPerAadhaar ||
          user?.name ||
          'Udyam Applicant',
        applicantMobile:
          formData.aadhaarDetails?.mobile || user?.mobile || '',
        applicantEmail:
          formData.aadhaarDetails?.email || user?.email || '',
        msmeClassification: msmeCategory,
        calculatedFees: fees,
        amountPaid: fees.totalPayable,
        submittedAt: new Date().toISOString(),
      };

      const result = await submitUdyamApplication(payload);
      setSubmitting(false);
      return result;
    } catch (err) {
      setSubmitting(false);
      setSubmitError(err.message || 'Failed to submit Udyam application');
      throw err;
    }
  };

  const value = {
    formData,
    updateFormData,
    updateAadhaarDetails,
    updatePANDetails,
    updateBusinessDetails,
    updateOrganisationDetails,
    updateOfficialAddress,
    updateBankDetails,
    updateFinancialDetails,
    addPlantUnit,
    updatePlantUnit,
    removePlantUnit,
    toggleNICCode,
    setOptionalDocument,
    removeOptionalDocument,
    msmeCategory,
    fees,
    submitting,
    submitError,
    submit,
    resetForm,
  };

  return (
    <UdyamFormContext.Provider value={value}>
      {children}
    </UdyamFormContext.Provider>
  );
}

export function useUdyamForm() {
  const context = useContext(UdyamFormContext);
  if (!context) {
    throw new Error('useUdyamForm must be used within an UdyamFormProvider');
  }
  return context;
}
