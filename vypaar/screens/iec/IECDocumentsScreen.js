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
import { pickFile } from '../../utils/pickFile';

export default function IECDocumentsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    formData,
    requiredDocuments,
    setDocument,
    removeDocument,
  } = useIECForm();

  const uploads = formData.documents || {};
  const uploadedCount = Object.keys(uploads).length;

  const handleUpload = async (docId) => {
    try {
      const file = await pickFile();
      if (file) {
        setDocument(docId, file);
      }
    } catch (err) {
      Alert.alert('Upload Error', err.message || 'Could not attach document');
    }
  };

  const handleNext = () => {
    // Check mandatory uploads
    const missingDocs = requiredDocuments.filter((d) => d.required && !uploads[d.id]);
    if (missingDocs.length > 0) {
      Alert.alert(
        'Upload Required Documents',
        `Please attach the following required documents before proceeding:\n\n• ${missingDocs
          .map((d) => d.label)
          .join('\n• ')}`
      );
      return;
    }
    navigation.navigate('IECReview');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScreenHeader title="Required Documents Checklist" />
      <IECStepper currentStep={8} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>📁 Step 8: Dynamic Document Checklist</Text>
          <Text style={styles.bannerSubtitle}>
            Upload clear digital copies in PDF / JPG / PNG format. Document requirements are customized to your entity type and address tenure.
          </Text>
        </View>

        {/* Progress Tracker */}
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Attached Records:</Text>
          <Text style={styles.progressVal}>
            {uploadedCount} of {requiredDocuments.length} Uploaded
          </Text>
        </View>

        {/* Dynamic Documents List */}
        <View style={styles.docList}>
          {requiredDocuments.map((doc) => {
            const file = uploads[doc.id];
            const isUploaded = !!file;

            return (
              <View
                key={doc.id}
                style={[styles.docCard, isUploaded && styles.docCardUploaded]}
              >
                <View style={styles.docInfo}>
                  <View style={styles.docTop}>
                    <Text style={styles.categoryBadge}>{doc.category}</Text>
                    {doc.required ? (
                      <Text style={styles.reqTag}>* Mandatory</Text>
                    ) : (
                      <Text style={styles.optTag}>Optional</Text>
                    )}
                  </View>
                  <Text style={styles.docTitle}>{doc.label}</Text>
                  <Text style={styles.docHint}>{doc.hint}</Text>

                  {isUploaded && (
                    <Text style={styles.fileName}>📄 {file.name}</Text>
                  )}
                </View>

                {isUploaded ? (
                  <View style={styles.actionCol}>
                    <TouchableOpacity
                      style={styles.btnChange}
                      onPress={() => handleUpload(doc.id)}
                    >
                      <Text style={styles.btnChangeText}>Replace</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.btnDelete}
                      onPress={() => removeDocument(doc.id)}
                    >
                      <Text style={styles.btnDeleteText}>✕ Remove</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.btnUpload}
                    onPress={() => handleUpload(doc.id)}
                  >
                    <Text style={styles.btnUploadText}>+ Upload</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
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
          <Text style={styles.btnNextText}>REVIEW APPLICATION →</Text>
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
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 14,
  },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: '#0369A1', marginBottom: 4 },
  bannerSubtitle: { fontSize: 13, color: '#0284C7', lineHeight: 18 },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  progressLabel: { fontSize: 13, fontWeight: '700', color: COLORS.primaryDark },
  progressVal: { fontSize: 12, fontWeight: '700', color: '#0284C7' },
  docList: { gap: 10 },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  docCardUploaded: { borderColor: '#10B981', backgroundColor: '#F0FDF4' },
  docInfo: { flex: 1, marginRight: 10 },
  docTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  categoryBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
  },
  reqTag: { fontSize: 9, fontWeight: '700', color: '#DC2626' },
  optTag: { fontSize: 9, fontWeight: '700', color: '#64748B' },
  docTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  docHint: { fontSize: 11, color: '#64748B', lineHeight: 15 },
  fileName: { fontSize: 11, color: '#059669', fontWeight: '700', marginTop: 4 },
  btnUpload: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnUploadText: { fontSize: 12, fontWeight: '700', color: COLORS.white },
  actionCol: { alignItems: 'flex-end', gap: 4 },
  btnChange: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  btnChangeText: { fontSize: 10, fontWeight: '700', color: '#0369A1' },
  btnDelete: { padding: 4 },
  btnDeleteText: { fontSize: 10, color: '#EF4444', fontWeight: '700' },
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
