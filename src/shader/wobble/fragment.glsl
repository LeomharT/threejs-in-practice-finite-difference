varying float vWobble;
varying vec3 vNormal;

uniform vec3 uSunDirection;
uniform vec3 uColorA;
uniform vec3 uColorB;

void main(){
    vec3  color  = vec3(1.0);
    vec3  normal = normalize(vNormal);
    
    float wobble = vWobble;
          wobble = wobble * 0.5 + 0.5;

    float lightClor  = dot(normal, uSunDirection);
          lightClor  = max(0.15, lightClor);
          lightClor += 0.35;

    float colorMix = wobble;

    color = mix(
        uColorA,
        uColorB,
        colorMix
    );

    color *= lightClor;

    gl_FragColor = vec4(color, 1.0);
}