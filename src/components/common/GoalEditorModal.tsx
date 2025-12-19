import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Colors } from '../../constants/colors';

interface GoalEditorModalProps {
  visible: boolean;
  appName: string;
  appIcon: string;
  appColor: string;
  currentGoal: number; // in minutes
  onClose: () => void;
  onSave: (goal: number) => void;
}

export const GoalEditorModal: React.FC<GoalEditorModalProps> = ({
  visible,
  appName,
  appIcon,
  appColor,
  currentGoal,
  onClose,
  onSave,
}) => {
  const [hours, setHours] = useState(Math.floor(currentGoal / 60).toString());
  const [minutes, setMinutes] = useState((currentGoal % 60).toString());

  const handleSave = () => {
    const hoursNum = parseInt(hours) || 0;
    const minutesNum = parseInt(minutes) || 0;
    const totalMinutes = hoursNum * 60 + minutesNum;

    if (totalMinutes <= 0) {
      Alert.alert('Invalid Goal', 'Goal must be greater than 0 minutes');
      return;
    }

    if (totalMinutes > 24 * 60) {
      Alert.alert('Invalid Goal', 'Goal cannot exceed 24 hours');
      return;
    }

    onSave(totalMinutes);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={[styles.header, { backgroundColor: appColor + '20' }]}>
            <Text style={styles.icon}>{appIcon}</Text>
            <Text style={styles.appName}>{appName}</Text>
            <Text style={styles.title}>Set Daily Goal</Text>
          </View>

          <View style={styles.content}>
            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Hours</Text>
                <TextInput
                  style={styles.input}
                  value={hours}
                  onChangeText={setHours}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="0"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Minutes</Text>
                <TextInput
                  style={styles.input}
                  value={minutes}
                  onChangeText={setMinutes}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="0"
                />
              </View>
            </View>

            <View style={styles.preview}>
              <Text style={styles.previewLabel}>Total:</Text>
              <Text style={[styles.previewValue, { color: appColor }]}>
                {formatTime(
                  (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0)
                )}
              </Text>
            </View>
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: appColor }]}
              onPress={handleSave}
              activeOpacity={0.7}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const formatTime = (totalMinutes: number): string => {
  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  content: {
    padding: 24,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  inputGroup: {
    alignItems: 'center',
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 2,
    borderColor: Colors.lightGray,
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    width: 100,
    color: Colors.text,
  },
  preview: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
  },
  previewLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  previewValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  buttons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  button: {
    flex: 1,
    padding: 18,
    alignItems: 'center',
  },
  cancelButton: {
    borderRightWidth: 1,
    borderRightColor: Colors.lightGray,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});

