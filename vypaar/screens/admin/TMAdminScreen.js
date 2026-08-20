import React, { useState, useEffect, useMemo } from 'react';
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
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS } from '../../constants/theme';
import {
  TM_ADMIN_FILTERS,
  TM_APPLICATION_STATUSES,
} from '../../config/trademarkConfig';
import {
  getTMApplications,
  updateTMApplicationStatus,
  updateTMDocumentStatus,
  requestTMDocument,
} from '../../lib/database';
import { formatINR } from '../../utils/currency';

export default function TMAdminScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Inspection Modal State
  const [selectedApp, setSelectedApp] = useState(null);

  // Request Document Modal State
  const [isRequestDocModalOpen, setIsRequestDocModalOpen] = useState(false);
  const [reqDocName, setReqDocName] = useState('');
  const [reqDocReason, setReqDocReason] = useState('');
  const [isActionBusy, setIsActionBusy] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getTMApplications();
      setApplications(data || []);
    } catch (err) {
      console.error('Error fetching TM applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredList = useMemo(() => {
    let list = applications;
    const filterConfig = TM_ADMIN_FILTERS.find((f) => f.id === activeFilter);
    if (filterConfig && filterConfig.statuses) {
      list = list.filter((a) => filterConfig.statuses.includes(a.status));
    }

    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;

    return list.filter(
      (a) =>
        (a.application_id && a.application_id.toLowerCase().includes(q)) ||
        (a.markDetails?.trademarkName &&
          a.markDetails.trademarkName.toLowerCase().includes(q)) ||
        (a.applicantDetails?.applicantLegalName &&
          a.applicantDetails.applicantLegalName.toLowerCase().includes(q))
    );
  }, [applications, activeFilter, searchQuery]);

  const handleStatusChange = async (appId, newStatus) => {
    setIsActionBusy(true);
    try {
      await updateTMApplicationStatus(appId, newStatus);
      setApplications((prev) =>
        prev.map((a) => (a.application_id === appId ? { ...a, status: newStatus } : a))
      );
      if (selectedApp && selectedApp.application_id === appId) {
        setSelectedApp((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setIsActionBusy(false);
    }
  };

  const handleDocStatusChange = async (docId, newStatus, reason = null) => {
    if (!selectedApp) return;
    setIsActionBusy(true);
    try {
      await updateTMDocumentStatus(selectedApp.application_id, docId, newStatus, reason);
      const updatedDocs = (selectedApp.documents || []).map((d) =>
        d.id === docId ? { ...d, status: newStatus, rejectionReason: reason } : d
      );
      setSelectedApp((prev) => ({ ...prev, documents: updatedDocs }));
      setApplications((prev) =>
        prev.map((a) =>
          a.application_id === selectedApp.application_id
            ? { ...a, documents: updatedDocs }
            : a
        )
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to update document status');
    } finally {
      setIsActionBusy(false);
    }
  };

  const handleSendDocumentRequest = async () => {
    if (!reqDocName.trim()) {
      Alert.alert('Required', 'Please enter document name');
      return;
    }
    if (!selectedApp) return;

    setIsActionBusy(true);
    try {
      await requestTMDocument(selectedApp.application_id, reqDocName, reqDocReason);
      await updateTMApplicationStatus(selectedApp.application_id, 'clarification_required');

      Alert.alert('Success', 'Additional document request sent to applicant');
      setIsRequestDocModalOpen(false);
      setReqDocName('');
      setReqDocReason('');
      loadData();
      setSelectedApp(null);
    } catch (err) {
      Alert.alert('Error', 'Failed to send request');
    } finally {
      setIsActionBusy(false);
    }
  };

  const renderItem = ({ item }) => {
    const statusCfg = TM_APPLICATION_STATUSES[item.status] || TM_APPLICATION_STATUSES.submitted;
    const docs = item.documents || [];
    const uploadedDocs = docs.filter(
      (d) => d.status === 'uploaded' || d.status === 'approved' || !!d.file
    );

    return (
      <Pressable
        style={({ pressed }) => [styles.appCard, pressed && styles.pressed]}
        onPress={() => setSelectedApp(item)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.appId}>{item.application_id || 'TM-APP'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.color + '20' }]}>
            <Text style={[styles.statusText, { color: statusCfg.color }]}>
              {statusCfg.label}
            </Text>
          </View>
        </View>

        <Text style={styles.tmName}>
          {item.markDetails?.trademarkName || 'Unnamed Mark'}
        </Text>

        <Text style={styles.applicantInfo}>
          👤 {item.applicantDetails?.applicantLegalName || 'Applicant'} • Class{' '}
          {item.selectedClasses?.join(', ') || '35'}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.feeInfo}>
            {formatINR(item.calculatedFees?.totalPayable || 8000)}
          </Text>
          <Text style={styles.docCount}>
            📁 {uploadedDocs.length}/{docs.length} Docs
          </Text>
          <Text style={styles.viewDetailsText}>Inspect Details ›</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>

      <ScreenHeader
        title="Trademark Admin Desk"
        onBack={() => navigation.goBack()}
      />

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContainer}
      >
        {TM_ADMIN_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[styles.filterChip, activeFilter === f.id && styles.filterChipActive]}
            onPress={() => setActiveFilter(f.id)}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === f.id && styles.filterChipTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Search Input */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by ID, Trademark, or Applicant..."
          placeholderTextColor="#999999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Applications List */}
      {loading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Loading applications...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={(item) => item.application_id || String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>📂</Text>
              <Text style={styles.emptyTitle}>No Applications Found</Text>
              <Text style={styles.emptySub}>
                {searchQuery
                  ? `No applications matched "${searchQuery}"`
                  : 'No applications submitted in this category.'}
              </Text>
            </View>
          }
        />
      )}

      {/* Inspection & Document Review Modal */}
      <Modal
        visible={!!selectedApp}
        animationType="slide"
        onRequestClose={() => setSelectedApp(null)}
      >
        <SafeAreaView style={styles.modalSafeContainer}>
          <View style={styles.modalNavHeader}>
            <Text style={styles.modalAppId} numberOfLines={1}>
              {selectedApp?.application_id} — {selectedApp?.markDetails?.trademarkName}
            </Text>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setSelectedApp(null)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Quick Status Bar */}
            <View style={styles.modalCard}>
              <Text style={styles.modalSectionTitle}>Application Status & Workflow</Text>
              <View style={styles.statusButtonsGrid}>
                {Object.entries(TM_APPLICATION_STATUSES).map(([key, st]) => {
                  const isActive = selectedApp?.status === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.statusToggleBtn,
                        isActive && { backgroundColor: st.color, borderColor: st.color },
                      ]}
                      onPress={() => handleStatusChange(selectedApp.application_id, key)}
                      disabled={isActionBusy}
                    >
                      <Text
                        style={[
                          styles.statusToggleText,
                          isActive && { color: COLORS.white, fontWeight: 'bold' },
                        ]}
                      >
                        {st.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Applicant & Mark Details */}
            <View style={styles.modalCard}>
              <Text style={styles.modalSectionTitle}>👤 Applicant & Trademark</Text>
              <Text style={styles.modalDetailRow}>
                <Text style={styles.modalLabel}>Applicant: </Text>
                {selectedApp?.applicantDetails?.applicantLegalName} ({selectedApp?.applicantType})
              </Text>
              <Text style={styles.modalDetailRow}>
                <Text style={styles.modalLabel}>PAN: </Text>
                {selectedApp?.applicantDetails?.pan}
              </Text>
              <Text style={styles.modalDetailRow}>
                <Text style={styles.modalLabel}>Contact: </Text>
                {selectedApp?.applicantDetails?.mobile} | {selectedApp?.applicantDetails?.email}
              </Text>
              <Text style={styles.modalDetailRow}>
                <Text style={styles.modalLabel}>Classes: </Text>
                Class {selectedApp?.selectedClasses?.join(', ')}
              </Text>
              <Text style={styles.modalDetailRow}>
                <Text style={styles.modalLabel}>Usage: </Text>
                {selectedApp?.usageDetails?.usageStatus === 'used'
                  ? `Prior Use since ${selectedApp?.usageDetails?.firstUseDate}`
                  : 'Proposed to be Used'}
              </Text>
            </View>

            {/* Document Checklist & Verification */}
            <View style={styles.modalCard}>
              <View style={styles.cardHeaderWithBtn}>
                <Text style={styles.modalSectionTitle}>📁 Submitted Documents</Text>
                <TouchableOpacity
                  style={styles.reqDocBtn}
                  onPress={() => setIsRequestDocModalOpen(true)}
                >
                  <Text style={styles.reqDocBtnText}>+ Request Document</Text>
                </TouchableOpacity>
              </View>

              {(selectedApp?.documents || []).map((doc) => {
                const isApproved = doc.status === 'approved';
                const isRejected = doc.status === 'rejected';

                return (
                  <View key={doc.id} style={styles.adminDocRow}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={styles.adminDocLabel}>{doc.label}</Text>
                      <Text style={styles.adminDocSub}>
                        Status: <Text style={{ fontWeight: 'bold' }}>{doc.status}</Text>
                        {doc.file?.name ? ` • ${doc.file.name}` : ''}
                      </Text>
                    </View>

                    <View style={styles.docActionBtns}>
                      <TouchableOpacity
                        style={[styles.approveBtn, isApproved && styles.approveBtnActive]}
                        onPress={() => handleDocStatusChange(doc.id, 'approved')}
                      >
                        <Text style={styles.approveBtnText}>✓</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.rejectBtn, isRejected && styles.rejectBtnActive]}
                        onPress={() => handleDocStatusChange(doc.id, 'rejected', 'Document illegible or invalid')}
                      >
                        <Text style={styles.rejectBtnText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Request Additional Document Modal */}
      <Modal
        visible={isRequestDocModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsRequestDocModalOpen(false)}
      >
        <View style={styles.requestDocOverlay}>
          <View style={styles.requestDocBox}>
            <Text style={styles.requestDocHeading}>Request Additional Document</Text>
            <Text style={styles.requestDocSub}>
              Send a clarification request to the applicant with custom instructions.
            </Text>

            <TextInput
              style={styles.requestInput}
              placeholder="Document Name (e.g. Sales Invoice for Year 2022)"
              placeholderTextColor="#999999"
              value={reqDocName}
              onChangeText={setReqDocName}
            />

            <TextInput
              style={[styles.requestInput, { minHeight: 70, textAlignVertical: 'top' }]}
              placeholder="Reason & instructions for applicant..."
              placeholderTextColor="#999999"
              value={reqDocReason}
              onChangeText={setReqDocReason}
              multiline
            />

            <View style={styles.requestModalBtnsRow}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setIsRequestDocModalOpen(false)}
              >
                <Text style={styles.cancelModalBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sendModalBtn}
                onPress={handleSendDocumentRequest}
                disabled={isActionBusy}
              >
                <Text style={styles.sendModalBtnText}>SEND REQUEST</Text>
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
    backgroundColor: '#F7F9FC',
  },
  pressed: {
    opacity: 0.85,
  },
  filtersScroll: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    maxHeight: 52,
  },
  filtersContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterChipActive: {
    backgroundColor: COLORS.primaryDark,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#222222',
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
    paddingBottom: 24,
  },
  appCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E8EC',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: { elevation: 1 },
      default: {},
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  appId: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  tmName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  applicantInfo: {
    fontSize: 12,
    color: COLORS.grayText,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  feeInfo: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  docCount: {
    fontSize: 12,
    color: COLORS.grayText,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.grayText,
    marginTop: 8,
  },
  emptyWrap: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.grayText,
    textAlign: 'center',
    marginTop: 4,
  },
  modalSafeContainer: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  modalNavHeader: {
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
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    flex: 1,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalCloseText: {
    fontSize: 18,
    color: '#888888',
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 16,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E8EC',
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 10,
  },
  statusButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  statusToggleText: {
    fontSize: 11,
    color: '#475569',
  },
  modalDetailRow: {
    fontSize: 12.5,
    color: '#334155',
    marginBottom: 6,
    lineHeight: 18,
  },
  modalLabel: {
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  cardHeaderWithBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  reqDocBtn: {
    backgroundColor: '#FFF7E6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  reqDocBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  adminDocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  adminDocLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  adminDocSub: {
    fontSize: 11,
    color: COLORS.grayText,
    marginTop: 2,
  },
  docActionBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  approveBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveBtnActive: {
    backgroundColor: COLORS.whatsapp,
    borderColor: COLORS.whatsapp,
  },
  approveBtnText: {
    color: '#15803D',
    fontWeight: 'bold',
    fontSize: 14,
  },
  rejectBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtnActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  rejectBtnText: {
    color: '#DC2626',
    fontWeight: 'bold',
    fontSize: 14,
  },
  requestDocOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  requestDocBox: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 18,
    width: '100%',
    maxWidth: 400,
  },
  requestDocHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  requestDocSub: {
    fontSize: 12,
    color: COLORS.grayText,
    marginBottom: 14,
    lineHeight: 16,
  },
  requestInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 10,
    fontSize: 13,
    color: '#222222',
    marginBottom: 10,
  },
  requestModalBtnsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  cancelModalBtn: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelModalBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#475569',
  },
  sendModalBtn: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendModalBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});
