/**
 * VibeLedger Logo Component
 * Custom animated logo for the VibeLedger app
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const VibeLogo = ({ size = 80, animated = true }) => {
  // Animation values without useRef
  const rotateAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const glowAnim = new Animated.Value(0);

  useEffect(() => {
    if (animated) {
      // Logo entrance animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous subtle rotation
      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        })
      );
      rotateAnimation.start();

      return () => {
        rotateAnimation.stop();
      };
    }
  }, [animated]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.8, 0.3],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer glow effect */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            width: size + 20,
            height: size + 20,
            borderRadius: (size + 20) / 2,
            opacity: glowOpacity,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      />
      
      {/* Main logo circle */}
      <Animated.View
        style={[
          styles.logoCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [{ scale: scaleAnim }, { rotate: rotation }],
          },
        ]}
      >
        {/* Inner pattern */}
        <View style={styles.innerPattern}>
          <View style={[styles.segment, styles.segment1]} />
          <View style={[styles.segment, styles.segment2]} />
          <View style={[styles.segment, styles.segment3]} />
          <View style={[styles.segment, styles.segment4]} />
        </View>
        
        {/* Center V symbol */}
        <View style={styles.centerSymbol}>
          <Text style={[styles.vText, { fontSize: size * 0.4 }]}>V</Text>
        </View>
      </Animated.View>
      
      {/* Logo text */}
      <View style={styles.textContainer}>
        <Text style={[styles.logoText, { fontSize: size * 0.15 }]}>VibeLedger</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(0, 122, 255, 0.4)',
  },
  logoCircle: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  innerPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  segment: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  segment1: {
    top: 0,
    left: 0,
    right: '50%',
    bottom: '50%',
    borderBottomRightRadius: 100,
  },
  segment2: {
    top: 0,
    right: 0,
    left: '50%',
    bottom: '50%',
    borderBottomLeftRadius: 100,
  },
  segment3: {
    bottom: 0,
    left: 0,
    right: '50%',
    top: '50%',
    borderTopRightRadius: 100,
  },
  segment4: {
    bottom: 0,
    right: 0,
    left: '50%',
    top: '50%',
    borderTopLeftRadius: 100,
  },
  centerSymbol: {
    width: '60%',
    height: '60%',
    backgroundColor: '#fff',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  vText: {
    color: '#007AFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textContainer: {
    marginTop: 8,
  },
  logoText: {
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

export default VibeLogo;
