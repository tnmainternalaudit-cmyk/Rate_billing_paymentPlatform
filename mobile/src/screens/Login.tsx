import React from 'react';
import { Button, Text, View } from 'react-native';

type Props = { onDone: () => void };

export function LoginScreen({ onDone }: Props) {
  return (
    <View>
      <Text>TNMA Revenue Mobile Login (online first login required)</Text>
      <Button title="Login" onPress={onDone} />
    </View>
  );
}
