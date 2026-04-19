import React from 'react';
import { Button, Text, View } from 'react-native';
import { syncNow } from '../sync/engine';

export function SyncScreen() {
  return (
    <View>
      <Text>Pending sync count and last sync time</Text>
      <Button title="Sync Now" onPress={() => void syncNow()} />
    </View>
  );
}
