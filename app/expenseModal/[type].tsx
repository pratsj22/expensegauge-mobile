import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Dropdown, IDropdownRef } from "react-native-element-dropdown";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Toast } from "toastify-react-native";

import { useExpenseStore } from "@/store/expenseStore";
import { useAdminStore } from "@/store/adminStore";
import { predictCategory } from "@/helper/categoryDetector";
import {
  addExpenseApi,
  editExpenseApi,
  editUserExpenseAdminApi,
  assignBalanceApi,
} from "@/api/expenseApi";

import LoaderModal from "../expenseModal/LoaderModal";

// ------------------ Constants ------------------
const categories = [
  { label: "Groceries", value: "Groceries" },
  { label: "Healthcare", value: "Healthcare" },
  { label: "Food & Dining", value: "Food & Dining" },
  { label: "Bills & Utilities", value: "Bills & Utilities" },
  { label: "Entertainment", value: "Entertainment" },
  { label: "Transport", value: "Transport" },
  { label: "Education", value: "Education" },
  { label: "Shopping", value: "Shopping" },
  { label: "Other", value: "Other" },
];

// ------------------ Component ------------------
const ExpenseForm = () => {
  const { _id, type, userIdAdmin, ...params } = useLocalSearchParams<Record<string, string>>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  
  const { addExpense, editExpense, markAsSynced } = useExpenseStore();
  const { assignBalance, editUserExpenseByAdmin, markAsSyncedAdmin } = useAdminStore();

  const dropdownRef = useRef<IDropdownRef>(null);
  const timeoutRef = useRef<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [containerPadding, setContainerPadding] = useState(0);

  // Unified form state
  const [form, setForm] = useState({
    amount: "",
    details: "",
    category: "",
    date: new Date(),
  });

  const updateForm = (field: keyof typeof form, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // ------------------ Lifecycle ------------------

  useEffect(() => {
    if (_id) {
      setForm({
        amount: params.amount || "",
        details: params.details || "",
        category: params.category || "",
        date: new Date(params.date),
      });
    }
  }, [_id]);

  useEffect(() => {
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setContainerPadding(0));
    return () => hideSub.remove();
  }, []);

  // ------------------ Handlers ------------------

  const handleFocus = () => {
    setContainerPadding(() => (Platform.OS === "ios" ? 300 : 200));
  };

  const handleCategoryDetect = () => {
    const detected = predictCategory(form.details);
    if (detected) updateForm("category", detected);
  };

  const buildTransaction = useCallback(
    (overrides = {}) => ({
      _id: _id || Date.now().toString(),
      type,
      details: form.details,
      amount: parseFloat(form.amount),
      category: form.category,
      date: form.date.toDateString(),
      isSynced: "false",
      ...overrides,
    }),
    [_id, type, form]
  );

  // ------------------ Submit Logic ------------------

  const handleAdminSubmit = async () => {
    if (!form.details || !form.amount) {
      Toast.error("Please enter details and amount");
      return;
    }
    
    setLoading(true);
    try {
      const transactionData = buildTransaction();
      if (_id) {
        editUserExpenseByAdmin(userIdAdmin, transactionData);
        await editUserExpenseAdminApi(userIdAdmin, transactionData);
        markAsSyncedAdmin(_id, _id,userIdAdmin);
      } else {
        const newId = await assignBalanceApi(
          userIdAdmin,
          form.details,
          form.date.toDateString(),
          parseFloat(form.amount)
        );
        assignBalance(userIdAdmin, transactionData);
        markAsSyncedAdmin(transactionData._id,newId,userIdAdmin)
      }
      router.back();
    } catch (error) {
      Toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async () => {
    if (!form.details || !form.amount) {
      Toast.error("Please enter details and amount");
      return;
    }
    
    setLoading(true);
    try {
      if (_id) {
        const transactionData = buildTransaction();
        editExpense(transactionData);
        await editExpenseApi(transactionData);
        markAsSynced(_id,_id);
      } else {
        const transactionData = buildTransaction();
        addExpense(transactionData);
        const newExpenseId = await addExpenseApi(transactionData);
        if (newExpenseId) markAsSynced(transactionData._id, newExpenseId);
      }
      router.back();
    } catch (error) {
      Toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => (userIdAdmin ? handleAdminSubmit() : handleUserSubmit());

  // ------------------ Render ------------------

  const backcolor = colorScheme === "light" ? "white" : "#111827";
  const textColor = colorScheme === "light" ? "black" : "#d1d5db";

  return (
    <SafeAreaView className="flex-1 bg-slate-700/60 justify-end" style={{ paddingBottom: containerPadding }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="dark:bg-gray-900 bg-white w-full rounded-lg p-5 items-center">
          {/* Header */}
          <View className="mb-10 relative w-full">
            <Text className="text-center text-xl dark:text-gray-200">
              Enter the {type} details
            </Text>
            <Link href={"../"} asChild>
              <Feather name="x" size={25} color={textColor} className="absolute right-0 top-0" />
            </Link>
          </View>

          {/* Details */}
          <TextInput
            className="w-full h-16 rounded-lg dark:bg-gray-900 bg-white placeholder:text-gray-400 dark:placeholder:text-gray-300 dark:text-gray-100 text-xl p-4"
            placeholder="Enter details"
            value={form.details}
            onChangeText={(v) => updateForm("details", v)}
            onFocus={handleFocus}
            onBlur={handleCategoryDetect} // ✅ Restored original behavior
          />

          {/* Amount */}
          <TextInput
            className="dark:bg-gray-900 bg-white placeholder:text-gray-400 dark:placeholder:text-gray-300 dark:text-gray-200 h-16 p-3 rounded-lg text-xl w-full mt-3"
            placeholder="₹ Amount"
            keyboardType="number-pad"
            value={form.amount}
            onChangeText={(v) => updateForm("amount", v)}
            onFocus={handleFocus}
          />

          {/* Category Dropdown (for debit) */}
          {type === "debit" && (
            <TouchableOpacity
              onPress={() => {
                Keyboard.dismiss();
                timeoutRef.current = setTimeout(() => dropdownRef.current?.open(), 100);
              }}
              className="dark:bg-gray-900 bg-white rounded-lg h-16 w-full mt-3"
            >
              <Dropdown
                ref={dropdownRef}
                data={categories}
                labelField="label"
                valueField="value"
                value={form.category}
                onChange={(item) => updateForm("category", item.value)}
                dropdownPosition="top"
                style={{
                  backgroundColor: backcolor,
                  borderRadius: 8,
                  padding: 10,
                  height: "100%",
                  pointerEvents: "none",
                }}
                containerStyle={{
                  backgroundColor: backcolor,
                  marginBottom: 30,
                  borderWidth: 0,
                  elevation: 20,
                }}
                selectedTextStyle={{ color: textColor }}
                itemTextStyle={{ color: textColor }}
                placeholderStyle={{ color: "#d1d5db" }}
                activeColor={backcolor}
                iconColor={textColor}
              />
            </TouchableOpacity>
          )}

          {/* Date Picker */}
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="dark:bg-gray-900 bg-white h-16 p-2 rounded-lg w-full flex-row items-center justify-between mt-3"
          >
            <Text className="dark:text-gray-300 p-1 text-xl">{form.date.toDateString()}</Text>
            {showDatePicker && (
              <DateTimePicker
                value={form.date}
                mode="date"
                is24Hour
                onChange={(e: DateTimePickerEvent, selectedDate: any) => {
                  setShowDatePicker(false);
                  if (selectedDate) updateForm("date", selectedDate);
                }}
              />
            )}
            <Feather name="calendar" size={22} color={textColor} />
          </TouchableOpacity>

          {/* Submit */}
          <View className="flex flex-row mt-10 mb-5">
            <TouchableOpacity
              className="bg-green-500 w-1/3 h-12 rounded-lg justify-center"
              onPress={handleSubmit}
            >
              <Text className="text-center text-xl text-gray-950 font-semibold">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>

      {/* Loader */}
      <LoaderModal
        visible={loading}
        message={
          _id
            ? "Updating expense..."
            : userIdAdmin
            ? "Assigning balance to user..."
            : "Adding expense..."
        }
      />
    </SafeAreaView>
  );
};

export default ExpenseForm;
