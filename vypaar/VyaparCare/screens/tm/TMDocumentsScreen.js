import React, { useState } from 'react';
import {
  Modal,
  Image,
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
import ScreenHeader from '../../components/ScreenHeader';
import TMStepper from '../../components/TMStepper';
import DocumentUploadCard from '../../components/DocumentUploadCard';
import { COLORS } from '../../constants/theme';
import { useTMForm } from '../../contexts/TMFormContext';
import { validateTMDocuments } from '../../utils/tmValidation';
import { pickDocument } from '../../utils/pickFile';

export default function TMDocumentsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { documents = [], uploadDocument, removeDocument, errors, setErrors } = useTMForm();

  const [previewDoc, setPreviewDoc] = useState(null);

  const categories = [];
  const categoryMap = new Map();

  documents.forEach((doc) => {
    const catName = doc.categoryLabel || 'General Documents';
    if (!categoryMap.has(catName)) {
      categoryMap.set(catName, []);
      categories.push(catName);
    }
    categoryMap.get(catName).push(doc);
  });

  const mandatoryDocs = documents.filter((d) => d.required);
  const uploadedMandatory = mandatoryDocs.filter(
    (d) => d.status === 'uploaded' || d.status === 'approved' || !!d.file || !!d.fileUrl
  );
  const uploadPercentage = mandatoryDocs.length
    ? Math.round((uploadedMandatory.length / mandatoryDocs.length) * 100)
    : 100;

  const handleUpload = async (docId) => {
    try {
      const file = await pickDocument();
      if (file) {
        uploadDocument(docId, file);
        if (errors[docId]) {
          setErrors((prev) => ({ ...prev, [docId]: null }));
        }
      }
    } catch (err) {
      console.warn('Document pick error:', err);
    }
  };

  const handlePreview = (doc) => {
    setPreviewDoc(doc);
  };

  const handleContinue = () => {
    const errs = validateTMDocuments(documents);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    navigation.navigate('TMAgent');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScreenHeader
        title="Trademark Registration"
        onBack={() => navigation.goBack()}
      />

      <TMStepper
        currentStep={6}
        onStepPress={(step, route) => navigation.navigate(route)}
      />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerBlock}>
          <Text style={styles.screenHeading}>Supporting Documents Checklist</Text>
          <Text style={styles.screenSubheading}>
            Upload required identity, entity constitution, trademark artwork and supporting statutory proofs. Documents are verified by legal experts before official filing.
          </Text>
        </View>

        {/* Progress Tracker Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressCardHeader}>
            <Text style={styles.progressCardTitle}>Document Upload Progress</Text>
            <Text style={styles.progressCardPercent}>
              {uploadedMandatory.length} of {mandatoryDocs.length} Mandatory Uploaded
            </Text>
          </View>

          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${uploadPercentage}%` },
                uploadPercentage === 100 && styles.progressBarFillComplete,
              ]}
            />
          </View>
        </View>

        {/* Categorized Document Matrix */}
        {categories.map((catName) => {
          const docsInCat = categoryMap.get(catName) || [];
          return (
            <View key={catName} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{catName}</Text>

              {docsInCat.map((doc) => (
                <DocumentUploadCard
                  key={doc.id}
                  document={doc}
                  onUpload={() => handleUpload(doc.id)}
                  onReplace={() => handleUpload(doc.id)}
                  onDelete={() => removeDocument(doc.id)}
                  onPreview={() => handlePreview(doc)}
                  error={errors[doc.id]}
                />
              ))}
            </View>
          );
        })}

        {/* File Preview Modal */}
        <Modal
          visible={!!previewDoc}
          transparent
          animationType="fade"
          onRequestClose={() => setPreviewDoc(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {previewDoc?.label}
                </Text>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setPreviewDoc(null)}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                {previewDoc?.file?.uri &&
                (previewDoc?.file?.type?.includes('image') ||
                  previewDoc?.file?.name?.match(/\.(png|jpe?g|webp)$/i)) ? (
                  <Image
                    source={{ uri: previewDoc.file.uri }}
                    style={styles.previewImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.docFileView}>
                    <Text style={styles.docFileIcon}>📄</Text>
                    <Text style={styles.docFileName}>
                      {previewDoc?.file?.name || 'Document Uploaded'}
                    </Text>
                    <Text style={styles.docFileSize}>
                      {previewDoc?.file?.size
                        ? `${Math.round(previewDoc.file.size / 1024)} KB`
                        : 'Ready for Review'}
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.modalDoneBtn}
                onPress={() => setPreviewDoc(null)}
              >
                <Text style={styles.modalDoneBtnText}>CLOSE PREVIEW</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>

      {/* Footer Navigation Buttons */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.footerBtnRow}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backBtnText}>← BACK</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.continueBtn, pressed && styles.pressed]}
            onPress={handleContinue}
          >
            <Text style={styles.continueBtnText}>AGENT / AUTH →</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  pressed: {
    opacity: 0.85,
  },
  headerBlock: {
    marginBottom: 16,
  },
  screenHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  screenSubheading: {
    fontSize: 13,
    color: COLORS.grayText,
    marginTop: 4,
    lineHeight: 19,
  },
  progressCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E8EC',
    marginBottom: 16,
  },
  progressCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressCardTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  progressCardPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gold,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 3,
  },
  progressBarFillComplete: {
    backgroundColor: COLORS.whatsapp,
  },
  categorySection: {
    marginBottom: 18,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    width: '100%',
    maxWidth: 420,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    flex: 1,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#888888',
    fontWeight: 'bold',
  },
  modalBody: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
    marginBottom: 14,
  },
  previewImage: {
    width: '100%',
    height: 240,
  },
  docFileView: {
    alignItems: 'center',
  },
  docFileIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  docFileName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    textAlign: 'center',
  },
  docFileSize: {
    fontSize: 12,
    color: COLORS.grayText,
    marginTop: 4,
  },
  modalDoneBtn: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 8,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDoneBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
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
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  footerBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  backBtn: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#F0F4F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: COLORS.primaryDark,
    fontSize: 14,
    fontWeight: 'bold',
  },
  continueBtn: {
    flex: 2,
    height: 50,
    borderRadius: 10,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: 'bold',
  },
});
