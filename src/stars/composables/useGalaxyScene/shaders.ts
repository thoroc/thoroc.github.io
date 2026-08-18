import { GALAXY_ZOOM } from '../../galaxy/constants'
import { GALAXY_MOTION_GLSL } from '../../galaxy/motion'

export const vertexShader = `
attribute float aSize;
attribute float aBright;
attribute float aActivity;
attribute float aIndex;
attribute float aRingStar;
attribute vec3 aInteraction;
attribute vec3 color;
uniform float uTime;
uniform float uMotionTime;
uniform float uPixelRatio;
${GALAXY_MOTION_GLSL}
varying vec3 vColor;
varying float vTwinkle;
varying float vBright;
varying float vActivity;
varying float vHighlight;
varying float vIsHovered;
varying float vIsSelected;
varying float vRingStar;
varying float vFogDepth;
varying float vSpikeSeed;

void main() {
  vColor = color;
  vBright = aBright;
  vActivity = aActivity;
  vHighlight = aInteraction.x;
  vIsSelected = aInteraction.y;
  vIsHovered = aInteraction.z;
  vRingStar = aRingStar;
  vSpikeSeed = fract(aIndex * 0.618033 + aBright * 0.371);
  float act = pow(aActivity, 1.4);
  float twGate = smoothstep(0.26, 0.6, act);
  float twAmp = mix(0.0, 0.62, smoothstep(0.34, 0.9, act));
  float twSpd = mix(0.32, 2.9, smoothstep(0.38, 0.94, act));
  float phase = uTime * twSpd * 0.62 + aIndex * 1.73;
  vTwinkle = 1.0;
  if (twGate > 0.001) {
    vTwinkle = 1.0 - twAmp * twGate + twAmp * twGate * (0.5 + 0.5 * sin(phase));
    vTwinkle += act * 0.16 * twGate * sin(phase * 2.15 + aIndex * 0.41);
    float breathGate = smoothstep(0.42, 0.72, act);
    vTwinkle += breathGate * 0.07 * sin(uTime * 0.78 + aIndex * 2.1);
    float flashGate = smoothstep(0.76, 0.93, act);
    float flickPhase = floor(uTime * (0.95 + act * 2.4) + aIndex * 0.83);
    float flickRand = fract(sin(flickPhase * 127.1 + aIndex * 311.7) * 43758.5453);
    vTwinkle += step(0.87, flickRand) * flashGate * 0.38;
  }
  vec3 worldPos = applyGalaxyMotion(position);
  vec4 mvPosition = modelViewMatrix * vec4(worldPos, 1.0);
  float selectPulse = 0.86 + 0.14 * sin(uTime * 4.6 + aIndex * 0.37);
  float hoverScale = 1.0 + vIsSelected * (0.58 * selectPulse) + vIsHovered * (1.0 - vIsSelected) * 0.3;
  float distScale = clamp(${GALAXY_ZOOM.POINT_DIST_SCALE_DIV.toFixed(1)} / max(-mvPosition.z, ${GALAXY_ZOOM.POINT_VIEW_Z_MIN.toFixed(1)}), ${GALAXY_ZOOM.POINT_DIST_SCALE_MIN.toFixed(1)}, ${GALAXY_ZOOM.POINT_DIST_SCALE_MAX.toFixed(1)});
  float s = aSize * (0.36 + vBright * 0.2) * vTwinkle * hoverScale * uPixelRatio * distScale * (1.0 - aRingStar * 0.1);
  gl_PointSize = clamp(s, 0.55, ${GALAXY_ZOOM.POINT_SIZE_MAX.toFixed(1)});
  vFogDepth = max(-mvPosition.z, 0.0);
  gl_Position = projectionMatrix * mvPosition;
}
`

export const fragmentShader = `
varying vec3 vColor;
varying float vTwinkle;
varying float vBright;
varying float vActivity;
varying float vHighlight;
varying float vIsHovered;
varying float vIsSelected;
varying float vRingStar;
varying float vFogDepth;
varying float vSpikeSeed;
uniform float uTime;
uniform float uDensityScale;
uniform float uFogDensity;

void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);
  float dist = length(uv);
  float mask = 1.0 - smoothstep(0.42, 0.465, dist);
  if (mask < 0.01) discard;

  float act = pow(vActivity, 1.4);
  float twGate = smoothstep(0.26, 0.6, act);
  float dim = mix(0.28, 1.0, vHighlight);

  float core = exp(-dist * dist * 24.0);
  float halo = exp(-dist * dist * 9.0) * 0.16;
  float lum = clamp(vBright, 0.0, 1.0);
  float spikeGate = smoothstep(0.18, 0.78, lum);
  float spikeAng = vSpikeSeed * 6.28318 + lum * 1.7;
  float ca = cos(spikeAng);
  float sa = sin(spikeAng);
  vec2 ruv = vec2(uv.x * ca - uv.y * sa, uv.x * sa + uv.y * ca);
  float sx = exp(-abs(ruv.x) * 22.0) * exp(-abs(ruv.y) * 5.5);
  float sy = exp(-abs(ruv.y) * 22.0) * exp(-abs(ruv.x) * 5.5);
  float d1 = exp(-abs(ruv.x + ruv.y) * 18.0) * exp(-abs(ruv.x - ruv.y) * 7.0);
  float d2 = exp(-abs(ruv.x - ruv.y) * 18.0) * exp(-abs(ruv.x + ruv.y) * 7.0);
  float crossSpikes = (sx + sy) * spikeGate;
  float diagSpikes = (d1 + d2) * smoothstep(0.48, 0.9, lum) * 0.42;
  float spikes = (crossSpikes * 0.72 + diagSpikes) * (0.32 + lum * 0.55);

  float twinkle = mix(1.0, mix(0.72, 1.18, clamp(vTwinkle, 0.0, 1.4)), twGate);
  float breath = 1.0 + 0.04 * sin(uTime * 1.05 + act * 5.8) * smoothstep(0.38, 0.72, act);
  float pulse = 1.0 + 0.05 * sin(uTime * 1.75 + vActivity * 6.0) * smoothstep(0.5, 0.84, act);
  float flashGate = smoothstep(0.78, 0.94, act);
  float flick = fract(sin(floor(uTime * (0.85 + act * 2.0) + act * 12.0) * 127.1) * 43758.5453);
  float flashBurst = step(0.9, flick) * flashGate * 0.35;
  float actGlow = mix(0.92, 1.08, smoothstep(0.32, 0.88, act));
  float alpha = (core * 0.92 + halo + spikes) * twinkle * actGlow * pulse * breath;
  alpha *= 1.0 + flashBurst * 0.45;
  alpha *= clamp(vBright * 0.55 + 0.18, 0.14, 0.88) * mask * dim;
  alpha += spikes * 0.38 * spikeGate;

  float selectPulse = 0.86 + 0.14 * sin(uTime * 5.2 + dist * 14.0);
  float selectRing = smoothstep(0.44, 0.3, dist) * smoothstep(0.12, 0.22, dist);
  alpha += vIsSelected * (core * 0.65 + selectRing * 0.45) * selectPulse;
  alpha += vIsHovered * (1.0 - vIsSelected) * core * 0.28;
  alpha = clamp(alpha * uDensityScale, 0.0, 0.72);

  vec3 col = vColor * (0.84 + core * 0.38 + lum * 0.2);
  col += vColor * halo * 0.48;
  col += vColor * spikes * 0.62;
  vec3 hotCore = vColor * (1.0 + core * 0.22 + spikes * 0.18);
  col = mix(col, hotCore, core * 0.2 + spikes * 0.14 + vIsSelected * core * 0.32);
  col *= (0.88 + twinkle * 0.16) * pulse * breath * dim;
  col *= 1.0 + flashBurst * 0.28;
  col *= 1.0 + vIsSelected * 0.45 + vIsHovered * (1.0 - vIsSelected) * 0.22;

  float fogFactor = 1.0 - exp(-uFogDensity * uFogDensity * vFogDepth * vFogDepth);
  vec3 fogCol = vec3(0.022, 0.034, 0.062);
  col = mix(col, fogCol, fogFactor * 0.48);
  alpha *= 1.0 - fogFactor * 0.35;

  gl_FragColor = vec4(col, alpha);
}
`

export const gasVertexShader = `
attribute float aSize;
attribute float aPhase;
attribute float aSoftness;
attribute float aDensity;
attribute float aStretch;
attribute vec3 color;
uniform float uTime;
uniform float uPixelRatio;
varying vec3 vColor;
varying float vPulse;
varying float vSoftness;
varying float vDensity;
varying float vStretch;
varying float vPhase;

void main() {
  vColor = color;
  vSoftness = aSoftness;
  vDensity = aDensity;
  vStretch = aStretch;
  vPhase = aPhase;
  float pulseRate = 0.05 + aSoftness * 0.06;
  float pulseAmp = mix(0.04, 0.02, aDensity);
  vPulse = 1.0 - pulseAmp + pulseAmp * sin(uTime * pulseRate + aPhase);
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  float viewZ = max(-mvPosition.z, ${GALAXY_ZOOM.GAS_VIEW_Z_MIN.toFixed(1)});
  float distScale = clamp(${GALAXY_ZOOM.GAS_DIST_SCALE_DIV.toFixed(1)} / viewZ, ${GALAXY_ZOOM.GAS_DIST_SCALE_MIN.toFixed(1)}, ${GALAXY_ZOOM.GAS_DIST_SCALE_MAX.toFixed(1)});
  float sizeMul = mix(1.02 + aSoftness * 0.58, 1.32 + aDensity * 0.26, aDensity);
  float s = aSize * sizeMul * vPulse * uPixelRatio * distScale;
  gl_PointSize = clamp(s, 1.6, ${GALAXY_ZOOM.GAS_POINT_SIZE_MAX.toFixed(1)});
  gl_Position = projectionMatrix * mvPosition;
}
`

export const gasFragmentShader = `
varying vec3 vColor;
varying float vPulse;
varying float vSoftness;
varying float vDensity;
varying float vStretch;
varying float vPhase;

void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);
  float filAngle = vPhase * 0.318309;
  float ca = cos(filAngle);
  float sa = sin(filAngle);
  uv = vec2(uv.x * ca - uv.y * sa, uv.x * sa + uv.y * ca);
  uv.x *= 1.0 + vStretch * 0.85;
  float dist = length(uv);
  if (dist > 0.5) discard;

  float veil = exp(-dist * dist * (0.12 + vSoftness * 0.1));
  float haze = exp(-dist * dist * (0.28 + vSoftness * 0.18));
  float body = exp(-dist * dist * (0.62 + vSoftness * 0.28));
  float sprite = veil * 0.42 + haze * 0.38 + body * 0.28;
  float cloud = sprite * mix(0.34, 0.82, vDensity);
  float ionFront = smoothstep(0.1, 0.38, cloud) * (1.0 - smoothstep(0.48, 0.82, cloud));

  vec3 lang = clamp(vColor, 0.0, 1.0);
  vec3 oiii = vec3(0.08, 0.52, 0.46) + lang * 0.38;
  vec3 halpha = vec3(0.82, 0.22, 0.38) + lang * 0.42;
  vec3 hiiGold = vec3(0.92, 0.72, 0.32) + lang * 0.22;
  vec3 deepTeal = vec3(0.04, 0.16, 0.22) + lang * 0.12;
  vec3 emit = mix(deepTeal, oiii, smoothstep(0.05, 0.4, vDensity));
  emit = mix(emit, halpha, smoothstep(0.26, 0.7, vDensity));
  emit = mix(emit, hiiGold, ionFront * 0.72);

  float alpha = cloud * 0.024 * vPulse;
  alpha += ionFront * 0.03;
  alpha *= smoothstep(0.5, 0.025, dist);
  alpha = clamp(alpha, 0.0, 0.095);

  vec3 col = emit * (0.48 + cloud * 0.62 + ionFront * 0.32);
  col = col / (1.0 + col * 0.48);
  gl_FragColor = vec4(col, alpha);
}
`

export const gasDustVertexShader = `
attribute float aSize;
attribute float aDensity;
attribute vec3 color;
uniform float uPixelRatio;
varying vec3 vColor;
varying vec3 vLocalPos;
varying float vDensity;

void main() {
  vLocalPos = position;
  vColor = color;
  vDensity = aDensity;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  float viewZ = max(-mvPosition.z, ${GALAXY_ZOOM.GAS_VIEW_Z_MIN.toFixed(1)});
  float distScale = clamp(${GALAXY_ZOOM.GAS_DIST_SCALE_DIV.toFixed(1)} / viewZ, ${GALAXY_ZOOM.GAS_DIST_SCALE_MIN.toFixed(1)}, ${GALAXY_ZOOM.GAS_DIST_SCALE_MAX.toFixed(1)});
  float s = aSize * uPixelRatio * distScale;
  gl_PointSize = clamp(s, 0.8, ${GALAXY_ZOOM.GAS_DUST_POINT_SIZE_MAX.toFixed(1)});
  gl_Position = projectionMatrix * mvPosition;
}
`

export const gasDustFragmentShader = `
varying vec3 vColor;
varying vec3 vLocalPos;
varying float vDensity;

float dHash(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}

void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);
  float dist = length(uv);
  if (dist > 0.5) discard;
  float n = dHash(vLocalPos * 0.05);
  float body = exp(-dist * dist * 1.1);
  float veil = exp(-dist * dist * 0.38);
  float alpha = (veil * 0.05 + body * 0.04) * (0.08 + vDensity * 0.2);
  alpha *= mix(0.65, 1.0, n);
  alpha *= smoothstep(0.5, 0.08, dist);
  alpha = clamp(alpha, 0.0, 0.14);
  gl_FragColor = vec4(vColor, alpha);
}
`
