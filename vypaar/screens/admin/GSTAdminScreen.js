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
import { COLORS } from '../../constants/theme';
import {
  getGSTApplications,
  requestGSTDocument,
  updateGSTApplicationStatus,
  updateGSTDocumentStatus,
} from '../../lib/database';
import { formatINR } from '../../utils/currency';

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'submitted', label: 'New / Received' },
  { id: 'under_scrutiny', label: 'Scrutiny' },
  { id: 'clarification_needed', label: 'Clarification' },
  { id: 'gstin_issued', label: 'Approved / Issued' },
];

export default function GSTAdminScreen({ navigation }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const [selectedApp, setSelectedApp] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [requestDocModal, setRequestDocModal] = useState(false);
  const [docRequestName, setDocRequestName] = useState('');
  const [docRequestInstruction, setDocRequestInstruction] = useState('');

  const loadData = async () => {
    try {
      const data = await getGSTApplications();
      setApplications(data || []);
    } catch (err) {
      console.log('Error loading GST applications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleStatusChange = async (appId, nextStatus) => {
    try {
      await updateGSTApplicationStatus(appId, nextStatus);
      Alert.alert('Status Updated', `Application status changed to ${nextStatus}`);
      loadData();
      if (selectedApp) {
        setSelectedApp((prev) => ({ ...prev, status: nextStatus }));
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not update status');
    }
  };

  const handleDocumentAction = async (appId, docId, status) => {
    try {
      await updateGSTDocumentStatus(appId, docId, status);
      loadData();
      if (selectedApp) {
        setSelectedApp((prev) => ({
          ...prev,
          documentReviews: {
            ...(prev.documentReviews || {}),
            [docId]: status,
          },
        }));
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not review document');
    }
  };

  const handleSendDocRequest = async () => {
    if (!docRequestName.trim()) {
      Alert.alert('Missing Name', 'Please enter document name');
      return;
    }
    try {
      await requestGSTDocument(
        selectedApp.id,
        docRequestName.trim(),
        docRequestInstruction.trim()
      );
      Alert.alert('Request Sent', 'Document request sent to applicant');
      setRequestDocModal(false);
      setDocRequestName('');
      setDocRequestInstruction('');
      loadData();
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not send document request');
    }
  };

  const filteredApps = applications.filter((app) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'submitted')
      return app.status === 'submitted' || app.status === 'pending';
    return app.status === activeTab;
  });

  const openAppDetails = (app) => {
    setSelectedApp(app);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'top']}>
      <ScreenHeader title="GST Admin Desk" />

      {/* Filter Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsList}
        >
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tabBtnText,
                    isActive && styles.tabBtnTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Applications List */}
      <FlatList
        data={filteredApps}
        keyExtractor={(item) => item.id || Math.random().toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No GST Applications</Text>
            <Text style={styles.emptySub}>
              {activeTab === 'all'
                ? 'No GST applications filed yet.'
                : `No applications with status "${activeTab}".`}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.appCard}
            onPress={() => openAppDetails(item)}
            activeOpacity={0.7}
          >
            <View style={styles.appCardHeader}>
              <View>
                <Text style={styles.appId}>{item.id}</Text>
                <Text style={styles.appDate}>
                  {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : 'Today'}
                </Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>
                  {item.status?.toUpperCase() || 'SUBMITTED'}
                </Text>
              </View>
            </View>

            <View style={styles.appBody}>
              <Text style={styles.legalName}>
                {item.businessDetails?.legalName || item.applicantName || 'GST Applicant'}
              </Text>
              <Text style={styles.tradeName}>
                Trade: {item.businessDetails?.tradeName || 'N/A'}
              </Text>
              <Text style={styles.panText}>
                PAN: {item.businessDetails?.pan || 'N/A'}
              </Text>
            </View>

            <View style={styles.appFooter}>
              <Text style={styles.entityTag}>
                {item.constitution?.toUpperCase() || 'PROPRIETORSHIP'}
              </Text>
              <Text style={styles.feeTag}>
                {formatINR(item.amountPaid || 5000)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Application Scrutiny Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalFull}>
          <View style={styles.modalBar}>
            <Text style={styles.modalBarTitle}>
              Application: {selectedApp?.id}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseBtn}>✕ Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} contentContainerStyle={{ padding: 16 }}>
            {selectedApp && (
              <>
                {/* Status Bar & Change */}
                <View style={styles.sectionBox}>
                  <Text style={styles.sectionTitle}>Application Status & Actions</Text>
                  <Text style={styles.currentStatus}>
                    Current: <Text style={{ color: '#059669', fontWeight: '800' }}>{selectedApp.status || 'submitted'}</Text>
                  </Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.btnStatus, { backgroundColor: '#3B82F6' }]}
                      onPress={() => handleStatusChange(selectedApp.id, 'under_scrutiny')}
                    >
                      <Text style={styles.btnStatusText}>Mark Scrutiny</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.btnStatus, { backgroundColor: '#EAB308' }]}
                      onPress={() => handleStatusChange(selectedApp.id, 'clarification_needed')}
                    >
                      <Text style={styles.btnStatusText}>Ask Clarification</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.btnStatus, { backgroundColor: '#10B981' }]}
                      onPress={() => handleStatusChange(selectedApp.id, 'gstin_issued')}
                    >
                      <Text style={styles.btnStatusText}>Issue GSTIN</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Business Info */}
                <View style={styles.sectionBox}>
                  <Text style={styles.sectionTitle}>Business & Constitution</Text>
                  <Text style={styles.rowText}>Legal Name: {selectedApp.businessDetails?.legalName}</Text>
                  <Text style={styles.rowText}>Trade Name: {selectedApp.businessDetails?.tradeName}</Text>
                  <Text style={styles.rowText}>PAN: {selectedApp.businessDetails?.pan}</Text>
                  <Text style={styles.rowText}>Constitution: {selectedApp.constitution}</Text>
                  <Text style={styles.rowText}>Composition Scheme: {selectedApp.isComposition ? 'Yes' : 'No'}</Text>
                </View>

                {/* Promoters */}
                <View style={styles.sectionBox}>
                  <Text style={styles.sectionTitle}>Promoters / Signatories</Text>
                  {(selectedApp.promoters || []).map((p, i) => (
                    <View key={i} style={styles.innerCard}>
                      <Text style={styles.innerCardTitle}>#{i + 1}: {p.name}</Text>
                      <Text style={styles.innerCardSub}>Mobile: {p.mobile} | Email: {p.email}</Text>
                      <Text style={styles.innerCardSub}>PAN: {p.pan} | Aadhaar: {p.aadhaar}</Text>
                    </View>
                  ))}
                </View>

                {/* Principal Place */}
                <View style={styles.sectionBox}>
                  <Text style={styles.sectionTitle}>Principal Place of Business</Text>
                  <Text style={styles.rowText}>
                    Possession: {selectedApp.premisesDetails?.possessionType}
                  </Text>
                  <Text style={styles.rowText}>
                    Address: {selectedApp.premisesDetails?.buildingNumber}, {selectedApp.premisesDetails?.street}, {selectedApp.premisesDetails?.city} - {selectedApp.premisesDetails?.pinCode}
                  </Text>
                </View>

                {/* Bank Account */}
                <View style={styles.sectionBox}>
                  <Text style={styles.sectionTitle}>Bank Account Details</Text>
                  <Text style={styles.rowText}>A/C No: {selectedApp.bankDetails?.accountNumber}</Text>
                  <Text style={styles.rowText}>IFSC: {selectedApp.bankDetails?.ifsc}</Text>
                  <Text style={styles.rowText}>Bank: {selectedApp.bankDetails?.bankName}</Text>
                </View>

                {/* Documents Review */}
                <View style={styles.sectionBox}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <Text style={styles.sectionTitle}>Uploaded Documents</Text>
                    <TouchableOpacity
                      style={styles.btnReqDoc}
                      onPress={() => setRequestDocModal(true)}
                    >
                      <Text style={styles.btnReqDocText}>+ Request Document</Text>
                    </TouchableOpacity>
                  </View>

                  {Object.entries(selectedApp.documents || {}).map(([docKey, file]) => {
                    const docReviewStatus = (selectedApp.documentReviews || {})[docKey];
                    return (
                      <View key={docKey} style={styles.docItem}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.docItemKey}>{docKey}</Text>
                          <Text style={styles.docItemName}>📄 {file?.name || 'File Attached'}</Text>
                          {docReviewStatus && (
                            <Text
                              style={{
                                fontSize: 11,
                                fontWeight: '700',
                                color: docReviewStatus === 'approved' ? '#10B981' : '#EF4444',
                              }}
                            >
                              Status: {docReviewStatus.toUpperCase()}
                            </Text>
                          )}
                        </View>
                        <View style={styles.docActions}>
                          <TouchableOpacity
                            style={[styles.btnDocAction, { backgroundColor: '#10B981' }]}
                            onPress={() => handleDocumentAction(selectedApp.id, docKey, 'approved')}
                          >
                            <Text style={styles.btnDocActionText}>✓</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.btnDocAction, { backgroundColor: '#EF4444' }]}
                            onPress={() => handleDocumentAction(selectedApp.id, docKey, 'rejected')}
                          >
                            <Text style={styles.btnDocActionText}>✕</Text>
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

      {/* Request Document Modal */}
      <Modal
        visible={requestDocModal}
        transparent
        animationType="fade"
        onRequestClose={() => setRequestDocModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.docReqBox}>
            <Text style={styles.docReqTitle}>Request Document from Applicant</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Document Name (e.g. Updated Rent Agreement)"
              value={docRequestName}
              onChangeText={setDocRequestName}
            />
            <TextInput
              style={[styles.inputField, { height: 70 }]}
              placeholder="Instructions / Reason for request"
              value={docRequestInstruction}
              onChangeText={setDocRequestInstruction}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setRequestDocModal(false)}
              >
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnSubmitReq}
                onPress={handleSendDocRequest}
              >
                <Text style={styles.btnSubmitReqText}>Send Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  tabsWrapper: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 8,
  },
  tabsList: { paddingHorizontal: 16, gap: 8 },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabBtnActive: { backgroundColor: '#059669' },
  tabBtnText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  tabBtnTextActive: { color: COLORS.white, fontWeight: '700' },
  listContent: { padding: 16 },
  appCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  appCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  appId: { fontSize: 13, fontWeight: '700', color: '#059669' },
  appDate: { fontSize: 11, color: '#94A3B8' },
  statusBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: { fontSize: 11, fontWeight: '700', color: '#0369A1' },
  appBody: { marginBottom: 12 },
  legalName: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  tradeName: { fontSize: 12, color: '#475569', marginBottom: 2 },
  panText: { fontSize: 12, color: '#64748B' },
  appFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  entityTag: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  feeTag: { fontSize: 13, fontWeight: '700', color: '#059669' },
  emptyBox: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  emptySub: { fontSize: 13, color: '#64748B' },
  modalFull: { flex: 1, backgroundColor: '#F8FAFC' },
  modalBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalBarTitle: { fontSize: 15, fontWeight: '700', color: COLORS.primaryDark },
  modalCloseBtn: { fontSize: 14, fontWeight: '700', color: '#EF4444' },
  modalScroll: { flex: 1 },
  sectionBox: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 8 },
  currentStatus: { fontSize: 13, color: COLORS.text, marginBottom: 12 },
  actionButtons: { flexDirection: 'row', gap: 8 },
  btnStatus: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  btnStatusText: { fontSize: 11, fontWeight: '700', color: COLORS.white },
  rowText: { fontSize: 13, color: '#334155', marginBottom: 4 },
  innerCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  innerCardTitle: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  innerCardSub: { fontSize: 11, color: '#64748B' },
  btnReqDoc: { backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  btnReqDocText: { fontSize: 11, fontWeight: '700', color: '#2563EB' },
  docItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  docItemKey: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  docItemName: { fontSize: 11, color: '#64748B' },
  docActions: { flexDirection: 'row', gap: 6 },
  btnDocAction: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  btnDocActionText: { color: COLORS.white, fontWeight: '700', fontSize: 12 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  docReqBox: { width: '100%', backgroundColor: COLORS.white, borderRadius: 14, padding: 20 },
  docReqTitle: { fontSize: 15, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 12 },
  inputField: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    marginBottom: 10,
  },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 6 },
  btnCancel: { flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 8 },
  btnCancelText: { fontSize: 13, color: '#475569', fontWeight: '600' },
  btnSubmitReq: { flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: '#059669', borderRadius: 8 },
  btnSubmitReqText: { fontSize: 13, color: COLORS.white, fontWeight: '700' },
});
