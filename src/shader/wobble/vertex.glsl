attribute vec4 tangent;

varying vec3 vNormal;
varying float vWobble;

uniform float uTime;
uniform float uWobbleFrequency;
uniform float uWobbleTimeScale;
uniform float uWobbleIntensity;
uniform float uWarpFrequency;
uniform float uWarpTimeScale;
uniform float uWarpIntensity;

#include <simplex4DNoise>

float getWobble(vec3 p) {
    vec3 warpPosition = p;
    warpPosition += snoise(
        vec4(
            warpPosition * uWarpFrequency,
            uTime * uWarpTimeScale
        )
    ) * uWarpIntensity;

    return snoise(
        vec4(
            warpPosition * uWobbleFrequency,
            uTime * uWobbleTimeScale
        )
    ) * uWobbleIntensity;
}

void main() {
    vec3  biTangent = cross(normal, tangent.xyz);
    float shift     = 0.01;

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec3 positionA     = modelPosition.xyz + tangent.xyz * shift;
    vec3 positionB     = modelPosition.xyz + biTangent * shift;

    float wobble = getWobble(modelPosition.xyz);

    modelPosition.xyz += wobble * normal;
    positionA         += getWobble(positionA) * normal;
    positionB         += getWobble(positionB) * normal;

    vec3 toA = normalize(positionA - modelPosition.xyz);
    vec3 toB = normalize(positionB - modelPosition.xyz);

    vec3 finiteNormal = cross(toA, toB);

    vec4 modelNormal        = modelMatrix * vec4(finiteNormal, 0.0);
    vec4 viewPosition       = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    #ifdef IS_DEPTH_MATERIAL
        csm_Position += wobble * normal;
    #else
        gl_Position = projectionPosition;
    #endif

    // Varying
    vNormal = modelNormal.xyz;
    vWobble = wobble;
}