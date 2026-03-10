precision mediump float;

attribute vec4 tangent;

uniform float uTime;
uniform float uWobbleFrequency;
uniform float uWobbleTimeScale;
uniform float uWobbleIntensity;
uniform float uWarpFrequency;
uniform float uWarpTimeScale;
uniform float uWarpIntensity;

varying float vWobble;
varying vec3 vNormal;


#include <simplex4DNoise>

float getWobble(vec3 p)
{
    vec3 warpedPosition = p;
    warpedPosition += snoise(
        vec4(
            warpedPosition * uWarpFrequency, 
            uTime * uWarpTimeScale
        )
    ) * uWarpIntensity;

    return snoise(
        vec4(
            warpedPosition * uWobbleFrequency,
            uTime * uWobbleTimeScale
        )
    ) * uWobbleIntensity;
}


void main(){
    vec3  biTangent = cross(normal, tangent.xyz);

    float shift = 0.01;

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec3 positionA     = modelPosition.xyz + tangent.xyz * shift;
    vec3 positionB     = modelPosition.xyz + biTangent * shift;

    float wobble             = getWobble(modelPosition.xyz);
          modelPosition.xyz += wobble * normal;
          positionA         += getWobble(positionA) * normal;
          positionB         += getWobble(positionB) * normal;

    vec3 toA = normalize(positionA - modelPosition.xyz);
    vec3 toB = normalize(positionB - modelPosition.xyz);

    vec3 newNormal = cross(toA, toB);

    vec4 modelNormal        = modelMatrix * vec4(newNormal, 0.0);
    vec4 viewPosition       = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    // Varying
    vWobble = wobble;
    vNormal = modelNormal.xyz;
}