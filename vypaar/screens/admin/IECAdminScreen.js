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
  getIECApplications,
  updateIECApplicationStatus,
} from '../../lib/database';
import { formatINR } from '../../utils/currency';

export default function IECAdminScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [iecNumber, setIecNumber] = useState('');
  const [reqDocName, setReqDocName] = useState('');
  const [reqDocReason, setReqDocReason] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const data = await getIECApplications();
      setApplications(data || []);
    } catch (err) {
      console.warn('Error fetching IEC apps:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const openAppModal = (app) => {
    setSelectedApp(app);
    setNewStatus(app.applicationStatus || app.status || 'submitted');
    setAdminNotes(app.adminRemarks || '');
    setIecNumber(app.iecNumber || app.panDetails?.panNumber || '');
    setReqDocName('');
    setReqDocReason('');
  };

  const handleUpdate = async () => {
    if (!selectedApp) return;
    setUpdating(true);
    try {
      const updates = {
        applicationStatus: newStatus,
        status: newStatus,
        adminRemarks: adminNotes,
        iecNumber: iecNumber,
        isApproved: newStatus === 'approved' || newStatus === 'completed',
      };

      if (reqDocName.trim()) {
        updates.additionalDocumentRequest = {
          documentName: reqDocName.trim(),
          reason: reqDocReason.trim() || 'Required for DGFT compliance',
          requestedAt: new Date().toISOString(),
        };
        updates.applicationStatus = 'clarification_required';
        updates.status = 'clarification_required';
      }

      await updateIECApplicationStatus(selectedApp.id, updates);
      Alert.alert('Success', 'IEC application status and records updated');
      setSelectedApp(null);
      fetchApps();
    } catch (err) {
      Alert.alert('Update Error', err.message || 'Could not update application');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = applications.filter((a) => {
    if (filterStatus === 'ALL') return true;
    return (a.applicationStatus || a.status || 'submitted').toUpperCase() === filterStatus;
  });

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScreenHeader title="Import Export Code (IEC) Admin Desk" />

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
          {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'PFMS_VERIFIED', 'DGFT_SUBMITTED', 'CLARIFICATION_REQUIRED', 'APPROVED', 'COMPLETED'].map((st) => (
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
          <Text style={styles.loadingText}>Loading IEC Applications...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No IEC applications found</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {filtered.map((app) => {
            const pan = app.panDetails || {};
            const biz = app.businessDetails || {};

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
                      {(app.applicationStatus || app.status || 'SUBMITTED').toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.entityName}>{pan.legalName || biz.businessName || 'Acme Exports'}</Text>
                <Text style={styles.entitySub}>
                  💳 PAN: {pan.panNumber || 'N/A'} | 🏛️ {(app.entityType || 'proprietorship').toUpperCase()}
                </Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.feeBadge}>{formatINR(app.amountPaid || 4500)} Paid</Text>
                  <Text style={styles.dateText}>
                    {new Date(app.created_at || app.submittedAt || Date.now()).toLocaleDateString('en-IN')}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Detail & Action Modal */}
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

            <ScrollView style={{ maxHeight: 440 }} showsVerticalScrollIndicator={false}>
              <View style={styles.modalSection}>
                <Text style={styles.modalSecTitle}>Applicant & Entity Overview</Text>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: '700' }}>Legal Name:</Text> {selectedApp?.panDetails?.legalName}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: '700' }}>PAN:</Text> {selectedApp?.panDetails?.panNumber} (Verified: ✓)
                </Text>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: '700' }}>Constitution:</Text> {selectedApp?.entityType?.toUpperCase()}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: '700' }}>Bank:</Text> {selectedApp?.bankDetails?.bankName} (IFSC: {selectedApp?.bankDetails?.ifsc})
                </Text>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: '700' }}>Signatory:</Text> {selectedApp?.signatoryDetails?.fullName} ({selectedApp?.signatoryDetails?.designation})
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSecTitle}>Update DGFT Processing Status</Text>
                <View style={styles.statusGrid}>
                  {[
                    { id: 'submitted', label: 'Submitted' },
                    { id: 'under_review', label: 'Under Review' },
                    { id: 'pfms_verified', label: 'PFMS Verified' },
                    { id: 'dgft_submitted', label: 'DGFT Uploaded' },
                    { id: 'clarification_required', label: 'Clarification Req' },
                    { id: 'approved', label: 'Approved' },
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

                <Text style={styles.inputLabel}>Official 10-Digit IEC Number</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. ABCDE1234F"
                  value={iecNumber}
                  onChangeText={(v) => setIecNumber(v.toUpperCase())}
                  autoCapitalize="characters"
                  maxLength={10}
                />

                <Text style={styles.inputLabel}>CA Remarks / Processing Notes</Text>
                <TextInput
                  style={[styles.textInput, { height: 50 }]}
                  placeholder="Internal scrutiny or DGFT filing remarks"
                  value={adminNotes}
                  onChangeText={setAdminNotes}
                  multiline
                />

                {/* Additional Document Request Section */}
                <View style={styles.addDocBox}>
                  <Text style={styles.addDocTitle}>Request Additional Document from User</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Document Name (e.g. Bank Certificate / Owner NOC)"
                    value={reqDocName}
                    onChangeText={setReqDocName}
                  />
                  <TextInput
                    style={[styles.textInput, { marginTop: 6, height: 40 }]}
                    placeholder="Reason / Specific instructions"
                    value={reqDocReason}
                    onChangeText={setReqDocReason}
                  />
                </View>
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
  entityName: { fontSize: 15, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 2 },
  entitySub: { fontSize: 12, color: '#475569', marginBottom: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 8 },
  feeBadge: { fontSize: 11, fontWeight: '800', color: '#059669', backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  dateText: { fontSize: 11, color: '#64748B' },
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
  addDocBox: { backgroundColor: '#FFFBEB', padding: 10, borderRadius: 8, marginTop: 12, borderWidth: 1, borderColor: '#FDE68A' },
  addDocTitle: { fontSize: 11, fontWeight: '700', color: '#92400E', marginBottom: 6 },
  btnSave: { backgroundColor: '#059669', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  btnSaveText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
});
