// Manual verification script for login background color
// Run this in browser console on the login page

(function verifyLoginBackground() {
  console.log('🔍 Verifying login background color...');
  
  // Find the login wrapper element
  const loginWrapper = document.querySelector('.watermark-bg');
  
  if (!loginWrapper) {
    console.error('❌ Login wrapper with .watermark-bg class not found!');
    return;
  }
  
  console.log('✅ Found login wrapper with .watermark-bg class');
  
  // Get computed background color
  const computedStyles = window.getComputedStyle(loginWrapper);
  const backgroundColor = computedStyles.backgroundColor;
  const backgroundImage = computedStyles.backgroundImage;
  
  console.log('📊 Computed background color:', backgroundColor);
  console.log('📊 Background image:', backgroundImage);
  
  // Check if background color matches expected red (#D22B2B = rgb(210, 43, 43))
  const expectedColor = 'rgb(210, 43, 43)';
  if (backgroundColor === expectedColor) {
    console.log('✅ Background color matches expected #D22B2B');
  } else {
    console.warn('⚠️  Background color does not match expected #D22B2B');
    console.log('Expected:', expectedColor);
    console.log('Actual:', backgroundColor);
  }
  
  // Check if watermark is present
  if (backgroundImage && backgroundImage !== 'none') {
    console.log('✅ Watermark background image is present');
    
    // Check if watermark contains "Suraj Satyarthi"
    if (backgroundImage.includes('Suraj Satyarthi')) {
      console.log('✅ Watermark contains "Suraj Satyarthi" text');
    } else {
      console.warn('⚠️  Watermark does not contain expected text');
    }
  } else {
    console.error('❌ No watermark background image found');
  }
  
  // Check if body has any conflicting background
  const bodyStyles = window.getComputedStyle(document.body);
  const bodyBackground = bodyStyles.backgroundColor;
  
  if (bodyBackground === 'rgba(0, 0, 0, 0)' || bodyBackground === 'transparent') {
    console.log('✅ Body has no conflicting background color');
  } else {
    console.warn('⚠️  Body has background color that might conflict:', bodyBackground);
  }
  
  console.log('🎉 Login background verification complete!');
})();