import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { Feather } from '@expo/vector-icons'
import { useAuthStore } from '@/store/authStore'
import api from '@/api/api'
import { router } from 'expo-router'
import { useExpenseStore } from '@/store/expenseStore'

const LogoutModal = ({ setShow }: any) => {
    const { reset, refreshToken } = useAuthStore();
    const handleLogout = async () => {
        try {
            const response = await api.post(`/user/logout`, { refreshToken })
            const { setCachedExpenses } = useExpenseStore.getState()
            setCachedExpenses([],0)
            reset()
            setShow(false)
            router.replace('/')
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <View className='bg-black/70 flex-row items-center justify-center w-screen h-screen absolute top-0 left-0 -ml-6 -mt-6'>
            <View className='bg-white dark:bg-gray-900 flex-col w-10/12 rounded-lg border border-gray-200 dark:border-gray-800 shadow-md'>
                <View className=''>
                    <View className='flex-row items-center px-3 border-b border-gray-200 dark:border-gray-800'>
                        <Feather name='alert-triangle' color={'red'} size={20} />
                        <Text className='dark:text-white font-semibold p-4 px-3 text-lg'>Logout</Text>
                    </View>
                </View>
                <View className='p-3 px-10'>
                    <Text className='text-gray-500 dark:text-gray-300 mb-5'>Are you sure you want to logout?</Text>
                    <View className='flex-row gap-4 justify-end mb-2'>
                        <TouchableOpacity className='border border-gray-300 dark:border-gray-600 rounded-md p-2 px-3' onPress={() => setShow(false)}>
                            <Text className='dark:text-gray-300'>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className='rounded-md p-2 px-3 bg-red-600' onPress={handleLogout}>
                            <Text className='text-white'>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default LogoutModal