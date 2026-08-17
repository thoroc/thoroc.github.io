export const nebulaVolumeVertexShader: string = `
varying vec3 vLocalPos;

void main() {
  vLocalPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const nebulaVolumeFragmentShader: string = `
uniform vec3 uLangTint;
uniform vec3 uEllipsoid;
uniform float uSeed;
uniform float uTime;
uniform float uStepCount;
uniform mat4 uInvModelMatrix;

varying vec3 vLocalPos;

float nbHash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.1, 0.17, 0.23));
  p += dot(p, p.yzx + 19.19);
  return fract((p.x + p.y) * p.z);
}

float nbNoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float n000 = nbHash(i);
  float n100 = nbHash(i + vec3(1.0, 0.0, 0.0));
  float n010 = nbHash(i + vec3(0.0, 1.0, 0.0));
  float n110 = nbHash(i + vec3(1.0, 1.0, 0.0));
  float n001 = nbHash(i + vec3(0.0, 0.0, 1.0));
  float n101 = nbHash(i + vec3(1.0, 0.0, 1.0));
  float n011 = nbHash(i + vec3(0.0, 1.0, 1.0));
  float n111 = nbHash(i + vec3(1.0, 1.0, 1.0));
  float nx00 = mix(n000, n100, f.x);
  float nx10 = mix(n010, n110, f.x);
  float nx01 = mix(n001, n101, f.x);
  float nx11 = mix(n011, n111, f.x);
  float nxy0 = mix(nx00, nx10, f.y);
  float nxy1 = mix(nx01, nx11, f.y);
  return mix(nxy0, nxy1, f.z);
}

float nbFbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * nbNoise(p);
    p = p * 2.04 + vec3(1.7, 2.3, 3.1);
    a *= 0.5;
  }
  return v;
}

vec2 boxIntersect(vec3 ro, vec3 rd) {
  vec3 invRd = 1.0 / rd;
  vec3 t0 = (vec3(-0.5) - ro) * invRd;
  vec3 t1 = (vec3(0.5) - ro) * invRd;
  vec3 tMin = min(t0, t1);
  vec3 tMax = max(t0, t1);
  float tNear = max(max(tMin.x, tMin.y), tMin.z);
  float tFar = min(min(tMax.x, tMax.y), tMax.z);
  return vec2(tNear, tFar);
}

float sampleNebulaDensity(vec3 localP) {
  vec3 p = localP * uEllipsoid * 2.0;
  vec3 q = p * 0.022 + vec3(uSeed * 6.1, uSeed * 3.7, uSeed * 4.9);
  q += vec3(0.0, uTime * 0.012, uTime * 0.008);
  float n1 = nbFbm(q);
  float n2 = nbFbm(q * 2.2 + vec3(4.2, 1.8, 6.2));
  float fil = smoothstep(0.12, 0.66, n1 * 0.58 + n2 * 0.42);
  float cavity = smoothstep(0.52, 0.82, n2);

  float r = length(localP * 2.0);
  float falloff = 1.0 - smoothstep(0.18, 0.98, r);
  float pillar = smoothstep(0.06, 0.38, abs(localP.y) / max(0.001, 0.5));

  return fil * falloff * (1.0 - cavity * 0.38) * mix(1.0, 1.0 + pillar * 0.28, step(0.45, uSeed));
}

vec3 nebulaEmit(float dens, vec3 lang) {
  vec3 oiii = vec3(0.08, 0.52, 0.46) + lang * 0.38;
  vec3 halpha = vec3(0.82, 0.22, 0.38) + lang * 0.42;
  vec3 hiiGold = vec3(0.92, 0.72, 0.32) + lang * 0.22;
  vec3 deepTeal = vec3(0.04, 0.16, 0.22) + lang * 0.12;
  vec3 emit = mix(deepTeal, oiii, smoothstep(0.06, 0.38, dens));
  emit = mix(emit, halpha, smoothstep(0.22, 0.68, dens));
  emit = mix(emit, hiiGold, smoothstep(0.52, 0.85, dens));
  return emit;
}

void main() {
  vec3 ro = (uInvModelMatrix * vec4(cameraPosition, 1.0)).xyz;
  vec3 rd = normalize(vLocalPos - ro);
  if (length(rd) < 0.0001) discard;

  vec2 tb = boxIntersect(ro, rd);
  if (tb.x > tb.y || tb.y < 0.0) discard;

  float t0 = max(tb.x, 0.0);
  float t1 = tb.y;
  float len = t1 - t0;
  if (len <= 0.0001) discard;

  const int MAX_STEPS = 12;
  float steps = clamp(uStepCount, 6.0, 12.0);
  float dt = len / steps;
  vec3 accum = vec3(0.0);
  float alphaSum = 0.0;

  for (int i = 0; i < MAX_STEPS; i++) {
    if (float(i) >= steps) break;
    float t = t0 + dt * (float(i) + 0.5);
    vec3 localP = ro + rd * t;
    float dens = sampleNebulaDensity(localP);
    if (dens < 0.012) continue;
    vec3 col = nebulaEmit(dens, uLangTint);
    float ionFront = smoothstep(0.35, 0.62, dens) * (1.0 - smoothstep(0.68, 0.92, dens));
    col = mix(col, col * 1.48 + vec3(0.16, 0.1, 0.05), ionFront * 0.78);
    float a = dens * 0.142;
    accum += col * a * (1.0 - alphaSum);
    alphaSum += a * (1.0 - alphaSum);
    if (alphaSum > 0.94) break;
  }

  if (alphaSum < 0.003) discard;
  accum = accum / (1.0 + accum * 0.36);
  gl_FragColor = vec4(accum, clamp(alphaSum, 0.0, 0.94));
}
`
