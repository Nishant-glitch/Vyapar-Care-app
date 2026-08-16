import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  calculateITRFees,
  getRequiredITRDocuments,
  recommendITRForm,
} from '../config/itrConfig';
import { submitITRApplication } from '../lib/database';
import { calculateIncomeTax } from '../utils/itrTaxEngine';

const ITRFormContext = createContext(null);

export const INITIAL_ITR_STATE = {
  // Step 1: Assessment Year & Taxpayer Profile
  assessmentYear: 'AY_2026_27',
  taxpayerType: 'individual',
  residentialStatus: 'resident',

  profile: {
    pan: '',
    fullName: '',
    fatherName: '',
    dob: '1990-01-01',
    mobile: '',
    email: '',
    address: '',
    city: '',
    state: '07',
    pinCode: '',
    isPANVerified: false,
    isDirector: false,
    holdsUnlistedShares: false,
  },

  // Step 2: Income Sources Multi-Selector
  incomeSources: {
    salary: true,
    houseProperty: false,
    business: false,
    profession: false,
    capitalGains: false,
    otherSources: true,
    agriculture: false,
    foreignIncome: false,
  },

  // Steps 3 to 6: Head-wise Income Details
  incomeDetails: {
    // Salary
    employerName: '',
    employerTAN: '',
    salaryGross: 850000,
    salaryAllowancesExempt: 0,
    salaryProfTax: 2400,

    // House Property
    hpType: 'self_occupied', // 'self_occupied', 'let_out'
    hpAddress: '',
    hpGrossRent: 0,
    hpMunicipalTax: 0,
    hpHomeLoanInterest: 0,

    // Business & Profession
    businessName: '',
    businessType: 'Proprietorship',
    isPresumptive: false, // 44AD / 44ADA
    businessTurnover: 0,
    businessProfit: 0,
    professionProfit: 0,
    gstin: '',

    // Capital Gains
    stcg: 0,
    ltcg: 0,
    vdaCryptoGain: 0,

    // Other Sources
    savingsInterest: 12000,
    fdInterest: 0,
    dividendIncome: 0,
    otherIncomeAmt: 0,
    agriculturalIncome: 0,

    // Foreign
    foreignCountry: '',
    foreignIncomeAmt: 0,
    foreignTaxPaid: 0,
  },

  // Step 7: Chapter VI-A Deductions
  deductions: {
    sec80C: 150000, // PPF, ELSS, EPF, LIC (Max ₹1.5L)
    sec80D: 25000,  // Mediclaim (Self / Parents)
    sec80CCD1B: 0, // NPS Additional (Max ₹50,000)
    sec80TTA: 10000, // Savings Interest (Max ₹10,000)
    sec80G: 0,      // Donations
    otherDeductions: 0,
  },

  // Step 8: TDS, Tax Paid & Bank Refund Details
  taxPaid: {
    tdsSalary: 35000,
    tdsOther: 0,
    tcs: 0,
    advanceTax: 0,
    selfAssessmentTax: 0,
  },

  bankDetails: {
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifsc: '',
    accountType: 'Savings',
    isRefundAccount: true,
  },

  // Step 9: Supporting Documents (Annexure-less verification)
  documents: {},

  // Step 10: Selected Regime & Declarations
  selectedRegime: null, // 'new' | 'old' | null (auto)
  declarations: {
    infoTrue: false,
    reviewAcknowledged: false,
  },

  // Payment
  paymentStatus: 'pending',
};

export function ITRFormProvider({ children }) {
  const [formData, setFormData] = useState(INITIAL_ITR_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const updateFormData = (fields) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const updateProfile = (fields) => {
    setFormData((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...fields },
    }));
  };

  const toggleIncomeSource = (sourceKey) => {
    setFormData((prev) => ({
      ...prev,
      incomeSources: {
        ...prev.incomeSources,
        [sourceKey]: !prev.incomeSources[sourceKey],
      },
    }));
  };

  const updateIncomeDetails = (fields) => {
    setFormData((prev) => ({
      ...prev,
      incomeDetails: { ...prev.incomeDetails, ...fields },
    }));
  };

  const updateDeductions = (fields) => {
    setFormData((prev) => ({
      ...prev,
      deductions: { ...prev.deductions, ...fields },
    }));
  };

  const updateTaxPaid = (fields) => {
    setFormData((prev) => ({
      ...prev,
      taxPaid: { ...prev.taxPaid, ...fields },
    }));
  };

  const updateBankDetails = (fields) => {
    setFormData((prev) => ({
      ...prev,
      bankDetails: { ...prev.bankDetails, ...fields },
    }));
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

  const resetForm = () => {
    setFormData(INITIAL_ITR_STATE);
  };

  // 1. Live ITR Recommendation Engine
  const recommendedITR = useMemo(() => {
    const totalInc =
      Number(formData.incomeDetails?.salaryGross || 0) +
      Number(formData.incomeDetails?.businessTurnover || 0) +
      Number(formData.incomeDetails?.stcg || 0) +
      Number(formData.incomeDetails?.ltcg || 0) +
      Number(formData.incomeDetails?.savingsInterest || 0);

    return recommendITRForm({
      taxpayerType: formData.taxpayerType,
      residentialStatus: formData.residentialStatus,
      totalIncome: totalInc,
      incomeSources: formData.incomeSources,
      hasBusinessIncome: formData.incomeSources?.business || formData.incomeSources?.profession,
      isPresumptiveBusiness: formData.incomeDetails?.isPresumptive,
      hasCapitalGains: formData.incomeSources?.capitalGains,
      hasMultipleProperties: false,
      hasForeignIncomeOrAssets: formData.incomeSources?.foreignIncome,
      isCompanyDirector: formData.profile?.isDirector,
      holdsUnlistedShares: formData.profile?.holdsUnlistedShares,
      agriculturalIncome: formData.incomeDetails?.agriculturalIncome,
    });
  }, [formData]);

  // 2. Live Tax Computation & Regime Optimizer
  const taxComputation = useMemo(() => {
    return calculateIncomeTax(formData);
  }, [formData]);

  // 3. Dynamic Required Documents Checklist
  const requiredDocuments = useMemo(() => {
    return getRequiredITRDocuments({
      incomeSources: formData.incomeSources,
      isPresumptiveBusiness: formData.incomeDetails?.isPresumptive,
      hasDeductions: true,
    });
  }, [formData.incomeSources, formData.incomeDetails]);

  const fees = useMemo(() => {
    return calculateITRFees();
  }, []);

  const submit = async (user) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        ...formData,
        userId: user?.id || 'guest_user',
        applicantName: formData.profile?.fullName || user?.name || 'ITR Applicant',
        applicantMobile: formData.profile?.mobile || user?.mobile || '',
        applicantEmail: formData.profile?.email || user?.email || '',
        recommendedITRForm: recommendedITR.recommendedForm,
        taxComputation,
        calculatedFees: fees,
        amountPaid: fees.totalPayable,
        submittedAt: new Date().toISOString(),
      };

      const result = await submitITRApplication(payload);
      setSubmitting(false);
      return result;
    } catch (err) {
      setSubmitting(false);
      setSubmitError(err.message || 'Failed to submit ITR application');
      throw err;
    }
  };

  const value = {
    formData,
    updateFormData,
    updateProfile,
    toggleIncomeSource,
    updateIncomeDetails,
    updateDeductions,
    updateTaxPaid,
    updateBankDetails,
    setDocument,
    removeDocument,
    recommendedITR,
    taxComputation,
    requiredDocuments,
    fees,
    submitting,
    submitError,
    submit,
    resetForm,
  };

  return (
    <ITRFormContext.Provider value={value}>
      {children}
    </ITRFormContext.Provider>
  );
}

export function useITRForm() {
  const context = useContext(ITRFormContext);
  if (!context) {
    throw new Error('useITRForm must be used within an ITRFormProvider');
  }
  return context;
}
