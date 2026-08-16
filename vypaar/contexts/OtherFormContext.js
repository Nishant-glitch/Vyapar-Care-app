import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  calculateOtherFees,
  getRequiredOtherDocuments,
} from '../config/otherServicesConfig';
import { submitOtherServiceRequest } from '../lib/database';

const OtherFormContext = createContext(null);

export const INITIAL_OTHER_STATE = {
  // Step 1: Selected Service & Search
  selectedService: {
    id: 'gst_notice_reply',
    name: 'GST Notice Reply',
    categoryId: 'gst',
    categoryName: 'GST Services',
    icon: '📋',
  },
  isUncertainService: false,
  searchQuery: '',

  // Step 2: Applicant Details
  applicantDetails: {
    fullName: '',
    mobile: '',
    email: '',
    pan: '',
    aadhaar: '',
    city: '',
    state: '07', // Delhi default
    pinCode: '',
    applicantType: 'individual',
  },

  // Step 3: Requirement Details
  requirementDetails: {
    description: '',
    urgency: 'normal',
    deadlineDate: '',
    department: 'gst',
    referenceNumber: '',
    noticeNumber: '',
    noticeDate: '',
    replyDueDate: '',
    selectedOption: '',
    previousApplicationNo: '',
  },

  // Step 4: Business Details (Conditional)
  businessDetails: {
    businessName: '',
    legalName: '',
    businessType: 'Proprietorship',
    businessActivity: '',
    address: '',
    state: '',
    city: '',
    pinCode: '',
    gstin: '',
    turnover: '',
  },

  // Step 5: Uploaded Documents
  documents: {},

  // Step 6: Additional Information & Callback
  additionalInfo: {
    notes: '',
    preferredContactMethod: 'phone', // 'phone' | 'whatsapp' | 'email'
    preferredContactTime: 'any_time', // 'morning' | 'afternoon' | 'evening' | 'any_time'
    requestCallback: false,
    callbackDate: '',
    callbackTime: '',
    callbackPhone: '',
  },

  // Step 8: Quote & Payment
  customQuote: null,
  paymentStatus: 'pending',
  status: 'submitted',
};

export function OtherFormProvider({ children }) {
  const [formData, setFormData] = useState(INITIAL_OTHER_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const updateFormData = (fields) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const updateApplicantDetails = (fields) => {
    setFormData((prev) => ({
      ...prev,
      applicantDetails: { ...prev.applicantDetails, ...fields },
    }));
  };

  const updateRequirementDetails = (fields) => {
    setFormData((prev) => ({
      ...prev,
      requirementDetails: { ...prev.requirementDetails, ...fields },
    }));
  };

  const updateBusinessDetails = (fields) => {
    setFormData((prev) => ({
      ...prev,
      businessDetails: { ...prev.businessDetails, ...fields },
    }));
  };

  const updateAdditionalInfo = (fields) => {
    setFormData((prev) => ({
      ...prev,
      additionalInfo: { ...prev.additionalInfo, ...fields },
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
    setFormData(INITIAL_OTHER_STATE);
  };

  // Dynamic Document Checklist
  const requiredDocuments = useMemo(() => {
    return getRequiredOtherDocuments(formData);
  }, [formData.selectedService?.id, formData.isUncertainService]);

  // Fees calculation
  const fees = useMemo(() => {
    return calculateOtherFees(formData.customQuote);
  }, [formData.customQuote]);

  // Submit action
  const submit = async (user, isPaid = false) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        ...formData,
        userId: user?.id || 'guest_user',
        applicantName:
          formData.applicantDetails?.fullName ||
          formData.businessDetails?.businessName ||
          user?.name ||
          'Client',
        applicantMobile:
          formData.applicantDetails?.mobile ||
          user?.mobile ||
          '',
        applicantEmail:
          formData.applicantDetails?.email ||
          user?.email ||
          '',
        calculatedFees: fees,
        amountPaid: isPaid ? fees.totalPayable : 0,
        paymentStatus: isPaid ? 'successful' : 'pending',
        submittedAt: new Date().toISOString(),
      };

      const result = await submitOtherServiceRequest(payload);
      setSubmitting(false);
      return result;
    } catch (err) {
      setSubmitting(false);
      setSubmitError(err.message || 'Failed to submit service request');
      throw err;
    }
  };

  const value = {
    formData,
    updateFormData,
    updateApplicantDetails,
    updateRequirementDetails,
    updateBusinessDetails,
    updateAdditionalInfo,
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
    <OtherFormContext.Provider value={value}>
      {children}
    </OtherFormContext.Provider>
  );
}

export function useOtherForm() {
  const context = useContext(OtherFormContext);
  if (!context) {
    throw new Error('useOtherForm must be used within an OtherFormProvider');
  }
  return context;
}
