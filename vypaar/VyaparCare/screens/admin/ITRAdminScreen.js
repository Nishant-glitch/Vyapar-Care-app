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
  getITRApplications,
  updateITRApplicationStatus,
} from '../../lib/database';
import { formatINR } from '../../utils/currency';

export default function ITRAdminScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [ackNumber, setAckNumber] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const data = await getITRApplications();
      setApplications(data || []);
    } catch (err) {
      console.warn('Error fetching ITR apps:', err);
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
    setAckNumber(app.acknowledgmentNumber || '');
  };

  const handleUpdate = async () => {
    if (!selectedApp) return;
    setUpdating(true);
    try {
      await updateITRApplicationStatus(selectedApp.id, {
        applicationStatus: newStatus,
        status: newStatus,
        adminRemarks: adminNotes,
        acknowledgmentNumber: ackNumber,
        filingCompleted: newStatus === 'filed' || newStatus === 'completed',
      });
      Alert.alert('Success', 'ITR application status updated');
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
      <ScreenHeader title="Income Tax (ITR) Admin Desk" />

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
          {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'COMPUTATION_PREPARED', 'FILED', 'COMPLETED'].map((st) => (
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
          <Text style={styles.loadingText}>Loading ITR Applications...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No ITR applications found</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {filtered.map((app) => {
            const prof = app.profile || {};
            const comp = app.taxComputation || {};

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

                <Text style={styles.taxpayerName}>{prof.fullName || 'Rahul Sharma'}</Text>
                <Text style={styles.taxpayerInfo}>
                  💳 PAN: {prof.pan || 'N/A'} | 📅 {app.assessmentYear?.replace('_', ' ') || 'AY 2026-27'}
                </Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.formBadge}>
                    {app.recommendedITRForm || 'ITR-1 (Sahaj)'}
                  </Text>
                  <Text style={styles.taxVal}>
                    {comp.isRefund ? `Refund: ${formatINR(comp.finalAmount || 0)}` : `Tax: ${formatINR(comp.totalTaxLiability || 0)}`}
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

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              <View style={styles.modalSection}>
                <Text style={styles.modalSecTitle}>Taxpayer & Return Overview</Text>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: '700' }}>Name:</Text> {selectedApp?.profile?.fullName}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: '700' }}>PAN:</Text> {selectedApp?.profile?.pan} (Verified: ✓)
                </Text>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: '700' }}>Assessment Year:</Text> {selectedApp?.assessmentYear?.replace('_', ' ')}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: '700' }}>Recommended Form:</Text> {selectedApp?.recommendedITRForm}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: '700' }}>Gross Income:</Text> {formatINR(selectedApp?.taxComputation?.grossTotalIncome || 0)}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: '700' }}>Net Taxable:</Text> {formatINR(selectedApp?.taxComputation?.taxableIncome || 0)}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: '700' }}>Tax Liability:</Text> {formatINR(selectedApp?.taxComputation?.totalTaxLiability || 0)}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: '700' }}>Taxes Paid:</Text> {formatINR(selectedApp?.taxComputation?.totalTaxesPaid || 0)}
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSecTitle}>Update Application & e-Filing Status</Text>
                <View style={styles.statusGrid}>
                  {[
                    { id: 'submitted', label: 'Submitted' },
                    { id: 'under_review', label: 'Under Review' },
                    { id: 'computation_prepared', label: 'Computation Done' },
                    { id: 'ready_for_filing', label: 'Ready to File' },
                    { id: 'filed', label: 'Filed on Portal' },
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

                <Text style={styles.inputLabel}>ITR Acknowledgment / e-Filing Number (15 Digits)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 123456789012345"
                  value={ackNumber}
                  onChangeText={setAckNumber}
                  keyboardType="number-pad"
                />

                <Text style={styles.inputLabel}>CA Remarks / Clarification Notes</Text>
                <TextInput
                  style={[styles.textInput, { height: 60 }]}
                  placeholder="Add computation notes or missing requirement details"
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
  taxpayerName: { fontSize: 15, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 2 },
  taxpayerInfo: { fontSize: 12, color: '#475569', marginBottom: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 8 },
  formBadge: { fontSize: 11, fontWeight: '800', color: '#059669', backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  taxVal: { fontSize: 12, fontWeight: '700', color: COLORS.text },
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
