# Video Assets Folder

Place pre-rendered MP4 video files in this directory matching the `videoFileMap` dictionary defined in `src/utils/videoResolver.ts`:

```ts
const videoFileMap = {
  dep_01_wake: {
    lg: "/videos/first_scene_laptop.mp4",
    sm: "/videos/first_scene_mobile.mp4"
  },
  dep_02_meadow: {
    lg: "/videos/sunny_medow_result_laptop.mp4",
    sm: "/videos/sunny_medow_result_mobile.mp4"
  },
  dep_02_rain: {
    lg: "/videos/Fox_walking_in_rainy_forest_laptop.mp4",
    sm: "/videos/Fox_walking_in_rainy_forest_mobile.mp4"
  },
  anx_01_invite: {
    lg: "/videos/game_invite_laptop.mp4",
    sm: "/videos/game_invite_mobile.mp4"
  },
  anx_02_join: {
    lg: "/videos/game_invite_accept_laptop.mp4",
    sm: "/videos/game_invite_accept_mobile.mp4"
  }
  // Any sceneId not listed here has no real video yet -> falls back to placeholder div
};
```

### Portal Access Credentials

1. **Parent / Clinician Credentials**:
   - Role: `Parent / Clinician`
   - Passcode / PIN: **`1234`** or **`parent123`**
   - Access: View 3-band domain scores (Typical, Worth Watching, Talk to a Professional), path replay timeline, session history, and export records.

2. **System Admin Credentials**:
   - Role: `System Admin`
   - Passcode / PIN: **`admin9999`** or **`admin123`**
   - Access: Elevated privileges, Admin System Control Center, graph status auditing, and raw scoring configurations.

> **Note:** If a scene ID is not present in `videoFileMap` or its video file fails to load, Finn's Way automatically renders an interactive visual canvas fallback with story text overlay. No arbitrary filename patterns are guessed.
