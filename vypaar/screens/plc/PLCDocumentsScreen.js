import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import DocumentUploadCard from '../../components/DocumentUploadCard';
import PLCStepper from '../../components/PLCStepper';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS } from '../../constants/theme';
import { usePLCForm } from '../../contexts/PLCFormContext';
import { pickFile, validatePickedFile } from '../../utils/pickFile';
import { hasErrors, validateDocumentUploads } from '../../utils/plcValidation';

export default function PLCDocumentsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    documents,
    documentSummary,
    uploadDocument,
    deleteDocument,
    errors,
    setErrors,
    goNext,
    goPrev,
  } = usePLCForm();

  const [uploadingId, setUploadingId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handlePickAndUpload = async (doc) => {
    try {
      const picked = await pickFile({ fallbackName: doc.id });
      if (!picked) return;

      const validationErr = validatePickedFile(picked);
      if (validationErr) {
        Alert.alert('Invalid File', validationErr);
        return;
      }

      setUploadingId(doc.id);
      setUploadProgress(20);

      // Simulate network upload progress
      setTimeout(() => setUploadProgress(60), 200);
      setTimeout(() => {
        setUploadProgress(100);
        setTimeout(() => {
          uploadDocument(doc.id, picked);
          setUploadingId(null);
          setUploadProgress(0);
        }, 150);
      }, 450);
    } catch (err) {
      setUploadingId(null);
      setUploadProgress(0);
      Alert.alert('Upload Failed', 'Could not select file. Please try again.');
    }
  };

  const handleNext = () => {
    const docErrors = validateDocumentUploads(documents);
    if (hasErrors(docErrors)) {
      setErrors(docErrors);
      Alert.alert(
        'Missing Documents',
        `${docErrors.missingList?.length || 'Some'} mandatory documents are missing. Please upload all required documents to ensure swift MCA approval.`
      );
      return;
    }

    setErrors({});
    goNext();
    navigation.navigate('PLCReview');
  };

  const handleBack = () => {
    goPrev();
    navigation.goBack();
  };

  // Group documents by category for structured layout
  const categories = [
    { key: 'director', title: 'Directors KYC & DIN Documents' },
    { key: 'subscriber', title: 'Subscribers / MoA Documents' },
    { key: 'office', title: 'Registered Office Premises Documents' },
    { key: 'company', title: 'Company & Trademark Documents' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>

      <ScreenHeader title="Company Registration" onBack={handleBack} />

      {/* ---------- 7-Step Stepper ---------- */}
      <PLCStepper activeStep={5} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBlock}>
          <Text style={styles.sectionTitle}>Step 6: Document Upload Matrix</Text>
          <Text style={styles.sectionSubtitle}>
            Upload required KYC documents, premises proofs, and signatures. PDF, JPG, and PNG are accepted up to 5 MB.
          </Text>
        </View>

        {/* ---------- Progress Header Card ---------- */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryTitle}>Document Checklist Status</Text>
              <Text style={styles.summarySub}>
                {documentSummary.uploaded} of {documentSummary.total} mandatory documents satisfied
              </Text>
            </View>
            <View style={styles.percentBadge}>
              <Text style={styles.percentText}>{documentSummary.percent}%</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${documentSummary.percent}%` },
                documentSummary.allUploaded && styles.progressFillComplete,
              ]}
            />
          </View>

          {documentSummary.allUploaded ? (
            <View style={styles.completeNotice}>
              <Text style={styles.completeIcon}>🎉</Text>
              <Text style={styles.completeText}>All mandatory documents uploaded and verified!</Text>
            </View>
          ) : (
            <Text style={styles.pendingNotice}>
              ⏳ {documentSummary.missing} document(s) remaining for filing
            </Text>
          )}
        </View>

        {/* ---------- Categorized Documents Matrix ---------- */}
        {categories.map((cat) => {
          const groupDocs = documents.filter((d) => d.category === cat.key);
          if (groupDocs.length === 0) return null;

          return (
            <View key={cat.key} style={styles.categorySection}>
              <View style={styles.catHeader}>
                <Text style={styles.catTitle}>{cat.title}</Text>
                <Text style={styles.catCount}>({groupDocs.length})</Text>
              </View>

              {groupDocs.map((doc) => (
                <DocumentUploadCard
                  key={doc.id}
                  document={doc}
                  file={doc.file}
                  isReused={doc.isReused}
                  reusedFromLabel={doc.reusedFromLabel}
                  uploading={uploadingId === doc.id}
                  progress={uploadProgress}
                  onUpload={() => handlePickAndUpload(doc)}
                  onReplace={() => handlePickAndUpload(doc)}
                  onDelete={() => deleteDocument(doc.id)}
                  error={errors[doc.id]}
                  showLimits
                />
              ))}
            </View>
          );
        })}
      </ScrollView>

      {/* ---------- Sticky Bottom CTA ---------- */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}
          onPress={handleNext}
        >
          <Text style={styles.continueText}>REVIEW & SUBMIT ›</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  pressed: {
    opacity: 0.85,
  },
  headerBlock: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.grayText,
    marginTop: 3,
    lineHeight: 18,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
      default: {},
    }),
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  summarySub: {
    fontSize: 12,
    color: COLORS.grayText,
    marginTop: 2,
  },
  percentBadge: {
    backgroundColor: COLORS.lightBlue,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  percentText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EEEEEE',
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
  },
  progressFillComplete: {
    backgroundColor: COLORS.whatsapp,
  },
  completeNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#E8F8F0',
    padding: 8,
    borderRadius: 6,
  },
  completeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  completeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E7E34',
  },
  pendingNotice: {
    fontSize: 12,
    color: COLORS.grayText,
    marginTop: 10,
  },
  categorySection: {
    marginBottom: 12,
  },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  catTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  catCount: {
    fontSize: 13,
    color: COLORS.grayText,
    marginLeft: 6,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  continueButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
