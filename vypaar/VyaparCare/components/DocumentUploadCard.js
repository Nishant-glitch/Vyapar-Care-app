import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { DOCUMENT_STATUSES } from '../config/plcDocumentConfig';
import { COLORS } from '../constants/theme';
import {
  ALLOWED_LABEL,
  MAX_FILE_SIZE_LABEL,
  formatFileSize,
  isImageFile,
} from '../utils/pickFile';

/**
 * Universal Document Upload Card
 * Supports: Upload, Progress bar, Preview modal, Replace, Delete, Re-upload, Reused/Linked indicator.
 */
export default function DocumentUploadCard({
  document,
  file,
  onUpload,
  onReplace,
  onDelete,
  uploading = false,
  progress = 0,
  error,
  showLimits = false,
  isReused = false,
  reusedFromLabel = '',
}) {
  const [preview, setPreview] = useState(false);
  const barWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(barWidth, {
      toValue: uploading ? progress : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [uploading, progress, barWidth]);

  const hasFile = !!file || isReused;
  const isMissing = document.required && !hasFile && !uploading;

  let statusKey = 'optional';
  if (uploading) statusKey = 'under_review';
  else if (isReused) statusKey = 'reused';
  else if (file) statusKey = 'uploaded';
  else if (document.required) statusKey = 'required';

  const status = DOCUMENT_STATUSES[statusKey] || DOCUMENT_STATUSES.required;
  const statusColor = statusKey === 'required' ? COLORS.danger : status.color;
  const image = file && isImageFile(file);

  return (
    <View
      style={[
        styles.card,
        isMissing && styles.cardMissing,
        !!error && styles.cardError,
        isReused && styles.cardReused,
      ]}
    >
      {/* ---------- title + status ---------- */}
      <View style={styles.titleRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.name} numberOfLines={2}>
            {document.label}
            {document.required ? <Text style={styles.asterisk}> *</Text> : null}
          </Text>
          {document.hint ? <Text style={styles.hintText}>{document.hint}</Text> : null}
        </View>

        <View style={[styles.badge, { backgroundColor: `${statusColor}1A` }]}>
          <Text style={[styles.badgeText, { color: statusColor }]}>
            {uploading ? 'Uploading' : isReused ? '🔗 Reused' : status.label}
          </Text>
        </View>
      </View>

      {!document.required ? <Text style={styles.optionalNote}>Optional</Text> : null}

      {/* ---------- progress ---------- */}
      {uploading ? (
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: barWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          />
        </View>
      ) : null}

      {/* ---------- Reused Document Banner ---------- */}
      {isReused ? (
        <View style={styles.reusedBlock}>
          <Text style={styles.reusedIcon}>🔗</Text>
          <View style={styles.reusedTextWrap}>
            <Text style={styles.reusedTitle}>Reused from Director Profile</Text>
            <Text style={styles.reusedSub}>{reusedFromLabel || 'Document shared from director details'}</Text>
          </View>
          <Text style={styles.fileCheck}>✓</Text>
        </View>
      ) : null}

      {/* ---------- File Uploaded Block ---------- */}
      {!uploading && file && !isReused ? (
        <View style={styles.fileBlock}>
          <View style={styles.fileRow}>
            {image ? (
              <Image source={{ uri: file.uri }} style={styles.thumb} resizeMode="cover" />
            ) : (
              <View style={styles.pdfIcon}>
                <Text style={styles.pdfIconText}>📄</Text>
              </View>
            )}

            <View style={styles.fileText}>
              <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
                {file.name}
              </Text>
              <Text style={styles.fileSize}>
                {formatFileSize(file.size) || 'Ready to submit'}
              </Text>
            </View>

            <Text style={styles.fileCheck}>✓</Text>
          </View>

          <View style={styles.actionRow}>
            <ActionButton label="Preview" onPress={() => setPreview(true)} />
            <ActionButton label="Replace" onPress={onReplace} />
            <ActionButton label="Delete" onPress={onDelete} danger />
          </View>
        </View>
      ) : null}

      {/* ---------- Upload CTA Button ---------- */}
      {!uploading && !file && !isReused ? (
        <Pressable
          style={({ pressed }) => [styles.uploadButton, pressed && styles.pressed]}
          onPress={onUpload}
        >
          <Text style={styles.uploadButtonIcon}>📤</Text>
          <Text style={styles.uploadButtonText}>Upload Document</Text>
        </Pressable>
      ) : null}

      {/* ---------- error / warning / limits ---------- */}
      {error ? (
        <Text style={styles.errorText}>⚠️ {error}</Text>
      ) : isMissing ? (
        <Text style={styles.missingText}>⚠️ Mandatory document required</Text>
      ) : null}

      {showLimits && !hasFile ? (
        <Text style={styles.limits}>
          {ALLOWED_LABEL} · max {MAX_FILE_SIZE_LABEL}
        </Text>
      ) : null}

      {/* ---------- preview modal ---------- */}
      <Modal
        visible={preview}
        transparent
        animationType="fade"
        onRequestClose={() => setPreview(false)}
      >
        <Pressable style={styles.previewBackdrop} onPress={() => setPreview(false)}>
          <Pressable style={styles.previewCard} onPress={() => {}}>
            <Text style={styles.previewTitle} numberOfLines={2}>
              {document.label}
            </Text>

            {image ? (
              <Image
                source={{ uri: file?.uri }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.previewPdf}>
                <Text style={styles.previewPdfIcon}>📄</Text>
                <Text style={styles.previewPdfName} numberOfLines={2}>
                  {file?.name}
                </Text>
                <Text style={styles.previewPdfNote}>PDF document attached successfully</Text>
              </View>
            )}

            <Text style={styles.previewMeta}>
              {formatFileSize(file?.size) || 'File attached'}
            </Text>

            <Pressable style={styles.previewClose} onPress={() => setPreview(false)}>
              <Text style={styles.previewCloseText}>Close Preview</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function ActionButton({ label, onPress, danger }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.action,
        danger && styles.actionDanger,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      hitSlop={6}
    >
      <Text style={[styles.actionText, danger && styles.actionTextDanger]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    padding: 14,
    marginBottom: 12,
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
  cardMissing: {
    borderColor: '#FADBD8',
    backgroundColor: '#FDEDEC',
  },
  cardError: {
    borderColor: COLORS.danger,
    backgroundColor: '#FDECEA',
  },
  cardReused: {
    borderColor: '#D4EFDF',
    backgroundColor: '#F9FCF9',
  },
  pressed: {
    opacity: 0.85,
  },

  /* title */
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleWrap: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    lineHeight: 20,
  },
  hintText: {
    fontSize: 11,
    color: COLORS.grayText,
    marginTop: 3,
  },
  asterisk: {
    color: COLORS.danger,
  },
  badge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  optionalNote: {
    fontSize: 11,
    color: COLORS.grayText,
    marginTop: 3,
  },

  /* progress */
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EEEEEE',
    overflow: 'hidden',
    marginTop: 12,
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gold,
  },

  /* reused */
  reusedBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8F0',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#C3EAD4',
  },
  reusedIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  reusedTextWrap: {
    flex: 1,
  },
  reusedTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1E7E34',
  },
  reusedSub: {
    fontSize: 11,
    color: '#27AE60',
    marginTop: 1,
  },

  /* file */
  fileBlock: {
    marginTop: 12,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 8,
  },
  thumb: {
    width: 42,
    height: 42,
    borderRadius: 6,
    backgroundColor: COLORS.border,
  },
  pdfIcon: {
    width: 42,
    height: 42,
    borderRadius: 6,
    backgroundColor: COLORS.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfIconText: {
    fontSize: 20,
  },
  fileText: {
    flex: 1,
    marginLeft: 10,
  },
  fileName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  fileSize: {
    fontSize: 11,
    color: COLORS.grayText,
    marginTop: 2,
  },
  fileCheck: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.whatsapp,
    marginLeft: 8,
  },

  /* actions */
  actionRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  action: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
    backgroundColor: COLORS.white,
  },
  actionDanger: {
    borderColor: '#FADBD8',
    backgroundColor: '#FDEDEC',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  actionTextDanger: {
    color: COLORS.danger,
  },

  /* upload */
  uploadButton: {
    flexDirection: 'row',
    height: 42,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    backgroundColor: '#FFFDF9',
  },
  uploadButtonIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.gold,
  },

  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 8,
  },
  missingText: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 8,
  },
  limits: {
    fontSize: 11,
    color: COLORS.grayText,
    marginTop: 6,
  },

  /* preview modal */
  previewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  previewCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 12,
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  previewPdf: {
    height: 180,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  previewPdfIcon: {
    fontSize: 44,
  },
  previewPdfName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
    marginTop: 10,
  },
  previewPdfNote: {
    fontSize: 11,
    color: COLORS.grayText,
    marginTop: 6,
  },
  previewMeta: {
    fontSize: 12,
    color: COLORS.grayText,
    marginTop: 10,
  },
  previewClose: {
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  previewCloseText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});
