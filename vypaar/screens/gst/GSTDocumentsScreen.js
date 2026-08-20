import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import GSTStepper from '../../components/GSTStepper';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS } from '../../constants/theme';
import { useGSTForm } from '../../contexts/GSTFormContext';
import { validateGSTDocuments } from '../../utils/gstValidation';
import { pickFile } from '../../utils/pickFile';

export default function GSTDocumentsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    formData,
    requiredDocuments,
    setDocument,
    removeDocument,
    addCustomDocument,
    removeCustomDocument,
  } = useGSTForm();

  const [errors, setErrors] = useState({});
  const [previewDoc, setPreviewDoc] = useState(null);
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customTitle, setCustomTitle] = useState('');

  const uploads = formData.documents || {};
  const customDocs = formData.customDocuments || [];

  const totalRequired = requiredDocuments.filter((d) => d.required).length;
  const uploadedRequired = requiredDocuments.filter(
    (d) => d.required && uploads[d.id]
  ).length;

  const handleUpload = async (docId) => {
    try {
      const file = await pickFile();
      if (file) {
        setDocument(docId, file);
        if (errors[docId]) {
          setErrors((prev) => ({ ...prev, [docId]: null }));
        }
      }
    } catch (err) {
      Alert.alert('Upload Error', err.message || 'Could not pick file');
    }
  };

  const handleAddCustom = async () => {
    if (!customTitle.trim()) {
      Alert.alert('Missing Title', 'Please enter a name for this document');
      return;
    }
    try {
      const file = await pickFile();
      if (file) {
        addCustomDocument(customTitle.trim(), file);
        setCustomTitle('');
        setCustomModalVisible(false);
      }
    } catch (err) {
      Alert.alert('Upload Error', err.message || 'Could not pick file');
    }
  };

  const handleNext = () => {
    const errs = validateGSTDocuments(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      Alert.alert(
        'Missing Mandatory Documents',
        'Please upload all required documents marked with * before continuing.'
      );
      return;
    }
    navigation.navigate('GSTReview');
  };

  // Group required documents by category
  const categories = {};
  requiredDocuments.forEach((doc) => {
    const cat = doc.categoryLabel || 'Documents';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(doc);
  });

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScreenHeader title="Document Uploads" />
      <GSTStepper currentStep={7} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <View style={styles.bannerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>📑 Step 7: Required Documents</Text>
              <Text style={styles.bannerSubtitle}>
                Customized checklist based on your business constitution and premises.
              </Text>
            </View>
            <View style={styles.progressBadge}>
              <Text style={styles.progressBadgeText}>
                {uploadedRequired}/{totalRequired} Uploaded
              </Text>
            </View>
          </View>
        </View>

        {Object.entries(categories).map(([catLabel, docs]) => (
          <View key={catLabel} style={styles.catSection}>
            <Text style={styles.catTitle}>{catLabel}</Text>
            {docs.map((doc) => {
              const file = uploads[doc.id];
              const isUploaded = !!file;
              const hasError = !!errors[doc.id];

              return (
                <View
                  key={doc.id}
                  style={[
                    styles.docCard,
                    isUploaded && styles.docCardUploaded,
                    hasError && styles.docCardError,
                  ]}
                >
                  <View style={styles.docInfo}>
                    <View style={styles.docTitleRow}>
                      <Text style={styles.docLabel}>
                        {doc.label} {doc.required && <Text style={{ color: '#DC2626' }}>*</Text>}
                      </Text>
                      {isUploaded ? (
                        <View style={styles.uploadedTag}>
                          <Text style={styles.uploadedTagText}>✓ Ready</Text>
                        </View>
                      ) : (
                        <View style={styles.pendingTag}>
                          <Text style={styles.pendingTagText}>Required</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.docHint}>{doc.hint}</Text>

                    {isUploaded && (
                      <View style={styles.fileMeta}>
                        <Text style={styles.fileName} numberOfLines={1}>
                          📄 {file.name || 'Uploaded Document'}
                        </Text>
                        <Text style={styles.fileSize}>
                          {file.size ? `${Math.round(file.size / 1024)} KB` : ''}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.actionRow}>
                    {isUploaded ? (
                      <>
                        <TouchableOpacity
                          style={styles.btnAction}
                          onPress={() => setPreviewDoc(file)}
                        >
                          <Text style={styles.btnActionText}>👁️ Preview</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.btnAction}
                          onPress={() => handleUpload(doc.id)}
                        >
                          <Text style={styles.btnActionText}>🔄 Replace</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.btnAction, styles.btnDeleteAction]}
                          onPress={() => removeDocument(doc.id)}
                        >
                          <Text style={styles.btnDeleteActionText}>✕ Delete</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity
                        style={styles.btnUpload}
                        onPress={() => handleUpload(doc.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.btnUploadText}>📤 Upload Document</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ))}

        {/* Custom Documents Section */}
        {customDocs.length > 0 && (
          <View style={styles.catSection}>
            <Text style={styles.catTitle}>📎 Additional Supporting Documents</Text>
            {customDocs.map((c) => (
              <View key={c.id} style={[styles.docCard, styles.docCardUploaded]}>
                <View style={styles.docInfo}>
                  <Text style={styles.docLabel}>{c.title}</Text>
                  <Text style={styles.fileName}>📄 {c.file.name}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.btnAction, styles.btnDeleteAction]}
                  onPress={() => removeCustomDocument(c.id)}
                >
                  <Text style={styles.btnDeleteActionText}>✕ Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.btnAddCustom}
          onPress={() => setCustomModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.btnAddCustomText}>+ Add Other Supporting Document</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ---------- Custom Document Modal ---------- */}
      <Modal
        visible={customModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCustomModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Supporting Document</Text>
            <Text style={styles.modalSub}>
              Enter a name for this document (e.g. Property Tax Receipt, Consent Letter, Trademark TM-A)
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Property Tax Receipt"
              value={customTitle}
              onChangeText={setCustomTitle}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => setCustomModalVisible(false)}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnConfirm}
                onPress={handleAddCustom}
              >
                <Text style={styles.modalBtnConfirmText}>Pick & Attach File</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ---------- Preview Modal ---------- */}
      <Modal
        visible={!!previewDoc}
        transparent
        animationType="slide"
        onRequestClose={() => setPreviewDoc(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.previewBox}>
            <Text style={styles.previewHeader}>📄 Document Preview</Text>
            <Text style={styles.previewName}>{previewDoc?.name}</Text>
            <Text style={styles.previewMeta}>
              Type: {previewDoc?.type || 'application/pdf'} | Size:{' '}
              {previewDoc?.size ? `${Math.round(previewDoc.size / 1024)} KB` : 'N/A'}
            </Text>
            <TouchableOpacity
              style={styles.previewClose}
              onPress={() => setPreviewDoc(null)}
            >
              <Text style={styles.previewCloseText}>Close Preview</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
          <Text style={styles.btnNextText}>CONTINUE TO REVIEW →</Text>
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
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 20,
  },
  bannerRow: { flexDirection: 'row', alignItems: 'center' },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: '#065F46', marginBottom: 2 },
  bannerSubtitle: { fontSize: 12, color: '#047857', lineHeight: 16 },
  progressBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 10,
  },
  progressBadgeText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
  catSection: { marginBottom: 20 },
  catTitle: { fontSize: 14, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 10 },
  docCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  docCardUploaded: { borderColor: '#10B981', backgroundColor: '#F0FDF4' },
  docCardError: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  docInfo: { marginBottom: 10 },
  docTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  docLabel: { fontSize: 13, fontWeight: '700', color: COLORS.text, flex: 1, marginRight: 8 },
  uploadedTag: { backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  uploadedTagText: { fontSize: 11, color: '#065F46', fontWeight: '700' },
  pendingTag: { backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  pendingTagText: { fontSize: 11, color: '#B91C1C', fontWeight: '700' },
  docHint: { fontSize: 11, color: '#64748B', marginTop: 3, lineHeight: 15 },
  fileMeta: { marginTop: 6, flexDirection: 'row', justifyContent: 'space-between' },
  fileName: { fontSize: 11, color: '#0F172A', fontWeight: '600', flex: 1 },
  fileSize: { fontSize: 11, color: '#64748B' },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  btnAction: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnActionText: { fontSize: 11, fontWeight: '700', color: '#334155' },
  btnDeleteAction: { backgroundColor: '#FEE2E2' },
  btnDeleteActionText: { fontSize: 11, fontWeight: '700', color: '#DC2626' },
  btnUpload: {
    width: '100%',
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnUploadText: { fontSize: 12, fontWeight: '700', color: COLORS.white },
  btnAddCustom: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  btnAddCustomText: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 20,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 4 },
  modalSub: { fontSize: 12, color: '#64748B', marginBottom: 14, lineHeight: 16 },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 16,
  },
  modalButtons: { flexDirection: 'row', gap: 10 },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  modalBtnCancelText: { fontSize: 13, fontWeight: '700', color: '#475569' },
  modalBtnConfirm: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#059669',
  },
  modalBtnConfirmText: { fontSize: 13, fontWeight: '700', color: COLORS.white },
  previewBox: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
  },
  previewHeader: { fontSize: 16, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 6 },
  previewName: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  previewMeta: { fontSize: 12, color: '#64748B', marginBottom: 16 },
  previewClose: {
    backgroundColor: '#059669',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  previewCloseText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },
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
