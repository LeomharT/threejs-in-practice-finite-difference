uniform vec3 uSunDirection;
uniform vec3 uColorA;
uniform vec3 uColorB;

varying vec3 vNormal;
varying float vWobble;

void main(){
    vec3  color  = vec3(1.0);
    vec3  normal = normalize(vNormal);
    float wobble = vWobble;

    float lightColor = dot(normal, uSunDirection);
    lightColor = max(0.051, lightColor);

    float colorMix = smoothstep(-1.0, 1.0, wobble);

    color = mix(
        uColorA,
        uColorB,
        colorMix
    );

    color += min(lightColor, 0.52);

    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
