/** Shared by GALAXY_MOTION_GLSL and GALAXY_HUB_MOTION_GLSL below — both shaders rotate around the same tilted galaxy plane. */
const GALAXY_ROTATION_GLSL: string = `
vec3 rotateGalaxyY(vec3 p, float ang) {
  float c = cos(ang);
  float s = sin(ang);
  return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
}

vec3 rotateTiltedGalaxyY(vec3 p, float ang, float tilt) {
  float ct = cos(tilt);
  float st = sin(tilt);
  float y1 = p.y * ct - p.z * st;
  float z1 = p.y * st + p.z * ct;
  float c = cos(ang);
  float s = sin(ang);
  float x2 = c * p.x + s * z1;
  float z2 = -s * p.x + c * z1;
  float y2 = y1 * ct + z2 * st;
  float z3 = -y1 * st + z2 * ct;
  return vec3(x2, y2, z3);
}
`

export const GALAXY_MOTION_GLSL: string = `
attribute vec3 aGalaxyHub;
attribute vec3 aNebulaCenter;
attribute vec4 aMotionOmega;
attribute vec4 aMotionOmega2;
attribute vec2 aMotionBob;

${GALAXY_ROTATION_GLSL}

vec3 applyGalaxyMotion(vec3 rest) {
  float universeOrbit = uMotionTime * aMotionOmega.x;
  float galaxySpin = uMotionTime * aMotionOmega.y;
  float clusterSpin = uMotionTime * aMotionOmega.z;

  float galaxyOrbit = uMotionTime * aMotionOmega2.x;
  float clusterOrbit = uMotionTime * aMotionOmega2.y;
  float tiltMix = aMotionOmega2.w;

  float galTilt = tiltMix * 0.12;
  float clusterTilt = sin(tiltMix * 2.17) * 0.12;

  vec3 hub = aGalaxyHub;
  vec3 clusterC = aNebulaCenter;
  vec3 pos = rest;

  if (abs(clusterSpin) > 0.0001 || abs(clusterOrbit) > 0.0001) {
    vec3 relC = pos - clusterC;
    relC = rotateTiltedGalaxyY(relC, clusterSpin, clusterTilt);
    if (abs(clusterOrbit) > 0.0001) {
      relC = rotateGalaxyY(relC, clusterOrbit);
    }
    pos = clusterC + relC;
  }

  vec3 relG = pos - hub;
  float galR = max(length(relG.xz), 6.0);
  float diffSpin = galaxySpin * (1.15 / pow(galR, 0.38));
  relG = rotateTiltedGalaxyY(relG, diffSpin, galTilt);
  if (abs(galaxyOrbit) > 0.0001) {
    relG = rotateGalaxyY(relG, galaxyOrbit);
  }
  pos = hub + relG;
  pos.y += sin(diffSpin * 0.6 + aMotionBob.y) * aMotionBob.x;

  pos = rotateGalaxyY(pos, universeOrbit);
  return pos;
}
`

/** 星系气体云：仅宇宙公转 + 绕 hub 的星系自转/轨道 */
export const GALAXY_HUB_MOTION_GLSL: string = `
${GALAXY_ROTATION_GLSL}

vec3 applyGalaxyHubMotion(vec3 rest) {
  float universeOrbit = uMotionTime * aMotionOmega.x;
  float galaxySpin = uMotionTime * aMotionOmega.y;
  float galaxyOrbit = uMotionTime * aMotionOmega2.x;
  float tiltMix = aMotionOmega2.w;
  float galTilt = tiltMix * 0.18;

  vec3 hub = aGalaxyHub;
  vec3 relG = rest - hub;
  relG = rotateTiltedGalaxyY(relG, galaxySpin, galTilt);
  relG = rotateGalaxyY(relG, galaxyOrbit);
  vec3 pos = hub + relG;
  pos = rotateGalaxyY(pos, universeOrbit);
  return pos;
}
`
