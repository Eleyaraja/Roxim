const initializeInterview = async () => {
  try {
    // ...
  } catch (error: any) {
    console.error('❌ Failed to initialize interview:', error)
    setAvatarState('idle')
    setShowTimeout(true)
    // ...
  }
}
