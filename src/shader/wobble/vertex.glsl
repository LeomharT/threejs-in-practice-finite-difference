uniform float uTime;
uniform float uWobbleFrequency;
uniform float uWobbleTimeScale;
uniform float uWobbleIntensity;

varying float vWobble;


#include <simplex4DNoise>

float getWobble(vec3 p)
{
    return snoise(
        vec4(
            p * uWobbleFrequency,
            uTime * uWobbleTimeScale
        )
    ) * uWobbleIntensity;
}


void main(){
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float wobble = getWobble(modelPosition.xyz * 1.0);

    modelPosition.xyz += wobble * normal;

    vec4 modelNormal        = modelMatrix * vec4(normal, 0.0);
    vec4 viewPosition       = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    // Varying
    vWobble = wobble;
}