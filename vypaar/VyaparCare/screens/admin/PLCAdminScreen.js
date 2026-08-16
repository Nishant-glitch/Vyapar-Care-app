import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import { getStateByCode } from '../../constants/indianStates';
import { COLORS } from '../../constants/theme';
import {
  getPLCApplications,
  requestPLCDocument,
  updatePLCApplicationStatus,
  updatePLCDocumentStatus,
} from '../../lib/database';
import { formatCurrency } from '../../utils/plcValidation';

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'submitted', label: 'Pending Review' },
  { id: 'clarification_requested', label: 'Clarification' },
  { id: 'mca_filed', label: 'MCA Filed' },
  { id: 'approved', label: 'Approved' },
];

export default function PLCAdminScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('all');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Request Document Modal
  const [reqModalVisible, setReqModalVisible] = useState(false);
  const [reqDocName, setReqDocName] = useState('');
  const [reqDocReason, setReqDocReason] = useState('');

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await getPLCApplications();
      setApplications(data || []);
    } catch (err) {
      console.log('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const filteredApps = applications.filter((app) => {
    if (activeTab === 'all') return true;
    return app.status === activeTab;
  });

  const handleOpenApp = (app) => {
    setSelectedApp(app);
    setModalVisible(true);
  };

  const handleApproveDoc = async (docId) => {
    if (!selectedApp) return;
    try {
      await updatePLCDocumentStatus(selectedApp.id, docId, 'approved');
      // Update local state
      const updatedDocs = selectedApp.documents.map((d) =>
        d.id === docId ? { ...d, status: 'approved' } : d
      );
      setSelectedApp({ ...selectedApp, documents: updatedDocs });
      loadApplications();
    } catch (err) {
      Alert.alert('Error', 'Could not update document status');
    }
  };

  const handleRejectDoc = async (docId) => {
    if (!selectedApp) return;
    try {
      await updatePLCDocumentStatus(selectedApp.id, docId, 'rejected', 'Document quality unclear or mismatch');
      const updatedDocs = selectedApp.documents.map((d) =>
        d.id === docId ? { ...d, status: 'rejected' } : d
      );
      setSelectedApp({ ...selectedApp, documents: updatedDocs });
      loadApplications();
    } catch (err) {
      Alert.alert('Error', 'Could not update document status');
    }
  };

  const handleSendDocRequest = async () => {
    if (!reqDocName.trim()) {
      Alert.alert('Required', 'Please enter document name');
      return;
    }

    try {
      await requestPLCDocument(selectedApp.id, {
        documentName: reqDocName,
        reason: reqDocReason,
      });

      setReqModalVisible(false);
      setReqDocName('');
      setReqDocReason('');
      Alert.alert('Success', 'Additional document request sent to applicant.');
      setModalVisible(false);
      loadApplications();
    } catch (err) {
      Alert.alert('Error', 'Could not send document request');
    }
  };

  const handleUpdateAppStatus = async (newStatus) => {
    if (!selectedApp) return;
    try {
      await updatePLCApplicationStatus(selectedApp.id, newStatus);
      setSelectedApp({ ...selectedApp, status: newStatus });
      loadApplications();
      Alert.alert('Status Updated', `Application status changed to ${newStatus}`);
    } catch (err) {
      Alert.alert('Error', 'Could not update application status');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScreenHeader title="PLC Admin Desk" />

      {/* ---------- Filter Tabs ---------- */}
      <View style={styles.tabsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {FILTER_TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                style={[styles.tabChip, active && styles.tabChipActive]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ---------- Application List ---------- */}
      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={COLORS.primaryDark} />
          <Text style={styles.loadingText}>Loading applications...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredApps}
          keyExtractor={(item) => item.id || item.application_id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.appCard, pressed && styles.pressed]}
              onPress={() => handleOpenApp(item)}
            >
              <View style={styles.cardTopRow}>
                <Text style={styles.appId}>{item.application_id || item.id}</Text>
                <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
                  <Text style={[styles.statusText, getStatusTextStyle(item.status)]}>
                    {item.status?.replace(/_/g, ' ').toUpperCase() || 'SUBMITTED'}
                  </Text>
                </View>
              </View>

              <Text style={styles.companyName}>
                {item.company?.proposedName1 || item.company_name || 'Proposed Company'}
              </Text>
              <Text style={styles.applicantName}>
                Promoter: {item.applicant?.fullName || item.applicant_name || 'Applicant'}
              </Text>

              <View style={styles.cardDetailsRow}>
                <Text style={styles.cardDetailItem}>
                  📍 {getStateByCode(item.company?.registeredState)?.label || item.state || 'ROC'}
                </Text>
                <Text style={styles.cardDetailItem}>
                  👥 {item.company?.directorCount || 2} Directors
                </Text>
                <Text style={styles.cardDetailItem}>
                  💰 {formatCurrency(item.company?.authorizedCapital || 100000)}
                </Text>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.timestamp}>
                  {item.created_at ? new Date(item.created_at).toLocaleDateString('en-IN') : 'Recent'}
                </Text>
                <Text style={styles.inspectBtnText}>Inspect Application ›</Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📂</Text>
              <Text style={styles.emptyTitle}>No Applications Found</Text>
              <Text style={styles.emptySub}>Applications matching this filter will appear here.</Text>
            </View>
          }
        />
      )}

      {/* ================================================================= */}
      {/* APPLICATION DETAIL MODAL */}
      {/* ================================================================= */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <ScreenHeader title={`Application ${selectedApp?.application_id || ''}`} onBack={() => setModalVisible(false)} />

          {selectedApp ? (
            <ScrollView style={styles.flex} contentContainerStyle={styles.modalScroll}>
              {/* Status banner */}
              <View style={styles.statusBox}>
                <Text style={styles.statusBoxLabel}>Current Status:</Text>
                <Text style={styles.statusBoxValue}>{selectedApp.status?.toUpperCase()}</Text>
              </View>

              {/* Status Action Buttons */}
              <View style={styles.actionButtonsRow}>
                <Pressable
                  style={[styles.statusActionBtn, { backgroundColor: '#EBF5FB' }]}
                  onPress={() => handleUpdateAppStatus('mca_filed')}
                >
                  <Text style={[styles.statusActionText, { color: '#2471A3' }]}>Mark MCA Filed</Text>
                </Pressable>

                <Pressable
                  style={[styles.statusActionBtn, { backgroundColor: '#E8F8F0' }]}
                  onPress={() => handleUpdateAppStatus('approved')}
                >
                  <Text style={[styles.statusActionText, { color: '#1E7E34' }]}>Approve & Issue COI</Text>
                </Pressable>

                <Pressable
                  style={[styles.statusActionBtn, { backgroundColor: '#FFF3E0' }]}
                  onPress={() => setReqModalVisible(true)}
                >
                  <Text style={[styles.statusActionText, { color: '#D35400' }]}>+ Request Doc</Text>
                </Pressable>
              </View>

              {/* Overview Details */}
              <View style={styles.modalCard}>
                <Text style={styles.modalCardTitle}>Company Overview</Text>
                <Text style={styles.modalDetail}>Proposed Option 1: {selectedApp.company?.proposedName1}</Text>
                <Text style={styles.modalDetail}>Proposed Option 2: {selectedApp.company?.proposedName2}</Text>
                <Text style={styles.modalDetail}>Authorized Capital: {formatCurrency(selectedApp.company?.authorizedCapital)}</Text>
                <Text style={styles.modalDetail}>Business Activity: {selectedApp.business?.mainActivity}</Text>
                <Text style={styles.modalDetail}>Office Status: {selectedApp.office?.premisesType}</Text>
              </View>

              {/* Document Review List */}
              <View style={styles.modalCard}>
                <Text style={styles.modalCardTitle}>Uploaded Documents Verification</Text>
                {(selectedApp.documents || []).map((doc, idx) => (
                  <View key={doc.id || idx} style={styles.docInspectRow}>
                    <View style={styles.docInspectInfo}>
                      <Text style={styles.docInspectName}>{doc.label}</Text>
                      <Text style={styles.docInspectMeta}>
                        Status: <Text style={styles.bold}>{doc.status || 'uploaded'}</Text>
                        {doc.isReused ? ' (🔗 Reused from Director)' : ''}
                      </Text>
                    </View>

                    <View style={styles.docInspectActions}>
                      <Pressable
                        style={[styles.docInspectBtn, styles.approveBtn]}
                        onPress={() => handleApproveDoc(doc.id)}
                      >
                        <Text style={styles.approveBtnText}>✓</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.docInspectBtn, styles.rejectBtn]}
                        onPress={() => handleRejectDoc(doc.id)}
                      >
                        <Text style={styles.rejectBtnText}>✕</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : null}
        </SafeAreaView>
      </Modal>

      {/* ================================================================= */}
      {/* REQUEST ADDITIONAL DOCUMENT MODAL */}
      {/* ================================================================= */}
      <Modal visible={reqModalVisible} transparent animationType="fade" onRequestClose={() => setReqModalVisible(false)}>
        <View style={styles.reqBackdrop}>
          <View style={styles.reqCard}>
            <Text style={styles.reqTitle}>Request Additional Document</Text>
            <Text style={styles.reqSub}>
              Send a clarification request to the applicant to upload missing or rectified documents.
            </Text>

            <Text style={styles.inputLabel}>Document Name / Requirement *</Text>
            <TextInput
              style={styles.textInput}
              value={reqDocName}
              onChangeText={setReqDocName}
              placeholder="e.g. Electricity Bill with Consumer Number"
            />

            <Text style={styles.inputLabel}>Reason / Remarks for Applicant</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={reqDocReason}
              onChangeText={setReqDocReason}
              placeholder="e.g. The previous utility bill is older than 2 months. Please upload a bill issued within the last 60 days."
              multiline
              numberOfLines={3}
            />

            <View style={styles.reqActions}>
              <Pressable style={styles.reqCancelBtn} onPress={() => setReqModalVisible(false)}>
                <Text style={styles.reqCancelText}>Cancel</Text>
              </Pressable>

              <Pressable style={styles.reqSendBtn} onPress={handleSendDocRequest}>
                <Text style={styles.reqSendText}>Send Request</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function getStatusStyle(status) {
  switch (status) {
    case 'approved':
      return { backgroundColor: '#E8F8F0' };
    case 'mca_filed':
      return { backgroundColor: '#EBF5FB' };
    case 'clarification_requested':
      return { backgroundColor: '#FFF3E0' };
    case 'rejected':
      return { backgroundColor: '#FDEDEC' };
    default:
      return { backgroundColor: '#F4F6F9' };
  }
}

function getStatusTextStyle(status) {
  switch (status) {
    case 'approved':
      return { color: '#1E7E34' };
    case 'mca_filed':
      return { color: '#2471A3' };
    case 'clarification_requested':
      return { color: '#D35400' };
    case 'rejected':
      return { color: '#C0392B' };
    default:
      return { color: COLORS.primaryDark };
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  flex: {
    flex: 1,
  },
  pressed: {
    opacity: 0.85,
  },
  tabsRow: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingVertical: 10,
  },
  tabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  tabChipActive: {
    borderColor: COLORS.primaryDark,
    backgroundColor: COLORS.primaryDark,
  },
  tabText: {
    fontSize: 13,
    color: COLORS.grayText,
    fontWeight: '500',
  },
  tabTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.grayText,
    marginTop: 10,
  },
  listContent: {
    padding: 16,
  },
  appCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
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
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  appId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginTop: 2,
  },
  applicantName: {
    fontSize: 13,
    color: COLORS.grayText,
    marginTop: 2,
  },
  cardDetailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  cardDetailItem: {
    fontSize: 12,
    color: COLORS.textDark,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  timestamp: {
    fontSize: 11,
    color: COLORS.grayText,
  },
  inspectBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.grayText,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  modalScroll: {
    padding: 16,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  statusBoxLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  statusBoxValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  statusActionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusActionText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
  },
  modalCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 10,
  },
  modalDetail: {
    fontSize: 13,
    color: COLORS.textDark,
    marginBottom: 6,
  },
  docInspectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  docInspectInfo: {
    flex: 1,
    paddingRight: 10,
  },
  docInspectName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  docInspectMeta: {
    fontSize: 11,
    color: COLORS.grayText,
    marginTop: 2,
  },
  bold: {
    fontWeight: 'bold',
  },
  docInspectActions: {
    flexDirection: 'row',
    gap: 8,
  },
  docInspectBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveBtn: {
    backgroundColor: '#E8F8F0',
  },
  approveBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E7E34',
  },
  rejectBtn: {
    backgroundColor: '#FDEDEC',
  },
  rejectBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#C0392B',
  },
  reqBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  reqCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 18,
  },
  reqTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  reqSub: {
    fontSize: 12,
    color: COLORS.grayText,
    marginTop: 4,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryDark,
    marginTop: 8,
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  multilineInput: {
    height: 70,
    textAlignVertical: 'top',
  },
  reqActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  reqCancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
  },
  reqCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.grayText,
  },
  reqSendBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
  },
  reqSendText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});
