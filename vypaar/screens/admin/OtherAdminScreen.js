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
import {
  OTHER_CATEGORIES,
  OTHER_GOVERNMENT_DEPARTMENTS,
} from '../../config/otherServicesConfig';
import { COLORS } from '../../constants/theme';
import {
  getOtherServiceRequests,
  updateOtherServiceRequestStatus,
} from '../../lib/database';
import { formatINR } from '../../utils/currency';
import { pickFile } from '../../utils/pickFile';

export default function OtherAdminScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [assignedStaff, setAssignedStaff] = useState('');

  // Classification
  const [classifiedCat, setClassifiedCat] = useState('');
  const [classifiedService, setClassifiedService] = useState('');

  // Quote
  const [quoteServiceFee, setQuoteServiceFee] = useState('2500');
  const [quoteGovtFee, setQuoteGovtFee] = useState('0');
  const [quoteGst, setQuoteGst] = useState('0');
  const [quoteDiscount, setQuoteDiscount] = useState('0');

  // Document Request
  const [reqDocName, setReqDocName] = useState('');
  const [reqDocReason, setReqDocReason] = useState('');

  // Final Output Delivery
  const [deliveryDocName, setDeliveryDocName] = useState('');
  const [deliveryFile, setDeliveryFile] = useState(null);

  const [updating, setUpdating] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getOtherServiceRequests();
      setRequests(data || []);
    } catch (err) {
      console.warn('Error fetching other service requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openReqModal = (req) => {
    setSelectedReq(req);
    setNewStatus(req.status || req.applicationStatus || 'submitted');
    setAdminNotes(req.adminRemarks || '');
    setAssignedStaff(req.assignedStaff || 'Senior Legal Advisor');
    setClassifiedCat(req.selectedService?.categoryId || 'gst');
    setClassifiedService(req.selectedService?.name || 'Custom Service');

    const q = req.customQuote || req.quote || {};
    setQuoteServiceFee(String(q.serviceFee || 2500));
    setQuoteGovtFee(String(q.governmentFee || 0));
    setQuoteGst(String(q.gst || 0));
    setQuoteDiscount(String(q.discount || 0));

    setReqDocName('');
    setReqDocReason('');
    setDeliveryDocName('');
    setDeliveryFile(null);
  };

  const handlePickDeliveryFile = async () => {
    try {
      const file = await pickFile();
      if (file) {
        setDeliveryFile(file);
        if (!deliveryDocName) {
          setDeliveryDocName(file.name);
        }
      }
    } catch (err) {
      Alert.alert('File Picker Error', err.message);
    }
  };

  const handleUpdate = async () => {
    if (!selectedReq) return;
    setUpdating(true);
    try {
      const sf = parseFloat(quoteServiceFee) || 0;
      const gf = parseFloat(quoteGovtFee) || 0;
      const gst = parseFloat(quoteGst) || 0;
      const disc = parseFloat(quoteDiscount) || 0;
      const total = Math.max(0, sf + gf + gst - disc);

      const updates = {
        status: newStatus,
        applicationStatus: newStatus,
        adminRemarks: adminNotes,
        assignedStaff: assignedStaff,
        adminClassification: {
          category: classifiedCat,
          service: classifiedService,
          classifiedAt: new Date().toISOString(),
        },
        customQuote: {
          serviceFee: sf,
          governmentFee: gf,
          gst: gst,
          discount: disc,
          total: total,
          quotedAt: new Date().toISOString(),
        },
      };

      if (reqDocName.trim()) {
        updates.additionalDocumentRequest = {
          documentName: reqDocName.trim(),
          reason: reqDocReason.trim() || 'Required for compliance scrutiny',
          requestedAt: new Date().toISOString(),
        };
        updates.status = 'documents_required';
        updates.applicationStatus = 'documents_required';
      }

      if (deliveryFile || deliveryDocName.trim()) {
        updates.finalDocumentDelivery = {
          documentName: deliveryDocName.trim() || 'Filing Acknowledgment',
          fileName: deliveryFile?.name || 'delivery_doc.pdf',
          deliveredAt: new Date().toISOString(),
        };
        updates.status = 'completed';
        updates.applicationStatus = 'completed';
      }

      await updateOtherServiceRequestStatus(selectedReq.id, updates);
      Alert.alert('Success', 'Service request record, quote & status updated');
      setSelectedReq(null);
      fetchRequests();
    } catch (err) {
      Alert.alert('Update Error', err.message || 'Could not update request');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = requests.filter((r) => {
    if (filterStatus === 'ALL') return true;
    return (r.status || r.applicationStatus || 'submitted').toUpperCase() === filterStatus;
  });

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScreenHeader title="Other Services Admin Desk" />

      {/* Status Filter Chips */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
          {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_REQUIRED', 'QUOTE_GENERATED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED'].map((st) => (
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
          <Text style={styles.loadingText}>Loading Other Service Requests...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No requests found</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {filtered.map((req) => {
            const app = req.applicantDetails || {};
            const serviceName = req.selectedService?.name || 'Custom Consultation';
            const urgency = req.requirementDetails?.urgency || 'normal';

            return (
              <TouchableOpacity
                key={req.id}
                style={styles.appCard}
                onPress={() => openReqModal(req)}
                activeOpacity={0.7}
              >
                <View style={styles.cardTop}>
                  <Text style={styles.appId}>{req.applicationId || req.id}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>
                      {(req.status || req.applicationStatus || 'SUBMITTED').toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.entityName}>{app.fullName || req.applicantName || 'Client'}</Text>
                <Text style={styles.serviceSub}>
                  ⚙️ {serviceName} | 🏛️ {(req.requirementDetails?.department || 'GST').toUpperCase()}
                </Text>

                <View style={styles.cardFooter}>
                  <Text
                    style={[
                      styles.urgencyBadge,
                      urgency === 'urgent' && { backgroundColor: '#FEE2E2', color: '#DC2626' },
                    ]}
                  >
                    ⚡ {urgency.replace('_', ' ').toUpperCase()}
                  </Text>
                  <Text style={styles.dateText}>
                    {new Date(req.created_at || req.submittedAt || Date.now()).toLocaleDateString('en-IN')}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Request Details & Action Modal */}
      <Modal visible={!!selectedReq} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedReq?.applicationId || selectedReq?.id}
              </Text>
              <TouchableOpacity onPress={() => setSelectedReq(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 440 }} showsVerticalScrollIndicator={false}>
              {/* Requirement Description */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSecTitle}>Client Requirement Description</Text>
                <Text style={styles.descBox}>
                  {selectedReq?.requirementDetails?.description || 'No description provided.'}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: '700' }}>Applicant:</Text> {selectedReq?.applicantDetails?.fullName} ({selectedReq?.applicantDetails?.mobile}, {selectedReq?.applicantDetails?.email})
                </Text>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: '700' }}>Urgency:</Text> {selectedReq?.requirementDetails?.urgency} (Deadline: {selectedReq?.requirementDetails?.deadlineDate || 'None'})
                </Text>
              </View>

              {/* Status Update */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSecTitle}>Update Workflow Status</Text>
                <View style={styles.statusGrid}>
                  {[
                    { id: 'submitted', label: 'Submitted' },
                    { id: 'under_review', label: 'Under Review' },
                    { id: 'documents_required', label: 'Doc Required' },
                    { id: 'quote_generated', label: 'Quote Issued' },
                    { id: 'in_progress', label: 'In Progress' },
                    { id: 'completed', label: 'Completed' },
                    { id: 'closed', label: 'Closed' },
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

                {/* Assigned Staff */}
                <Text style={styles.inputLabel}>Assigned Legal / CA Case Manager</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. CA Amit Singhal"
                  value={assignedStaff}
                  onChangeText={setAssignedStaff}
                />

                {/* Service Classification */}
                <Text style={styles.inputLabel}>Classify Exact Service</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. GST → Notice Reply"
                  value={classifiedService}
                  onChangeText={setClassifiedService}
                />

                {/* Custom Quote Generator */}
                <View style={styles.quoteBox}>
                  <Text style={styles.quoteBoxTitle}>Custom Fee Quotation Generator</Text>
                  <View style={styles.quoteInputRow}>
                    <View style={styles.half}>
                      <Text style={styles.smallLabel}>Service Fee (₹)</Text>
                      <TextInput
                        style={styles.textInput}
                        value={quoteServiceFee}
                        onChangeText={setQuoteServiceFee}
                        keyboardType="number-pad"
                      />
                    </View>
                    <View style={styles.half}>
                      <Text style={styles.smallLabel}>Govt Fee (₹)</Text>
                      <TextInput
                        style={styles.textInput}
                        value={quoteGovtFee}
                        onChangeText={setQuoteGovtFee}
                        keyboardType="number-pad"
                      />
                    </View>
                  </View>
                </View>

                {/* Request Additional Document */}
                <View style={styles.addDocBox}>
                  <Text style={styles.addDocTitle}>Request Additional Document from Client</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Document Name (e.g. SCN Notice / Bank Statement)"
                    value={reqDocName}
                    onChangeText={setReqDocName}
                  />
                  <TextInput
                    style={[styles.textInput, { marginTop: 6 }]}
                    placeholder="Reason & instructions for user"
                    value={reqDocReason}
                    onChangeText={setReqDocReason}
                  />
                </View>

                {/* Final Document Delivery */}
                <View style={styles.deliveryBox}>
                  <Text style={styles.deliveryTitle}>Deliver Final Document / Acknowledgment</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Document Title (e.g. Filing Acknowledgment / Order Copy)"
                    value={deliveryDocName}
                    onChangeText={setDeliveryDocName}
                  />
                  <TouchableOpacity style={styles.btnPick} onPress={handlePickDeliveryFile}>
                    <Text style={styles.btnPickText}>
                      {deliveryFile ? `✓ Attached: ${deliveryFile.name}` : '+ Attach Output PDF'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Admin Remarks */}
                <Text style={styles.inputLabel}>Case Notes & Remarks</Text>
                <TextInput
                  style={[styles.textInput, { height: 50 }]}
                  placeholder="Internal notes or communication remarks"
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
  entityName: { fontSize: 15, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 2 },
  serviceSub: { fontSize: 12, color: '#475569', marginBottom: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 8 },
  urgencyBadge: { fontSize: 11, fontWeight: '800', color: '#0284C7', backgroundColor: '#E0F2FE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  dateText: { fontSize: 11, color: '#64748B' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: COLORS.primaryDark },
  modalClose: { fontSize: 18, color: '#94A3B8', padding: 4 },
  modalSection: { marginBottom: 14, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 10 },
  modalSecTitle: { fontSize: 13, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 6 },
  descBox: { fontSize: 12, color: COLORS.text, backgroundColor: COLORS.white, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', marginBottom: 8, lineHeight: 16 },
  modalText: { fontSize: 11, color: '#334155', marginBottom: 3 },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  stBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: '#E2E8F0' },
  stBtnSelected: { backgroundColor: '#0284C7' },
  stBtnText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  stBtnTextSelected: { color: COLORS.white, fontWeight: '700' },
  inputLabel: { fontSize: 11, fontWeight: '700', color: '#475569', marginTop: 8, marginBottom: 4 },
  smallLabel: { fontSize: 10, fontWeight: '700', color: '#64748B', marginBottom: 2 },
  textInput: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 12, color: COLORS.text },
  quoteBox: { backgroundColor: '#F0F9FF', padding: 10, borderRadius: 8, marginTop: 10, borderWidth: 1, borderColor: '#BAE6FD' },
  quoteBoxTitle: { fontSize: 11, fontWeight: '800', color: '#0369A1', marginBottom: 6 },
  quoteInputRow: { flexDirection: 'row', gap: 8 },
  half: { flex: 1 },
  addDocBox: { backgroundColor: '#FFFBEB', padding: 10, borderRadius: 8, marginTop: 10, borderWidth: 1, borderColor: '#FDE68A' },
  addDocTitle: { fontSize: 11, fontWeight: '700', color: '#92400E', marginBottom: 6 },
  deliveryBox: { backgroundColor: '#F0FDF4', padding: 10, borderRadius: 8, marginTop: 10, borderWidth: 1, borderColor: '#A7F3D0' },
  deliveryTitle: { fontSize: 11, fontWeight: '700', color: '#065F46', marginBottom: 6 },
  btnPick: { backgroundColor: '#059669', paddingVertical: 8, borderRadius: 6, alignItems: 'center', marginTop: 6 },
  btnPickText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
  btnSave: { backgroundColor: '#059669', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  btnSaveText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
});
