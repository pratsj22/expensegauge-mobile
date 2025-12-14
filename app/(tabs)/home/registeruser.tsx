import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import api from "@/api/api";
// import { useAuthStore } from "@/store/authStore";
import { useAdminStore } from "@/store/adminStore";
import { Feather } from "@expo/vector-icons";

export default function Index() {

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [assignBalance, setAssignBalance] = useState("0.00")
    const [buttonDisabled, setButtonDisabled] = useState(false)
    const [error, setError] = useState({
        nameError: '',
        emailError: '',
        passwordError: '',
        passwordvalidationError: '',
        serverError: '',
    })
    const { addUser } = useAdminStore();
    const router = useRouter();


    const validatePasswords = () => {
        if (password && confirmPassword && password !== confirmPassword) {
            setError((prev) => ({ ...prev, passwordvalidationError: "Passwords don't match" }));
        }
        else setError((prev) => ({ ...prev, passwordvalidationError: "" }));
    }
    const validateFields = () => {
        if (!name) {
            setError((prev) => ({ ...prev, nameError: "Please enter name" }));
            return false
        }
        else {
            setError((prev) => ({ ...prev, nameError: "" }));
        }
        if (!email) {
            setError((prev) => ({ ...prev, emailError: "Please enter email" }));
            return false
        }
        else {
            setError((prev) => ({ ...prev, emailError: "" }));
        }
        if (!password) {
            setError((prev) => ({ ...prev, passwordError: "Please enter password" }));
            return false
        }
        else {
            setError((prev) => ({ ...prev, passwordError: "" }));
        }
        if (!confirmPassword) {
            setError((prev) => ({ ...prev, passwordvalidationError: "Please confirm password" }));
            return false
        }
        else {
            setError((prev) => ({ ...prev, passwordvalidationError: "" }));
        }
        if (password && confirmPassword && password !== confirmPassword) {
            setError((prev) => ({ ...prev, passwordvalidationError: "Passwords don't match" }));
            return false
        }
        else setError((prev) => ({ ...prev, passwordvalidationError: "" }));
        return true
    }
    const handleVerify = async () => {
        if (!validateFields()) return;
        try {
            console.log("enterred try");
            const parsedAmount= parseFloat(assignBalance) || 0;
            setButtonDisabled(true)
            const response = await api.post(`/admin/registeruser`, { name, email, password,balance:parsedAmount })
            router.navigate('/(tabs)/home');
            console.log(response);
            addUser({
                _id: response.data.id,
                name,
                netBalance: parsedAmount,
                createdAt: response.data.createdAt,
                expenses:[]
            });

            // router.navigate('/(tabs)/home');
        } catch (error: any) {
            console.log("error aaya", error);

            setButtonDisabled(false)
            // console.log(error.response.data.message);
            setError((prev) => ({ ...prev, serverError: error.response.data.message }));
        }
    }

    return (
        <SafeAreaView className="flex-1 p-6 dark:bg-gray-900 ">
            <View className="flex-[0.5] justify-center items-center">
                <Text className="text-4xl font-bold dark:text-white mb-2">ExpenseGauge</Text>
                <Text className="text-gray-400 text-center">
                    Manage your finances with ease
                </Text>
            </View>
            <Text className="text-2xl text-center font-semibold dark:text-white text-gray-800 mb-6">
                Register a New User
            </Text>
            <View className="flex gap-5 space-y-6">
                {error.serverError && <Text className="text-red-600 -mt-4 -mb-1 px-3 text-center">{error.serverError}</Text>}

                <TextInput
                    className="dark:bg-gray-800 dark:text-white bg-white p-4 rounded-lg text-lg"
                    placeholder="Full Name"
                    placeholderTextColor="#9CA3AF"
                    onChangeText={setName}
                />
                {error.nameError && <Text className="text-red-600 -mt-4 -mb-1 px-3">{error.nameError}</Text>}
                <TextInput
                    className="dark:bg-gray-800 dark:text-white bg-white p-4 rounded-lg text-lg"
                    placeholder="Email"
                    placeholderTextColor="#9CA3AF"
                    onChangeText={setEmail}
                />
                {error.emailError && <Text className="text-red-600 -mt-4 -mb-1 px-3">{error.emailError}</Text>}

                <TextInput
                    className="dark:bg-gray-800 dark:text-white bg-white p-4 rounded-lg text-lg"
                    placeholder="Password"
                    placeholderTextColor="#9CA3AF"
                    onChangeText={setPassword}
                    onBlur={validatePasswords}
                    secureTextEntry
                />
                {error.passwordError && <Text className="text-red-600 -mt-4 -mb-1 px-3">{error.passwordError}</Text>}


                <TextInput
                    className="dark:bg-gray-800 dark:text-white bg-white p-4 rounded-lg text-lg"
                    placeholder="Confirm Password"
                    placeholderTextColor="#9CA3AF"
                    onBlur={validatePasswords}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />
                {error.passwordvalidationError && <Text className="text-red-600 -mt-4 -mb-1 px-3">{error.passwordvalidationError}</Text>}

                <TouchableOpacity disabled={buttonDisabled} className="bg-indigo-600 disabled:bg-indigo-400 py-4 rounded-lg" onPress={handleVerify}>
                    <Text className="text-white text-center text-lg font-semibold">
                        Sign Up
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
