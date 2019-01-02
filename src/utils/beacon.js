function shouldBlockBeacon() {
  return (
    window.navigator.doNotTrack === '1' ||
    window.navigator.msDoNotTrack === '1' ||
    window.doNotTrack === '1' ||
    window.msDoNotTrack === '1'
  );
}

export const sendBeacon = type => {
  if (!navigator.sendBeacon || !process.env.PREACT_APP_TRACKING) {
    return;
  }

  if (!shouldBlockBeacon()) {
    navigator.sendBeacon(
      process.env.PREACT_APP_TRACKING,
      JSON.stringify({
        type,
        url: window.location.pathname,
      })
    );
  } else {
    return;
  }
};
