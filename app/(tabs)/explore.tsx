import { useState } from 'react';
import { Image } from 'expo-image';
import { Platform, StyleSheet, Alert } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { BiometricAuthButton } from '@/components/biometric-auth-button';

export default function TabTwoScreen() {
  const [authCount, setAuthCount] = useState(0);

  const handleAuthSuccess = () => {
    setAuthCount(prev => prev + 1);
    Alert.alert(
      '認証成功',
      `生体認証に成功しました！\n認証回数: ${authCount + 1}回`,
      [{ text: 'OK' }]
    );
  };

  const handleAuthFailure = (error: string) => {
    console.log('認証失敗:', error);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Explore
        </ThemedText>
      </ThemedView>
      <ThemedText>This app includes example code to help you get started.</ThemedText>

      <Collapsible title="生体認証 (Biometric Authentication)">
        <ThemedText style={styles.biometricDescription}>
          このアプリは指紋認証や顔認証などの生体認証機能をサポートしています。
          デバイスに登録された生体認証を使用してログインやセキュアな操作を実行できます。
        </ThemedText>
        <ThemedView style={styles.biometricContainer}>
          <BiometricAuthButton
            onAuthSuccess={handleAuthSuccess}
            onAuthFailure={handleAuthFailure}
            buttonText="生体認証を試す"
            promptMessage="本人確認のため認証してください"
            cancelLabel="キャンセル"
            showSupportedTypes
          />
          {authCount > 0 && (
            <ThemedText style={styles.authCountText}>
              認証成功回数: {authCount}回
            </ThemedText>
          )}
        </ThemedView>
        <ThemedText style={styles.usageNote}>
          使い方:
        </ThemedText>
        <ThemedText style={styles.codeExample}>
          {`import { BiometricAuthButton } from '@/components/biometric-auth-button';

<BiometricAuthButton
  onAuthSuccess={() => {
    // 認証成功時の処理
  }}
  onAuthFailure={(error) => {
    // 認証失敗時の処理
  }}
/>`}
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/versions/latest/sdk/local-authentication/">
          <ThemedText type="link">Expo LocalAuthenticationについて詳しく見る</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="File-based routing">
        <ThemedText>
          This app has two screens:{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>
        </ThemedText>
        <ThemedText>
          The layout file in <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{' '}
          sets up the tab navigator.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Android, iOS, and web support">
        <ThemedText>
          You can open this project on Android, iOS, and the web. To open the web version, press{' '}
          <ThemedText type="defaultSemiBold">w</ThemedText> in the terminal running this project.
        </ThemedText>
      </Collapsible>
      <Collapsible title="Images">
        <ThemedText>
          For static images, you can use the <ThemedText type="defaultSemiBold">@2x</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">@3x</ThemedText> suffixes to provide files for
          different screen densities
        </ThemedText>
        <Image
          source={require('@/assets/images/react-logo.png')}
          style={{ width: 100, height: 100, alignSelf: 'center' }}
        />
        <ExternalLink href="https://reactnative.dev/docs/images">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Light and dark mode components">
        <ThemedText>
          This template has light and dark mode support. The{' '}
          <ThemedText type="defaultSemiBold">useColorScheme()</ThemedText> hook lets you inspect
          what the user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Animations">
        <ThemedText>
          This template includes an example of an animated component. The{' '}
          <ThemedText type="defaultSemiBold">components/HelloWave.tsx</ThemedText> component uses
          the powerful{' '}
          <ThemedText type="defaultSemiBold" style={{ fontFamily: Fonts.mono }}>
            react-native-reanimated
          </ThemedText>{' '}
          library to create a waving hand animation.
        </ThemedText>
        {Platform.select({
          ios: (
            <ThemedText>
              The <ThemedText type="defaultSemiBold">components/ParallaxScrollView.tsx</ThemedText>{' '}
              component provides a parallax effect for the header image.
            </ThemedText>
          ),
        })}
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  biometricDescription: {
    marginBottom: 16,
    lineHeight: 22,
  },
  biometricContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  authCountText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  usageNote: {
    marginTop: 20,
    marginBottom: 8,
    fontWeight: '600',
  },
  codeExample: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 12,
    padding: 12,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 8,
    marginVertical: 8,
  },
});
