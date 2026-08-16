import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import FSSAIStepper from '../../components/FSSAIStepper';
import DocumentUploadCard from '../../components/DocumentUploadCard';
import { COLORS } from '../../constants/theme';
import { useFSSAIForm } from '../../contexts/FSSAIFormContext';
import { pickDocument, pickImage } from '../../utils/pickFile';
import { validateFSSAIDocuments } from '../../utils/fssaiValidation';

export default function FSSAIDocumentsUploadScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { documents, uploadDocument, removeDocument, addCustomDocument, errors, setErrors } =
    useFSSAIForm();

  const [showAddModal, setShowAddModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customFile, setCustomFile] = useState(null);

  const mandatoryDocs = documents.filter((d) => d.required);
  const uploadedMandatory = mandatoryDocs.filter((d) => d.status === 'uploaded' || d.file).length;
  const uploadPercentage =
    mandatoryDocs.length > 0 ? Math.round((uploadedMandatory / mandatoryDocs.length) * 100) : 100;

  const handlePick = async (doc) => {
    try {
      const isPhoto = doc.id === 'applicant_photo';
      const file = isPhoto ? await pickImage() : await pickDocument();
      if (file) {
        uploadDocument(doc.id, file);
        if (errors[doc.id]) {
          setErrors((prev) => ({ ...prev, [doc.id]: null }));
        }
      }
    } catch (err) {
      console.warn('File pick error:', err);
    }
  };

  const handleCustomPick = async () => {
    try {
      const file = await pickDocument();
      if (file) {
        setCustomFile(file);
      }
    } catch (err) {
      console.warn('Custom file pick error:', err);
    }
  };

  const handleSaveCustomDoc = () => {
    if (!customName.trim()) {
      Alert.alert('Required', 'Please enter document name');
      return;
    }
    if (!customFile) {
      Alert.alert('Required', 'Please select a file to upload');
      return;
    }
    addCustomDocument(customName, customDesc, customFile);
    setCustomName('');
    setCustomDesc('');
    setCustomFile(null);
    setShowAddModal(false);
  };

  const handleContinue = () => {
    const errs = validateFSSAIDocuments(documents);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      Alert.alert(
        'Missing Mandatory Documents',
        'Please upload all mandatory documents highlighted in red before proceeding.'
      );
      return;
    }
    setErrors({});
    navigation.navigate('FSSAIReview');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScreenHeader
        title="FSSAI Food License"
        subtitle="Step 8 — Upload Supporting Documents"
        onBack={() => navigation.goBack()}
      />

      <FSSAIStepper
        currentStep={8}
        onStepPress={(step, route) => navigation.navigate(route)}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upload FoSCoS Documents</Text>
          <Text style={styles.sectionSubtitle}>
            Attach clear, legible copies of all required documents (PDF, JPG, PNG up to 5MB).
          </Text>
        </View>

        {/* Progress Tracker Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeaderRow}>
            <Text style={styles.progressTitle}>MANDATORY UPLOAD PROGRESS</Text>
            <Text style={styles.progressValue}>
              {uploadedMandatory} of {mandatoryDocs.length} Uploaded ({uploadPercentage}%)
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${uploadPercentage}%` }]} />
          </View>
        </View>

        {/* Dynamic Document Cards */}
        <View style={styles.docCardsList}>
          {documents.map((doc) => {
            const hasError = !!errors[doc.id];
            return (
              <DocumentUploadCard
                key={doc.id}
                document={doc}
                file={doc.file}
                onUpload={() => handlePick(doc)}
                onReplace={() => handlePick(doc)}
                onDelete={() => removeDocument(doc.id)}
                error={hasError ? errors[doc.id] : null}
                showLimits={true}
              />
            );
          })}
        </View>

        {/* Add Additional Supporting Document Button */}
        <TouchableOpacity
          style={styles.addCustomDocBtn}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.addCustomDocText}>+ Add Other Supporting Document</Text>
          <Text style={styles.addCustomDocHint}>
            Upload any extra certification, NOC, or lab test not listed above
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Custom Document Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Supporting Document</Text>

            <Text style={styles.inputLabel}>Document Name *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Fire Safety NOC / Pest Control Certificate"
              value={customName}
              onChangeText={setCustomName}
            />

            <Text style={styles.inputLabel}>Description (Optional)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Annual pest control treatment certificate"
              value={customDesc}
              onChangeText={setCustomDesc}
            />

            <TouchableOpacity style={styles.pickFileBtn} onPress={handleCustomPick}>
              <Text style={styles.pickFileBtnText}>
                {customFile ? `Selected: ${customFile.name}` : '📁 Choose File (PDF/Image)'}
              </Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveModalBtn}
                onPress={handleSaveCustomDoc}
              >
                <Text style={styles.saveModalBtnText}>Save & Upload</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Sticky Bottom Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>SAVE & CONTINUE →</Text>
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
  },
  progressCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    letterSpacing: 0.5,
  },
  progressValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 3,
  },
  docCardsList: {
    gap: 12,
    marginBottom: 16,
  },
  addCustomDocBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  addCustomDocText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  addCustomDocHint: {
    fontSize: 11.5,
    color: '#94A3B8',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.primaryDark,
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13.5,
    color: COLORS.primaryDark,
    marginBottom: 14,
  },
  pickFileBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  pickFileBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E40AF',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  saveModalBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveModalBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
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
