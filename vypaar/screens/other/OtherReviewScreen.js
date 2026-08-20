import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import OtherServicesStepper from '../../components/OtherServicesStepper';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS } from '../../constants/theme';
import { useOtherForm } from '../../contexts/OtherFormContext';

export default function OtherReviewScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formData } = useOtherForm();

  const app = formData.applicantDetails || {};
  const req = formData.requirementDetails || {};
  const biz = formData.businessDetails || {};
  const addInfo = formData.additionalInfo || {};
  const docs = formData.documents || {};
  const isUncertain = formData.isUncertainService;

  const handleNext = () => {
    navigation.navigate('OtherPayment');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScreenHeader title="Review Service Request" />
      <OtherServicesStepper currentStep={7} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>📋 Step 7: Final Request Summary</Text>
          <Text style={styles.bannerSubtitle}>
            Please review the details of your request before proceeding to consultation and quote confirmation.
          </Text>
        </View>

        {/* 1. Service Selected */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>1. Service Category & Request</Text>
            <TouchableOpacity onPress={() => navigation.navigate('OtherSelectService')}>
              <Text style={styles.btnEdit}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Service Type:</Text>
            <Text style={styles.valBold}>
              {isUncertain
                ? '✨ General Consultation / Uncertain Service'
                : formData.selectedService?.name || 'Custom Service'}
            </Text>
          </View>
          {!isUncertain && (
            <View style={styles.row}>
              <Text style={styles.label}>Category:</Text>
              <Text style={styles.val}>{formData.selectedService?.categoryName || 'Other'}</Text>
            </View>
          )}
        </View>

        {/* 2. Applicant Details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>2. Applicant Information</Text>
            <TouchableOpacity onPress={() => navigation.navigate('OtherApplicant')}>
              <Text style={styles.btnEdit}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Applicant Name:</Text>
            <Text style={styles.valBold}>{app.fullName || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Constitution:</Text>
            <Text style={styles.val}>{app.applicantType?.toUpperCase() || 'INDIVIDUAL'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Mobile Number:</Text>
            <Text style={styles.val}>{app.mobile || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email Address:</Text>
            <Text style={styles.val}>{app.email || '-'}</Text>
          </View>
          {app.pan ? (
            <View style={styles.row}>
              <Text style={styles.label}>PAN:</Text>
              <Text style={styles.valHighlight}>{app.pan}</Text>
            </View>
          ) : null}
        </View>

        {/* 3. Requirement Details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>3. Requirement & Department</Text>
            <TouchableOpacity onPress={() => navigation.navigate('OtherRequirement')}>
              <Text style={styles.btnEdit}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Urgency:</Text>
            <Text style={[styles.valBold, { color: req.urgency === 'urgent' ? '#DC2626' : '#0284C7' }]}>
              {req.urgency?.replace('_', ' ').toUpperCase() || 'NORMAL'}
            </Text>
          </View>
          {req.deadlineDate ? (
            <View style={styles.row}>
              <Text style={styles.label}>Target Deadline:</Text>
              <Text style={styles.valBold}>{req.deadlineDate}</Text>
            </View>
          ) : null}
          <View style={styles.row}>
            <Text style={styles.label}>Department:</Text>
            <Text style={styles.val}>{req.department?.toUpperCase() || 'NOT SPECIFIED'}</Text>
          </View>
          {req.noticeNumber ? (
            <View style={styles.row}>
              <Text style={styles.label}>Notice / Reference No:</Text>
              <Text style={styles.valHighlight}>{req.noticeNumber}</Text>
            </View>
          ) : null}
          <View style={{ marginTop: 6 }}>
            <Text style={styles.label}>Description:</Text>
            <Text style={styles.descText}>{req.description || '-'}</Text>
          </View>
        </View>

        {/* 4. Business Profile (if entered) */}
        {biz.businessName ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>4. Business Profile</Text>
              <TouchableOpacity onPress={() => navigation.navigate('OtherBusiness')}>
                <Text style={styles.btnEdit}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Business Name:</Text>
              <Text style={styles.valBold}>{biz.businessName}</Text>
            </View>
            {biz.gstin ? (
              <View style={styles.row}>
                <Text style={styles.label}>GSTIN:</Text>
                <Text style={styles.valHighlight}>{biz.gstin}</Text>
              </View>
            ) : null}
            {biz.businessActivity ? (
              <View style={styles.row}>
                <Text style={styles.label}>Activity / Sector:</Text>
                <Text style={styles.val}>{biz.businessActivity}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* 5. Uploaded Documents */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>5. Uploaded Documents ({Object.keys(docs).length})</Text>
            <TouchableOpacity onPress={() => navigation.navigate('OtherDocuments')}>
              <Text style={styles.btnEdit}>Edit</Text>
            </TouchableOpacity>
          </View>
          {Object.keys(docs).length === 0 ? (
            <Text style={styles.noDocsText}>No documents attached (Can be shared during consultation)</Text>
          ) : (
            Object.keys(docs).map((k) => (
              <View key={k} style={styles.docRow}>
                <Text style={styles.docName}>• {k.replace(/_/g, ' ').toUpperCase()}</Text>
                <Text style={styles.docStatus}>✓ {docs[k]?.name || 'Attached'}</Text>
              </View>
            ))
          )}
        </View>

        {/* 6. Contact Preferences */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>6. Contact & Callback</Text>
            <TouchableOpacity onPress={() => navigation.navigate('OtherAdditional')}>
              <Text style={styles.btnEdit}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Preferred Mode:</Text>
            <Text style={styles.valBold}>
              {(addInfo.preferredContactMethod || 'phone').toUpperCase()}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Preferred Time:</Text>
            <Text style={styles.val}>
              {(addInfo.preferredContactTime || 'any_time').replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          {addInfo.requestCallback ? (
            <View style={styles.row}>
              <Text style={styles.label}>Expert Callback:</Text>
              <Text style={styles.valSuccess}>✓ Requested</Text>
            </View>
          ) : null}
        </View>

        {/* Compliance Notice */}
        <View style={styles.noticeBox}>
          <Text style={styles.noticeTitle}>⚖️ Expert Advisory Notice:</Text>
          <Text style={styles.noticeText}>
            Our team of chartered accountants and corporate lawyers will evaluate your requirements and contact you within business hours.
          </Text>
        </View>
      </ScrollView>

      {/* ---------- Footer ---------- */}
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 14) },
        ]}
      >
        <Pressable
          style={({ pressed }) => [styles.btnNext, pressed && styles.btnPressed]}
          onPress={handleNext}
        >
          <Text style={styles.btnNextText}>PROCEED TO CONSULTATION & QUOTE →</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  flex: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  banner: {
    backgroundColor: '#F0F9FF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 14,
  },
  bannerTitle: { fontSize: 15, fontWeight: '700', color: '#0369A1', marginBottom: 4 },
  bannerSubtitle: { fontSize: 12, color: '#0284C7', lineHeight: 17 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 6,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: COLORS.primaryDark },
  btnEdit: { fontSize: 12, color: '#0284C7', fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 12, color: '#64748B' },
  val: { fontSize: 12, color: COLORS.text, fontWeight: '600', textAlign: 'right' },
  valBold: { fontSize: 12, color: COLORS.text, fontWeight: '700', textAlign: 'right' },
  valHighlight: { fontSize: 12, color: '#0284C7', fontWeight: '700', textAlign: 'right' },
  valSuccess: { fontSize: 12, color: '#059669', fontWeight: '800', textAlign: 'right' },
  descText: { fontSize: 12, color: COLORS.text, lineHeight: 17, marginTop: 2, backgroundColor: '#F8FAFC', padding: 8, borderRadius: 6 },
  noDocsText: { fontSize: 11, color: '#94A3B8', fontStyle: 'italic' },
  docRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  docName: { fontSize: 11, fontWeight: '600', color: '#475569' },
  docStatus: { fontSize: 11, color: '#059669', fontWeight: '700' },
  noticeBox: {
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 20,
  },
  noticeTitle: { fontSize: 11, fontWeight: '700', color: '#92400E', marginBottom: 2 },
  noticeText: { fontSize: 11, color: '#78350F', lineHeight: 15 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  btnNext: {
    backgroundColor: COLORS.gold,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnPressed: { opacity: 0.85 },
  btnNextText: { fontSize: 15, fontWeight: '700', color: COLORS.white, letterSpacing: 0.5 },
});
