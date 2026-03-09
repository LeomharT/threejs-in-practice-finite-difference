
#include <simplex4DNoise>

float getWobble(vec3 p)
{
    return snoise(
        vec4(
            p,
            0.0
        )
    );
}


void main(){
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float wobble = getWobble(modelPosition.xyz * 10.0);

    modelPosition.xyz += wobble * normal;

    vec4 viewPosition       = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;
}