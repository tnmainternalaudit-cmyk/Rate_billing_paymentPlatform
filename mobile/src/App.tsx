import React, { useState } from 'react';
import { SafeAreaView, Button, Text, View } from 'react-native';
import { LoginScreen } from './screens/Login';
import { SearchScreen } from './screens/Search';
import { BillScreen } from './screens/Bill';
import { PaymentScreen } from './screens/Payment';
import { ReceiptScreen } from './screens/Receipt';
import { SyncScreen } from './screens/Sync';

type Screen = 'search' | 'bill' | 'payment' | 'receipt' | 'sync';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [screen, setScreen] = useState<Screen>('search');

  if (!loggedIn) {
    return <LoginScreen onDone={() => setLoggedIn(true)} />;
  }

  return (
    <SafeAreaView>
      <Text>Tano North Municipal Assembly</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {(['search', 'bill', 'payment', 'receipt', 'sync'] as Screen[]).map((s) => (
          <Button key={s} title={s} onPress={() => setScreen(s)} />
        ))}
      </View>
      {screen === 'search' && <SearchScreen />}
      {screen === 'bill' && <BillScreen />}
      {screen === 'payment' && <PaymentScreen />}
      {screen === 'receipt' && <ReceiptScreen />}
      {screen === 'sync' && <SyncScreen />}
    </SafeAreaView>
  );
}
