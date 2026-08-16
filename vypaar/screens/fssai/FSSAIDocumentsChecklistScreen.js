import React from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import FSSAIStepper from '../../components/FSSAIStepper';
import { COLORS } from '../../constants/theme';
import { useFSSAIForm } from '../../contexts/FSSAIFormContext';

export default function FSSAIDocumentsChecklistScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formState, documents, eligibility } = useFSSAIForm();

  // Group documents by category
  const categories = {};
  documents.forEach((d) => {
    const catKey = d.categoryLabel || 'General Documents';
    if (!categories[catKey]) {
      categories[catKey] = [];
    }
    categories[catKey].push(d);
  });

  const mandatoryCount = documents.filter((d) => d.required).length;
  const optionalCount = documents.filter((d) => !d.required).length;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScreenHeader
        title="FSSAI Food License"
        subtitle="Step 7 — Required Documents Checklist"
        onBack={() => navigation.goBack()}
      />

      <FSSAIStepper
        currentStep={7}
        onStepPress={(step, route) => navigation.navigate(route)}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Document Checklist Matrix</Text>
          <Text style={styles.sectionSubtitle}>
            Based on your Kind of Business ({formState.kob.toUpperCase()}), legal structure ({formState.constitution.toUpperCase()}), and premises type, here is your customized FoSCoS checklist.
          </Text>
        </View>

        {/* Overview Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{mandatoryCount}</Text>
            <Text style={styles.statLabel}>Mandatory Documents</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{optionalCount}</Text>
            <Text style={styles.statLabel}>Optional / Conditional</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: eligibility.badgeColor }]}>
              {eligibility.label.includes('Central') ? 'Central' : eligibility.label.includes('State') ? 'State' : 'Basic'}
            </Text>
            <Text style={styles.statLabel}>License Tier</Text>
          </View>
        </View>

        {/* Categorized Checklists */}
        {Object.entries(categories).map(([catTitle, docList]) => (
          <View key={catTitle} style={styles.categoryCard}>
            <Text style={styles.categoryTitle}>{catTitle}</Text>
            {docList.map((doc) => (
              <View key={doc.id} style={styles.docRow}>
                <View style={styles.docInfo}>
                  <Text style={styles.docLabel}>{doc.label}</Text>
                  <Text style={styles.docHint}>{doc.hint}</Text>
                </View>
                <View style={[styles.badge, doc.required ? styles.badgeRequired : styles.badgeOptional]}>
                  <Text style={[styles.badgeText, doc.required ? styles.badgeTextRequired : styles.badgeTextOptional]}>
                    {doc.required ? 'MANDATORY' : 'OPTIONAL'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ))}

        {/* Upload Guidelines */}
        <View style={styles.guidelinesCard}>
          <Text style={styles.guidelineTitle}>📋 FoSCoS Upload Guidelines</Text>
          <Text style={styles.guidelineItem}>• Accepted File Formats: PDF, JPG, JPEG, PNG</Text>
          <Text style={styles.guidelineItem}>• Maximum file size: 5 MB per document</Text>
          <Text style={styles.guidelineItem}>• Ensure all scans are clearly legible with no blurry text or missing corners</Text>
          <Text style={styles.guidelineItem}>• You will upload all these files in the next step</Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => navigation.navigate('FSSAIDocumentsUpload')}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>PROCEED TO UPLOAD →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 12,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  docInfo: {
    flex: 1,
    marginRight: 10,
  },
  docLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 3,
  },
  docHint: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeRequired: {
    backgroundColor: '#FEF2F2',
  },
  badgeOptional: {
    backgroundColor: '#F1F5F9',
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: 'bold',
  },
  badgeTextRequired: {
    color: COLORS.danger,
  },
  badgeTextOptional: {
    color: '#64748B',
  },
  guidelinesCard: {
    backgroundColor: '#FFFDF6',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginTop: 6,
  },
  guidelineTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 6,
  },
  guidelineItem: {
    fontSize: 11.5,
    color: '#78350F',
    lineHeight: 18,
  },
  footer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  continueBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: 10,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.gold,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: { elevation: 3 },
      default: {},
    }),
  },
  continueBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
