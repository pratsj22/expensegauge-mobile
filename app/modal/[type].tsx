import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View, TextInput, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useExpenseStore } from '../../store/store'
import { Feather } from '@expo/vector-icons';
import { Dropdown, IDropdownRef } from 'react-native-element-dropdown';
import { Keyboard } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Toast } from 'toastify-react-native'


const App = () => {
  const { id, type } = useLocalSearchParams<Record<string, string>>();
  const params = useLocalSearchParams<Record<string, string>>()

  const [amount, setAmount] = useState("");
  const [quantity, setQuantity] = useState("");
  const [details, setDetails] = useState("");
  const [date, setDate] = useState(new Date(Date.now()));
  const { addExpense, editExpense, expenses } = useExpenseStore();
  const [unit, setUnit] = useState('');
  const [show, setShow] = useState(false);
  const dropdownref = useRef<IDropdownRef>(null);
  const router= useRouter()
  useEffect(() => {
    if (id) {
      setAmount(params.amount)
      setDetails(params.details)
      setQuantity(params.quantity)
      setUnit(params.unit)
    }

  }, [])
  const onChange = (event: DateTimePickerEvent, selectedDate: any) => {
    const currentDate = selectedDate;
    setShow(false);
    setDate(currentDate);
  };


  const handleSubmit = () => {
    if (!details){
      Toast.error("Please enter details")
      return;
    } 
    if (!amount){
      Toast.error("Please enter amount")
      return;
    } 

    if (id) editExpense({
      id: id,
      type: type,
      details,
      amount: parseFloat(amount),
      quantity,
      unit,
      day: params.day,
    })
    else addExpense({
      id: Date.now().toString(),
      type: type,
      details,
      amount: parseFloat(amount),
      quantity,
      unit,
      day: date.toDateString(),
    })
    router.back()
  }
  const unitOfMeasurements = [
    { label: 'Kilogram', value: 'kg' },
    { label: 'Gram', value: 'gm' },
    { label: 'Litre', value: 'litre' },
    { label: 'Mililitre', value: 'ml' },
    { label: 'Dozen', value: 'doz' },
    { label: 'Unit', value: 'unit' },
    { label: 'Select Unit', value: '' },
    // Add more units as needed
  ];

  return (
    <SafeAreaView className='flex-1 justify-end bg-slate-700/60'>
      <View className='bg-gray-800 h-fit w-full rounded-lg p-5 items-center'>
        <View className='mb-10 relative w-full'>
          <Text className='text-center text-xl text-gray-200'>Enter the {type} details</Text>
          <Link href={'../'} asChild>
            <Feather
              name="x"
              size={25}
              color="#d1d5db"
              className='absolute right-0 top-0'
            />
          </Link>
        </View>
        <TextInput className='w-full h-16 rounded-lg bg-gray-800 placeholder:text-gray-300 text-gray-100 text-xl p-4 text-left' placeholder='Enter details' onChangeText={setDetails} value={details}></TextInput>
        <Text className='bg-gray-500 h-[0.01px] w-full mb-2'></Text>
        <TextInput className='bg-gray-800 placeholder:text-gray-300 text-gray-200 h-16 p-3 rounded-lg text-xl text-left w-full' placeholder='₹ Amount' keyboardType='number-pad' onChangeText={setAmount} value={amount}></TextInput>
        <Text className='bg-gray-500 h-[0.01px] w-full mb-2'></Text>
        {type == "debit" &&
          <>
            <TextInput className=' bg-gray-800 placeholder:text-gray-300 text-gray-200 p-3 h-16 rounded-lg text-lg w-full text-left' placeholder='Enter Quantity' keyboardType='number-pad' onChangeText={setQuantity} value={quantity}></TextInput>
            <Text className='bg-gray-500 h-[0.01px] w-full mb-2'></Text>
            <TouchableOpacity onPress={() => {
              dropdownref.current?.open()
            }} className=' bg-gray-800 rounded-lg h-16 text-2xl w-full'>
              <Dropdown
                ref={dropdownref}
                data={unitOfMeasurements}
                labelField="label"
                valueField="value"
                value={unit}
                onChange={(item) => setUnit(item.value)}
                dropdownPosition='top'
                style={{
                  backgroundColor: '#1f2937',
                  borderRadius: 8,
                  padding: 10,
                  height: '100%',
                }}
                placeholder='Select Value'
                onFocus={() => {
                  Keyboard.dismiss()
                }}
                containerStyle={{
                  backgroundColor: '#1f2937',
                  marginBottom: 30,
                  borderWidth: 0,
                  elevation: 20
                }}
                selectedTextStyle={{ color: '#d1d5db' }}
                itemTextStyle={{ color: '#d1d5db' }}
                placeholderStyle={{ color: '#d1d5db' }}
                activeColor='#111827'
                iconColor="#d1d5db"
              />

            </TouchableOpacity>
            <Text className='bg-gray-500 h-[0.01px] w-full mb-2'></Text>
          </>

        }
        <TouchableOpacity onPress={() => setShow(true)} className='bg-gray-800 h-16 p-2 rounded-lg w-full flex-row items-center justify-between'>
          <Text className='text-gray-300 p-1 text-xl text-left'>{date.toDateString()}</Text>
          {show && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode='date'
              is24Hour={true}
              onChange={(event, date) => onChange(event, date)}
            />
          )}
          <Feather
            name="calendar"
            size={22}
            color="#d1d5db"
          />
        </TouchableOpacity>
        <Text className='bg-gray-500 h-[0.01px] w-full mb-2'></Text>
        <View className='flex flex-row mt-12 mb-5'>
          <TouchableOpacity
            className='bg-green-500 w-1/3 text-center h-12 rounded-lg justify-center'
            onPress={() => handleSubmit()}>
            <Text className='text-center text-xl text-gray-950 font-semibold'>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default App;