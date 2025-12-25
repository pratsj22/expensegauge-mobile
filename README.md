# ExpenseGauge 📊

ExpenseGauge is a high-performance, cross-platform expense management application built with Expo and React Native. It features a robust **offline-first architecture**, **intelligent expense classification**, and a sophisticated administrative ecosystem.

## ✨ Features

- **🛡️ Secure Authentication**: Google Sign-in integration for seamless and secure user access.
- **☁️ Offline-First Strategy**: 
  - **Optimistic Updates**: Immediate UI feedback for all transactions.
  - **Sync Queue**: Automatic background synchronization of queued requests when connectivity is restored.
- **🤖 Intelligent Categorization**: Integrated Bayes classifier (`categoryDetector.js`) for automatic expense category prediction based on descriptions.
- **� Advanced Visualizations**: Monthly spending trends and category breakdowns via `react-native-chart-kit`.
- **👥 Admin Suite**: Specialized dashboards for user oversight, balance adjustments, and transaction auditing.
- **🌓 Adaptive Theming**: Persistent light and dark mode support with automatic system preference detection.

## 🛠️ Tech Stack

### Framework & Core
- **Engine**: [Expo](https://expo.dev/) (React Native 0.81.5)
- **Framework**: [Expo](https://expo.dev/) (React Native)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (Link-based navigation)
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- **State Management**: [Zustand](https://www.npmjs.com/package/zustand)
- **UI Components**:
  - [React Native Paper](https://www.npmjs.com/package/react-native-paper) (Main UI Lib)
  - [React Native Element Dropdown](https://www.npmjs.com/package/react-native-element-dropdown)
  - [Expo Vector Icons](https://docs.expo.dev/guides/icons/) (Feather, FontAwesome)
  - [React Native Community DateTimePicker](https://www.npmjs.com/package/@react-native-community/datetimepicker)
  - [Toastify React Native](https://www.npmjs.com/package/toastify-react-native)
- **API Client**: [Axios](https://axios-http.com/) with `axios-retry`
- **Charts**: [React Native Chart Kit](https://www.npmjs.com/package/react-native-chart-kit)
- **Data Persistence**: [Async Storage](https://www.npmjs.com/package/@react-native-async-storage/async-storage) & [Secure Store](https://docs.expo.dev/versions/latest/sdk/securestore/)

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest LTS)
- npm or yarn
- Expo Go app on your mobile device (for testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd expensegauge-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```


3. **Start the development server**
   ```bash
   npx expo start
   ```

## 🏗️ Building for Production

To build the production version (AAB for Play Store):

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Build Android App Bundle**
   ```bash
   eas build -p android --profile production
   ```

2. **Testing APK**
   ```bash
   eas build -p android --profile preview
   ```

---

Made with ❤️ by [spider22](https://github.com/spider22)
