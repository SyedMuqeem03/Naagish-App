import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, FlatList, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Typography, Spacing, Shadows } from '@/constants/Theme';
import { scale, fontScale, moderateScale } from '@/utils/ResponsiveUtils';

interface LanguageOption {
  name: string;
  code: string;
}

interface LanguageSelectorProps {
  selectedLanguage: LanguageOption;
  onSelectLanguage: (language: LanguageOption) => void;
  label?: string;
  placeholder?: string;
  options: LanguageOption[];
  style?: any;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onSelectLanguage,
  label,
  placeholder = "Select language",
  options,
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus search input when dropdown opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      // Reset search when dropdown closes
      setSearchQuery("");
      setFilteredOptions(options);
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = options.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [searchQuery, options]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (language: LanguageOption) => {
    onSelectLanguage(language);
    setIsOpen(false);
  };

  const handleOutsidePress = () => {
    setIsOpen(false);
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={styles.selector}
        onPress={toggleDropdown}
        activeOpacity={0.8}
      >
        <Text style={[
          styles.selectorText,
          !selectedLanguage.code && styles.placeholder
        ]}>
          {selectedLanguage.name || placeholder}
        </Text>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color={Colors.text.secondary}
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableWithoutFeedback onPress={handleOutsidePress}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.searchContainer}>
                  <Ionicons name="search" size={20} color={Colors.text.secondary} />
                  <TextInput
                    ref={searchInputRef}
                    style={styles.searchInput}
                    placeholder="Search languages..."
                    placeholderTextColor={Colors.text.secondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery ? (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                      <Ionicons name="close-circle" size={20} color={Colors.text.secondary} />
                    </TouchableOpacity>
                  ) : null}
                </View>

                <FlatList
                  data={filteredOptions}
                  keyExtractor={(item) => item.code}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.optionItem,
                        selectedLanguage.code === item.code && styles.selectedOption
                      ]}
                      onPress={() => handleSelect(item)}
                    >
                      <Text style={[
                        styles.optionText,
                        selectedLanguage.code === item.code && styles.selectedOptionText
                      ]}>
                        {item.name}
                      </Text>
                      {selectedLanguage.code === item.code && (
                        <Ionicons name="checkmark" size={20} color={Colors.primary.light} />
                      )}
                    </TouchableOpacity>
                  )}
                  style={styles.optionsList}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>No languages found</Text>
                    </View>
                  }
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: fontScale(Typography.fontSizes.sm),
    color: Colors.text.secondary,
    marginBottom: scale(8),
    fontWeight: Typography.fontWeights.medium,
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    padding: scale(12),
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    height: scale(48),
  },
  selectorText: {
    fontSize: fontScale(Typography.fontSizes.md),
    color: Colors.text.primary,
    fontWeight: Typography.fontWeights.medium,
  },
  placeholder: {
    color: Colors.text.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    width: '80%',
    maxHeight: scale(400),
    ...Shadows.medium,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
    padding: scale(12),
  },
  searchInput: {
    flex: 1,
    marginLeft: scale(8),
    fontSize: fontScale(Typography.fontSizes.md),
    color: Colors.text.primary,
  },
  optionsList: {
    maxHeight: scale(300),
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.divider,
  },
  selectedOption: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  optionText: {
    fontSize: fontScale(Typography.fontSizes.md),
    color: Colors.text.primary,
  },
  selectedOptionText: {
    color: Colors.primary.light,
    fontWeight: Typography.fontWeights.semiBold,
  },
  emptyContainer: {
    padding: scale(20),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontScale(Typography.fontSizes.md),
    color: Colors.text.secondary,
  },
});