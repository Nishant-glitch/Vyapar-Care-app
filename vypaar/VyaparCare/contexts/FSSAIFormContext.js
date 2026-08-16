import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  FSSAI_KOB_TYPES,
  getRequiredFSSAIDocuments,
  calculateFSSAIFees,
  determineFSSAIEligibility,
} from '../config/fssaiConfig';
import { submitFSSAIApplication } from '../lib/database';

const FSSAIFormContext = createContext(null);

const INITIAL_STATE = {
  kob: 'restaurant',
  constitution: 'proprietorship',
  licenseType: 'state',
  validityYears: 1,

  applicantDetails: {
    businessLegalName: '',
    tradeName: '',
    applicantName: '',
    fatherOrMotherName: '',
    dob: '',
    pan: '',
    mobile: '',
    email: '',
    address1: '',
    address2: '',
    city: '',
    district: '',
    state: '07',
    pinCode: '',
    partners: [
      { name: '', mobile: '', email: '', address: '' },
      { name: '', mobile: '', email: '', address: '' },
    ],
    llpin: '',
    cin: '',
    directors: [
      { name: '', din: '', pan: '' },
      { name: '', din: '', pan: '' },
    ],
    authorizedSignatory: '',
  },

  businessDetails: {
    foodBusinessName: '',
    natureOfBusiness: 'Food Service / Restaurant',
    activity: 'Restaurant / Cafe',
    businessStartDate: '01/01/2026',
    annualTurnover: '12_to_20_cr',
    expectedTurnover: '50_lakhs',
    employeeCount: '5',
    website: '',
    isCurrentlyOperating: true,
    applicationType: 'new', // 'new' | 'renewal' | 'modification'
  },

  premisesDetails: {
    premisesName: '',
    address1: '',
    address2: '',
    locality: '',
    city: '',
    district: '',
    state: '07',
    pinCode: '',
    premisesType: 'rented', // 'owned' | 'rented' | 'leased' | 'shared' | 'other'
  },

  products: [
    {
      productName: 'Cooked Meals & Indian Cuisines',
      categoryCode: '16',
      categoryName: 'Prepared Foods / Restaurant Cuisines',
      description: 'Dine-in and takeaway cooked meals, curries, breads and desserts',
      capacity: '200 Meals/Day',
      unit: 'Meals',
    },
  ],

  specificDetails: {
    productionCapacity: '1000',
    capacityUnit: 'Kg/Day',
    workingHours: '8',
    employees: '10',
    processDescription: '',
    equipment: [
      { name: 'Commercial Oven', quantity: '1', capacity: '100 L', hp: '2', description: 'Baking' },
    ],
    seatingCapacity: '40',
    kitchenDetails: 'Standard commercial hygienic kitchen with stainless steel counters',
    foodPreparationDetails: 'Cooked daily using fresh ingredients',
    isDeliveryTakeaway: true,
    hotelRating: '3',
    roomCount: '25',
    kitchenCount: '1',
    hraccCertificateNumber: '',
    dairyLPD: '500',
    collectionCentres: '2',
    milkSource: 'Local farmers collection network',
    meatType: 'Poultry & Mutton',
    meatDailyCapacity: '100 Kg/Day',
    meatSource: 'Registered Municipal Slaughterhouse',
    waterSource: 'Borewell & RO Purification Plant',
    bisNumber: '',
    packagingType: '1 Litre PET Bottles',
    manufacturerName: '',
    manufacturerFSSAI: '',
    repackerUndertaking: '',
    vehicles: [
      { vehicleNumber: 'DL01AB1234', vehicleType: 'Insulated Van', capacity: '2 Ton', rcNumber: 'RC12345' },
    ],
    iecCode: '',
    importCountries: 'Italy, France',
    exportCountries: 'UAE, UK',
    websitePlatform: 'https://swiggy.com',
    marketplaceName: 'Swiggy / Zomato / Direct App',
    warehouseAddress: '',
    isWaterTestRequired: false,
    hasFSMS: false,
    hasMunicipalNOC: false,
  },

  customDocuments: [],
  submittedApplicationId: null,
};

export function FSSAIFormProvider({ children }) {
  const [formState, setFormState] = useState(INITIAL_STATE);
  const [documents, setDocuments] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Automatically recalculate recommended eligibility
  const eligibility = useMemo(() => {
    let turnoverNum = 1500000;
    if (formState.businessDetails.annualTurnover === 'up_to_12_lakh') turnoverNum = 800000;
    else if (formState.businessDetails.annualTurnover === '12_to_20_cr') turnoverNum = 5000000;
    else if (formState.businessDetails.annualTurnover === 'above_20_cr') turnoverNum = 250000000;

    let capNum = 0;
    if (formState.specificDetails.productionCapacity) {
      capNum = parseFloat(formState.specificDetails.productionCapacity) || 0;
    }
    if (formState.kob === 'dairy' && formState.specificDetails.dairyLPD) {
      capNum = parseFloat(formState.specificDetails.dairyLPD) || 0;
    }

    return determineFSSAIEligibility({
      kob: formState.kob,
      turnover: turnoverNum,
      capacity: capNum,
      isImportExport: ['importer', 'exporter'].includes(formState.kob),
      isCentralPremises: formState.kob === 'central_premises',
      isMultipleStates: formState.kob === 'ecommerce',
    });
  }, [
    formState.kob,
    formState.businessDetails.annualTurnover,
    formState.specificDetails.productionCapacity,
    formState.specificDetails.dairyLPD,
  ]);

  // Sync recommended licenseType with formState
  useEffect(() => {
    if (eligibility && eligibility.licenseType) {
      setFormState((prev) => {
        if (prev.licenseType !== eligibility.licenseType) {
          return { ...prev, licenseType: eligibility.licenseType };
        }
        return prev;
      });
    }
  }, [eligibility]);

  // Dynamically regenerate document checklist matrix when pertinent fields change
  useEffect(() => {
    const matrix = getRequiredFSSAIDocuments({
      kob: formState.kob,
      licenseType: formState.licenseType,
      constitution: formState.constitution,
      premisesType: formState.premisesDetails.premisesType,
      isWaterTestRequired:
        formState.specificDetails.isWaterTestRequired ||
        ['water', 'dairy', 'meat', 'manufacturer'].includes(formState.kob),
      hasFSMS: formState.specificDetails.hasFSMS,
      hasMunicipalNOC: formState.specificDetails.hasMunicipalNOC,
    });

    setDocuments((prevDocs) => {
      return matrix.map((item) => {
        const existing = prevDocs.find((d) => d.id === item.id);
        if (existing) {
          return { ...item, status: existing.status, file: existing.file, fileUrl: existing.fileUrl };
        }
        return { ...item, status: item.required ? 'required' : 'optional', file: null, fileUrl: null };
      });
    });
  }, [
    formState.kob,
    formState.licenseType,
    formState.constitution,
    formState.premisesDetails.premisesType,
    formState.specificDetails.isWaterTestRequired,
    formState.specificDetails.hasFSMS,
    formState.specificDetails.hasMunicipalNOC,
  ]);

  const updateFormState = (updates) => {
    setFormState((prev) => ({ ...prev, ...updates }));
  };

  const updateApplicantDetails = (updates) => {
    setFormState((prev) => ({
      ...prev,
      applicantDetails: { ...prev.applicantDetails, ...updates },
    }));
  };

  const addPartner = () => {
    setFormState((prev) => ({
      ...prev,
      applicantDetails: {
        ...prev.applicantDetails,
        partners: [
          ...prev.applicantDetails.partners,
          { name: '', mobile: '', email: '', address: '' },
        ],
      },
    }));
  };

  const removePartner = (idx) => {
    setFormState((prev) => ({
      ...prev,
      applicantDetails: {
        ...prev.applicantDetails,
        partners: prev.applicantDetails.partners.filter((_, i) => i !== idx),
      },
    }));
  };

  const updatePartner = (idx, updates) => {
    setFormState((prev) => {
      const updated = [...prev.applicantDetails.partners];
      updated[idx] = { ...updated[idx], ...updates };
      return {
        ...prev,
        applicantDetails: { ...prev.applicantDetails, partners: updated },
      };
    });
  };

  const addDirector = () => {
    setFormState((prev) => ({
      ...prev,
      applicantDetails: {
        ...prev.applicantDetails,
        directors: [
          ...prev.applicantDetails.directors,
          { name: '', din: '', pan: '' },
        ],
      },
    }));
  };

  const removeDirector = (idx) => {
    setFormState((prev) => ({
      ...prev,
      applicantDetails: {
        ...prev.applicantDetails,
        directors: prev.applicantDetails.directors.filter((_, i) => i !== idx),
      },
    }));
  };

  const updateDirector = (idx, updates) => {
    setFormState((prev) => {
      const updated = [...prev.applicantDetails.directors];
      updated[idx] = { ...updated[idx], ...updates };
      return {
        ...prev,
        applicantDetails: { ...prev.applicantDetails, directors: updated },
      };
    });
  };

  const updateBusinessDetails = (updates) => {
    setFormState((prev) => ({
      ...prev,
      businessDetails: { ...prev.businessDetails, ...updates },
    }));
  };

  const updatePremisesDetails = (updates) => {
    setFormState((prev) => ({
      ...prev,
      premisesDetails: { ...prev.premisesDetails, ...updates },
    }));
  };

  const addProduct = (prod = { productName: '', categoryCode: '16', categoryName: 'Prepared Foods', description: '', capacity: '', unit: '' }) => {
    setFormState((prev) => ({
      ...prev,
      products: [...prev.products, prod],
    }));
  };

  const removeProduct = (idx) => {
    setFormState((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== idx),
    }));
  };

  const updateProduct = (idx, updates) => {
    setFormState((prev) => {
      const updated = [...prev.products];
      updated[idx] = { ...updated[idx], ...updates };
      return { ...prev, products: updated };
    });
  };

  const updateSpecificDetails = (updates) => {
    setFormState((prev) => ({
      ...prev,
      specificDetails: { ...prev.specificDetails, ...updates },
    }));
  };

  const addEquipment = (eq = { name: '', quantity: '1', capacity: '', hp: '', description: '' }) => {
    setFormState((prev) => ({
      ...prev,
      specificDetails: {
        ...prev.specificDetails,
        equipment: [...(prev.specificDetails.equipment || []), eq],
      },
    }));
  };

  const removeEquipment = (idx) => {
    setFormState((prev) => ({
      ...prev,
      specificDetails: {
        ...prev.specificDetails,
        equipment: (prev.specificDetails.equipment || []).filter((_, i) => i !== idx),
      },
    }));
  };

  const updateEquipment = (idx, updates) => {
    setFormState((prev) => {
      const updated = [...(prev.specificDetails.equipment || [])];
      updated[idx] = { ...updated[idx], ...updates };
      return {
        ...prev,
        specificDetails: { ...prev.specificDetails, equipment: updated },
      };
    });
  };

  const addVehicle = (v = { vehicleNumber: '', vehicleType: 'Insulated Van', capacity: '', rcNumber: '' }) => {
    setFormState((prev) => ({
      ...prev,
      specificDetails: {
        ...prev.specificDetails,
        vehicles: [...(prev.specificDetails.vehicles || []), v],
      },
    }));
  };

  const removeVehicle = (idx) => {
    setFormState((prev) => ({
      ...prev,
      specificDetails: {
        ...prev.specificDetails,
        vehicles: (prev.specificDetails.vehicles || []).filter((_, i) => i !== idx),
      },
    }));
  };

  const updateVehicle = (idx, updates) => {
    setFormState((prev) => {
      const updated = [...(prev.specificDetails.vehicles || [])];
      updated[idx] = { ...updated[idx], ...updates };
      return {
        ...prev,
        specificDetails: { ...prev.specificDetails, vehicles: updated },
      };
    });
  };

  const uploadDocument = (docId, file) => {
    setDocuments((prevDocs) =>
      prevDocs.map((d) => (d.id === docId ? { ...d, file, status: 'uploaded' } : d))
    );
  };

  const removeDocument = (docId) => {
    setDocuments((prevDocs) =>
      prevDocs.map((d) =>
        d.id === docId ? { ...d, file: null, fileUrl: null, status: d.required ? 'required' : 'optional' } : d
      )
    );
  };

  const addCustomDocument = (label, description, file) => {
    const customDoc = {
      id: `custom_${Date.now()}`,
      label,
      description,
      category: 'other_supporting',
      categoryLabel: '📎 Additional Supporting Documents',
      required: false,
      status: 'uploaded',
      file,
    };
    setDocuments((prev) => [...prev, customDoc]);
    setFormState((prev) => ({
      ...prev,
      customDocuments: [...prev.customDocuments, customDoc],
    }));
  };

  const getFees = () => {
    return calculateFSSAIFees({
      licenseType: formState.licenseType,
      validityYears: formState.validityYears,
      kob: formState.kob,
    });
  };

  const submitApplication = async (user = null) => {
    setIsSubmitting(true);
    try {
      const payload = {
        userId: user?.id || null,
        kob: formState.kob,
        constitution: formState.constitution,
        licenseType: formState.licenseType,
        validityYears: formState.validityYears,
        applicantDetails: formState.applicantDetails,
        businessDetails: formState.businessDetails,
        premisesDetails: formState.premisesDetails,
        products: formState.products,
        specificDetails: formState.specificDetails,
        documents: documents.map((d) => ({
          id: d.id,
          label: d.label,
          category: d.category,
          categoryLabel: d.categoryLabel,
          required: d.required,
          status: d.status,
          file: d.file ? { name: d.file.name, size: d.file.size, type: d.file.type } : null,
          fileUrl: d.fileUrl || null,
        })),
        calculatedFees: getFees(),
        eligibility,
      };

      const res = await submitFSSAIApplication(payload);
      if (res?.applicationId) {
        setFormState((prev) => ({
          ...prev,
          submittedApplicationId: res.applicationId,
        }));
      }
      return res?.record || res;
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormState(INITIAL_STATE);
    setDocuments([]);
    setErrors({});
  };

  return (
    <FSSAIFormContext.Provider
      value={{
        formState,
        documents,
        errors,
        setErrors,
        isSubmitting,
        eligibility,
        updateFormState,
        updateApplicantDetails,
        addPartner,
        removePartner,
        updatePartner,
        addDirector,
        removeDirector,
        updateDirector,
        updateBusinessDetails,
        updatePremisesDetails,
        addProduct,
        removeProduct,
        updateProduct,
        updateSpecificDetails,
        addEquipment,
        removeEquipment,
        updateEquipment,
        addVehicle,
        removeVehicle,
        updateVehicle,
        uploadDocument,
        removeDocument,
        addCustomDocument,
        getFees,
        submitApplication,
        resetForm,
      }}
    >
      {children}
    </FSSAIFormContext.Provider>
  );
}

export function useFSSAIForm() {
  const context = useContext(FSSAIFormContext);
  if (!context) {
    throw new Error('useFSSAIForm must be used within an FSSAIFormProvider');
  }
  return context;
}
