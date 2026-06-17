# Technical Design Document: State-Driven Layout Blueprint Gauge Cluster

## 1. Modular Grid Schema

**Display Target:** 12.3-inch Ultra-wide Display (e.g., 1920x720 resolution).
**Grid System:** 12-column flexible grid.

*   **Total Columns:** 12
*   **Gutter:** 16dp
*   **Margin:** 24dp

**Widget Span Definitions:**
*   `SpeedometerWidget`: 4 columns (Standard), 6 columns (Performance Mode)
*   `TachometerWidget` (RPM): 4 columns (Standard), 6 columns (Performance Mode)
*   `MediaWidget`: 3 columns (Standard), 8 columns (Parked Mode)
*   `NavigationWidget`: 4 columns (Standard), 8 columns (Commute Mode)
*   `OBDSensorWidget` (Temps/Pressures): 2 columns (Standard), 3 columns (Detail View)

## 2. Realistic Textures (PBR Theme)

**Theme Name:** Apex Predator  
**Vibe:** Race-inspired, modern, aggressive, 3D layered.

### Materials

**1. Brushed Dark Titanium (Base Layer & Bezels)**
*   **Base Color (Albedo):** `#1A1C20`
*   **Metallic:** 0.9 (Highly metallic)
*   **Roughness:** 0.4 (Brushed finish, not perfectly reflective)
*   **Normal Map:** Linear brushed noise along the X-axis to simulate machine turning.

**2. Frosted Smoked Glass (Widget Containers & Overlays)**
*   **Base Color:** `#0A0B10` with 40% opacity (`0x660A0B10`)
*   **Blur Radius (Backdrop Filter):** 24px (Heavy frosted effect)
*   **Edge Highlight (Inner Stroke):** 1px `#ffffff` at 15% opacity to catch virtual light.
*   **Drop Shadow:** 
    *   *Depth 1:* Y: 8px, Blur: 16px, Color: `#000000` at 60% opacity (Ambient)
    *   *Depth 2:* Y: 24px, Blur: 32px, Color: `#000000` at 80% opacity (Directional)

### GLSL Shader Properties (Glass Effect)
```glsl
uniform sampler2D u_Background; // Captured background behind the glass
uniform vec2 u_ScreenResolution;
uniform float u_BlurRadius; // 24.0
uniform vec4 u_GlassTint; // vec4(0.04, 0.04, 0.06, 0.4)
uniform vec2 u_LightDir; // vec2(0.5, 0.8)

// Fragment Shader Pseudo-properties
float specular = pow(max(dot(reflect(-u_LightDir, normal), viewDir), 0.0), 64.0);
vec4 blurredBackdrop = applyGaussianKernel(u_Background, currentUV, u_BlurRadius);
vec4 finalColor = mix(blurredBackdrop, u_GlassTint, u_GlassTint.a) + (specular * 0.15);
```

## 3. Dynamic States (JSON State Machine)

```json
{
  "modes": {
    "commute": {
      "focus": "navigation",
      "layout": [
        { "widgetId": "speedometer", "span": 3, "position": "left" },
        { "widgetId": "navigation", "span": 6, "position": "center" },
        { "widgetId": "media", "span": 3, "position": "right" }
      ],
      "themeOverrides": {
        "accentColor": "#00E5FF",
        "glowIntensity": 0.4
      }
    },
    "performance": {
      "focus": "telemetry",
      "layout": [
        { "widgetId": "obd_sensors", "span": 3, "position": "left" },
        { "widgetId": "tachometer_speed_combo", "span": 6, "position": "center" },
        { "widgetId": "g_force", "span": 3, "position": "right" }
      ],
      "themeOverrides": {
        "accentColor": "#FF3366",
        "glowIntensity": 1.0
      }
    },
    "parked": {
      "focus": "media_apps",
      "layout": [
        { "widgetId": "vehicle_status", "span": 4, "position": "left" },
        { "widgetId": "media", "span": 8, "position": "right" }
      ],
      "themeOverrides": {
        "accentColor": "#BDBDBD",
        "glowIntensity": 0.2
      }
    }
  }
}
```

## 4. Animated Elements (Rive Logic)

**Element:** Digital Tachometer Needle  
**Rive State Machine:** `TachometerSM`

*   **Inputs:**
    *   `rpm` (Number): 0 to 10000
    *   `isShifting` (Boolean): Triggered on gear change.
*   **Listeners/Logic:**
    *   **Physics-Based Bounce:** The needle rotation is driven by a Blend State mapped to the `rpm` input. An interpolation property with a spring modifier (Tension: 300, Friction: 20) is applied to the rotation value to create a physical bounce when RPM drops rapidly or snaps.
    *   **Glowing Trail:** A secondary shape layer follows the needle's rotation with a slight delay (0.05s). Its opacity is mapped to the rate of change (delta) of the `rpm` input. When `rpm` increases rapidly, the trail opacity hits 100% and uses an additive blend mode.
    *   **Shift Shock:** When `isShifting` is true, an animation state injects a high-frequency, low-amplitude rotational shake (jitter) to the needle root bone for 0.15s before returning to the interpolated `rpm` state.

## 5. Kotlin Pseudo-Code Structure (Jetpack Compose)

```kotlin
// DashboardManager.kt

/**
 * Manages the transition of dashboard states and drives the Compose UI.
 */
class DashboardManager {
    private val _currentMode = MutableStateFlow<DashboardMode>(DashboardMode.COMMUTE)
    val currentMode: StateFlow<DashboardMode> = _currentMode

    private val layoutSchemaDecoder = LayoutSchemaDecoder()

    fun switchMode(newMode: DashboardMode) {
        // Trigger exit animations for current layout
        // Retrieve new layout configuration from JSON schema
        // Push new mode to state flow to trigger Compose recomposition
        _currentMode.value = newMode
    }
}

enum class DashboardMode {
    COMMUTE, PERFORMANCE, PARKED
}

// Composables.kt

@Composable
fun DashboardHost(manager: DashboardManager, vehicleTelemetry: VehicleTelemetryFlow) {
    val currentMode by manager.currentMode.collectAsState()
    val layoutConfig = remember(currentMode) { getLayoutConfigForMode(currentMode) }

    // Animate grid column widths during mode transitions
    val transition = updateTransition(targetState = currentMode, label = "ModeTransition")

    Row(
        modifier = Modifier
            .fillMaxSize()
            .background(color = DarkTitaniumBase) // #1A1C20
            .padding(horizontal = 24.dp),
        horizontalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        layoutConfig.widgets.forEach { widgetConf ->
            // Animated fraction for column spanning
            val weight by transition.animateFloat(
                transitionSpec = { spring(stiffness = Spring.StiffnessLow) },
                label = "WidgetSpan"
            ) { mode -> 
               getLayoutConfigForMode(mode).widgets.find { it.id == widgetConf.id }?.span?.toFloat() ?: 0f 
            }

            if (weight > 0f) {
                WidgetContainer(
                    modifier = Modifier.weight(weight),
                    widgetConf = widgetConf,
                    telemetry = vehicleTelemetry
                )
            }
        }
    }
}

@Composable
fun WidgetContainer(modifier: Modifier, widgetConf: WidgetConfig, telemetry: VehicleTelemetryFlow) {
    // Frosted Glass Effect using RenderEffect (API 31+) or custom modifier
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .background(Color(0x660A0B10))
            .border(1.dp, Color.White.copy(alpha = 0.15f), RoundedCornerShape(16.dp))
            // Pseudo-glass shader modifier applying GLSL runtime
            .glassEffect(blurRadius = 24f) 
    ) {
        // Rive animation or standard compose widget based on config
        when (widgetConf.id) {
            "speedometer" -> RiveSpeedometer(telemetry.speed)
            "tachometer_speed_combo" -> RiveTachometer(telemetry.rpm)
            "media" -> MediaWidget(telemetry.mediaState)
            // ... other widgets
        }
    }
}
```
