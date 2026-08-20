import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import {
  FSSAI_ADMIN_FILTERS,
  FSSAI_APPLICATION_STATUSES,
} from '../../config/fssaiConfig';
import { COLORS } from '../../constants/theme';
import {
  getFSSAIApplications,
  updateFSSAIApplicationStatus,
  updateFSSAIDocumentStatus,
  requestFSSAIDocument,
} from '../../lib/database';
import { formatINR } from '../../utils/currency';

export default function FSSAIAdminScreen({ navigation }) {
  const [applications, setApplications] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Inspection Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [inspectModalVisible, setInspectModalVisible] = useState(false);

  // Request Document Modal State
  const [reqModalVisible, setReqModalVisible] = useState(false);
  const [reqDocName, setReqDocName] = useState('');
  const [reqReason, setReqReason] = useState('');

  const loadData = async () => {
    try {
      const data = await getFSSAIApplications();
      setApplications(data || []);
    } catch (err) {
      console.error('Failed to load FSSAI applications:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const currentFilterConfig = FSSAI_ADMIN_FILTERS.find((f) => f.id === selectedFilter);

  const filteredApplications = applications.filter((app) => {
    // Status filter
    if (currentFilterConfig?.statuses && !currentFilterConfig.statuses.includes(app.status)) {
      return false;
    }
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = app.application_id?.toLowerCase().includes(q);
      const matchBiz = (app.business_details?.foodBusinessName || app.businessDetails?.foodBusinessName || '')
        .toLowerCase()
        .includes(q);
      const matchName = (app.applicant_details?.applicantName || app.applicantDetails?.applicantName || '')
        .toLowerCase()
        .includes(q);
      return matchId || matchBiz || matchName;
    }
    return true;
  });

  const handleInspect = (app) => {
    setSelectedApp(app);
    setInspectModalVisible(true);
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedApp) return;
    try {
      await updateFSSAIApplicationStatus(selectedApp.application_id || selectedApp.id, newStatus);
      setSelectedApp((prev) => ({ ...prev, status: newStatus }));
      await loadData();
      Alert.alert('Status Updated', `Application status changed to ${newStatus.toUpperCase()}`);
    } catch (err) {
      console.error('Error changing status:', err);
    }
  };

  const handleDocStatusChange = async (docId, newStatus) => {
    if (!selectedApp) return;
    try {
      await updateFSSAIDocumentStatus(selectedApp.application_id || selectedApp.id, docId, newStatus);
      const updatedDocs = (selectedApp.documents || []).map((d) =>
        d.id === docId ? { ...d, status: newStatus } : d
      );
      setSelectedApp((prev) => ({ ...prev, documents: updatedDocs }));
      await loadData();
    } catch (err) {
      console.error('Error updating doc status:', err);
    }
  };

  const handleSendDocRequest = async () => {
    if (!reqDocName.trim()) {
      Alert.alert('Required', 'Please enter required document name');
      return;
    }
    try {
      await requestFSSAIDocument(selectedApp.application_id || selectedApp.id, reqDocName, reqReason);
      Alert.alert(
        'Request Dispatched',
        `Notification sent to applicant requesting "${reqDocName}". Application marked as Clarification Required.`
      );
      setReqDocName('');
      setReqReason('');
      setReqModalVisible(false);
      setSelectedApp((prev) => ({ ...prev, status: 'clarification_required' }));
      await loadData();
    } catch (err) {
      console.error('Error requesting document:', err);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>

      <ScreenHeader
        title="FSSAI Admin Desk"
        subtitle="FoSCoS Food Licensing Scrutiny"
        onBack={() => navigation.goBack()}
      />

      {/* Top Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by ID, Food Business, or Applicant..."
          placeholderTextColor="#999999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Status Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {FSSAI_ADMIN_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[styles.filterChip, selectedFilter === f.id && styles.filterChipActive]}
            onPress={() => setSelectedFilter(f.id)}
          >
            <Text style={[styles.filterChipText, selectedFilter === f.id && styles.filterChipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Applications List */}
      <FlatList
        data={filteredApplications}
        keyExtractor={(item) => item.application_id || item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🍽️</Text>
            <Text style={styles.emptyTitle}>No FSSAI Applications Found</Text>
            <Text style={styles.emptySubtitle}>No records match the selected filter criteria.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const biz = item.business_details || item.businessDetails || {};
          const appDetails = item.applicant_details || item.applicantDetails || {};
          const stConfig = FSSAI_APPLICATION_STATUSES[item.status] || FSSAI_APPLICATION_STATUSES.submitted;

          return (
            <TouchableOpacity
              style={styles.appCard}
              onPress={() => handleInspect(item)}
              activeOpacity={0.8}
            >
              <View style={styles.cardTopRow}>
                <Text style={styles.appIdText}>{item.application_id || item.id}</Text>
                <View style={[styles.statusBadge, { backgroundColor: `${stConfig.color}15` }]}>
                  <Text style={[styles.statusBadgeText, { color: stConfig.color }]}>
                    {stConfig.label}
                  </Text>
                </View>
              </View>

              <Text style={styles.bizNameText}>{biz.foodBusinessName || 'Food Business'}</Text>
              <Text style={styles.applicantText}>
                👤 {appDetails.applicantName || 'Applicant'} • {appDetails.businessLegalName || 'Entity'}
              </Text>

              <View style={styles.metaRow}>
                <View style={styles.kobTag}>
                  <Text style={styles.kobTagText}>KoB: {(item.kob || 'Food Service').toUpperCase()}</Text>
                </View>
                <View style={styles.tierTag}>
                  <Text style={styles.tierTagText}>{(item.license_type || item.licenseType || 'State').toUpperCase()} LIC</Text>
                </View>
                <Text style={styles.dateText}>
                  {new Date(item.created_at || Date.now()).toLocaleDateString('en-IN')}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Application Inspection Modal */}
      <Modal visible={inspectModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalAppId}>{selectedApp?.application_id || selectedApp?.id}</Text>
              <Text style={styles.modalAppSub}>FoSCoS Application File</Text>
            </View>
            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setInspectModalVisible(false)}
            >
              <Text style={styles.closeModalText}>✕ Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            {selectedApp && (
              <>
                {/* Status Action Bar */}
                <View style={styles.inspectCard}>
                  <Text style={styles.inspectSectionTitle}>Current Application Status</Text>
                  <View style={styles.statusButtonsRow}>
                    {[
                      { id: 'under_review', label: 'Under Scrutiny', color: '#F1C40F' },
                      { id: 'clarification_required', label: 'Clarification', color: '#E74C3C' },
                      { id: 'inspection_scheduled', label: 'FSO Inspection', color: '#9B59B6' },
                      { id: 'approved', label: 'Approve (✓)', color: '#2ECC71' },
                    ].map((s) => (
                      <TouchableOpacity
                        key={s.id}
                        style={[
                          styles.statusActionBtn,
                          selectedApp.status === s.id && { backgroundColor: s.color, borderColor: s.color },
                        ]}
                        onPress={() => handleStatusChange(s.id)}
                      >
                        <Text
                          style={[
                            styles.statusActionBtnText,
                            selectedApp.status === s.id && { color: COLORS.white },
                          ]}
                        >
                          {s.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Applicant & Entity Details */}
                <View style={styles.inspectCard}>
                  <Text style={styles.inspectSectionTitle}>Applicant & Entity</Text>
                  <Text style={styles.infoLine}>
                    <Text style={styles.infoLabel}>Legal Name: </Text>
                    {selectedApp.applicant_details?.businessLegalName || selectedApp.applicantDetails?.businessLegalName || '—'}
                  </Text>
                  <Text style={styles.infoLine}>
                    <Text style={styles.infoLabel}>PAN: </Text>
                    {selectedApp.applicant_details?.pan || selectedApp.applicantDetails?.pan || '—'}
                  </Text>
                  <Text style={styles.infoLine}>
                    <Text style={styles.infoLabel}>Mobile / Email: </Text>
                    {`${selectedApp.applicant_details?.mobile || selectedApp.applicantDetails?.mobile || '—'} / ${selectedApp.applicant_details?.email || selectedApp.applicantDetails?.email || '—'}`}
                  </Text>
                  <Text style={styles.infoLine}>
                    <Text style={styles.infoLabel}>Address: </Text>
                    {`${selectedApp.applicant_details?.address1 || selectedApp.applicantDetails?.address1 || '—'}, ${selectedApp.applicant_details?.city || selectedApp.applicantDetails?.city || '—'}, PIN: ${selectedApp.applicant_details?.pinCode || selectedApp.applicantDetails?.pinCode || '—'}`}
                  </Text>
                </View>

                {/* Food Business & Products */}
                <View style={styles.inspectCard}>
                  <Text style={styles.inspectSectionTitle}>Food Business & Products</Text>
                  <Text style={styles.infoLine}>
                    <Text style={styles.infoLabel}>Business Name: </Text>
                    {selectedApp.business_details?.foodBusinessName || selectedApp.businessDetails?.foodBusinessName || '—'}
                  </Text>
                  <Text style={styles.infoLine}>
                    <Text style={styles.infoLabel}>Turnover: </Text>
                    {selectedApp.business_details?.annualTurnover || selectedApp.businessDetails?.annualTurnover || '—'}
                  </Text>
                  <Text style={styles.infoLine}>
                    <Text style={styles.infoLabel}>Premises: </Text>
                    {selectedApp.premises_details?.address1 || selectedApp.premisesDetails?.address1 || '—'} ({selectedApp.premises_details?.premisesType || selectedApp.premisesDetails?.premisesType || 'Rented'})
                  </Text>

                  <Text style={[styles.infoLabel, { marginTop: 10, marginBottom: 4 }]}>Registered Products:</Text>
                  {(selectedApp.products || []).map((p, idx) => (
                    <Text key={idx} style={styles.prodLine}>
                      • {p.productName} (Cat {p.categoryCode}) — {p.capacity || 'Standard'}
                    </Text>
                  ))}
                </View>

                {/* Document Verification & Scrutiny */}
                <View style={styles.inspectCard}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.inspectSectionTitle}>Uploaded Documents</Text>
                    <TouchableOpacity
                      style={styles.reqDocBtn}
                      onPress={() => setReqModalVisible(true)}
                    >
                      <Text style={styles.reqDocBtnText}>+ Request Document</Text>
                    </TouchableOpacity>
                  </View>

                  {(selectedApp.documents || []).map((doc) => {
                    const isApproved = doc.status === 'approved';
                    const isRejected = doc.status === 'rejected';

                    return (
                      <View key={doc.id} style={styles.docInspectRow}>
                        <View style={styles.docInspectInfo}>
                          <Text style={styles.docInspectLabel}>{doc.label}</Text>
                          <Text style={styles.docInspectStatus}>
                            Status: {doc.status?.toUpperCase()} {doc.file ? `• ${doc.file.name || 'File attached'}` : ''}
                          </Text>
                        </View>

                        <View style={styles.docActionsRow}>
                          <TouchableOpacity
                            style={[styles.docActionBtn, isApproved && styles.docApproveActive]}
                            onPress={() => handleDocStatusChange(doc.id, 'approved')}
                          >
                            <Text style={[styles.docActionText, isApproved && styles.docActionTextActive]}>
                              ✓ Approve
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.docActionBtn, isRejected && styles.docRejectActive]}
                            onPress={() => handleDocStatusChange(doc.id, 'rejected')}
                          >
                            <Text style={[styles.docActionText, isRejected && styles.docRejectTextActive]}>
                              ✕ Reject
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Request Additional Document Modal */}
      <Modal visible={reqModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalCardTitle}>Request Additional FoSCoS Document</Text>

            <Text style={styles.inputLabel}>Document Name *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Updated Water Potability Report / Owner NOC"
              value={reqDocName}
              onChangeText={setReqDocName}
            />

            <Text style={styles.inputLabel}>Reason / Remarks for Applicant</Text>
            <TextInput
              style={[styles.modalInput, { height: 70 }]}
              multiline
              placeholder="e.g. The water test report must be from an NABL accredited lab not older than 6 months."
              value={reqReason}
              onChangeText={setReqReason}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setReqModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sendReqBtn}
                onPress={handleSendDocRequest}
              >
                <Text style={styles.sendReqBtnText}>Send Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: COLORS.primaryDark,
  },
  clearIcon: {
    fontSize: 14,
    color: '#94A3B8',
    padding: 4,
  },
  filterScroll: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 10,
    maxHeight: 36,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.primaryDark,
  },
  filterChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
    paddingBottom: 40,
    gap: 12,
  },
  appCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  appIdText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primaryDark,
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  bizNameText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  applicantText: {
    fontSize: 12.5,
    color: '#64748B',
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  kobTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  kobTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  tierTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tierTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E40AF',
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
    marginLeft: 'auto',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
  },
  modalSafe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalAppId: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  modalAppSub: {
    fontSize: 11,
    color: '#64748B',
  },
  closeModalBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  closeModalText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#475569',
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },
  inspectCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inspectSectionTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusActionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  statusActionBtnText: {
    fontSize: 11.5,
    fontWeight: 'bold',
    color: '#475569',
  },
  infoLine: {
    fontSize: 13,
    color: '#334155',
    marginBottom: 6,
  },
  infoLabel: {
    fontWeight: '700',
    color: '#64748B',
  },
  prodLine: {
    fontSize: 12.5,
    color: '#334155',
    marginBottom: 4,
  },
  reqDocBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  reqDocBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  docInspectRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  docInspectInfo: {
    marginBottom: 6,
  },
  docInspectLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  docInspectStatus: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  docActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  docActionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  docActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  docApproveActive: {
    backgroundColor: '#DCFCE7',
  },
  docActionTextActive: {
    color: '#16A34A',
    fontWeight: 'bold',
  },
  docRejectActive: {
    backgroundColor: '#FEE2E2',
  },
  docRejectTextActive: {
    color: COLORS.danger,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
  },
  modalCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    color: COLORS.primaryDark,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  sendReqBtn: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendReqBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});
