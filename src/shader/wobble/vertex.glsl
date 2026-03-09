uniform float uTime;
uniform float uWobbleFrequency;
uniform float uWobbleTimeScale;

varying float vWobble;


#include <simplex4DNoise>

float getWobble(vec3 p)
{
    return snoise(
        vec4(
            p * uWobbleFrequency,
            0.0 * uWobbleTimeScale
        )
    ) * 1.9;
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