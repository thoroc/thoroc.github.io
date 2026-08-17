export const SKY_RADIUS: number = 6500

export const skyVertexShader: string = `
varying vec3 vWorldDir;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldDir = normalize(worldPos.xyz - cameraPosition);
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`

export const skyFragmentShader: string = `
varying vec3 vWorldDir;

float skyHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float skyNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = skyHash(i);
  float b = skyHash(i + vec2(1.0, 0.0));
  float c = skyHash(i + vec2(0.0, 1.0));
  float d = skyHash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main() {
  vec3 dir = normalize(vWorldDir);
  float h = dir.y * 0.5 + 0.5;

  vec3 deep = vec3(0.018, 0.028, 0.055);
  vec3 mid = vec3(0.028, 0.038, 0.072);
  vec3 zenith = vec3(0.014, 0.022, 0.048);
  vec3 warm = vec3(0.045, 0.032, 0.038);

  vec3 col = mix(deep, mid, smoothstep(0.0, 0.42, h));
  col = mix(col, zenith, pow(h, 1.35));
  col = mix(col, warm, smoothstep(0.72, 0.98, 1.0 - h) * 0.42);

  float n = skyNoise(dir.xz * 48.0) * 0.5 + skyNoise(dir.xz * 128.0) * 0.3;
  col += (n - 0.4) * 0.035;

  float band = exp(-pow((dir.x * 0.55 + dir.z * 0.35) * 2.2, 2.0) * 0.8);
  col += vec3(0.012, 0.008, 0.022) * band * smoothstep(0.25, 0.75, 1.0 - abs(dir.y));

  gl_FragColor = vec4(col, 1.0);
}
`
