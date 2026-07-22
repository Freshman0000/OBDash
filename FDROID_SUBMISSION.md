# F-Droid Submission Guide

Submitting an app to F-Droid is a bit different from the Google Play Store. F-Droid compiles the app from source themselves to ensure it is 100% open-source and free of proprietary trackers.

Because OBDash is built with standard open-source web technologies and Capacitor, it is a great fit for F-Droid!

## Step 1: Prepare Your Repository
Before submitting, ensure your GitHub repository has:
1. An open-source license file (e.g., `LICENSE` containing the MIT or GPL-3.0 text).
2. A clear `README.md` (which we've already set up!).
3. Release tags (e.g., `v1.0.0`) on GitHub.

## Step 2: Create the F-Droid Metadata File
F-Droid uses YAML metadata files in their `fdroiddata` repository to know how to build your app. 

Here is the draft configuration for OBDash. You will need to submit this to F-Droid via a GitLab Merge Request.

### `com.obdash.app.yml`
```yaml
Categories:
  - Navigation
  - System
License: MIT # Change this if you decide on a different open-source license
AuthorName: PlusTwoMedia
AuthorEmail: PLUSTWOMEDIA@gmail.com
WebSite: https://github.com/YourUsername/OBDash
SourceCode: https://github.com/YourUsername/OBDash
IssueTracker: https://github.com/YourUsername/OBDash/issues
Name: OBDash
Summary: Premium Car Launcher & OBD2 Digital Gauge Cluster
Description: |-
  Transform your car's head unit or Android tablet into a high-end digital gauge cluster and car launcher. 
  
  OBDash bridges the gap between luxury OEM interfaces and aggressive race-day telemetry. Connect your OBD2 adapter, integrate your dashcam, and experience real-time engine diagnostics, GPS navigation, media controls, and dashcam recording interfaces in one unified, distraction-free environment.

  Features:
  * Real-time OBD2 telemetry (RPM, Speed, Boost, Temperatures)
  * Fully customizable high-fidelity gauge skins
  * Integrated GPS mini-map and navigation
  * Media playback controls
  * Dashcam and app launcher integrations
  * Completely open-source and tracker-free!

Builds:
  - versionName: '1.0.0'
    versionCode: 1
    commit: v1.0.0
    subdir: android
    sudo:
      - apt-get update || true
      - apt-get install -y nodejs npm
    output: app/build/outputs/apk/release/app-release-unsigned.apk
    build:
      - npm install
      - npm run build
      - npx cap sync android
      - cd android
      - ./gradlew assembleRelease

AutoUpdateMode: Version
UpdateCheckMode: Tags
CurrentVersion: '1.0.0'
CurrentVersionCode: 1
```

## Step 3: Submit to F-Droid (GitLab)

1. Create a free account on [GitLab.com](https://gitlab.com).
2. Go to the [F-Droid Data repository](https://gitlab.com/fdroid/fdroiddata) and click **Fork**.
3. In your forked repository, navigate to the `metadata/` folder.
4. Add a new file named `com.obdash.app.yml` (matching the Android package name inside your `android/app/build.gradle`) and paste the YAML content from above into it.
5. Commit the changes and open a **Merge Request** against the main F-Droid repository.
6. The F-Droid maintainers and automated bots will review the submission, test the build, and let you know if any tweaks are needed.

## Step 4: Fastlane Structure (Optional but Recommended)
To make your app look great on the F-Droid store with screenshots and descriptions, you can add a `fastlane` metadata structure directly inside your GitHub repository.

Create these folders in your GitHub repo:
```text
fastlane/
└── metadata/
    └── android/
        └── en-US/
            ├── title.txt (Contains: OBDash)
            ├── short_description.txt (Contains: Custom Android Car Launcher & OBD2 Digital Dash)
            ├── full_description.txt (Paste your README overview here)
            └── images/
                ├── phoneScreenshots/ (Put your showcase images here)
                └── featureGraphic.png
```
When F-Droid builds your app, it will automatically pull those images and descriptions for the store page!
