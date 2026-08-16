import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { COLORS } from '../../constants/theme';
import {
  getUdyamApplications,
  updateUdyamApplicationStatus,
} from '../../lib/database';
import { formatINR } from '../../utils/currency';

export default function UdyamAdminScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [udyamRegNumber, setUdyamRegNumber] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const data = await getUdyamApplications();
      setApplications(data || []);
    } catch (err) {
      console.warn('Error fetching udyam apps:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const openAppModal = (app) => {
    setSelectedApp(app);
    setNewStatus(app.applicationStatus || 'submitted');
    setAdminNotes(app.adminRemarks || '');
    setUdyamRegNumber(app.udyamRegistrationNumber || '');
  };

  const handleUpdate = async () => {
    if (!selectedApp) return;
    setUpdating(true);
    try {
      await updateUdyamApplicationStatus(selectedApp.id, {
        applicationStatus: newStatus,
        adminRemarks: adminNotes,
        udyamRegistrationNumber: udyamRegNumber,
        certificateGenerated: newStatus === 'certificate_generated' || newStatus === 'completed',
      });
      Alert.alert('Success', 'Application updated successfully');
      setSelectedApp(null);
      fetchApps();
    } catch (err) {
      Alert.alert('Update Error', err.message || 'Could not update status');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = applications.filter((a) => {
    if (filterStatus === 'ALL') return true;
    return (a.applicationStatus || 'submitted').toUpperCase() === filterStatus;
  });

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScreenHeader title="Udyam / MSME Admin Desk" />

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
          {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'CERTIFICATE_GENERATED', 'COMPLETED'].map((st) => (
            <TouchableOpacity
              key={st}
              style={[styles.filterChip, filterStatus === st && styles.filterChipActive]}
              onPress={() => setFilterStatus(st)}
            >
              <Text style={[styles.filterChipText, filterStatus === st && styles.filterChipTextActive]}>
                {st.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0284C7" />
          <Text style={styles.loadingText}>Loading Udyam Applications...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No Udyam applications found</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {filtered.map((app) => {
            const biz = app.businessDetails || {};
            const aadhaar = app.aadhaarDetails || {};
            const msme = app.msmeClassification || {};

            return (
              <TouchableOpacity
                key={app.id}
                style={styles.appCard}
                onPress={() => openAppModal(app)}
                activeOpacity={0.7}
              >
                <View style={styles.cardTop}>
                  <Text style={styles.appId}>{app.applicationId || app.id}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>
                      {(app.applicationStatus || 'SUBMITTED').toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.bizName}>{biz.enterpriseName || 'Untitled Enterprise'}</Text>
                <Text style={styles.applicantName}>👤 {aadhaar.nameAsPerAadhaar || 'N/A'}</Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.categoryBadge}>{msme.categoryLabel || 'Micro Enterprise'}</Text>
                  <Text style={styles.feePaid}>Paid: {formatINR(app.amountPaid || 2000)}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Application Details & Action Modal */}
      <Modal visible={!!selectedApp} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedApp?.applicationId || selectedApp?.id}
              </Text>
              <TouchableOpacity onPress={() => setSelectedApp(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              <View style={styles.modalSection}>
                <Text style={styles.modalSecTitle}>Enterprise & Applicant</Text>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: '700' }}>Enterprise:</Text>{' '}
                  {selectedApp?.businessDetails?.enterpriseName}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: '700' }}>Applicant:</Text>{' '}
                  {selectedApp?.aadhaarDetails?.nameAsPerAadhaar} (Aadhaar: Verified ✓)
                </Text>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: '700' }}>Mobile / Email:</Text>{' '}
                  {selectedApp?.aadhaarDetails?.mobile} | {selectedApp?.aadhaarDetails?.email}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: '700' }}>PAN:</Text>{' '}
                  {selectedApp?.panDetails?.panNumber || 'No PAN'} (Verified: ✓)
                </Text>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: '700' }}>Classification:</Text>{' '}
                  {selectedApp?.msmeClassification?.categoryLabel}
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSecTitle}>Update Application Status</Text>
                <View style={styles.statusGrid}>
                  {[
                    { id: 'submitted', label: 'Submitted' },
                    { id: 'under_review', label: 'Under Review' },
                    { id: 'clarification_required', label: 'Clarification' },
                    { id: 'certificate_generated', label: 'Certificate Gen' },
                    { id: 'completed', label: 'Completed' },
                  ].map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      style={[styles.stBtn, newStatus === s.id && styles.stBtnSelected]}
                      onPress={() => setNewStatus(s.id)}
                    >
                      <Text style={[styles.stBtnText, newStatus === s.id && styles.stBtnTextSelected]}>
                        {s.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Udyam Registration Number (URN)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="UDYAM-DL-01-0012345"
                  value={udyamRegNumber}
                  onChangeText={setUdyamRegNumber}
                  autoCapitalize="characters"
                />

                <Text style={styles.inputLabel}>Admin Remarks / Notes</Text>
                <TextInput
                  style={[styles.textInput, { height: 60 }]}
                  placeholder="Add notes or missing requirement details"
                  value={adminNotes}
                  onChangeText={setAdminNotes}
                  multiline
                />
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.btnSave}
              onPress={handleUpdate}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.btnSaveText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  filterContainer: { backgroundColor: COLORS.white, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  filterList: { paddingHorizontal: 16, gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F1F5F9' },
  filterChipActive: { backgroundColor: '#0284C7' },
  filterChipText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  filterChipTextActive: { color: COLORS.white },
  scrollContent: { padding: 16, paddingBottom: 60 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { fontSize: 13, color: '#64748B', marginTop: 10 },
  emptyText: { fontSize: 14, color: '#94A3B8', fontWeight: '600' },
  appCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  appId: { fontSize: 13, fontWeight: '800', color: '#0284C7' },
  statusBadge: { backgroundColor: '#F0F9FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700', color: '#0369A1' },
  bizName: { fontSize: 15, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 2 },
  applicantName: { fontSize: 12, color: '#475569', marginBottom: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 8 },
  categoryBadge: { fontSize: 11, fontWeight: '700', color: '#059669' },
  feePaid: { fontSize: 11, fontWeight: '700', color: COLORS.text },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: COLORS.primaryDark },
  modalClose: { fontSize: 18, color: '#94A3B8', padding: 4 },
  modalSection: { marginBottom: 14, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 10 },
  modalSecTitle: { fontSize: 13, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 6 },
  modalText: { fontSize: 12, color: '#334155', marginBottom: 3 },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  stBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: '#E2E8F0' },
  stBtnSelected: { backgroundColor: '#0284C7' },
  stBtnText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  stBtnTextSelected: { color: COLORS.white, fontWeight: '700' },
  inputLabel: { fontSize: 11, fontWeight: '700', color: '#475569', marginTop: 8, marginBottom: 4 },
  textInput: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 12, color: COLORS.text },
  btnSave: { backgroundColor: '#059669', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  btnSaveText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
});
