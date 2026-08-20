import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { SafeAreaView, StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './contexts/AuthContext';
import { FSSAIFormProvider } from './contexts/FSSAIFormContext';
import { GSTFormProvider } from './contexts/GSTFormContext';
import { IECFormProvider } from './contexts/IECFormContext';
import { ITRFormProvider } from './contexts/ITRFormContext';
import { OtherFormProvider } from './contexts/OtherFormContext';
import { PLCFormProvider } from './contexts/PLCFormContext';
import { TMFormProvider } from './contexts/TMFormContext';
import { UdyamFormProvider } from './contexts/UdyamFormContext';

// Admin Screens
import FSSAIAdminScreen from './screens/admin/FSSAIAdminScreen';
import GSTAdminScreen from './screens/admin/GSTAdminScreen';
import IECAdminScreen from './screens/admin/IECAdminScreen';
import ITRAdminScreen from './screens/admin/ITRAdminScreen';
import OtherAdminScreen from './screens/admin/OtherAdminScreen';
import PLCAdminScreen from './screens/admin/PLCAdminScreen';
import TMAdminScreen from './screens/admin/TMAdminScreen';
import UdyamAdminScreen from './screens/admin/UdyamAdminScreen';

// Other Services Consultation Flow Screens (9-Step Dynamic Consultation Wizard)
import OtherAdditionalScreen from './screens/other/OtherAdditionalScreen';
import OtherApplicantScreen from './screens/other/OtherApplicantScreen';
import OtherBusinessScreen from './screens/other/OtherBusinessScreen';
import OtherConfirmationScreen from './screens/other/OtherConfirmationScreen';
import OtherDocumentsScreen from './screens/other/OtherDocumentsScreen';
import OtherPaymentScreen from './screens/other/OtherPaymentScreen';
import OtherRequirementScreen from './screens/other/OtherRequirementScreen';
import OtherReviewScreen from './screens/other/OtherReviewScreen';
import OtherSelectServiceScreen from './screens/other/OtherSelectServiceScreen';

// Import Export Code (IEC) Flow Screens (12-Step DGFT Application Wizard)
import IECAddressScreen from './screens/iec/IECAddressScreen';
import IECApplicantTypeScreen from './screens/iec/IECApplicantTypeScreen';
import IECBankScreen from './screens/iec/IECBankScreen';
import IECBusinessDetailsScreen from './screens/iec/IECBusinessDetailsScreen';
import IECCertificateScreen from './screens/iec/IECCertificateScreen';
import IECConfirmationScreen from './screens/iec/IECConfirmationScreen';
import IECDocumentsScreen from './screens/iec/IECDocumentsScreen';
import IECPANScreen from './screens/iec/IECPANScreen';
import IECPaymentScreen from './screens/iec/IECPaymentScreen';
import IECProductsScreen from './screens/iec/IECProductsScreen';
import IECReviewScreen from './screens/iec/IECReviewScreen';
import IECSignatoryScreen from './screens/iec/IECSignatoryScreen';

// Income Tax Return (ITR) Flow Screens (12-Step Dynamic Filing Wizard)
import ITRBusinessScreen from './screens/itr/ITRBusinessScreen';
import ITRCapitalGainsScreen from './screens/itr/ITRCapitalGainsScreen';
import ITRConfirmationScreen from './screens/itr/ITRConfirmationScreen';
import ITRDeductionsScreen from './screens/itr/ITRDeductionsScreen';
import ITRDocumentsScreen from './screens/itr/ITRDocumentsScreen';
import ITRHousePropertyScreen from './screens/itr/ITRHousePropertyScreen';
import ITRPaymentScreen from './screens/itr/ITRPaymentScreen';
import ITRProfileScreen from './screens/itr/ITRProfileScreen';
import ITRReviewScreen from './screens/itr/ITRReviewScreen';
import ITRSalaryScreen from './screens/itr/ITRSalaryScreen';
import ITRSourcesScreen from './screens/itr/ITRSourcesScreen';
import ITRTaxPaidScreen from './screens/itr/ITRTaxPaidScreen';

// MSME / Udyam Registration Flow Screens (12-Step Assistance Wizard)
import UdyamAadhaarScreen from './screens/udyam/UdyamAadhaarScreen';
import UdyamAddressScreen from './screens/udyam/UdyamAddressScreen';
import UdyamBankScreen from './screens/udyam/UdyamBankScreen';
import UdyamBusinessScreen from './screens/udyam/UdyamBusinessScreen';
import UdyamConfirmationScreen from './screens/udyam/UdyamConfirmationScreen';
import UdyamFinancialsScreen from './screens/udyam/UdyamFinancialsScreen';
import UdyamNICScreen from './screens/udyam/UdyamNICScreen';
import UdyamOrganisationScreen from './screens/udyam/UdyamOrganisationScreen';
import UdyamPANScreen from './screens/udyam/UdyamPANScreen';
import UdyamPaymentScreen from './screens/udyam/UdyamPaymentScreen';
import UdyamReviewScreen from './screens/udyam/UdyamReviewScreen';
import UdyamUnitsScreen from './screens/udyam/UdyamUnitsScreen';

// GST Registration Flow Screens (10-Step Form GST REG-01)
import GSTBankDetailsScreen from './screens/gst/GSTBankDetailsScreen';
import GSTBusinessDetailsScreen from './screens/gst/GSTBusinessDetailsScreen';
import GSTConfirmationScreen from './screens/gst/GSTConfirmationScreen';
import GSTConstitutionScreen from './screens/gst/GSTConstitutionScreen';
import GSTDocumentsScreen from './screens/gst/GSTDocumentsScreen';
import GSTGoodsServicesScreen from './screens/gst/GSTGoodsServicesScreen';
import GSTPaymentScreen from './screens/gst/GSTPaymentScreen';
import GSTPremisesScreen from './screens/gst/GSTPremisesScreen';
import GSTPromotersScreen from './screens/gst/GSTPromotersScreen';
import GSTReviewScreen from './screens/gst/GSTReviewScreen';

// FSSAI Food License Flow Screens (11-Step FoSCoS)
import FSSAIApplicantScreen from './screens/fssai/FSSAIApplicantScreen';
import FSSAIBusinessScreen from './screens/fssai/FSSAIBusinessScreen';
import FSSAIConfirmationScreen from './screens/fssai/FSSAIConfirmationScreen';
import FSSAIDocumentsChecklistScreen from './screens/fssai/FSSAIDocumentsChecklistScreen';
import FSSAIDocumentsUploadScreen from './screens/fssai/FSSAIDocumentsUploadScreen';
import FSSAIEligibilityScreen from './screens/fssai/FSSAIEligibilityScreen';
import FSSAIPaymentScreen from './screens/fssai/FSSAIPaymentScreen';
import FSSAIPremisesScreen from './screens/fssai/FSSAIPremisesScreen';
import FSSAIProductsScreen from './screens/fssai/FSSAIProductsScreen';
import FSSAIReviewScreen from './screens/fssai/FSSAIReviewScreen';
import FSSAISpecificScreen from './screens/fssai/FSSAISpecificScreen';

// PLC Registration Flow Screens
import PLCApplicantScreen from './screens/plc/PLCApplicantScreen';
import PLCBusinessScreen from './screens/plc/PLCBusinessScreen';
import PLCCompanyScreen from './screens/plc/PLCCompanyScreen';
import PLCConfirmationScreen from './screens/plc/PLCConfirmationScreen';
import PLCDirectorsScreen from './screens/plc/PLCDirectorsScreen';
import PLCDocumentsScreen from './screens/plc/PLCDocumentsScreen';
import PLCOfficeScreen from './screens/plc/PLCOfficeScreen';
import PLCReviewScreen from './screens/plc/PLCReviewScreen';

// Trademark Registration Flow Screens (Form TM-A)
import TMAgentScreen from './screens/tm/TMAgentScreen';
import TMApplicantDetailsScreen from './screens/tm/TMApplicantDetailsScreen';
import TMApplicantTypeScreen from './screens/tm/TMApplicantTypeScreen';
import TMClassesScreen from './screens/tm/TMClassesScreen';
import TMConfirmationScreen from './screens/tm/TMConfirmationScreen';
import TMDocumentsScreen from './screens/tm/TMDocumentsScreen';
import TMMarkDetailsScreen from './screens/tm/TMMarkDetailsScreen';
import TMPaymentScreen from './screens/tm/TMPaymentScreen';
import TMReviewScreen from './screens/tm/TMReviewScreen';
import TMUsageScreen from './screens/tm/TMUsageScreen';

// Core App Screens
import FinalPaymentDueScreen from './screens/FinalPaymentDueScreen';
import FinancialServicesScreen from './screens/FinancialServicesScreen';
import HelpSupportScreen from './screens/HelpSupportScreen';
import HomeScreen from './screens/HomeScreen';
import InsuranceScreen from './screens/InsuranceScreen';
import InvoiceScreen from './screens/InvoiceScreen';
import LoginScreen from './screens/LoginScreen';
import MarketingScreen from './screens/MarketingScreen';
import MyDocumentsScreen from './screens/MyDocumentsScreen';
import MyWorkScreen from './screens/MyWorkScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import OrderConfirmationScreen from './screens/OrderConfirmationScreen';
import OtpScreen from './screens/OtpScreen';
import PaymentGatewayScreen from './screens/PaymentGatewayScreen';
import PaymentHistoryScreen from './screens/PaymentHistoryScreen';
import PaymentSuccessScreen from './screens/PaymentSuccessScreen';
import PaymentSummaryScreen from './screens/PaymentSummaryScreen';
import PricingScreen from './screens/PricingScreen';
import ProfileScreen from './screens/ProfileScreen';
import ServiceCompletedScreen from './screens/ServiceCompletedScreen';
import ServiceDetailScreen from './screens/ServiceDetailScreen';
import ServicesScreen from './screens/ServicesScreen';
import SplashScreen from './screens/SplashScreen';
import TaxCompanyScreen from './screens/TaxCompanyScreen';
import UploadDocumentsScreen from './screens/UploadDocumentsScreen';
import WebServiceScreen from './screens/WebServiceScreen';
import WorkProgressScreen from './screens/WorkProgressScreen';

const Stack = createNativeStackNavigator();

// Screens where back navigation is disabled
const NO_BACK = { gestureEnabled: false };

export default function App() {
  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: '#1B2B5E' }}>
      <StatusBar barStyle="light-content" backgroundColor="#1B2B5E" />
      <View style={{ flex: 1, backgroundColor: '#1B2B5E' }}>
        <AuthProvider>
          <PLCFormProvider>
            <TMFormProvider>
              <FSSAIFormProvider>
                <GSTFormProvider>
                  <UdyamFormProvider>
                    <ITRFormProvider>
                      <IECFormProvider>
                        <OtherFormProvider>
                          <NavigationContainer>
                            <Stack.Navigator
                              initialRouteName="Splash"
                              screenOptions={{
                                headerShown: false,
                                animation: 'slide_from_right',
                                contentStyle: { backgroundColor: '#1B2B5E' },
                              }}
                            >
                          {/* ---------- Auth ---------- */}
                          <Stack.Screen name="Splash" component={SplashScreen} options={NO_BACK} />
                          <Stack.Screen name="Login" component={LoginScreen} options={NO_BACK} />
                          <Stack.Screen name="OTP" component={OtpScreen} />

                          {/* ---------- Profile & User Details ---------- */}
                          <Stack.Screen name="Profile" component={ProfileScreen} />

                          {/* ---------- 5 Main Navigation Tabs ---------- */}
                          <Stack.Screen name="Dashboard" component={HomeScreen} options={NO_BACK} />
                          <Stack.Screen name="Home" component={HomeScreen} options={NO_BACK} />
                          <Stack.Screen name="TaxCompany" component={TaxCompanyScreen} />
                          <Stack.Screen name="Insurance" component={InsuranceScreen} />
                          <Stack.Screen name="Marketing" component={MarketingScreen} />
                          <Stack.Screen name="WebService" component={WebServiceScreen} />

                          {/* ---------- Alias / Legacy Routes ---------- */}
                          <Stack.Screen name="MyWork" component={TaxCompanyScreen} />
                          <Stack.Screen name="Services" component={TaxCompanyScreen} />
                          <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
                          <Stack.Screen name="Pricing" component={PricingScreen} />
                          <Stack.Screen name="PricingScreen" component={PricingScreen} />
                          <Stack.Screen name="DSCPricing" component={PricingScreen} />
                          <Stack.Screen name="ISOPricing" component={PricingScreen} />
                          <Stack.Screen name="ChallanPricing" component={PricingScreen} />
                          <Stack.Screen name="FinancialServices" component={InsuranceScreen} />

                          {/* ---------- Payment ---------- */}
                          <Stack.Screen name="PaymentSummary" component={PaymentSummaryScreen} />
                          <Stack.Screen name="PaymentGateway" component={PaymentGatewayScreen} />
                          <Stack.Screen
                            name="PaymentSuccess"
                            component={PaymentSuccessScreen}
                            options={NO_BACK}
                          />
                          <Stack.Screen
                            name="OrderConfirmation"
                            component={OrderConfirmationScreen}
                            options={NO_BACK}
                          />
                          <Stack.Screen name="FinalPaymentDue" component={FinalPaymentDueScreen} />
                          <Stack.Screen
                            name="ServiceCompleted"
                            component={ServiceCompletedScreen}
                            options={NO_BACK}
                          />

                          {/* ---------- Work & Documents ---------- */}
                          <Stack.Screen name="UploadDocuments" component={UploadDocumentsScreen} />
                          <Stack.Screen name="WorkProgress" component={WorkProgressScreen} />
                          <Stack.Screen name="MyDocuments" component={MyDocumentsScreen} />

                          {/* ---------- Import Export Code (IEC) Flow (12-Step DGFT Wizard) ---------- */}
                          <Stack.Screen name="IECApplicantType" component={IECApplicantTypeScreen} />
                          <Stack.Screen name="IECPAN" component={IECPANScreen} />
                          <Stack.Screen name="IECBusinessDetails" component={IECBusinessDetailsScreen} />
                          <Stack.Screen name="IECAddress" component={IECAddressScreen} />
                          <Stack.Screen name="IECBank" component={IECBankScreen} />
                          <Stack.Screen name="IECSignatory" component={IECSignatoryScreen} />
                          <Stack.Screen name="IECProducts" component={IECProductsScreen} />
                          <Stack.Screen name="IECDocuments" component={IECDocumentsScreen} />
                          <Stack.Screen name="IECReview" component={IECReviewScreen} />
                          <Stack.Screen name="IECPayment" component={IECPaymentScreen} />
                          <Stack.Screen
                            name="IECConfirmation"
                            component={IECConfirmationScreen}
                            options={NO_BACK}
                          />
                          <Stack.Screen name="IECCertificate" component={IECCertificateScreen} />
                          <Stack.Screen name="IECAdmin" component={IECAdminScreen} />

                          {/* ---------- Income Tax Return (ITR) Flow (12-Step Wizard) ---------- */}
                          <Stack.Screen name="ITRProfile" component={ITRProfileScreen} />
                          <Stack.Screen name="ITRSources" component={ITRSourcesScreen} />
                          <Stack.Screen name="ITRSalary" component={ITRSalaryScreen} />
                          <Stack.Screen name="ITRHouseProperty" component={ITRHousePropertyScreen} />
                          <Stack.Screen name="ITRBusiness" component={ITRBusinessScreen} />
                          <Stack.Screen name="ITRCapitalGains" component={ITRCapitalGainsScreen} />
                          <Stack.Screen name="ITRDeductions" component={ITRDeductionsScreen} />
                          <Stack.Screen name="ITRTaxPaid" component={ITRTaxPaidScreen} />
                          <Stack.Screen name="ITRDocuments" component={ITRDocumentsScreen} />
                          <Stack.Screen name="ITRReview" component={ITRReviewScreen} />
                          <Stack.Screen name="ITRPayment" component={ITRPaymentScreen} />
                          <Stack.Screen
                            name="ITRConfirmation"
                            component={ITRConfirmationScreen}
                            options={NO_BACK}
                          />
                          <Stack.Screen name="ITRAdmin" component={ITRAdminScreen} />

                          {/* ---------- MSME / Udyam Registration Flow (12-Step Wizard) ---------- */}
                          <Stack.Screen name="UdyamAadhaar" component={UdyamAadhaarScreen} />
                          <Stack.Screen name="UdyamPAN" component={UdyamPANScreen} />
                          <Stack.Screen name="UdyamBusiness" component={UdyamBusinessScreen} />
                          <Stack.Screen name="UdyamOrganisation" component={UdyamOrganisationScreen} />
                          <Stack.Screen name="UdyamAddress" component={UdyamAddressScreen} />
                          <Stack.Screen name="UdyamUnits" component={UdyamUnitsScreen} />
                          <Stack.Screen name="UdyamBank" component={UdyamBankScreen} />
                          <Stack.Screen name="UdyamNIC" component={UdyamNICScreen} />
                          <Stack.Screen name="UdyamFinancials" component={UdyamFinancialsScreen} />
                          <Stack.Screen name="UdyamReview" component={UdyamReviewScreen} />
                          <Stack.Screen name="UdyamPayment" component={UdyamPaymentScreen} />
                          <Stack.Screen
                            name="UdyamConfirmation"
                            component={UdyamConfirmationScreen}
                            options={NO_BACK}
                          />
                          <Stack.Screen name="UdyamAdmin" component={UdyamAdminScreen} />

                          {/* ---------- GST Registration Flow (10-Step Form GST REG-01) ---------- */}
                          <Stack.Screen name="GSTConstitution" component={GSTConstitutionScreen} />
                          <Stack.Screen name="GSTBusinessDetails" component={GSTBusinessDetailsScreen} />
                          <Stack.Screen name="GSTPromoters" component={GSTPromotersScreen} />
                          <Stack.Screen name="GSTPremises" component={GSTPremisesScreen} />
                          <Stack.Screen name="GSTGoodsServices" component={GSTGoodsServicesScreen} />
                          <Stack.Screen name="GSTBankDetails" component={GSTBankDetailsScreen} />
                          <Stack.Screen name="GSTDocuments" component={GSTDocumentsScreen} />
                          <Stack.Screen name="GSTReview" component={GSTReviewScreen} />
                          <Stack.Screen name="GSTPayment" component={GSTPaymentScreen} />
                          <Stack.Screen
                            name="GSTConfirmation"
                            component={GSTConfirmationScreen}
                            options={NO_BACK}
                          />
                          <Stack.Screen name="GSTAdmin" component={GSTAdminScreen} />

                          {/* ---------- Private Limited Company Registration Flow ---------- */}
                          <Stack.Screen name="PLCApplicant" component={PLCApplicantScreen} />
                          <Stack.Screen name="PLCCompany" component={PLCCompanyScreen} />
                          <Stack.Screen name="PLCDirectors" component={PLCDirectorsScreen} />
                          <Stack.Screen name="PLCOffice" component={PLCOfficeScreen} />
                          <Stack.Screen name="PLCBusiness" component={PLCBusinessScreen} />
                          <Stack.Screen name="PLCDocuments" component={PLCDocumentsScreen} />
                          <Stack.Screen name="PLCReview" component={PLCReviewScreen} />
                          <Stack.Screen
                            name="PLCConfirmation"
                            component={PLCConfirmationScreen}
                            options={NO_BACK}
                          />
                          <Stack.Screen name="PLCAdmin" component={PLCAdminScreen} />

                          {/* ---------- Trademark Registration Flow (Form TM-A) ---------- */}
                          <Stack.Screen name="TMApplicantType" component={TMApplicantTypeScreen} />
                          <Stack.Screen name="TMApplicantDetails" component={TMApplicantDetailsScreen} />
                          <Stack.Screen name="TMMarkDetails" component={TMMarkDetailsScreen} />
                          <Stack.Screen name="TMClasses" component={TMClassesScreen} />
                          <Stack.Screen name="TMUsage" component={TMUsageScreen} />
                          <Stack.Screen name="TMDocuments" component={TMDocumentsScreen} />
                          <Stack.Screen name="TMAgent" component={TMAgentScreen} />
                          <Stack.Screen name="TMReview" component={TMReviewScreen} />
                          <Stack.Screen name="TMPayment" component={TMPaymentScreen} />
                          <Stack.Screen
                            name="TMConfirmation"
                            component={TMConfirmationScreen}
                            options={NO_BACK}
                          />
                          <Stack.Screen name="TMAdmin" component={TMAdminScreen} />

                          {/* ---------- FSSAI Food License Flow (11-Step FoSCoS) ---------- */}
                          <Stack.Screen name="FSSAIEligibility" component={FSSAIEligibilityScreen} />
                          <Stack.Screen name="FSSAIApplicant" component={FSSAIApplicantScreen} />
                          <Stack.Screen name="FSSAIBusiness" component={FSSAIBusinessScreen} />
                          <Stack.Screen name="FSSAIPremises" component={FSSAIPremisesScreen} />
                          <Stack.Screen name="FSSAIProducts" component={FSSAIProductsScreen} />
                          <Stack.Screen name="FSSAISpecific" component={FSSAISpecificScreen} />
                          <Stack.Screen name="FSSAIDocumentsChecklist" component={FSSAIDocumentsChecklistScreen} />
                          <Stack.Screen name="FSSAIDocumentsUpload" component={FSSAIDocumentsUploadScreen} />
                          <Stack.Screen name="FSSAIReview" component={FSSAIReviewScreen} />
                          <Stack.Screen name="FSSAIPayment" component={FSSAIPaymentScreen} />
                          <Stack.Screen
                            name="FSSAIConfirmation"
                            component={FSSAIConfirmationScreen}
                            options={NO_BACK}
                          />
                          <Stack.Screen name="FSSAIAdmin" component={FSSAIAdminScreen} />

                          {/* ---------- Other Services Dynamic Consultation Flow (9 Steps) ---------- */}
                          <Stack.Screen name="OtherSelectService" component={OtherSelectServiceScreen} />
                          <Stack.Screen name="OtherApplicant" component={OtherApplicantScreen} />
                          <Stack.Screen name="OtherRequirement" component={OtherRequirementScreen} />
                          <Stack.Screen name="OtherBusiness" component={OtherBusinessScreen} />
                          <Stack.Screen name="OtherDocuments" component={OtherDocumentsScreen} />
                          <Stack.Screen name="OtherAdditional" component={OtherAdditionalScreen} />
                          <Stack.Screen name="OtherReview" component={OtherReviewScreen} />
                          <Stack.Screen name="OtherPayment" component={OtherPaymentScreen} />
                          <Stack.Screen
                            name="OtherConfirmation"
                            component={OtherConfirmationScreen}
                            options={NO_BACK}
                          />
                          <Stack.Screen name="OtherAdmin" component={OtherAdminScreen} />

                          {/* ---------- Other ---------- */}
                          <Stack.Screen name="Notifications" component={NotificationsScreen} />
                          <Stack.Screen name="Invoice" component={InvoiceScreen} />
                          <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
                          <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
                        </Stack.Navigator>
                      </NavigationContainer>
                    </OtherFormProvider>
                  </IECFormProvider>
                </ITRFormProvider>
              </UdyamFormProvider>
            </GSTFormProvider>
          </FSSAIFormProvider>
        </TMFormProvider>
      </PLCFormProvider>
    </AuthProvider>
  </View>
</SafeAreaProvider>
);
}
