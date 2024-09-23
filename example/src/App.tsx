import React from 'react';
import { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';

export default function App() {
  const [result, setResult] = useState<number | undefined>();
  const multiply = (a: number, b: number) => {
    return a * b;
  };
  useEffect(() => {
    setResult(multiply(3, 7));
  }, []);

  return (
    <View style={styles.container}>
      <Text>Result: {result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
