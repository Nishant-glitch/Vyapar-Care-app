import React from 'react';
import {
  Alert,
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
import IECStepper from '../../components/IECStepper';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS } from '../../constants/theme';
import { useIECForm } from '../../contexts/IECFormContext';

export default function IECCertificateScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, resetForm } = useIECForm();

  const pan = formData.panDetails || {};
  const addr = formData.addressDetails || {};
  const cert = formData.iecCertificateDetails || {};
  const iecNum = pan.panNumber || cert.iecNumber || 'ABCDE1234F';

  const handleDownload = () => {
    Alert.alert(
      '📥 Download e-IEC Certificate',
      `Official DGFT signed e-IEC Certificate (PDF) for ${pan.legalName || 'your enterprise'} has been downloaded to your device.`
    );
  };

  const handleHome = () => {
    resetForm();
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScreenHeader title="Official e-IEC Certificate" />
      <IECStepper currentStep={12} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Certificate Frame Card */}
        <View style={styles.certFrame}>
          <View style={styles.certInnerBorder}>
            {/* DGFT Header */}
            <View style={styles.certHeader}>
              <Text style={styles.emblemText}>🇮🇳</Text>
              <Text style={styles.govtTitle}>GOVERNMENT OF INDIA</Text>
              <Text style={styles.ministryTitle}>
                MINISTRY OF COMMERCE & INDUSTRY
              </Text>
              <Text style={styles.deptTitle}>
                DIRECTORATE GENERAL OF FOREIGN TRADE
              </Text>
              <View style={styles.badgeLine}>
                <Text style={styles.certMainTitle}>
                  CERTIFICATE OF IMPORTER - EXPORTER CODE (IEC)
                </Text>
              </View>
            </View>

            {/* IEC Number Banner */}
            <View style={styles.iecNumBox}>
              <Text style={styles.iecNumLabel}>IMPORTER EXPORTER CODE (IEC)</Text>
              <Text style={styles.iecNumVal}>{iecNum}</Text>
            </View>

            {/* Certificate Details Body */}
            <View style={styles.certBody}>
              <View style={styles.certRow}>
                <Text style={styles.certLabel}>1. Legal Entity Name:</Text>
                <Text style={styles.certValBold}>
                  {pan.legalName || 'ACME GLOBAL EXPORTS PVT LTD'}
                </Text>
              </View>

              <View style={styles.certRow}>
                <Text style={styles.certLabel}>2. Entity PAN:</Text>
                <Text style={styles.certValHighlight}>{iecNum}</Text>
              </View>

              <View style={styles.certRow}>
                <Text style={styles.certLabel}>3. Constitution:</Text>
                <Text style={styles.certVal}>
                  {(formData.entityType || 'Proprietorship').toUpperCase()}
                </Text>
              </View>

              <View style={styles.certRow}>
                <Text style={styles.certLabel}>4. Registered Address:</Text>
                <Text style={styles.certVal}>
                  {addr.line1 || 'Plot No. 42, Okhla Ind Area'}, {addr.city || 'New Delhi'}, {addr.state || 'Delhi'} - {addr.pinCode || '110020'}
                </Text>
              </View>

              <View style={styles.certRow}>
                <Text style={styles.certLabel}>5. Date of Issue:</Text>
                <Text style={styles.certVal}>
                  {new Date(cert.issueDate).toLocaleDateString('en-IN')}
                </Text>
              </View>

              <View style={styles.certRow}>
                <Text style={styles.certLabel}>6. Validity:</Text>
                <Text style={styles.certValSuccess}>LIFETIME (Subject to Annual Update)</Text>
              </View>

              <View style={styles.certRow}>
                <Text style={styles.certLabel}>7. DGFT Regional Authority:</Text>
                <Text style={styles.certVal}>{cert.dgftJurisdiction || 'Regional Authority - New Delhi'}</Text>
              </View>
            </View>

            {/* Verification Footer & QR */}
            <View style={styles.certFooter}>
              <View style={styles.qrBox}>
                <Text style={styles.qrIcon}>📱</Text>
                <Text style={styles.qrText}>DGFT Verified QR Code</Text>
              </View>

              <View style={styles.signBox}>
                <Text style={styles.signStamp}>✓ Digitally Signed</Text>
                <Text style={styles.signTitle}>Director General of Foreign Trade</Text>
                <Text style={styles.signSub}>Government of India</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Download PDF Button */}
        <TouchableOpacity style={styles.btnDownload} onPress={handleDownload}>
          <Text style={styles.btnDownloadText}>📥 DOWNLOAD OFFICIAL e-IEC CERTIFICATE (PDF)</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ---------- Footer ---------- */}
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 14) },
        ]}
      >
        <Pressable
          style={({ pressed }) => [styles.btnHome, pressed && styles.btnPressed]}
          onPress={handleHome}
        >
          <Text style={styles.btnHomeText}>RETURN TO DASHBOARD</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  flex: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  certFrame: {
    backgroundColor: '#FFFDF0',
    borderRadius: 16,
    padding: 10,
    borderWidth: 2.5,
    borderColor: '#B45309',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  certInnerBorder: {
    borderWidth: 1.5,
    borderColor: '#D97706',
    borderRadius: 10,
    padding: 14,
    borderStyle: 'dashed',
  },
  certHeader: { alignItems: 'center', marginBottom: 12 },
  emblemText: { fontSize: 28, marginBottom: 2 },
  govtTitle: { fontSize: 11, fontWeight: '800', color: '#78350F', letterSpacing: 0.8 },
  ministryTitle: { fontSize: 10, fontWeight: '700', color: '#92400E', letterSpacing: 0.5 },
  deptTitle: { fontSize: 11, fontWeight: '800', color: COLORS.primaryDark, marginTop: 2 },
  badgeLine: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  certMainTitle: { fontSize: 11, fontWeight: '900', color: '#92400E', textAlign: 'center' },
  iecNumBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0284C7',
    marginBottom: 12,
  },
  iecNumLabel: { fontSize: 9, fontWeight: '800', color: '#0369A1', letterSpacing: 0.5 },
  iecNumVal: { fontSize: 20, fontWeight: '900', color: '#0284C7', letterSpacing: 1.5, marginTop: 2 },
  certBody: { gap: 6, marginBottom: 12 },
  certRow: { marginBottom: 4 },
  certLabel: { fontSize: 10, fontWeight: '700', color: '#78350F' },
  certVal: { fontSize: 11, color: COLORS.text, fontWeight: '600', marginTop: 1 },
  certValBold: { fontSize: 12, color: COLORS.primaryDark, fontWeight: '800', marginTop: 1 },
  certValHighlight: { fontSize: 12, color: '#0284C7', fontWeight: '800', marginTop: 1 },
  certValSuccess: { fontSize: 11, color: '#059669', fontWeight: '800', marginTop: 1 },
  certFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#FDE68A',
    paddingTop: 10,
    marginTop: 6,
  },
  qrBox: { alignItems: 'center' },
  qrIcon: { fontSize: 24 },
  qrText: { fontSize: 8, fontWeight: '700', color: '#78350F', marginTop: 2 },
  signBox: { alignItems: 'flex-end' },
  signStamp: { fontSize: 10, fontWeight: '800', color: '#059669' },
  signTitle: { fontSize: 9, fontWeight: '700', color: COLORS.text, marginTop: 2 },
  signSub: { fontSize: 8, color: '#64748B' },
  btnDownload: {
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  btnDownloadText: { color: COLORS.white, fontWeight: '800', fontSize: 13, letterSpacing: 0.5 },
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
  btnHome: {
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnPressed: { opacity: 0.85 },
  btnHomeText: { fontSize: 15, fontWeight: '700', color: COLORS.white, letterSpacing: 0.5 },
});
